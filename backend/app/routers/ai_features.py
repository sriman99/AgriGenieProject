from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from ..dependencies import get_supabase, get_current_user
from ..models import DiseaseDetection
import google.generativeai as genai
import base64
import os
from typing import List, Optional
import httpx
import json
from datetime import datetime, timedelta
import random  # For demo purposes
from functools import lru_cache
from fastapi.responses import JSONResponse

router = APIRouter(prefix="/ai", tags=["ai-features"])

# Initialize Gemini API
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel('gemini-pro')

# Cache chat responses for 5 minutes
@lru_cache(maxsize=100)
def get_cached_chat_response(message: str) -> str:
    try:
        response = model.generate_content(message)
        return response.text
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI model error: {str(e)}")

@router.post("/chat")
async def chat_with_ai(
    message: str,
    current_user = Depends(get_current_user)
):
    try:
        response = get_cached_chat_response(message)
        return {"response": response}
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"detail": "Failed to get AI response. Please try again."}
        )

@router.post("/detect-disease", response_model=DiseaseDetection)
async def detect_disease(
    file: UploadFile = File(...),
    crop_name: str = None,
    current_user = Depends(get_current_user),
    supabase = Depends(get_supabase)
):
    try:
        # Validate file size (5MB limit)
        content = await file.read()
        if len(content) > 5 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="File size should be less than 5MB")
        
        # Validate file type
        if not file.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="File must be an image")

        # In a real implementation, you would:
        # 1. Process the image with a ML model
        # 2. Get disease prediction
        # 3. Store results in database
        
        # For demo purposes, random response
        diseases = {
            "healthy": {
                "description": "No diseases detected",
                "treatment": "Continue regular maintenance",
                "prevention": "Maintain good agricultural practices"
            },
            "leaf_blight": {
                "description": "Fungal infection causing brown spots on leaves",
                "treatment": "Apply appropriate fungicide",
                "prevention": "Improve air circulation, avoid overhead watering"
            },
            "pest_damage": {
                "description": "Insect infestation damaging the crop",
                "treatment": "Use recommended pesticides",
                "prevention": "Regular monitoring and crop rotation"
            }
        }
        
        disease = random.choice(list(diseases.keys()))
        confidence = random.uniform(0.7, 0.95)
        
        result = {
            "disease_name": disease,
            "confidence": confidence,
            **diseases[disease]
        }
        
        # Store detection result
        try:
            supabase.table("disease_detections").insert({
                "farmer_id": current_user.id,
                "crop_name": crop_name,
                "disease_name": disease,
                "confidence": confidence,
                "image_url": None  # In production, store image URL
            }).execute()
        except Exception as e:
            print(f"Failed to store detection result: {e}")
            # Don't fail the request if storage fails
        
        return result
        
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/disease-history", response_model=List[DiseaseDetection])
async def get_disease_detection_history(
    current_user = Depends(get_current_user),
    supabase = Depends(get_supabase)
):
    try:
        response = supabase.table("disease_detections").select("*").eq("farmer_id", current_user.id).execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# Cache market price data for 5 minutes
@lru_cache(maxsize=50)
def get_cached_market_prices(crop_name: Optional[str] = None) -> List[dict]:
    # In a real implementation, fetch from a market price API
    # For demo, generate random data
    base_price = {
        "Rice": 40,
        "Wheat": 30,
        "Cotton": 60,
        "Sugarcane": 35,
        "Corn": 25,
        "Soybeans": 45
    }.get(crop_name, random.randint(20, 70))
    
    return [
        {
            "date": (datetime.now() - timedelta(days=i)).strftime("%Y-%m-%d"),
            "price": base_price * (1 + random.uniform(-0.1, 0.1)),
            "volume": random.randint(1000, 5000)
        }
        for i in range(7)
    ]

@router.get("/market-prices/{crop_name}")
async def get_market_prices(crop_name: str):
    try:
        prices = get_cached_market_prices(crop_name)
        return JSONResponse(content=prices)
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"detail": f"Failed to fetch market prices: {str(e)}"}
        )

@router.get("/predict-price/{crop_name}")
async def predict_price(crop_name: str):
    try:
        current_price = get_cached_market_prices(crop_name)[0]["price"]
        prediction = current_price * (1 + random.uniform(-0.2, 0.3))
        confidence = random.uniform(0.7, 0.95)
        
        recommendation = "Hold for now - prices are stable."
        if prediction > current_price * 1.1:
            recommendation = f"Consider selling {crop_name} soon. Prices are expected to rise significantly."
        elif prediction < current_price * 0.9:
            recommendation = f"Hold your {crop_name}. Prices are expected to fall."
        
        return {
            "crop_name": crop_name,
            "current_price": current_price,
            "predicted_price": prediction,
            "confidence": confidence,
            "recommendation": recommendation
        }
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"detail": f"Failed to generate price prediction: {str(e)}"}
        )

@router.get("/weather-alerts")
async def get_weather_alerts(location: Optional[str] = None):
    try:
        # In a real implementation, fetch from a weather API
        # For demo, random alerts
        alerts = [
            "Clear skies expected for the next 3 days - good time for harvesting",
            "Heavy rainfall expected tomorrow - consider protecting sensitive crops",
            "High temperatures forecasted - ensure adequate irrigation",
            "No significant weather events expected",
            "Light showers expected - good conditions for planting"
        ]
        
        return {
            "type": "weather",
            "severity": random.choice(["low", "medium", "high"]),
            "message": random.choice(alerts),
            "location": location or "current-location"
        }
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"detail": f"Failed to fetch weather alerts: {str(e)}"}
        )