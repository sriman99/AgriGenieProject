from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

class UserBase(BaseModel):
    email: str
    full_name: str
    user_type: str  # "farmer" or "buyer"

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class CropListing(BaseModel):
    id: Optional[int] = None
    farmer_id: int
    crop_name: str
    quantity: float
    price_per_unit: float
    unit: str  # kg, ton, etc.
    description: Optional[str] = None
    available: bool = True
    created_at: Optional[datetime] = None

class Order(BaseModel):
    id: Optional[int] = None
    buyer_id: int
    crop_listing_id: int
    quantity: float
    total_price: float
    status: str  # "pending", "accepted", "completed", "cancelled"
    created_at: Optional[datetime] = None

class DiseaseDetection(BaseModel):
    id: Optional[str] = None
    farmer_id: str
    crop_name: str
    image_url: str
    detection_result: Dict[str, Any]
    created_at: Optional[datetime] = None

class WeatherAlert(BaseModel):
    message: str
    severity: str
    location: str
    timestamp: datetime

class MarketPrice(BaseModel):
    crop_name: str
    price: float
    market_location: str
    date: datetime

class PricePrediction(BaseModel):
    crop_name: str
    current_price: float
    predicted_price: float
    confidence: float
    best_selling_time: str
    recommendation: str