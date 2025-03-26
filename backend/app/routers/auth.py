from fastapi import APIRouter, Depends, HTTPException
from ..models import UserCreate, User
from ..dependencies import get_supabase

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/signup")
async def signup(user: UserCreate, supabase=Depends(get_supabase)):
    try:
        # Create auth user in Supabase
        auth_response = supabase.auth.sign_up({
            "email": user.email,
            "password": user.password
        })
        
        # Store additional user data in profiles table
        user_data = {
            "id": auth_response.user.id,
            "email": user.email,
            "full_name": user.full_name,
            "user_type": user.user_type
        }
        
        profile_response = supabase.table("profiles").insert(user_data).execute()
        return {"message": "User created successfully", "user": profile_response.data[0]}
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/login")
async def login(email: str, password: str, supabase=Depends(get_supabase)):
    try:
        response = supabase.auth.sign_in_with_password({
            "email": email,
            "password": password
        })
        return response.json()
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid credentials")