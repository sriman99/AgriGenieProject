from fastapi import APIRouter, Depends, HTTPException
from typing import Optional
from pydantic import BaseModel
from ..dependencies import get_supabase, get_current_user
from datetime import datetime

router = APIRouter(prefix="/profile", tags=["profile"])

class ProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    language: Optional[str] = None
    currency: Optional[str] = None
    notification_preferences: Optional[dict] = None

class PaymentMethod(BaseModel):
    id: Optional[str] = None
    user_id: str
    type: str  # "card", "upi", "bank"
    details: dict
    is_default: bool = False
    created_at: Optional[datetime] = None

@router.get("/")
async def get_profile(
    user = Depends(get_current_user),
    supabase = Depends(get_supabase)
):
    try:
        response = await supabase.table("profiles").select("*").eq("id", user.id).single().execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/")
async def update_profile(
    profile: ProfileUpdate,
    user = Depends(get_current_user),
    supabase = Depends(get_supabase)
):
    try:
        # Remove None values
        update_data = {k: v for k, v in profile.dict().items() if v is not None}
        
        response = await supabase.table("profiles").update(update_data).eq("id", user.id).execute()
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/payment-methods")
async def get_payment_methods(
    user = Depends(get_current_user),
    supabase = Depends(get_supabase)
):
    try:
        response = await supabase.table("payment_methods").select("*").eq("user_id", user.id).execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/payment-methods")
async def add_payment_method(
    payment_method: PaymentMethod,
    user = Depends(get_current_user),
    supabase = Depends(get_supabase)
):
    try:
        payment_data = payment_method.dict(exclude={"id", "created_at"})
        payment_data["user_id"] = user.id

        response = await supabase.table("payment_methods").insert(payment_data).execute()
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/payment-methods/{method_id}")
async def delete_payment_method(
    method_id: str,
    user = Depends(get_current_user),
    supabase = Depends(get_supabase)
):
    try:
        # Verify ownership
        method = await supabase.table("payment_methods").select("*").eq("id", method_id).single().execute()
        if method.data["user_id"] != user.id:
            raise HTTPException(status_code=403, detail="Not authorized")

        await supabase.table("payment_methods").delete().eq("id", method_id).execute()
        return {"message": "Payment method deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/payment-methods/{method_id}/default")
async def set_default_payment_method(
    method_id: str,
    user = Depends(get_current_user),
    supabase = Depends(get_supabase)
):
    try:
        # Verify ownership
        method = await supabase.table("payment_methods").select("*").eq("id", method_id).single().execute()
        if method.data["user_id"] != user.id:
            raise HTTPException(status_code=403, detail="Not authorized")

        # Remove default from all methods
        await supabase.table("payment_methods").update({"is_default": False}).eq("user_id", user.id).execute()
        
        # Set new default
        response = await supabase.table("payment_methods").update({"is_default": True}).eq("id", method_id).execute()
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 