from fastapi import FastAPI, APIRouter, HTTPException, Depends, status, UploadFile, File
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
import os
import logging
from pathlib import Path
from typing import List, Dict
from datetime import datetime

from models import (
    User, UserCreate, UserLogin, UserResponse, UserUpdate,
    MonthlyData, MonthlyDataCreate,
    ContentIdea, ContentIdeaCreate, ContentIdeaUpdate,
    Post, PostCreate, PostUpdate, MediaUpload
)
from auth import hash_password, verify_password, create_access_token, get_current_user
from database import (
    find_user_by_email, create_user, find_user_by_id, get_all_users, update_user_status,
    get_monthly_data, upsert_monthly_data,
    get_all_content_ideas, create_content_idea, update_content_idea, delete_content_idea,
    get_posts_for_date, get_posts_for_month, create_post, update_post, delete_post
)
from media_service import MediaService
from email_service import EmailService

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Create the main app without a prefix
app = FastAPI(title="Content Strategy Planner API")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Authentication Routes
@api_router.post("/auth/register", response_model=dict)
async def register(user_data: UserCreate):
    try:
        logger.info(f"Registration attempt for email: {user_data.email}")
        logger.info(f"Registration data: name={user_data.name}, socialHandle={user_data.socialHandle}")
        
        # Check if user already exists
        existing_user = await find_user_by_email(user_data.email)
        if existing_user:
            logger.warning(f"Registration failed - email already exists: {user_data.email}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        # Create new user with pending approval status
        user = User(
            email=user_data.email,
            name=user_data.name,
            social_handle=user_data.socialHandle,
            password_hash=hash_password(user_data.password),
            approval_status="pending",
            is_active=False  # Not active until approved
        )
        
        await create_user(user.model_dump())
        logger.info(f"User created successfully: {user_data.email}")
        
        # Send pending approval email
        email_result = EmailService.send_pending_approval_notification(user.email, user.name)
        logger.info(f"Email notification result: {email_result}")
        
        return {
            "message": "Registration successful! Your account is pending approval. You'll receive an email once approved.",
            "approval_status": "pending",
            "email_sent": email_result.get("success", False)
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Registration error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error during registration"
        )

@api_router.post("/auth/login", response_model=dict)
async def login(login_data: UserLogin):
    # Find user by email
    user = await find_user_by_email(login_data.email)
    if not user or not verify_password(login_data.password, user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    # Check approval status
    if user["approval_status"] == "pending":
        return {
            "message": "Account pending approval",
            "approval_status": "pending",
            "show_awaiting_approval": True
        }
    
    if user["approval_status"] == "denied":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Account access has been denied"
        )
    
    if not user["is_active"]:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Account is deactivated"
        )
    
    # Create access token
    token = create_access_token(user["id"], user["email"])
    
    # Update last active timestamp
    await update_user_status(user["id"], {
        "last_active": datetime.utcnow(),
        "login_count": user.get("login_count", 0) + 1
    })
    
    return {
        "message": "Login successful",
        "token": token,
        "user": UserResponse(
            id=user["id"],
            email=user["email"],
            name=user["name"],
            social_handle=user.get("social_handle"),
            is_active=user["is_active"],
            is_admin=user.get("is_admin", False),
            approval_status=user["approval_status"],
            last_active=user.get("last_active"),
            created_at=user["created_at"]
        )
    }

@api_router.get("/auth/verify", response_model=dict)
async def verify_token(current_user: dict = Depends(get_current_user)):
    user = await find_user_by_id(current_user["user_id"])
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return {
        "message": "Token valid",
        "user": UserResponse(
            id=user["id"],
            email=user["email"],
            name=user["name"],
            social_handle=user.get("social_handle"),
            is_active=user["is_active"],
            is_admin=user.get("is_admin", False),
            approval_status=user["approval_status"],
            last_active=user.get("last_active"),
            created_at=user["created_at"]
        )
    }
# Admin Routes
@api_router.get("/admin/users", response_model=List[UserResponse])
async def get_all_users_admin(current_user: dict = Depends(get_current_user)):
    # Check if user is admin
    admin_user = await find_user_by_id(current_user["user_id"])
    if not admin_user or not admin_user.get("is_admin", False):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    
    users = await get_all_users()
    return [UserResponse(
        id=user["id"],
        email=user["email"],
        name=user["name"],
        social_handle=user.get("social_handle"),
        is_active=user["is_active"],
        is_admin=user.get("is_admin", False),
        approval_status=user["approval_status"],
        last_active=user.get("last_active"),
        created_at=user["created_at"]
    ) for user in users]

