from fastapi import APIRouter, Depends, HTTPException, Query
from ..models import CropListing, Order
from ..dependencies import get_supabase, get_current_user
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime
from uuid import UUID

router = APIRouter(prefix="/marketplace", tags=["marketplace"])

class CropListing(BaseModel):
    id: Optional[str] = None
    farmer_id: str
    crop_name: str
    quantity: float
    price_per_unit: float
    unit: str
    description: Optional[str] = None
    available: bool = True
    created_at: Optional[datetime] = None

class Order(BaseModel):
    id: Optional[str] = None
    buyer_id: str
    crop_listing_id: str
    quantity: float
    total_price: float
    status: str = "pending"
    created_at: Optional[datetime] = None

@router.post("/listings", response_model=CropListing)
async def create_crop_listing(
    listing: CropListing,
    user = Depends(get_current_user),
    supabase = Depends(get_supabase)
):
    try:
        # Verify user is a farmer
        profile = await supabase.table("profiles").select("*").eq("id", user.id).single().execute()
        if profile.data["user_type"] != "farmer":
            raise HTTPException(status_code=403, detail="Only farmers can create listings")

        # Create listing
        listing_data = listing.dict(exclude={"id", "farmer_id", "created_at"})
        listing_data["farmer_id"] = user.id

        response = await supabase.table("crop_listings").insert(listing_data).execute()
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/listings", response_model=List[CropListing])
async def get_crop_listings(
    available_only: bool = Query(True, description="Filter only available listings"),
    crop_name: Optional[str] = Query(None, description="Filter by crop name"),
    user = Depends(get_current_user),
    supabase = Depends(get_supabase)
):
    try:
        query = supabase.table("crop_listings").select("*")
        
        if available_only:
            query = query.eq("available", True)
        
        if crop_name:
            query = query.eq("crop_name", crop_name)
        
        response = await query.execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/orders", response_model=Order)
async def create_order(
    order: Order,
    user = Depends(get_current_user),
    supabase = Depends(get_supabase)
):
    try:
        # Verify user is a buyer
        profile = await supabase.table("profiles").select("*").eq("id", user.id).single().execute()
        if profile.data["user_type"] != "buyer":
            raise HTTPException(status_code=403, detail="Only buyers can place orders")

        # Get listing details
        listing = await supabase.table("crop_listings").select("*").eq("id", order.crop_listing_id).single().execute()
        if not listing.data:
            raise HTTPException(status_code=404, detail="Listing not found")

        if not listing.data["available"]:
            raise HTTPException(status_code=400, detail="This crop is no longer available")

        if order.quantity > listing.data["quantity"]:
            raise HTTPException(status_code=400, detail="Order quantity exceeds available quantity")

        # Calculate total price
        total_price = order.quantity * listing.data["price_per_unit"]

        # Create order
        order_data = {
            "buyer_id": user.id,
            "crop_listing_id": order.crop_listing_id,
            "quantity": order.quantity,
            "total_price": total_price,
            "status": "pending"
        }

        response = await supabase.table("orders").insert(order_data).execute()
        
        # Update listing quantity and availability
        remaining_quantity = listing.data["quantity"] - order.quantity
        update_data = {
            "quantity": remaining_quantity,
            "available": remaining_quantity > 0
        }
        
        await supabase.table("crop_listings").update(update_data).eq("id", order.crop_listing_id).execute()

        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/orders", response_model=List[Order])
async def get_orders(
    user = Depends(get_current_user),
    supabase = Depends(get_supabase)
):
    try:
        # Get user type
        profile = await supabase.table("profiles").select("*").eq("id", user.id).single().execute()
        
        if profile.data["user_type"] == "buyer":
            # Buyers see their orders
            query = supabase.table("orders").select("*").eq("buyer_id", user.id)
        elif profile.data["user_type"] == "farmer":
            # Farmers see orders for their listings
            query = supabase.table("orders").select("*").eq("farmer_id", user.id)
        else:
            raise HTTPException(status_code=403, detail="Unauthorized")
        
        response = await query.execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/orders/{order_id}")
async def update_order_status(
    order_id: str,
    status: str,
    user = Depends(get_current_user),
    supabase = Depends(get_supabase)
):
    try:
        # Verify user is the farmer who owns the listing
        order = await supabase.table("orders").select("*").eq("id", order_id).single().execute()
        if not order.data:
            raise HTTPException(status_code=404, detail="Order not found")

        listing = await supabase.table("crop_listings").select("*").eq("id", order.data["crop_listing_id"]).single().execute()
        if listing.data["farmer_id"] != user.id:
            raise HTTPException(status_code=403, detail="Only the farmer can update order status")

        # Update order status
        response = await supabase.table("orders").update({"status": status}).eq("id", order_id).execute()
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))