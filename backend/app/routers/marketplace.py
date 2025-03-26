from fastapi import APIRouter, Depends, HTTPException
from ..models import CropListing, Order
from ..dependencies import get_supabase, get_current_user
from typing import List

router = APIRouter(prefix="/marketplace", tags=["marketplace"])

@router.post("/crops", response_model=CropListing)
async def create_crop_listing(
    listing: CropListing,
    current_user = Depends(get_current_user),
    supabase = Depends(get_supabase)
):
    try:
        # Ensure user is a farmer
        user_data = supabase.table("profiles").select("user_type").eq("id", current_user.id).single().execute()
        if user_data.data["user_type"] != "farmer":
            raise HTTPException(status_code=403, detail="Only farmers can create listings")

        listing_data = listing.model_dump()
        listing_data["farmer_id"] = current_user.id
        
        response = supabase.table("crop_listings").insert(listing_data).execute()
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/crops", response_model=List[CropListing])
async def get_crop_listings(supabase = Depends(get_supabase)):
    try:
        response = supabase.table("crop_listings").select("*").eq("available", True).execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/orders", response_model=Order)
async def create_order(
    order: Order,
    current_user = Depends(get_current_user),
    supabase = Depends(get_supabase)
):
    try:
        # Ensure user is a buyer
        user_data = supabase.table("profiles").select("user_type").eq("id", current_user.id).single().execute()
        if user_data.data["user_type"] != "buyer":
            raise HTTPException(status_code=403, detail="Only buyers can create orders")

        order_data = order.model_dump()
        order_data["buyer_id"] = current_user.id
        
        # Check if crop is available and update quantity
        crop = supabase.table("crop_listings").select("*").eq("id", order.crop_listing_id).single().execute()
        if not crop.data["available"] or crop.data["quantity"] < order.quantity:
            raise HTTPException(status_code=400, detail="Crop not available in requested quantity")

        # Create order and update crop listing
        response = supabase.table("orders").insert(order_data).execute()
        
        # Update crop listing quantity
        new_quantity = crop.data["quantity"] - order.quantity
        supabase.table("crop_listings").update({
            "quantity": new_quantity,
            "available": new_quantity > 0
        }).eq("id", order.crop_listing_id).execute()

        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/orders/farmer", response_model=List[Order])
async def get_farmer_orders(
    current_user = Depends(get_current_user),
    supabase = Depends(get_supabase)
):
    try:
        # Get all orders for crops listed by this farmer
        response = supabase.table("orders").select(
            "*, crop_listings!inner(*)"
        ).eq("crop_listings.farmer_id", current_user.id).execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/orders/buyer", response_model=List[Order])
async def get_buyer_orders(
    current_user = Depends(get_current_user),
    supabase = Depends(get_supabase)
):
    try:
        response = supabase.table("orders").select("*").eq("buyer_id", current_user.id).execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))