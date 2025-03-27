from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from typing import Dict, List, Optional, Any
from ..dependencies import get_current_user, get_supabase
import httpx
import os
from dotenv import load_dotenv
import base64
from pydantic import BaseModel
from datetime import datetime

load_dotenv()

router = APIRouter(prefix="/disease-detection", tags=["disease-detection"])

PLANT_ID_API_KEY = os.getenv("PLANT_ID_API_KEY")
PLANT_ID_API_URL = "https://api.plant.id/v2/identify"

class DiseaseDetection(BaseModel):
    id: Optional[str] = None
    farmer_id: str
    crop_name: str
    image_url: str
    detection_result: Dict[str, Any]
    created_at: Optional[datetime] = None

class DiseaseDetectionResponse(BaseModel):
    disease_name: str
    confidence: float
    treatment: List[str]
    prevention: List[str]
    images: List[str]

@router.post("/detect", response_model=DiseaseDetectionResponse)
async def detect_disease(
    file: UploadFile = File(...),
    crop_name: str = None,
    user = Depends(get_current_user),
    supabase = Depends(get_supabase)
):
    try:
        # Read and encode the image
        contents = await file.read()
        image_base64 = base64.b64encode(contents).decode('utf-8')

        # Prepare the request to Plant.id API
        headers = {
            "Api-Key": PLANT_ID_API_KEY,
            "Content-Type": "application/json"
        }

        payload = {
            "images": [image_base64],
            "plant_details": ["diseases"],
            "language": "en"
        }

        async with httpx.AsyncClient() as client:
            response = await client.post(PLANT_ID_API_URL, json=payload, headers=headers)
            
            if response.status_code != 200:
                raise HTTPException(status_code=500, detail="Failed to process image")

            data = response.json()
            
            # Extract disease information
            disease_info = data.get("suggestions", [{}])[0]
            disease_name = disease_info.get("plant_name", "Unknown Disease")
            confidence = disease_info.get("probability", 0.0)

            # Generate treatment and prevention recommendations
            treatment = [
                "Apply appropriate fungicide/pesticide",
                "Remove infected plant parts",
                "Improve air circulation",
                "Maintain proper watering schedule"
            ]

            prevention = [
                "Regular plant inspection",
                "Proper spacing between plants",
                "Use disease-resistant varieties",
                "Maintain good soil health"
            ]

            # Store detection result in Supabase
            detection_result = {
                "disease_name": disease_name,
                "confidence": confidence,
                "treatment": treatment,
                "prevention": prevention
            }

            # Store in database
            await supabase.table("disease_detections").insert({
                "farmer_id": user.id,
                "crop_name": crop_name,
                "image_url": image_base64,  # In production, store image URL
                "detection_result": detection_result
            }).execute()

            return DiseaseDetectionResponse(
                disease_name=disease_name,
                confidence=confidence,
                treatment=treatment,
                prevention=prevention,
                images=[image_base64]
            )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/history", response_model=List[DiseaseDetection])
async def get_detection_history(
    user = Depends(get_current_user),
    supabase = Depends(get_supabase)
):
    try:
        # Get detection history from Supabase
        response = await supabase.table("disease_detections").select("*").eq("farmer_id", user.id).execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/recommendations/{disease_name}")
async def get_disease_recommendations(
    disease_name: str,
    user = Depends(get_current_user)
):
    try:
        # Get specific recommendations for the disease
        recommendations = {
            "treatment": [
                "Apply appropriate fungicide/pesticide",
                "Remove infected plant parts",
                "Improve air circulation",
                "Maintain proper watering schedule"
            ],
            "prevention": [
                "Regular plant inspection",
                "Proper spacing between plants",
                "Use disease-resistant varieties",
                "Maintain good soil health"
            ],
            "monitoring": [
                "Check plants daily for symptoms",
                "Monitor weather conditions",
                "Keep records of outbreaks",
                "Regular soil testing"
            ]
        }
        return recommendations
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 