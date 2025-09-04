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
    # Check if user already exists
    existing_user = await find_user_by_email(user_data.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user with pending approval status
    user = User(
        email=user_data.email,
        name=user_data.name,
        password_hash=hash_password(user_data.password),
        approval_status="pending",
        is_active=False  # Not active until approved
    )
    
    await create_user(user.dict())
    
    # Send pending approval email
    email_result = EmailService.send_pending_approval_notification(user.email, user.name)
    
    return {
        "message": "Registration successful! Your account is pending approval. You'll receive an email once approved.",
        "approval_status": "pending",
        "email_sent": email_result.get("success", False)
    }

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
    
    return {
        "message": "Login successful",
        "token": token,
        "user": UserResponse(
            id=user["id"],
            email=user["email"],
            name=user["name"],
            is_active=user["is_active"],
            is_admin=user.get("is_admin", False),
            approval_status=user["approval_status"],
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
            is_active=user["is_active"],
            is_admin=user.get("is_admin", False),
            approval_status=user["approval_status"],
            created_at=user["created_at"]
        )
    }

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
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)