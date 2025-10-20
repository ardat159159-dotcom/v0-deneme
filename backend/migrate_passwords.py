#!/usr/bin/env python3
"""
Migrate all plain text passwords to hashed passwords
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

async def migrate_passwords():
    """Hash all plain text passwords"""
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    users = await db.users.find({}, {"_id": 0}).to_list(length=None)
    
    migrated = 0
    already_hashed = 0
    
    for user in users:
        password = user.get('password', '')
        
        # Check if already hashed
        if password.startswith('$2b$') or password.startswith('$2a$'):
            already_hashed += 1
            continue
        
        # Hash the password
        hashed_password = pwd_context.hash(password)
        await db.users.update_one(
            {"id": user['id']},
            {"$set": {"password": hashed_password}}
        )
        migrated += 1
        print(f"✅ Migrated: {user['email']}")
    
    print(f"\n📊 Summary:")
    print(f"  - Already hashed: {already_hashed}")
    print(f"  - Migrated: {migrated}")
    print(f"  - Total: {len(users)}")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(migrate_passwords())
