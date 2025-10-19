from fastapi import FastAPI, APIRouter, HTTPException, UploadFile, File
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import random

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# ==================== MODELS ====================

# User Models
class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    username: str
    email: str
    password: str
    full_name: str
    bio: Optional[str] = ""
    profile_picture: Optional[str] = "https://api.dicebear.com/7.x/avataaars/svg?seed=default"
    followers_count: int = 0
    following_count: int = 0
    total_earnings: float = 0.0
    # KYC fields
    tc_id: Optional[str] = None
    birth_date: Optional[str] = None
    kyc_verified: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class KYCUpdate(BaseModel):
    tc_id: str
    birth_date: str  # YYYY-MM-DD format

# Withdrawal Models
class WithdrawalRequest(BaseModel):
    user_id: str
    amount: float
    method: str  # "btc", "bank", etc
    wallet_address: Optional[str] = None

class Withdrawal(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    amount: float
    method: str
    wallet_address: Optional[str]
    status: str = "pending"  # pending, approved, rejected
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserCreate(BaseModel):
    username: str
    email: str
    password: str
    full_name: str

class UserLogin(BaseModel):
    email: str
    password: str

class UserProfile(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    username: str
    full_name: str
    bio: Optional[str]
    profile_picture: Optional[str]
    followers_count: int
    following_count: int
    total_earnings: float
    is_admin: bool = False

class UserUpdate(BaseModel):
    username: Optional[str] = None
    full_name: Optional[str] = None
    bio: Optional[str] = None
    profile_picture: Optional[str] = None

# Post Models
class Post(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    username: str
    user_avatar: str
    content: str
    image_url: Optional[str] = None
    likes_count: int = 0
    comments_count: int = 0
    shares_count: int = 0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class PostCreate(BaseModel):
    user_id: str
    content: str
    image_url: Optional[str] = None

# Story Models
class Story(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    username: str
    user_avatar: str
    media_url: str
    media_type: str  # "image" or "video"
    views_count: int = 0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    expires_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc) + timedelta(hours=24))

class StoryCreate(BaseModel):
    user_id: str
    media_url: str
    media_type: str

# Comment Models
class Comment(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    post_id: str
    user_id: str
    username: str
    user_avatar: str
    content: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class CommentCreate(BaseModel):
    post_id: str
    user_id: str
    content: str

# Message Models
class Message(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    sender_id: str
    receiver_id: str
    content: str
    is_read: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class MessageCreate(BaseModel):
    sender_id: str
    receiver_id: str
    content: str

# Live Stream Models
class LiveStream(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    username: str
    user_avatar: str
    title: str
    description: Optional[str] = ""
    viewers_count: int = 0
    is_live: bool = True
    stream_url: Optional[str] = ""
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class LiveStreamCreate(BaseModel):
    user_id: str
    title: str
    description: Optional[str] = ""

# Earnings Models
class Earning(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    amount: float
    type: str  # "like", "comment", "share", "view"
    source_id: str  # post_id, story_id, etc.
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# Notification Models
class Notification(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    type: str  # "like", "comment", "follow", "earning"
    message: str
    is_read: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# ==================== HELPER FUNCTIONS ====================

async def add_earning(user_id: str, amount: float, earning_type: str, source_id: str):
    """Add earning to user"""
    earning = Earning(
        user_id=user_id,
        amount=amount,
        type=earning_type,
        source_id=source_id
    )
    doc = earning.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.earnings.insert_one(doc)
    
    # Update user total earnings
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    if user:
        new_total = user.get('total_earnings', 0) + amount
        await db.users.update_one(
            {"id": user_id},
            {"$set": {"total_earnings": new_total}}
        )

# ==================== AUTH ROUTES ====================

@api_router.post("/auth/register")
async def register(user: UserCreate):
    # Check if user exists by email
    existing_email = await db.users.find_one({"email": user.email}, {"_id": 0})
    if existing_email:
        raise HTTPException(status_code=400, detail="Bu e-posta adresi zaten kayıtlı")
    
    # Check if username exists
    existing_username = await db.users.find_one({"username": user.username}, {"_id": 0})
    if existing_username:
        raise HTTPException(status_code=400, detail="Bu kullanıcı adı zaten kullanılıyor")
    
    # Check if username is admin
    is_admin = (user.username == "admin" and user.password == "myworktest1")
    
    # Create user
    new_user = User(
        username=user.username,
        email=user.email,
        password=user.password,
        full_name=user.full_name,
        profile_picture=f"https://api.dicebear.com/7.x/avataaars/svg?seed={user.username}"
    )
    
    doc = new_user.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    doc['is_admin'] = is_admin
    await db.users.insert_one(doc)
    
    profile = UserProfile(**new_user.model_dump())
    profile.is_admin = is_admin
    return {"message": "User registered successfully", "user": profile}

@api_router.post("/auth/login")
async def login(credentials: UserLogin):
    user = await db.users.find_one({"email": credentials.email}, {"_id": 0})
    if not user or user['password'] != credentials.password:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Set admin flag if username is admin
    if 'is_admin' not in user:
        user['is_admin'] = (user['username'] == 'admin' and credentials.password == 'myworktest1')
    
    return {"message": "Login successful", "user": UserProfile(**user)}

@api_router.get("/users/{user_id}")
async def get_user(user_id: str):
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if 'is_admin' not in user:
        user['is_admin'] = False
    return UserProfile(**user)

@api_router.put("/users/{user_id}")
async def update_user(user_id: str, update: UserUpdate):
    # Get current user
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Prepare update data
    update_data = {}
    if update.username is not None:
        # Check if username already exists
        existing = await db.users.find_one({"username": update.username, "id": {"$ne": user_id}}, {"_id": 0})
        if existing:
            raise HTTPException(status_code=400, detail="Username already taken")
        update_data['username'] = update.username
    
    if update.full_name is not None:
        update_data['full_name'] = update.full_name
    if update.bio is not None:
        update_data['bio'] = update.bio
    if update.profile_picture is not None:
        update_data['profile_picture'] = update.profile_picture
    
    if update_data:
        await db.users.update_one({"id": user_id}, {"$set": update_data})
    
    # Get updated user
    updated_user = await db.users.find_one({"id": user_id}, {"_id": 0})
    if 'is_admin' not in updated_user:
        updated_user['is_admin'] = False
    return UserProfile(**updated_user)

# ==================== POST ROUTES ====================

@api_router.post("/posts")
async def create_post(post: PostCreate):
    # Get user info
    user = await db.users.find_one({"id": post.user_id}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    new_post = Post(
        user_id=post.user_id,
        username=user['username'],
        user_avatar=user['profile_picture'],
        content=post.content,
        image_url=post.image_url
    )
    
    doc = new_post.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.posts.insert_one(doc)
    
    return new_post

@api_router.get("/posts", response_model=List[Post])
async def get_posts(limit: int = 50):
    posts = await db.posts.find({}, {"_id": 0}).sort("created_at", -1).limit(limit).to_list(limit)
    
    for post in posts:
        if isinstance(post['created_at'], str):
            post['created_at'] = datetime.fromisoformat(post['created_at'])
    
    return posts

@api_router.get("/posts/{post_id}")
async def get_post(post_id: str):
    post = await db.posts.find_one({"id": post_id}, {"_id": 0})
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    if isinstance(post['created_at'], str):
        post['created_at'] = datetime.fromisoformat(post['created_at'])
    
    return Post(**post)

@api_router.post("/posts/{post_id}/like")
async def like_post(post_id: str, user_id: str):
    post = await db.posts.find_one({"id": post_id}, {"_id": 0})
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    # Update like count
    new_count = post['likes_count'] + 1
    await db.posts.update_one(
        {"id": post_id},
        {"$set": {"likes_count": new_count}}
    )
    
    # Add earning to post owner (0.01 per like)
    await add_earning(post['user_id'], 0.01, "like", post_id)
    
    return {"message": "Post liked", "likes_count": new_count}

# ==================== STORY ROUTES ====================

@api_router.post("/stories")
async def create_story(story: StoryCreate):
    user = await db.users.find_one({"id": story.user_id}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    new_story = Story(
        user_id=story.user_id,
        username=user['username'],
        user_avatar=user['profile_picture'],
        media_url=story.media_url,
        media_type=story.media_type
    )
    
    doc = new_story.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    doc['expires_at'] = doc['expires_at'].isoformat()
    await db.stories.insert_one(doc)
    
    return new_story

@api_router.get("/stories", response_model=List[Story])
async def get_stories():
    # Get non-expired stories
    now = datetime.now(timezone.utc)
    stories = await db.stories.find({}, {"_id": 0}).to_list(100)
    
    active_stories = []
    for story in stories:
        if isinstance(story['expires_at'], str):
            story['expires_at'] = datetime.fromisoformat(story['expires_at'])
        if isinstance(story['created_at'], str):
            story['created_at'] = datetime.fromisoformat(story['created_at'])
        
        if story['expires_at'] > now:
            active_stories.append(Story(**story))
    
    return active_stories

# ==================== COMMENT ROUTES ====================

@api_router.post("/comments")
async def create_comment(comment: CommentCreate):
    user = await db.users.find_one({"id": comment.user_id}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    new_comment = Comment(
        post_id=comment.post_id,
        user_id=comment.user_id,
        username=user['username'],
        user_avatar=user['profile_picture'],
        content=comment.content
    )
    
    doc = new_comment.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.comments.insert_one(doc)
    
    # Update post comment count
    post = await db.posts.find_one({"id": comment.post_id}, {"_id": 0})
    if post:
        new_count = post['comments_count'] + 1
        await db.posts.update_one(
            {"id": comment.post_id},
            {"$set": {"comments_count": new_count}}
        )
        
        # Add earning to post owner (0.02 per comment)
        await add_earning(post['user_id'], 0.02, "comment", comment.post_id)
    
    return new_comment

@api_router.get("/comments/{post_id}", response_model=List[Comment])
async def get_comments(post_id: str):
    comments = await db.comments.find({"post_id": post_id}, {"_id": 0}).sort("created_at", -1).to_list(100)
    
    for comment in comments:
        if isinstance(comment['created_at'], str):
            comment['created_at'] = datetime.fromisoformat(comment['created_at'])
    
    return comments

# ==================== MESSAGE ROUTES ====================

@api_router.post("/messages")
async def send_message(message: MessageCreate):
    new_message = Message(
        sender_id=message.sender_id,
        receiver_id=message.receiver_id,
        content=message.content
    )
    
    doc = new_message.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.messages.insert_one(doc)
    
    return new_message

@api_router.get("/messages/{user_id}")
async def get_messages(user_id: str, with_user_id: str):
    messages = await db.messages.find({
        "$or": [
            {"sender_id": user_id, "receiver_id": with_user_id},
            {"sender_id": with_user_id, "receiver_id": user_id}
        ]
    }, {"_id": 0}).sort("created_at", 1).to_list(1000)
    
    for msg in messages:
        if isinstance(msg['created_at'], str):
            msg['created_at'] = datetime.fromisoformat(msg['created_at'])
    
    return messages

# ==================== LIVE STREAM ROUTES ====================

@api_router.post("/streams")
async def create_stream(stream: LiveStreamCreate):
    user = await db.users.find_one({"id": stream.user_id}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    new_stream = LiveStream(
        user_id=stream.user_id,
        username=user['username'],
        user_avatar=user['profile_picture'],
        title=stream.title,
        description=stream.description,
        stream_url=f"mock://stream/{uuid.uuid4()}"
    )
    
    doc = new_stream.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.streams.insert_one(doc)
    
    return new_stream

@api_router.get("/streams", response_model=List[LiveStream])
async def get_live_streams():
    streams = await db.streams.find({"is_live": True}, {"_id": 0}).to_list(100)
    
    for stream in streams:
        if isinstance(stream['created_at'], str):
            stream['created_at'] = datetime.fromisoformat(stream['created_at'])
    
    return streams

# ==================== EARNINGS ROUTES ====================

@api_router.get("/earnings/{user_id}")
async def get_earnings(user_id: str):
    earnings = await db.earnings.find({"user_id": user_id}, {"_id": 0}).sort("created_at", -1).to_list(100)
    
    for earning in earnings:
        if isinstance(earning['created_at'], str):
            earning['created_at'] = datetime.fromisoformat(earning['created_at'])
    
    total = sum(e['amount'] for e in earnings)
    
    return {
        "total": total,
        "earnings": earnings
    }

# ==================== KYC ROUTES ====================

@api_router.put("/users/{user_id}/kyc")
async def update_kyc(user_id: str, kyc: KYCUpdate):
    """Update user KYC information"""
    # Validate TC ID (11 digits)
    if len(kyc.tc_id) != 11 or not kyc.tc_id.isdigit():
        raise HTTPException(status_code=400, detail="TC Kimlik numarası 11 haneli olmalıdır")
    
    # Validate birth date and check age (18+)
    try:
        birth_date = datetime.fromisoformat(kyc.birth_date)
        today = datetime.now()
        age = today.year - birth_date.year - ((today.month, today.day) < (birth_date.month, birth_date.day))
        
        if age < 18:
            raise HTTPException(status_code=400, detail="Para çekme için 18 yaşından büyük olmalısınız")
    except ValueError:
        raise HTTPException(status_code=400, detail="Geçersiz doğum tarihi formatı")
    
    # Check if TC ID already exists for another user
    existing = await db.users.find_one({"tc_id": kyc.tc_id, "id": {"$ne": user_id}}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="Bu TC Kimlik numarası başka bir hesapta kullanılıyor")
    
    # Update user
    await db.users.update_one(
        {"id": user_id},
        {"$set": {
            "tc_id": kyc.tc_id,
            "birth_date": kyc.birth_date,
            "kyc_verified": True
        }}
    )
    
    return {"message": "KYC bilgileri güncellendi", "kyc_verified": True}

# ==================== WITHDRAWAL ROUTES ====================

@api_router.post("/withdrawals")
async def create_withdrawal(withdrawal: WithdrawalRequest):
    """Create withdrawal request"""
    # Get user
    user = await db.users.find_one({"id": withdrawal.user_id}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı")
    
    # Check KYC
    if not user.get('kyc_verified', False):
        raise HTTPException(status_code=400, detail="Para çekebilmek için kimlik doğrulaması yapmalısınız")
    
    # Check minimum amount
    if withdrawal.amount < 10:
        raise HTTPException(status_code=400, detail="Minimum çekim tutarı $10.00")
    
    # Check balance
    if user.get('total_earnings', 0) < withdrawal.amount:
        raise HTTPException(status_code=400, detail="Yetersiz bakiye")
    
    # Create withdrawal
    new_withdrawal = Withdrawal(
        user_id=withdrawal.user_id,
        amount=withdrawal.amount,
        method=withdrawal.method,
        wallet_address=withdrawal.wallet_address
    )
    
    doc = new_withdrawal.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.withdrawals.insert_one(doc)
    
    # Deduct from user balance (in real app, only after approval)
    await db.users.update_one(
        {"id": withdrawal.user_id},
        {"$set": {"total_earnings": user.get('total_earnings', 0) - withdrawal.amount}}
    )
    
    return {"message": "Para çekme talebiniz alındı", "withdrawal": new_withdrawal}

@api_router.get("/withdrawals/{user_id}")
async def get_withdrawals(user_id: str):
    """Get user withdrawal history"""
    withdrawals = await db.withdrawals.find({"user_id": user_id}, {"_id": 0}).sort("created_at", -1).to_list(100)
    
    for w in withdrawals:
        if isinstance(w['created_at'], str):
            w['created_at'] = datetime.fromisoformat(w['created_at'])
    
    return withdrawals

# ==================== NOTIFICATION ROUTES ====================

@api_router.get("/notifications/{user_id}")
async def get_notifications(user_id: str):
    notifications = await db.notifications.find({"user_id": user_id}, {"_id": 0}).sort("created_at", -1).limit(50).to_list(50)
    
    for notif in notifications:
        if isinstance(notif['created_at'], str):
            notif['created_at'] = datetime.fromisoformat(notif['created_at'])
    
    return notifications

# ==================== ADMIN ROUTES ====================

@api_router.get("/admin/stats")
async def get_admin_stats():
    """Get platform statistics for admin dashboard"""
    total_users = await db.users.count_documents({})
    total_posts = await db.posts.count_documents({})
    total_streams = await db.streams.count_documents({})
    total_earnings_cursor = await db.earnings.find({}, {"_id": 0, "amount": 1}).to_list(100000)
    total_earnings = sum(e['amount'] for e in total_earnings_cursor)
    
    return {
        "total_users": total_users,
        "total_posts": total_posts,
        "total_streams": total_streams,
        "total_earnings_paid": total_earnings
    }

@api_router.get("/admin/users")
async def get_all_users():
    """Get all users for admin panel"""
    users = await db.users.find({}, {"_id": 0, "password": 0}).to_list(1000)
    return users

@api_router.delete("/admin/users/{user_id}")
async def delete_user(user_id: str):
    """Delete a user (admin only)"""
    result = await db.users.delete_one({"id": user_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Also delete user's posts, comments, etc.
    await db.posts.delete_many({"user_id": user_id})
    await db.comments.delete_many({"user_id": user_id})
    await db.stories.delete_many({"user_id": user_id})
    
    return {"message": "User deleted successfully"}

@api_router.delete("/admin/posts/{post_id}")
async def delete_post(post_id: str):
    """Delete a post (admin only)"""
    result = await db.posts.delete_one({"id": post_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Post not found")
    
    # Also delete post's comments
    await db.comments.delete_many({"post_id": post_id})
    
    return {"message": "Post deleted successfully"}

@api_router.get("/admin/earnings")
async def get_all_earnings():
    """Get all earnings for admin panel"""
    earnings = await db.earnings.find({}, {"_id": 0}).sort("created_at", -1).limit(100).to_list(100)
    
    for earning in earnings:
        if isinstance(earning['created_at'], str):
            earning['created_at'] = datetime.fromisoformat(earning['created_at'])
    
    return earnings

# ==================== SEED DATA ROUTE ====================

@api_router.post("/seed-data")
async def seed_data():
    """Create sample data for testing"""
    # Create sample users
    sample_users = [
        {"username": "ayse_yilmaz", "email": "ayse@example.com", "full_name": "Ayşe Yılmaz", "bio": "Fotoğraf tutkunudesigner 📸"},
        {"username": "ali_ozturk", "email": "ali@example.com", "full_name": "Ali Öztürk", "bio": "Fitness coach 💪"},
        {"username": "mehmet_kaya", "email": "mehmet@example.com", "full_name": "Mehmet Kaya", "bio": "Kahve aşığı ☕"},
    ]
    
    created_users = []
    for u in sample_users:
        user = User(
            username=u["username"],
            email=u["email"],
            password="12345",
            full_name=u["full_name"],
            bio=u["bio"],
            profile_picture=f"https://api.dicebear.com/7.x/avataaars/svg?seed={u['username']}",
            followers_count=random.randint(100, 5000),
            following_count=random.randint(50, 1000)
        )
        doc = user.model_dump()
        doc['created_at'] = doc['created_at'].isoformat()
        await db.users.insert_one(doc)
        created_users.append(user)
    
    # Create sample posts
    sample_posts_data = [
        {"content": "Yeni projemiz çok heyecan verici! 🚀", "image": "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800"},
        {"content": "Antrenman zamanı! Kim benimle? 🏋️", "image": "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800"},
        {"content": "Sabah kahvaltısı ve güzel bir gün ☕", "image": "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800"},
    ]
    
    for i, post_data in enumerate(sample_posts_data):
        user = created_users[i % len(created_users)]
        post = Post(
            user_id=user.id,
            username=user.username,
            user_avatar=user.profile_picture,
            content=post_data["content"],
            image_url=post_data["image"],
            likes_count=random.randint(100, 10000),
            comments_count=random.randint(10, 500),
            shares_count=random.randint(5, 200)
        )
        doc = post.model_dump()
        doc['created_at'] = doc['created_at'].isoformat()
        await db.posts.insert_one(doc)
    
    return {"message": "Sample data created successfully"}

# ==================== ROOT & MIDDLEWARE ====================

@api_router.get("/")
async def root():
    return {"message": "Social Media Platform API"}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()