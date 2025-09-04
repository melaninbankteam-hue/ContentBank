#!/usr/bin/env python3
"""
Reset admin password for Content Strategy Planner
"""
import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from pathlib import Path
from auth import hash_password
from datetime import datetime

# Load environment variables
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

async def reset_admin_password():
    # MongoDB connection
    mongo_url = os.environ['MONGO_URL']
    client = AsyncIOMotorClient(mongo_url)
    db = client[os.environ.get('DB_NAME', 'melanin_bank_content_planner')]
    users_collection = db.users
    
    # Admin credentials
    admin_email = "admin@contentstrategyplanner.com"
    admin_password = "Admin123!"  # Simple, clear password
    
    # Check if admin exists
    existing_admin = await users_collection.find_one({"email": admin_email})
    if not existing_admin:
        print(f"❌ Admin user with email {admin_email} does not exist!")
        print("Creating new admin user...")
        
        # Create new admin user
        from models import User
        admin_user = User(
            email=admin_email,
            name="Content Strategy Planner Admin",
            password_hash=hash_password(admin_password),
            is_active=True,
            is_admin=True,
            approval_status="approved"
        )
        
        await users_collection.insert_one(admin_user.model_dump())
        print("✅ New admin user created!")
    else:
        print(f"✅ Admin user found! Updating password...")
        
        # Update password
        result = await users_collection.update_one(
            {"email": admin_email},
            {
                "$set": {
                    "password_hash": hash_password(admin_password),
                    "is_active": True,
                    "is_admin": True,
                    "approval_status": "approved",
                    "updated_at": datetime.utcnow()
                }
            }
        )
        
        if result.modified_count > 0:
            print("✅ Admin password updated successfully!")
        else:
            print("⚠️ No changes made - admin might already have correct settings")
    
    print("\n🔐 ADMIN CREDENTIALS:")
    print(f"Email: {admin_email}")
    print(f"Password: {admin_password}")
    print("\n💡 Use these credentials to log in as admin!")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(reset_admin_password())