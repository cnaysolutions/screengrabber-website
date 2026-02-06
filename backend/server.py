from fastapi import FastAPI, APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import jwt
import secrets
import hashlib

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT settings
JWT_SECRET = os.environ.get('JWT_SECRET', secrets.token_hex(32))
JWT_ALGORITHM = 'HS256'
JWT_EXPIRATION_HOURS = 24 * 7  # 7 days

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

security = HTTPBearer(auto_error=False)

# Define Models
class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StatusCheckCreate(BaseModel):
    client_name: str

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class GoogleAuthData(BaseModel):
    email: EmailStr
    name: Optional[str] = None
    picture: Optional[str] = None
    google_id: str

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

class UserResponse(BaseModel):
    id: str
    email: str
    name: Optional[str] = None
    picture: Optional[str] = None
    is_pro: bool = False
    created_at: str

class TokenResponse(BaseModel):
    token: str
    user: UserResponse

class LicenseValidate(BaseModel):
    license_key: str

class LicenseValidateResponse(BaseModel):
    valid: bool
    message: str

# Password hashing
def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def verify_password(password: str, hashed: str) -> bool:
    return hash_password(password) == hashed

# JWT helpers
def create_token(user_id: str, email: str) -> str:
    payload = {
        'user_id': user_id,
        'email': email,
        'exp': datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS),
        'iat': datetime.now(timezone.utc)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def decode_token(token: str) -> dict:
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    if not credentials:
        raise HTTPException(status_code=401, detail="Not authenticated")
    payload = decode_token(credentials.credentials)
    user = await db.users.find_one({'id': payload['user_id']}, {'_id': 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

async def get_optional_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    if not credentials:
        return None
    try:
        payload = decode_token(credentials.credentials)
        user = await db.users.find_one({'id': payload['user_id']}, {'_id': 0})
        return user
    except Exception:
        return None

# Routes
@api_router.get("/")
async def root():
    return {"message": "ScreenGrabber API"}

@api_router.post("/auth/register", response_model=TokenResponse)
async def register(data: UserCreate):
    existing = await db.users.find_one({'email': data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_id = str(uuid.uuid4())
    user = {
        'id': user_id,
        'email': data.email,
        'password': hash_password(data.password),
        'name': data.name or data.email.split('@')[0],
        'picture': None,
        'is_pro': False,
        'created_at': datetime.now(timezone.utc).isoformat(),
        'auth_provider': 'email'
    }
    await db.users.insert_one(user)
    
    token = create_token(user_id, data.email)
    return TokenResponse(
        token=token,
        user=UserResponse(
            id=user_id,
            email=user['email'],
            name=user['name'],
            picture=user['picture'],
            is_pro=user['is_pro'],
            created_at=user['created_at']
        )
    )

@api_router.post("/auth/login", response_model=TokenResponse)
async def login(data: UserLogin):
    user = await db.users.find_one({'email': data.email}, {'_id': 0})
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    if user.get('auth_provider') == 'google':
        raise HTTPException(status_code=400, detail="This account uses Google sign-in. Please use Google to log in.")
    
    if not verify_password(data.password, user.get('password', '')):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    token = create_token(user['id'], data.email)
    return TokenResponse(
        token=token,
        user=UserResponse(
            id=user['id'],
            email=user['email'],
            name=user.get('name'),
            picture=user.get('picture'),
            is_pro=user.get('is_pro', False),
            created_at=user.get('created_at', '')
        )
    )

@api_router.post("/auth/google", response_model=TokenResponse)
async def google_auth(data: GoogleAuthData):
    user = await db.users.find_one({'email': data.email}, {'_id': 0})
    
    if user:
        # Update existing user with Google info
        await db.users.update_one(
            {'email': data.email},
            {'$set': {
                'google_id': data.google_id,
                'picture': data.picture or user.get('picture'),
                'name': data.name or user.get('name'),
                'auth_provider': 'google'
            }}
        )
        user = await db.users.find_one({'email': data.email}, {'_id': 0})
    else:
        # Create new user
        user_id = str(uuid.uuid4())
        user = {
            'id': user_id,
            'email': data.email,
            'name': data.name or data.email.split('@')[0],
            'picture': data.picture,
            'google_id': data.google_id,
            'is_pro': False,
            'created_at': datetime.now(timezone.utc).isoformat(),
            'auth_provider': 'google'
        }
        await db.users.insert_one(user)
    
    token = create_token(user['id'], data.email)
    return TokenResponse(
        token=token,
        user=UserResponse(
            id=user['id'],
            email=user['email'],
            name=user.get('name'),
            picture=user.get('picture'),
            is_pro=user.get('is_pro', False),
            created_at=user.get('created_at', '')
        )
    )

@api_router.get("/auth/me", response_model=UserResponse)
async def get_me(user=Depends(get_current_user)):
    return UserResponse(
        id=user['id'],
        email=user['email'],
        name=user.get('name'),
        picture=user.get('picture'),
        is_pro=user.get('is_pro', False),
        created_at=user.get('created_at', '')
    )

@api_router.post("/auth/forgot-password")
async def forgot_password(data: ForgotPasswordRequest):
    user = await db.users.find_one({'email': data.email}, {'_id': 0})
    
    if not user:
        # Don't reveal if email exists
        return {"message": "If an account with this email exists, a password reset link has been sent."}
    
    if user.get('auth_provider') == 'google':
        return {"message": "This account uses Google sign-in. Please use Google to log in."}
    
    # Generate reset token
    reset_token = secrets.token_urlsafe(32)
    expires_at = datetime.now(timezone.utc) + timedelta(hours=1)
    
    await db.password_resets.insert_one({
        'email': data.email,
        'token': reset_token,
        'expires_at': expires_at.isoformat(),
        'used': False
    })
    
    # In a real app, send email here
    # For now, we'll just return success
    logger.info(f"Password reset token for {data.email}: {reset_token}")
    
    return {
        "message": "If an account with this email exists, a password reset link has been sent.",
        "debug_token": reset_token  # Remove in production
    }

@api_router.post("/auth/reset-password")
async def reset_password(data: ResetPasswordRequest):
    reset = await db.password_resets.find_one({
        'token': data.token,
        'used': False
    }, {'_id': 0})
    
    if not reset:
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")
    
    expires_at = datetime.fromisoformat(reset['expires_at'])
    if datetime.now(timezone.utc) > expires_at:
        raise HTTPException(status_code=400, detail="Reset token has expired")
    
    # Update password
    await db.users.update_one(
        {'email': reset['email']},
        {'$set': {'password': hash_password(data.new_password)}}
    )
    
    # Mark token as used
    await db.password_resets.update_one(
        {'token': data.token},
        {'$set': {'used': True}}
    )
    
    return {"message": "Password reset successfully"}

# License validation for Pro
@api_router.post("/license/validate")
async def validate_license(data: LicenseValidate, user=Depends(get_optional_user)):
    license_key = data.license_key
    
    # Check if license exists and is valid
    license_doc = await db.licenses.find_one({'key': license_key, 'active': True}, {'_id': 0})
    
    if license_doc:
        # Update user's Pro status if logged in
        if user:
            await db.users.update_one(
                {'id': user['id']},
                {'$set': {'is_pro': True, 'license_key': license_key}}
            )
        
        return {"result": {"data": {"valid": True, "message": "License activated successfully"}}}
    
    return {"result": {"data": {"valid": False, "message": "Invalid or expired license key"}}}

# Status check routes
@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.model_dump()
    status_obj = StatusCheck(**status_dict)
    doc = status_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    _ = await db.status_checks.insert_one(doc)
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find({}, {"_id": 0}).to_list(1000)
    for check in status_checks:
        if isinstance(check['timestamp'], str):
            check['timestamp'] = datetime.fromisoformat(check['timestamp'])
    return status_checks

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
