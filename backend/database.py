from motor.motor_asyncio import AsyncIOMotorClient
import os
from typing import Optional

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'melanin_bank')]

# Collections
users_collection = db.users
monthly_data_collection = db.monthly_data
content_ideas_collection = db.content_ideas
posts_collection = db.posts

async def find_user_by_email(email: str) -> Optional[dict]:
    """Find a user by email"""
    return await users_collection.find_one({"email": email})

async def create_user(user_data: dict) -> str:
    """Create a new user and return the ID"""
    result = await users_collection.insert_one(user_data)
    return str(result.inserted_id)

async def find_user_by_id(user_id: str) -> Optional[dict]:
    """Find a user by ID"""
    return await users_collection.find_one({"id": user_id})

async def get_monthly_data(user_id: str, month_key: str) -> Optional[dict]:
    """Get monthly data for a user and month"""
    return await monthly_data_collection.find_one({
        "user_id": user_id,
        "month_key": month_key
    })

async def upsert_monthly_data(user_id: str, month_key: str, data: dict) -> str:
    """Create or update monthly data"""
    data["user_id"] = user_id
    data["month_key"] = month_key
    data["updated_at"] = data.get("updated_at")
    
    result = await monthly_data_collection.update_one(
        {"user_id": user_id, "month_key": month_key},
        {"$set": data},
        upsert=True
    )
    
    if result.upserted_id:
        return str(result.upserted_id)
    else:
        existing = await monthly_data_collection.find_one({
            "user_id": user_id,
            "month_key": month_key
        })
        return existing["id"] if existing else ""

async def get_all_content_ideas(user_id: str):
    """Get all content ideas for a user"""
    cursor = content_ideas_collection.find({"user_id": user_id})
    return await cursor.to_list(length=1000)

async def create_content_idea(idea_data: dict) -> str:
    """Create a new content idea"""
    result = await content_ideas_collection.insert_one(idea_data)
    return str(result.inserted_id)

async def update_content_idea(idea_id: str, user_id: str, update_data: dict) -> bool:
    """Update a content idea"""
    update_data["updated_at"] = update_data.get("updated_at")
    result = await content_ideas_collection.update_one(
        {"id": idea_id, "user_id": user_id},
        {"$set": update_data}
    )
    return result.modified_count > 0

async def delete_content_idea(idea_id: str, user_id: str) -> bool:
    """Delete a content idea"""
    result = await content_ideas_collection.delete_one({
        "id": idea_id,
        "user_id": user_id
    })
    return result.deleted_count > 0

async def get_posts_for_date(user_id: str, month_key: str, date_key: str):
    """Get posts for a specific date"""
    cursor = posts_collection.find({
        "user_id": user_id,
        "month_key": month_key,
        "date_key": date_key
    })
    return await cursor.to_list(length=100)

async def get_posts_for_month(user_id: str, month_key: str):
    """Get all posts for a month"""
    cursor = posts_collection.find({
        "user_id": user_id,
        "month_key": month_key
    })
    return await cursor.to_list(length=1000)

async def create_post(post_data: dict) -> str:
    """Create a new post"""
    result = await posts_collection.insert_one(post_data)
    return str(result.inserted_id)

async def update_post(post_id: str, user_id: str, update_data: dict) -> bool:
    """Update a post"""
    update_data["updated_at"] = update_data.get("updated_at")
    result = await posts_collection.update_one(
        {"id": post_id, "user_id": user_id},
        {"$set": update_data}
    )
    return result.modified_count > 0

async def delete_post(post_id: str, user_id: str) -> bool:
    """Delete a post"""
    result = await posts_collection.delete_one({
        "id": post_id,
        "user_id": user_id
    })
    return result.deleted_count > 0