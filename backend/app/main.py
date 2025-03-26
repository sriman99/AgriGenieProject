from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os
from supabase import create_client, Client
import httpx

from .routers import auth, marketplace, ai_features

load_dotenv()

app = FastAPI(title="AgriGenie API")

# CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("CORS_ORIGIN", "http://localhost:3000")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Supabase client initialization with proper configuration
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_KEY")

if not supabase_url or not supabase_key:
    raise ValueError("Missing Supabase credentials in environment variables")

# Initialize Supabase client without proxy configuration
supabase: Client = create_client(
    supabase_url=supabase_url,
    supabase_key=supabase_key
)

# Include routers
app.include_router(auth.router)
app.include_router(marketplace.router)
app.include_router(ai_features.router)

@app.get("/")
async def root():
    return {"message": "Welcome to AgriGenie API"}

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "supabase": "connected" if supabase else "not connected"
    }