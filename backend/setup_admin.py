#!/usr/bin/env python3
"""
Setup script to create an admin user for the Content Strategy Planner
"""
import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from pathlib import Path
from models import User
from auth import hash_password
from datetime import datetime

# Load environment variables
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

async def create_admin_user():
    # MongoDB connection
    mongo_url = os.environ['MONGO_URL']
    client = AsyncIOMotorClient(mongo_url)
    db = client[os.environ.get('DB_NAME', 'melanin_bank_content_planner')]
    users_collection = db.users
    
    # Admin user details
    admin_email = "admin@contentstrategyplanner.com"
    admin_password = "ContentAdmin2025!"
    
    # Check if admin already exists
    existing_admin = await users_collection.find_one({"email": admin_email})
    if existing_admin:
        print(f"Admin user with email {admin_email} already exists!")
        return
    
    # Create admin user
    admin_user = User(
        email=admin_email,
        name="Content Strategy Planner Admin",
        password_hash=hash_password(admin_password),
        is_active=True,
        is_admin=True,
        approval_status="approved"
    )
    
    await users_collection.insert_one(admin_user.dict())
    
    print("✅ Admin user created successfully!")
    print(f"Email: {admin_email}")
    print(f"Password: {admin_password}")
    print("🔐 Please save these credentials securely!")
    
    await client.close()

if __name__ == "__main__":
    asyncio.run(create_admin_user())