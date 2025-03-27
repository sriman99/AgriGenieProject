from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import os
from dotenv import load_dotenv
import google.generativeai as genai
from supabase import create_client, Client
from supabase.client import ClientOptions
from supabase.client import AsyncClient

load_dotenv()

# Security scheme for JWT authentication
security = HTTPBearer()

def get_supabase() -> AsyncClient:
    """Get Supabase async client with real-time support"""
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_KEY")
    
    if not supabase_url or not supabase_key:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Supabase credentials not configured"
        )
    
    return create_client(
        supabase_url=supabase_url,
        supabase_key=supabase_key,
        options=ClientOptions(
            schema='public',
            headers={
                'apikey': supabase_key
            }
        )
    )

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    supabase: AsyncClient = Depends(get_supabase)
):
    """Get current authenticated user"""
    try:
        user = await supabase.auth.get_user(credentials.credentials)
        return user
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

# Initialize Gemini API
def get_gemini_model():
    """Get Gemini AI model instance"""
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise HTTPException(
            status_code=500,
            detail="Gemini API configuration not found"
        )
    genai.configure(api_key=api_key)
    return genai.GenerativeModel('gemini-pro')