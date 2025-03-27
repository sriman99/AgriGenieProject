from fastapi import APIRouter, Depends, WebSocket, WebSocketDisconnect, HTTPException
from ..dependencies import get_supabase, get_current_user
from typing import List, Dict, Any
import json
import asyncio
from datetime import datetime
from supabase import Client

router = APIRouter(prefix="/realtime", tags=["realtime"])

# Store active WebSocket connections
class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, user_id: str):
        await websocket.accept()
        if user_id not in self.active_connections:
            self.active_connections[user_id] = []
        self.active_connections[user_id].append(websocket)

    def disconnect(self, websocket: WebSocket, user_id: str):
        if user_id in self.active_connections:
            self.active_connections[user_id].remove(websocket)
            if not self.active_connections[user_id]:
                del self.active_connections[user_id]

    async def broadcast_to_user(self, user_id: str, message: dict):
        if user_id in self.active_connections:
            for connection in self.active_connections[user_id]:
                await connection.send_json(message)

manager = ConnectionManager()

# Store active subscriptions
active_subscriptions: Dict[str, Any] = {}

@router.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: str):
    await manager.connect(websocket, user_id)
    try:
        while True:
            data = await websocket.receive_text()
            # Handle incoming messages if needed
            await manager.broadcast_to_user(user_id, {"message": data})
    except WebSocketDisconnect:
        manager.disconnect(websocket, user_id)

@router.post("/subscribe/{table}")
async def subscribe_to_table(
    table: str,
    supabase: Client = Depends(get_supabase)
):
    """Subscribe to real-time updates for a specific table"""
    try:
        if table in active_subscriptions:
            return {"message": f"Already subscribed to {table}"}
        
        channel = supabase.realtime.channel(f'realtime_{table}')
        
        def handle_event(payload: Dict[str, Any]):
            print(f"Received {table} update: {payload}")
            # Here you can add logic to handle the update
            # For example, broadcasting to connected WebSocket clients
        
        channel.on(
            'postgres_changes',
            event='*',
            schema='public',
            table=table,
            callback=handle_event
        ).subscribe()
        
        active_subscriptions[table] = channel
        return {"message": f"Successfully subscribed to {table}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/unsubscribe/{table}")
async def unsubscribe_from_table(table: str):
    """Unsubscribe from real-time updates for a specific table"""
    try:
        if table in active_subscriptions:
            channel = active_subscriptions[table]
            await channel.unsubscribe()
            del active_subscriptions[table]
            return {"message": f"Successfully unsubscribed from {table}"}
        return {"message": f"No active subscription for {table}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/status")
async def get_subscription_status():
    """Get status of all active subscriptions"""
    return {
        "active_subscriptions": list(active_subscriptions.keys()),
        "count": len(active_subscriptions)
    }

# Market price updates
@router.get("/market-prices/{crop_name}")
async def get_realtime_market_prices(
    crop_name: str,
    supabase = Depends(get_supabase)
):
    try:
        # Subscribe to market price updates
        response = supabase.table("market_prices").select("*").eq("crop_name", crop_name).execute()
        
        # Set up real-time subscription
        supabase.table("market_prices").select("*").eq("crop_name", crop_name).subscribe(
            lambda payload: asyncio.create_task(
                manager.broadcast_to_user(crop_name, {
                    "type": "market_price_update",
                    "data": payload
                })
            )
        )

        return response.data
    except Exception as e:
        return {"status": "error", "message": str(e)}

# Weather updates
@router.get("/weather/{location}")
async def get_realtime_weather(
    location: str,
    supabase = Depends(get_supabase)
):
    try:
        # Subscribe to weather updates
        response = supabase.table("weather_updates").select("*").eq("location", location).execute()
        
        # Set up real-time subscription
        supabase.table("weather_updates").select("*").eq("location", location).subscribe(
            lambda payload: asyncio.create_task(
                manager.broadcast_to_user(location, {
                    "type": "weather_update",
                    "data": payload
                })
            )
        )

        return response.data
    except Exception as e:
        return {"status": "error", "message": str(e)} 