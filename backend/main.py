from fastapi import FastAPI, HTTPException, Query
from fastapi.responses import JSONResponse, HTMLResponse
import requests
import os
import pandas as pd
import matplotlib.pyplot as plt
from datetime import datetime, timedelta
from sklearn.linear_model import LinearRegression
import numpy as np
import io
import base64
from typing import Optional
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()
app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DATA_GOV_API_KEY = os.getenv("DATA_GOV_API_KEY")

if not DATA_GOV_API_KEY:
    logger.error("DATA_GOV_API_KEY not found in environment variables")
    raise ValueError("DATA_GOV_API_KEY environment variable is required")

def fetch_crop_data(state: str, commodity: str, days: int = 7):
    base_url = "https://api.data.gov.in/resource/35985678-0d79-46b4-9ed6-6f13308a1d24"
    
    records = []
    unit = "Quintal"  
    
    try:
        for i in range(days, 0, -1):
            date = (datetime.today() - timedelta(days=i)).strftime("%d-%m-%Y")
            url = f"{base_url}?api-key={DATA_GOV_API_KEY}&format=json&limit=1&filters[State.keyword]={state}&filters[Commodity.keyword]={commodity}&filters[Arrival_Date]={date}"
            
            logger.info(f"Fetching data from URL: {url}")
            response = requests.get(url)
            response.raise_for_status()  # Raise an exception for bad status codes
            
            data = response.json()
            
            if 'records' in data and data['records']:
                record = data['records'][0]
                try:
                    records.append({
                        "Date": date,
                        "Min Price": float(record['Min_Price']),
                        "Max Price": float(record['Max_Price']),
                        "Modal Price": float(record['Modal_Price'])
                    })
                except (KeyError, ValueError) as e:
                    logger.error(f"Error processing record: {e}")
                    continue
    
        if not records:
            logger.warning(f"No data found for state: {state}, commodity: {commodity}")
            raise HTTPException(status_code=404, detail="No data found for the given state and commodity.")
        
        df = pd.DataFrame(records)
        return df, unit
        
    except requests.exceptions.RequestException as e:
        logger.error(f"Error fetching data from API: {e}")
        raise HTTPException(status_code=500, detail=f"Error fetching data from API: {str(e)}")
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")

def plot_price_trend(df: pd.DataFrame, commodity: str, unit: str, state: str):
    try:
        plt.figure(figsize=(10, 6))
        plt.plot(df['Date'], df['Modal Price'], marker='o', linestyle='-', color='b', label='Modal Price')
        plt.plot(df['Date'], df['Min Price'], marker='o', linestyle='--', color='g', label='Min Price')
        plt.plot(df['Date'], df['Max Price'], marker='o', linestyle='--', color='r', label='Max Price')
        
        plt.xlabel('Date')
        plt.ylabel(f'Price (INR per {unit})')
        plt.title(f'{commodity} Price Trend in {state} for the Past {len(df)} Days')
        plt.xticks(rotation=45)
        plt.legend()
        plt.grid()
        
        # Save the plot to a BytesIO object
        buf = io.BytesIO()
        plt.savefig(buf, format='png')
        buf.seek(0)
        plt.close()
        
        # Encode the image to base64
        image_base64 = base64.b64encode(buf.getvalue()).decode('utf-8')
        return f'<img src="data:image/png;base64,{image_base64}" />'
    except Exception as e:
        logger.error(f"Error creating price trend plot: {e}")
        raise HTTPException(status_code=500, detail=f"Error creating price trend plot: {str(e)}")

def predict_price(df: pd.DataFrame):
    try:
        X = np.array(range(len(df))).reshape(-1, 1)
        y = np.array(df['Modal Price']).reshape(-1, 1)
        
        model = LinearRegression()
        model.fit(X, y)
        
        future_day = np.array([[len(df)]])
        predicted_price = model.predict(future_day)[0][0]
        
        return round(predicted_price, 2)
    except Exception as e:
        logger.error(f"Error predicting price: {e}")
        raise HTTPException(status_code=500, detail=f"Error predicting price: {str(e)}")

@app.get("/fetch-crop-data/", response_class=JSONResponse)
async def get_crop_data(
    state: str = Query(..., description="State name (e.g., Telangana)"),
    commodity: str = Query(..., description="Commodity name (e.g., Onion)"),
    days: int = Query(7, description="Number of days of data to fetch (default is 7)")
):
    try:
        logger.info(f"Fetching crop data for state: {state}, commodity: {commodity}, days: {days}")
        df, unit = fetch_crop_data(state, commodity, days)
        return {"data": df.to_dict(orient='records'), "unit": unit}
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Unexpected error in get_crop_data: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/plot-price-trend/", response_class=HTMLResponse)
async def get_price_trend_plot(
    state: str = Query(..., description="State name (e.g., Telangana)"),
    commodity: str = Query(..., description="Commodity name (e.g., Onion)")
):
    try:
        logger.info(f"Generating price trend plot for state: {state}, commodity: {commodity}")
        df, unit = fetch_crop_data(state, commodity)
        image_base64 = plot_price_trend(df, commodity, unit, state)
        return image_base64
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Unexpected error in get_price_trend_plot: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/predict-price/", response_class=JSONResponse)
async def get_predicted_price(
    state: str = Query(..., description="State name (e.g., Telangana)"),
    commodity: str = Query(..., description="Commodity name (e.g., Onion)")
):
    try:
        logger.info(f"Predicting price for state: {state}, commodity: {commodity}")
        df, unit = fetch_crop_data(state, commodity)
        predicted_price = predict_price(df)
        return {"predicted_price": predicted_price, "unit": unit}
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Unexpected error in get_predicted_price: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 