@api_router.patch("/admin/users/{user_id}/approve", response_model=dict)
async def approve_user(user_id: str, current_user: dict = Depends(get_current_user)):
    # Check if user is admin
    admin_user = await find_user_by_id(current_user["user_id"])
    if not admin_user or not admin_user.get("is_admin", False):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    
    # Get user to approve
    user = await find_user_by_id(user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Update user status
    success = await update_user_status(user_id, {
        "approval_status": "approved",
        "is_active": True,
        "updated_at": datetime.utcnow()
    })
    
    if success:
        # Send approval email
        email_result = EmailService.send_approval_notification(user["email"], user["name"])
        return {
            "message": "User approved successfully",
            "email_sent": email_result.get("success", False)
        }
    else:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to approve user"
        )

@api_router.patch("/admin/users/{user_id}/deny", response_model=dict)
async def deny_user(user_id: str, current_user: dict = Depends(get_current_user)):
    # Check if user is admin
    admin_user = await find_user_by_id(current_user["user_id"])
    if not admin_user or not admin_user.get("is_admin", False):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    
    # Get user to deny
    user = await find_user_by_id(user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Update user status
    success = await update_user_status(user_id, {
        "approval_status": "denied",
        "is_active": False,
        "updated_at": datetime.utcnow()
    })
    
    if success:
        # Send denial email
        email_result = EmailService.send_denial_notification(user["email"], user["name"])
        return {
            "message": "User denied successfully",
            "email_sent": email_result.get("success", False)
        }
    else:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to deny user"
        )

@api_router.delete("/admin/users/{user_id}", response_model=dict)
async def delete_user(user_id: str, current_user: dict = Depends(get_current_user)):
    # Check admin permissions
    if not current_user.get("is_admin", False):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    
    # Get user to delete
    user = await find_user_by_id(user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Prevent admin from deleting themselves
    if user_id == current_user["user_id"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete your own admin account"
        )
    
    # Delete user from database
    try:
        from database import db
        result = await db.users.delete_one({"id": user_id})
        
        if result.deleted_count > 0:
            return {
                "message": "User deleted successfully",
                "deleted_user": user["email"]
            }
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to delete user"
            )
    except Exception as e:
        logger.error(f"Error deleting user: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete user"
        )

@api_router.patch("/admin/users/{user_id}/suspend", response_model=dict)
async def suspend_user(user_id: str, current_user: dict = Depends(get_current_user)):
    # Check if user is admin
    admin_user = await find_user_by_id(current_user["user_id"])
    if not admin_user or not admin_user.get("is_admin", False):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    
    # Update user status
    success = await update_user_status(user_id, {
        "is_active": False,
        "updated_at": datetime.utcnow()
    })
    
    if success:
        return {"message": "User suspended successfully"}
    else:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to suspend user"
        )

# Health Check Route
@api_router.get("/admin/health", response_model=dict)
async def get_health_status(current_user: dict = Depends(get_current_user)):
    # Check if user is admin
    admin_user = await find_user_by_id(current_user["user_id"])
    if not admin_user or not admin_user.get("is_admin", False):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    
    health_status = {
        "mongo": False,
        "jwt": False,
        "cloudinary": False,
        "email": False,
        "cors": False
    }
    
    # Check MongoDB
    try:
        from database import db
        await db.command("ping")
        health_status["mongo"] = True
    except:
        pass
    
    # Check JWT
    try:
        jwt_secret = os.environ.get('JWT_SECRET_KEY')
        health_status["jwt"] = bool(jwt_secret and len(jwt_secret) > 10)
    except:
        pass
    
    # Check Cloudinary
    try:
        cloudinary_name = os.environ.get('CLOUDINARY_CLOUD_NAME')
        cloudinary_key = os.environ.get('CLOUDINARY_API_KEY')
        cloudinary_secret = os.environ.get('CLOUDINARY_API_SECRET')
        health_status["cloudinary"] = bool(cloudinary_name and cloudinary_key and cloudinary_secret)
    except:
        pass
    
    # Check Email
    try:
        email_key = os.environ.get('EMAIL_PROVIDER_API_KEY')
        health_status["email"] = bool(email_key and len(email_key) > 10)
    except:
        pass
    
    # Check CORS
    try:
        cors_origins = os.environ.get('ALLOWED_ORIGINS') or os.environ.get('CORS_ORIGINS')
        health_status["cors"] = bool(cors_origins)
    except:
        pass
    
    return health_status
# Media Upload Routes
@api_router.post("/media/upload", response_model=dict)
async def upload_media(
    file: UploadFile = File(...),
    folder: str = "content_planner",
    current_user: dict = Depends(get_current_user)
):
    """Upload media to Cloudinary"""
    try:
        # Read file data
        file_data = await file.read()
        
        # Generate filename
        filename = f"user_{current_user['user_id']}_{file.filename}"
        
        # Upload to Cloudinary
        result = MediaService.upload_image(file_data, filename, folder)
        
        if result["success"]:
            return {
                "success": True,
                "media": MediaUpload(
                    url=result["url"],
                    public_id=result["public_id"],
                    width=result.get("width"),
                    height=result.get("height")
                )
            }
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Upload failed: {result['error']}"
            )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Upload failed: {str(e)}"
        )

