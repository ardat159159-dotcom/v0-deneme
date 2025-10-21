#!/usr/bin/env python3
"""
Make a user admin by email
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

load_dotenv()

mongo_url = os.environ['MONGO_URL']
db_name = os.environ['DB_NAME']

async def make_admin(email: str):
    """Make user admin"""
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    user = await db.users.find_one({"email": email}, {"_id": 0})
    
    if not user:
        print(f"❌ Kullanıcı bulunamadı: {email}")
        client.close()
        return
    
    if user.get('is_admin', False):
        print(f"✅ Kullanıcı zaten admin: @{user['username']}")
        client.close()
        return
    
    # Make admin
    await db.users.update_one(
        {"email": email},
        {"$set": {"is_admin": True}}
    )
    
    print(f"✅ Admin yetkisi verildi!")
    print(f"   E-posta: {email}")
    print(f"   Kullanıcı: @{user['username']}")
    print(f"   ID: {user['id']}")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(make_admin("baron0450@hotmail.com"))
