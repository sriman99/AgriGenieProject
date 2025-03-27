from fastapi import APIRouter, Depends, HTTPException, Query
from ..dependencies import get_supabase, get_current_user
from typing import List, Optional, Dict
import httpx
import os
from datetime import datetime, timedelta
import google.generativeai as genai
from functools import lru_cache
import json
from dotenv import load_dotenv
import pandas as pd
import numpy as np
from sklearn.linear_model import LinearRegression
import matplotlib.pyplot as plt
import io
import base64
from pydantic import BaseModel

load_dotenv()

router = APIRouter(prefix="/market-analysis", tags=["market-analysis"])

# Initialize Gemini API
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel('gemini-pro')

DATA_GOV_API_KEY = os.getenv("DATA_GOV_API_KEY")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

class PriceData(BaseModel):
    date: str
    min_price: float
    max_price: float
    modal_price: float

class MarketAnalysis(BaseModel):
    current_price: float
    predicted_price: float
    price_trend: str
    best_time_to_sell: str
    market_recommendations: List[str]
    risk_factors: List[str]
    supply_demand_analysis: str

# Cache government API responses for 5 minutes
@lru_cache(maxsize=50)
async def get_govt_market_data(crop_name: str) -> List[Dict]:
    try:
        async with httpx.AsyncClient() as client:
            # Government API endpoint for market prices
            url = f"https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070"
            params = {
                "api-key": DATA_GOV_API_KEY,
                "format": "json",
                "filters[crop_name]": crop_name,
                "limit": 100
            }
            response = await client.get(url, params=params)
            response.raise_for_status()
            data = response.json()
            
            # Process and format the data
            records = data.get("records", [])
            return [
                {
                    "date": record.get("arrival_date"),
                    "price": float(record.get("modal_price", 0)),
                    "market": record.get("market"),
                    "state": record.get("state"),
                    "quantity": float(record.get("quantity", 0))
                }
                for record in records
            ]
    except Exception as e:
        print(f"Error fetching government market data: {e}")
        return []