@api_router.delete("/media/{public_id}", response_model=dict)
async def delete_media(
    public_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Delete media from Cloudinary"""
    try:
        result = MediaService.delete_image(public_id)
        
        if result["success"]:
            return {"message": "Media deleted successfully"}
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Delete failed: {result.get('error', 'Unknown error')}"
            )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Delete failed: {str(e)}"
        )

# Monthly Data Routes
@api_router.get("/months/{month_key}", response_model=MonthlyData)
async def get_monthly_data_endpoint(
    month_key: str,
    current_user: dict = Depends(get_current_user)
):
    data = await get_monthly_data(current_user["user_id"], month_key)
    if not data:
        # Return default monthly data structure
        default_data = MonthlyData(
            user_id=current_user["user_id"],
            month_key=month_key
        )
        return default_data
    return MonthlyData(**data)

@api_router.post("/months/{month_key}", response_model=dict)
async def create_or_update_monthly_data(
    month_key: str,
    data: MonthlyDataCreate,
    current_user: dict = Depends(get_current_user)
):
    data_dict = data.dict()
    data_dict["user_id"] = current_user["user_id"]
    data_dict["month_key"] = month_key
    
    monthly_data = MonthlyData(**data_dict)
    
    data_id = await upsert_monthly_data(
        current_user["user_id"],
        month_key,
        monthly_data.dict()
    )
    
    return {"message": "Monthly data saved successfully", "id": data_id}

# Content Ideas Routes
@api_router.get("/content-ideas", response_model=List[ContentIdea])
async def get_content_ideas(current_user: dict = Depends(get_current_user)):
    ideas = await get_all_content_ideas(current_user["user_id"])
    return [ContentIdea(**idea) for idea in ideas]

@api_router.post("/content-ideas", response_model=dict)
async def create_idea(
    idea_data: ContentIdeaCreate,
    current_user: dict = Depends(get_current_user)
):
    idea = ContentIdea(
        user_id=current_user["user_id"],
        **idea_data.dict()
    )
    
    idea_id = await create_content_idea(idea.dict())
    return {"message": "Content idea created successfully", "id": idea_id}

@api_router.put("/content-ideas/{idea_id}", response_model=dict)
async def update_idea(
    idea_id: str,
    update_data: ContentIdeaUpdate,
    current_user: dict = Depends(get_current_user)
):
    # Filter out None values
    update_dict = {k: v for k, v in update_data.dict().items() if v is not None}
    update_dict["updated_at"] = datetime.utcnow()
    
    success = await update_content_idea(idea_id, current_user["user_id"], update_dict)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Content idea not found"
        )
    
    return {"message": "Content idea updated successfully"}

@api_router.delete("/content-ideas/{idea_id}", response_model=dict)
async def delete_idea(
    idea_id: str,
    current_user: dict = Depends(get_current_user)
):
    success = await delete_content_idea(idea_id, current_user["user_id"])
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Content idea not found"
        )
    
    return {"message": "Content idea deleted successfully"}

# Posts Routes
@api_router.get("/posts/{month_key}/{date_key}", response_model=List[Post])
async def get_posts_by_date(
    month_key: str,
    date_key: str,
    current_user: dict = Depends(get_current_user)
):
    posts = await get_posts_for_date(current_user["user_id"], month_key, date_key)
    return [Post(**post) for post in posts]

@api_router.get("/posts/{month_key}", response_model=List[Post])
async def get_posts_by_month(
    month_key: str,
    current_user: dict = Depends(get_current_user)
):
    posts = await get_posts_for_month(current_user["user_id"], month_key)
    return [Post(**post) for post in posts]

@api_router.post("/posts", response_model=dict)
async def create_new_post(
    post_data: PostCreate,
    current_user: dict = Depends(get_current_user)
):
    post = Post(
        user_id=current_user["user_id"],
        **post_data.dict()
    )
    
    post_id = await create_post(post.dict())
    return {"message": "Post created successfully", "id": post_id}

@api_router.put("/posts/{post_id}", response_model=dict)
async def update_existing_post(
    post_id: str,
    update_data: PostUpdate,
    current_user: dict = Depends(get_current_user)
):
    # Filter out None values
    update_dict = {k: v for k, v in update_data.dict().items() if v is not None}
    update_dict["updated_at"] = datetime.utcnow()
    
    success = await update_post(post_id, current_user["user_id"], update_dict)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found"
        )
    
    return {"message": "Post updated successfully"}

@api_router.delete("/posts/{post_id}", response_model=dict)
async def delete_existing_post(
    post_id: str,
    current_user: dict = Depends(get_current_user)
):
    success = await delete_post(post_id, current_user["user_id"])
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found"
        )
    
    return {"message": "Post deleted successfully"}

# Health check
@api_router.get("/")
async def root():
    return {"message": "The Melanin Bank Content Planner API"}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=[os.environ.get('ALLOWED_ORIGINS', os.environ.get('CORS_ORIGINS', '*'))],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)