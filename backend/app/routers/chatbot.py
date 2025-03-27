from fastapi import APIRouter, Depends, HTTPException
from typing import Dict, List
from ..dependencies import get_gemini_model, get_current_user
import google.generativeai as genai
from pydantic import BaseModel

router = APIRouter(prefix="/chatbot", tags=["chatbot"])

class ChatMessage(BaseModel):
    message: str
    language: str = "en"  # Default to English
    context: Dict = {}  # Additional context like location, crop type, etc.

class ChatResponse(BaseModel):
    response: str
    suggestions: List[str] = []
    related_info: Dict = {}

@router.post("/chat", response_model=ChatResponse)
async def chat_with_ai(
    chat_message: ChatMessage,
    model = Depends(get_gemini_model),
    user = Depends(get_current_user)
):
    try:
        # Construct the prompt with context
        prompt = f"""
        You are an AI farming assistant. The user is asking: {chat_message.message}
        
        Context:
        - Language: {chat_message.language}
        - User Type: {user.user_metadata.get('role', 'farmer')}
        - Additional Context: {chat_message.context}
        
        Please provide:
        1. A helpful response to the user's question
        2. 2-3 practical suggestions or tips
        3. Any relevant farming information
        """
        
        # Generate response
        response = model.generate_content(prompt)
        
        # Parse the response
        response_text = response.text
        
        # Extract suggestions and related info
        suggestions = []
        related_info = {}
        
        # Basic parsing of the response
        if "Suggestions:" in response_text:
            suggestions_section = response_text.split("Suggestions:")[1].split("\n")
            suggestions = [s.strip() for s in suggestions_section if s.strip()]
        
        if "Related Information:" in response_text:
            info_section = response_text.split("Related Information:")[1].split("\n")
            related_info = {"details": [i.strip() for i in info_section if i.strip()]}
        
        return ChatResponse(
            response=response_text.split("\n")[0],  # First line as main response
            suggestions=suggestions,
            related_info=related_info
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/recommendations/{crop_type}")
async def get_crop_recommendations(
    crop_type: str,
    model = Depends(get_gemini_model),
    user = Depends(get_current_user)
):
    try:
        prompt = f"""
        Provide detailed farming recommendations for {crop_type}:
        1. Best planting time
        2. Required conditions
        3. Common issues and solutions
        4. Expected yield
        5. Market demand
        """
        
        response = model.generate_content(prompt)
        return {"recommendations": response.text}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/weather-advice/{location}")
async def get_weather_based_advice(
    location: str,
    model = Depends(get_gemini_model),
    user = Depends(get_current_user)
):
    try:
        prompt = f"""
        Provide farming advice based on weather conditions for {location}:
        1. Current weather impact on crops
        2. Recommended actions
        3. Precautions to take
        4. Best practices for the current conditions
        """
        
        response = model.generate_content(prompt)
        return {"advice": response.text}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 