async def get_ai_analysis(crop_name: str, market_data: List[Dict]) -> Dict:
    try:
        # Prepare data for AI analysis
        analysis_prompt = f"""
        Analyze the following market data for {crop_name} and provide insights:
        
        Market Data:
        {json.dumps(market_data, indent=2)}
        
        Please provide:
        1. Price trend analysis
        2. Best time to sell
        3. Market recommendations
        4. Risk factors
        5. Supply-demand analysis
        """
        
        response = model.generate_content(analysis_prompt)
        analysis = response.text
        
        # Extract key points from analysis
        return {
            "analysis": analysis,
            "market_data": market_data,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        print(f"Error generating AI analysis: {e}")
        return {
            "error": "Failed to generate analysis",
            "market_data": market_data
        }

async def fetch_crop_data(state: str, commodity: str, days: int = 7):
    base_url = "https://api.data.gov.in/resource/35985678-0d79-46b4-9ed6-6f13308a1d24"
    
    records = []
    unit = "Quintal"  
    
    for i in range(days, 0, -1):
        date = (datetime.today() - timedelta(days=i)).strftime("%d-%m-%Y")
        url = f"{base_url}?api-key={DATA_GOV_API_KEY}&format=json&limit=1&filters[State.keyword]={state}&filters[Commodity.keyword]={commodity}&filters[Arrival_Date]={date}"
        async with httpx.AsyncClient() as client:
            response = await client.get(url)
            data = response.json()
            
            if 'records' in data and data['records']:
                record = data['records'][0]
                records.append({
                    "date": date,
                    "min_price": float(record['Min_Price']),
                    "max_price": float(record['Max_Price']),
                    "modal_price": float(record['Modal_Price'])
                })
    
    if not records:
        raise HTTPException(status_code=404, detail="No data found for the given state and commodity.")
    
    return pd.DataFrame(records), unit

def predict_price(df: pd.DataFrame):
    X = np.array(range(len(df))).reshape(-1, 1)
    y = np.array(df['modal_price']).reshape(-1, 1)
    
    model = LinearRegression()
    model.fit(X, y)
    
    future_day = np.array([[len(df)]])
    predicted_price = model.predict(future_day)[0][0]
    
    return round(predicted_price, 2)

@router.get("/prices/{crop_name}", response_model=List[PriceData])
async def get_market_prices(
    crop_name: str,
    state: str = Query(..., description="State name (e.g., Telangana)"),
    days: int = Query(7, description="Number of days of data to fetch"),
    user = Depends(get_current_user),
    supabase = Depends(get_supabase)
):
    try:
        df, unit = await fetch_crop_data(state, crop_name, days)
        
        # Store the data in Supabase for historical tracking
        await supabase.table("market_prices").insert({
            "user_id": user.id,
            "crop_name": crop_name,
            "state": state,
            "price_data": df.to_dict(orient='records'),
            "unit": unit
        }).execute()
        
        return df.to_dict(orient='records')
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/analysis/{crop_name}", response_model=MarketAnalysis)
async def get_market_analysis(
    crop_name: str,
    state: str = Query(..., description="State name (e.g., Telangana)"),
    user = Depends(get_current_user),
    supabase = Depends(get_supabase)
):
    try:
        # Fetch market data
        df, unit = await fetch_crop_data(state, crop_name)
        
        # Get price prediction
        predicted_price = predict_price(df)
        
        # Get AI analysis
        ai_analysis = await get_ai_analysis(crop_name, await get_govt_market_data(crop_name))
        
        # Store the analysis in Supabase
        await supabase.table("ai_insights").insert({
            "user_id": user.id,
            "crop_name": crop_name,
            "state": state,
            "insight_type": "market_analysis",
            "analysis_data": {
                "current_price": df['modal_price'].iloc[-1],
                "predicted_price": predicted_price,
                "ai_analysis": ai_analysis
            }
        }).execute()
        
        return MarketAnalysis(
            current_price=df['modal_price'].iloc[-1],
            predicted_price=predicted_price,
            price_trend="increasing" if df['modal_price'].iloc[-1] > df['modal_price'].iloc[0] else "decreasing",
            best_time_to_sell=ai_analysis.get("best_time_to_sell", "Not available"),
            market_recommendations=ai_analysis.get("market_recommendations", []),
            risk_factors=ai_analysis.get("risk_factors", []),
            supply_demand_analysis=ai_analysis.get("supply_demand_analysis", "Not available")
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/predict/{crop_name}")
async def predict_market_prices(
    crop_name: str,
    state: str = Query(..., description="State name (e.g., Telangana)"),
    user = Depends(get_current_user),
    supabase = Depends(get_supabase)
):
    try:
        df, unit = await fetch_crop_data(state, crop_name)
        predicted_price = predict_price(df)
        
        # Store the prediction in Supabase
        await supabase.table("ai_insights").insert({
            "user_id": user.id,
            "crop_name": crop_name,
            "state": state,
            "insight_type": "price_prediction",
            "analysis_data": {
                "predicted_price": predicted_price,
                "unit": unit
            }
        }).execute()
        
        return {
            "predicted_price": predicted_price,
            "unit": unit
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/recommendations/{crop_name}")
async def get_market_recommendations(
    crop_name: str,
    state: str = Query(..., description="State name (e.g., Telangana)"),
    user = Depends(get_current_user),
    supabase = Depends(get_supabase)
):
    try:
        df, unit = await fetch_crop_data(state, crop_name)
        ai_analysis = await get_ai_analysis(crop_name, await get_govt_market_data(crop_name))
        
        # Store the recommendations in Supabase
        await supabase.table("ai_insights").insert({
            "user_id": user.id,
            "crop_name": crop_name,
            "state": state,
            "insight_type": "market_recommendations",
            "analysis_data": ai_analysis
        }).execute()
        
        return ai_analysis
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 