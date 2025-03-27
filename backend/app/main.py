from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os
from supabase import create_client, Client
from supabase.client import AsyncClient, ClientOptions
import httpx

from .routers import auth, marketplace, ai_features, realtime, market_analysis, chatbot, disease_detection

load_dotenv()

app = FastAPI(title="AgriGenie API")

# CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("CORS_ORIGIN", "http://localhost:3000")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Supabase client initialization with proper configuration
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_KEY")

if not supabase_url or not supabase_key:
    raise ValueError("Missing Supabase credentials in environment variables")

# Initialize Supabase async client with real-time enabled
supabase: AsyncClient = create_client(
    supabase_url=supabase_url,
    supabase_key=supabase_key,
    options=ClientOptions(
        schema='public',
        headers={
            'apikey': supabase_key
        }
    )
)

# Include routers
app.include_router(auth.router)
app.include_router(marketplace.router)
app.include_router(ai_features.router)
app.include_router(realtime.router)
app.include_router(market_analysis.router)
app.include_router(chatbot.router)
app.include_router(disease_detection.router)

@app.get("/")
async def root():
    return {"message": "Welcome to AgriGenie API"}

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "supabase": "connected" if supabase else "not connected"
    }

# Initialize real-time subscriptions on startup
@app.on_event("startup")
async def startup_event():
    # Set up Supabase real-time subscriptions
    try:
        # Subscribe to market prices
        channel = await supabase.realtime.channel('market_prices')
        await channel.on(
            'postgres_changes',
            event='*',
            schema='public',
            table='market_prices',
            callback=lambda payload: print(f"Market price update: {payload}")
        ).subscribe()

        # Subscribe to AI insights
        channel = await supabase.realtime.channel('ai_insights')
        await channel.on(
            'postgres_changes',
            event='*',
            schema='public',
            table='ai_insights',
            callback=lambda payload: print(f"AI insight update: {payload}")
        ).subscribe()

        # Subscribe to crop listings
        channel = await supabase.realtime.channel('crop_listings')
        await channel.on(
            'postgres_changes',
            event='*',
            schema='public',
            table='crop_listings',
            callback=lambda payload: print(f"Crop listing update: {payload}")
        ).subscribe()

        # Subscribe to orders
        channel = await supabase.realtime.channel('orders')
        await channel.on(
            'postgres_changes',
            event='*',
            schema='public',
            table='orders',
            callback=lambda payload: print(f"Order update: {payload}")
        ).subscribe()

        # Subscribe to disease detections
        channel = await supabase.realtime.channel('disease_detections')
        await channel.on(
            'postgres_changes',
            event='*',
            schema='public',
            table='disease_detections',
            callback=lambda payload: print(f"Disease detection update: {payload}")
        ).subscribe()

        print("Successfully set up real-time subscriptions")
    except Exception as e:
        print(f"Error setting up real-time subscriptions: {e}")