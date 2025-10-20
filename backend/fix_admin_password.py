#!/usr/bin/env python3
"""
Script to fix admin password by hashing it
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
from passlib.context import CryptContext

load_dotenv()

mongo_url = os.environ['MONGO_URL']
db_name = os.environ['DB_NAME']

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

async def fix_admin_password():
    """Hash the admin password"""
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    # Find admin user
    admin = await db.users.find_one({"email": "admin@lupintr.com"}, {"_id": 0})
    
    if not admin:
        print("Admin user not found. Creating new admin...")
        # Create new admin with hashed password
        hashed_password = pwd_context.hash("myworktest1")
        admin_doc = {
            "id": "admin-" + os.urandom(8).hex(),
            "username": "admin",
            "email": "admin@lupintr.com",
            "password": hashed_password,
            "full_name": "Admin User",
            "bio": "Platform Administrator",
            "profile_picture": "https://api.dicebear.com/7.x/avataaars/svg?seed=admin",
            "followers_count": 0,
            "following_count": 0,
            "total_earnings": 0.0,
            "is_admin": True,
            "kyc_verified": False,
            "created_at": "2025-01-01T00:00:00+00:00"
        }
        await db.users.insert_one(admin_doc)
        print("✅ Admin user created with hashed password")
    else:
        print(f"Admin user found: {admin['email']}")
        # Check if password is already hashed
        if admin['password'].startswith('$2b$'):
            print("Password is already hashed")
        else:
            print("Password is not hashed. Hashing now...")
            hashed_password = pwd_context.hash(admin['password'])
            await db.users.update_one(
                {"email": "admin@lupintr.com"},
                {"$set": {"password": hashed_password, "is_admin": True}}
            )
            print("✅ Admin password hashed successfully")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(fix_admin_password())
