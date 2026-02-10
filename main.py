
import os
import json
import time
from datetime import datetime, timedelta
from typing import List, Optional, Dict, Any

from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel, Field
from passlib.context import CryptContext
from jose import JWTError, jwt
from tinydb import TinyDB, Query
import google.generativeai as genai
from fastapi.responses import StreamingResponse
from dotenv import load_dotenv

# Load environment variables from .env file for local development
load_dotenv()

# --- Configuration & Initial Setup ---

SECRET_KEY = "a_very_secret_key_that_should_be_in_env_vars"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7 # One week

# FastAPI App Initialization
app = FastAPI(
    title="Krishi Mitra AI Backend",
    description="Backend server for the AI-powered farming assistant.",
    version="1.0.0"
)

# CORS Middleware to allow frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for simplicity
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Password Hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# OAuth2 Scheme
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

# Database Setup (using TinyDB for file-based storage)
db = TinyDB('database.json')
users_table = db.table('users')
chats_table = db.table('chats')
otp_store = db.table('otp') # Using DB instead of in-memory for OTPs

# Gemini API Configuration
GEMINI_API_KEY = os.getenv("API_KEY")
if not GEMINI_API_KEY:
    print("WARNING: API_KEY environment variable not found.")
    # raise ValueError("API_KEY environment variable not set.")
genai.configure(api_key=GEMINI_API_KEY)


# --- Pydantic Models (Data Schemas) ---

class UserBase(BaseModel):
    username: str
    fullName: str
    phone: Optional[str] = None
    gender: Optional[str] = None
    dob: Optional[str] = None
    address: Optional[str] = None
    district: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    pincode: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserInDB(UserBase):
    hashed_password: str

class User(UserBase):
    pass # For responses, doesn't include password

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

class ChatMessage(BaseModel):
    id: float
    role: str
    text: str
    image: Optional[str] = None

class ChatSession(BaseModel):
    id: str
    title: str
    timestamp: float
    messages: List[ChatMessage]
    
class Product(BaseModel):
    id: str
    name: str
    category: str
    price: float
    image: str
    keywords: List[str]

# --- Security & Authentication Helpers ---

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def get_user(username: str):
    UserQuery = Query()
    user = users_table.get(UserQuery.username.matches(username, flags=re.IGNORECASE))
    if user:
        return UserInDB(**user)
    return None

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = TokenData(username=username)
    except JWTError:
        raise credentials_exception
    user = get_user(username=token_data.username)
    if user is None:
        raise credentials_exception
    return user

# --- Database Seeding ---

import re

def create_default_users():
    if not get_user('admin'):
        admin_user = {
            "fullName": "Admin User",
            "username": "admin",
            "hashed_password": get_password_hash("Vijay@147896"),
            "phone": "0000000000"
        }
        users_table.insert(admin_user)
        print("Admin user created.")
    
    if not get_user('farmer'):
        farmer_user = {
            "fullName": "Test Farmer",
            "username": "farmer",
            "hashed_password": get_password_hash("password123"),
            "phone": "9876543210"
        }
        users_table.insert(farmer_user)
        print("Test farmer created.")

# Run seeding at startup
create_default_users()


# --- API Endpoints ---

# --- Authentication Endpoints ---

@app.post("/signup", response_model=User)
def signup(user: UserCreate):
    UserQuery = Query()
    db_user = users_table.get(UserQuery.username.matches(user.username, flags=re.IGNORECASE))
    if db_user:
        raise HTTPException(status_code=400, detail="Username already exists. Please choose another.")
    
    hashed_password = get_password_hash(user.password)
    user_data = user.dict()
    del user_data["password"]
    user_data["hashed_password"] = hashed_password
    
    users_table.insert(user_data)
    return User(**user_data)

