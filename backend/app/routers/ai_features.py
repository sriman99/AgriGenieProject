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

router = APIRouter(prefix="/ai", tags=["ai-features"])

# Initialize Gemini API
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel('gemini-pro')

@router.post("/chat")
async def chat_with_ai(
    message: str,
    current_user = Depends(get_current_user)
):
    try:
        # Add farming context to the prompt
        contextualized_prompt = f"""As an agricultural expert, please provide advice on: {message}
        Consider factors like weather, soil conditions, and best farming practices in your response."""
        
        response = model.generate_content(contextualized_prompt)
        return {"response": response.text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/detect-disease", response_model=DiseaseDetection)
async def detect_disease(
    file: UploadFile = File(...),
    crop_name: str = None,
    current_user = Depends(get_current_user),
    supabase = Depends(get_supabase)
):
    try:
        # Read image file
        contents = await file.read()
        base64_image = base64.b64encode(contents).decode("utf-8")

        # Call Plant.id API
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://api.plant.id/v2/health_assessment",
                json={
                    "images": [base64_image],
                    "modifiers": ["crops_fast"],
                    "disease_details": ["cause", "common_names", "classification", "treatment"]
                },
                headers={
                    "Api-Key": os.getenv("PLANT_ID_API_KEY")
                }
            )

        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail="Plant.id API error")

        # Upload image to Supabase storage
        file_path = f"disease_images/{current_user.id}/{file.filename}"
        storage_response = supabase.storage.from_("disease-images").upload(
            file_path,
            contents
        )

        # Create disease detection record
        detection_data = {
            "farmer_id": current_user.id,
            "crop_name": crop_name,
            "image_url": supabase.storage.from_("disease-images").get_public_url(file_path),
            "detection_result": response.json()
        }

        db_response = supabase.table("disease_detections").insert(detection_data).execute()
        return db_response.data[0]

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

@router.get("/market-prices/{crop_name}")
async def get_market_prices(crop_name: str):
    try:
        # For demo purposes, generating mock data
        # In production, this would fetch from government APIs
        base_price = {
            "rice": 2000,
            "wheat": 1800,
            "cotton": 5500,
            "sugarcane": 300,
            "corn": 1700,
            "soybeans": 3800
        }.get(crop_name.lower(), 1000)
        
        locations = ["Delhi Market", "Mumbai Market", "Chennai Market", "Kolkata Market"]
        
        price_history = []
        for i in range(7):  # Last 7 days
            date = datetime.now() - timedelta(days=i)
            for location in locations:
                variation = random.uniform(-50, 50)
                price_history.append({
                    "date": date.isoformat(),
                    "price": round(base_price + variation, 2),
                    "market_location": location
                })
        
        return price_history
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/predict-price/{crop_name}")
async def predict_price(crop_name: str):
    try:
        # For demo purposes, generating mock AI prediction
        # In production, this would use a trained ML model
        base_price = {
            "rice": 2000,
            "wheat": 1800,
            "cotton": 5500,
            "sugarcane": 300,
            "corn": 1700,
            "soybeans": 3800
        }.get(crop_name.lower(), 1000)
        
        current_price = base_price + random.uniform(-100, 100)
        predicted_increase = random.uniform(5, 15) / 100  # 5-15% increase
        predicted_price = current_price * (1 + predicted_increase)
        
        days_to_wait = random.randint(10, 30)
        best_selling_date = (datetime.now() + timedelta(days=days_to_wait)).strftime("%B %d")
        
        return {
            "crop_name": crop_name,
            "current_price": round(current_price, 2),
            "predicted_price": round(predicted_price, 2),
            "confidence": round(random.uniform(85, 95), 1),
            "best_selling_time": best_selling_date,
            "recommendation": f"Based on market trends and seasonal patterns, we recommend waiting until {best_selling_date} to sell your {crop_name}. Expected price increase of {round(predicted_increase * 100, 1)}%."
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/weather-alerts")
async def get_weather_alerts(location: Optional[str] = None):
    try:
        # For demo purposes, generating mock weather alerts
        # In production, this would use a weather API
        conditions = ["sunny", "rainy", "cloudy", "stormy"]
        severities = ["low", "medium", "high"]
        
        condition = random.choice(conditions)
        severity = random.choice(severities)
        
        messages = {
            "sunny": "Clear skies expected. Good conditions for harvesting.",
            "rainy": "Moderate rainfall expected. Consider protecting crops.",
            "cloudy": "Overcast conditions expected. Moderate humidity levels.",
            "stormy": "Strong winds and rain expected. Take necessary precautions."
        }
        
        return {
            "message": messages[condition],
            "severity": severity,
            "location": location or "Current Location",
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))