@app.post("/login", response_model=Token)
def login(form_data: Dict[str, str]):
    username = form_data.get("username")
    password = form_data.get("password")
    user = get_user(username)
    if not user or not verify_password(password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password.",
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/request-password-otp")
def request_password_reset_otp(body: Dict[str, str]):
    username = body.get("username")
    user = get_user(username)
    if not user or not user.phone:
        raise HTTPException(status_code=404, detail="User not found or no phone number is registered.")
    
    otp = str(time.time())[-4:] # Simple time-based OTP for simulation
    otp_store.upsert({'username': user.username.lower(), 'otp': otp, 'timestamp': time.time()}, Query().username == user.username.lower())
    
    masked_phone = f"******{user.phone[-4:]}"
    print(f"[SIMULATED SMS to {user.phone}] Your OTP is: {otp}")
    return {"success": True, "maskedPhone": masked_phone, "otp": otp} # Returning OTP for frontend alert

@app.post("/verify-password-otp")
def verify_password_reset_otp(body: Dict[str, str]):
    username = body.get("username")
    otp = body.get("otp")
    OtpQuery = Query()
    record = otp_store.get((OtpQuery.username == username.lower()) & (OtpQuery.otp == otp))
    
    if record and (time.time() - record['timestamp'] < 300): # 5-minute validity
        otp_store.remove(OtpQuery.username == username.lower())
        return {"success": True}
    raise HTTPException(status_code=400, detail="Invalid or expired OTP.")
    
@app.post("/reset-password")
def reset_password(body: Dict[str, str]):
    username = body.get("username")
    new_password = body.get("newPassword")
    UserQuery = Query()
    users_table.update({'hashed_password': get_password_hash(new_password)}, UserQuery.username.matches(username, flags=re.IGNORECASE))
    return {"success": True}

# --- User Profile Endpoints ---

@app.get("/users/me", response_model=User)
async def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user

@app.put("/users/me", response_model=User)
async def update_user_me(user_update: UserBase, current_user: User = Depends(get_current_user)):
    update_data = user_update.dict(exclude_unset=True)
    
    # If username is being changed, check for conflicts
    if 'username' in update_data and update_data['username'].lower() != current_user.username.lower():
        if get_user(update_data['username']):
            raise HTTPException(status_code=400, detail="This username is already taken. Please choose another.")

    UserQuery = Query()
    users_table.update(update_data, UserQuery.username == current_user.username)
    
    # Fetch updated user data to return
    updated_user_data = users_table.get(UserQuery.username == update_data.get('username', current_user.username))
    return User(**updated_user_data)
    
# --- Chat History Endpoints ---

@app.get("/chats", response_model=List[ChatSession])
async def get_chat_history(current_user: User = Depends(get_current_user)):
    ChatQuery = Query()
    sessions = chats_table.search(ChatQuery.username == current_user.username)
    return sorted(sessions, key=lambda s: s['timestamp'], reverse=True)

@app.post("/chats")
async def save_chat_session(session: ChatSession, current_user: User = Depends(get_current_user)):
    session_data = session.dict()
    session_data['username'] = current_user.username # Ensure session is tied to the authenticated user
    ChatQuery = Query()
    chats_table.upsert(session_data, (ChatQuery.id == session.id) & (ChatQuery.username == current_user.username))
    return {"success": True}

@app.delete("/chats/{session_id}")
async def delete_chat_session(session_id: str, current_user: User = Depends(get_current_user)):
    ChatQuery = Query()
    chats_table.remove((ChatQuery.id == session_id) & (ChatQuery.username == current_user.username))
    return {"success": True}

@app.delete("/chats")
async def delete_all_chat_sessions(current_user: User = Depends(get_current_user)):
    ChatQuery = Query()
    chats_table.remove(ChatQuery.username == current_user.username)
    return {"success": True}
    
# --- Product Endpoints ---

# Mock product data now lives on the backend
with open('services/mockProducts.json', 'r') as f:
    mock_products = json.load(f)

@app.get("/products", response_model=List[Product])
def get_products(term: Optional[str] = None, category: Optional[str] = None):
    results = mock_products
    if category:
        results = [p for p in results if p['category'] == category]
    if term:
        lower_term = term.lower()
        results = [
            p for p in results if lower_term in p['name'].lower() or any(lower_term in kw.lower() for kw in p['keywords'])
        ]
    return results
    
# --- Admin Endpoints ---

async def get_current_admin_user(current_user: User = Depends(get_current_user)):
    if current_user.username != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    return current_user

@app.get("/admin/users", response_model=List[User])
async def get_all_users(admin_user: User = Depends(get_current_admin_user)):
    all_db_users = users_table.all()
    return [User(**user) for user in all_db_users]

@app.delete("/admin/users/{username}")
async def delete_user(username: str, admin_user: User = Depends(get_current_admin_user)):
    if username.lower() == 'admin':
        raise HTTPException(status_code=400, detail="Cannot delete the admin user.")
    UserQuery = Query()
    result = users_table.remove(UserQuery.username.matches(username, flags=re.IGNORECASE))
    if not result:
        raise HTTPException(status_code=404, detail="User not found.")
    return {"success": True}

@app.get("/admin/stats")
async def get_admin_stats(admin_user: User = Depends(get_current_admin_user)):
    total_users = len(users_table)
    total_chat_sessions = len(chats_table)
    return {"totalUsers": total_users, "totalChatSessions": total_chat_sessions}


# --- Gemini API Proxy Endpoints ---

class GeminiStreamRequest(BaseModel):
    prompt: str
    imageBase64: Optional[str] = None
    config: Optional[Dict[str, Any]] = None
    
class GeminiTitleRequest(BaseModel):
    message: str

class GeminiImageRequest(BaseModel):
    prompt: str

@app.post("/gemini/generate-stream")
async def generate_stream_proxy(req: GeminiStreamRequest, current_user: User = Depends(get_current_user)):
    if not GEMINI_API_KEY:
        raise HTTPException(status_code=500, detail="Gemini API key is not configured on the server.")
        
    try:
        model = genai.GenerativeModel('gemini-3-flash-preview')
        
        parts = [req.prompt]
        if req.imageBase64:
            mime_type = req.imageBase64.substring(5, req.imageBase64.indexOf(';'))
            image_data = req.imageBase64.split(',')[1]
            parts.append({"inline_data": {"mime_type": mime_type, "data": image_data}})

        async def stream_generator():
            response_stream = model.generate_content(parts, stream=True, generation_config=req.config)
            for chunk in response_stream:
                if chunk.text:
                    yield chunk.text
        
        return StreamingResponse(stream_generator(), media_type="text/plain")
        
    except Exception as e:
        print(f"Gemini API Error: {e}")
        raise HTTPException(status_code=500, detail=f"Error communicating with Gemini API: {str(e)}")


@app.post("/gemini/generate-title")
async def generate_title_proxy(req: GeminiTitleRequest, current_user: User = Depends(get_current_user)):
    if not GEMINI_API_KEY:
        raise HTTPException(status_code=500, detail="Gemini API key is not configured on the server.")
    
    try:
        model = genai.GenerativeModel('gemini-3-flash-preview')
        prompt = f'Generate a very short (3-5 words) and descriptive title for a chat that starts with: "{req.message}". Return ONLY the title text, no quotes or labels.'
        response = model.generate_content(prompt)
        return {"title": response.text.strip().replace('"', '')}
    except Exception as e:
        print(f"Gemini API Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/gemini/generate-image", response_model=Dict[str, Optional[str]])
async def generate_image_proxy(req: GeminiImageRequest, current_user: User = Depends(get_current_user)):
    if not GEMINI_API_KEY:
        raise HTTPException(status_code=500, detail="Gemini API key is not configured on the server.")
    
    try:
        model = genai.GenerativeModel('gemini-2.5-flash-image')
        prompt_text = f"Generate a realistic image of: {req.prompt}"
        response = model.generate_content(prompt_text)
        
        for part in response.candidates[0].content.parts:
            if 'inline_data' in part:
                img_data = part.inline_data
                return {"imageUrl": f"data:{img_data.mime_type};base64,{img_data.data}"}
        
        return {"imageUrl": None}

    except Exception as e:
        print(f"Gemini Image API Error: {e}")
        # Gracefully fail if quota is exceeded
        return {"imageUrl": None}

# To run this app:
# 1. Install dependencies: pip install "fastapi[all]" python-dotenv "google-generativeai" "python-jose[cryptography]" passlib[bcrypt] tinydb
# 2. Create a .env file with your API_KEY="your_gemini_api_key"
# 3. Run the server: uvicorn main:app --reload
# The backend will be available at http://127.0.0.1:8000
