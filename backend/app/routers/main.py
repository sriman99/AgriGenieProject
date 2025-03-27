from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from weatherEnd import (
    weather_endpoint,
    recommendations_endpoint,
    precautions_endpoint,
    weather_graph_endpoint,
    get_city_coordinates,
    fetch_weather_data,
    get_crop_recommendations,
    get_crop_precautions,
    plot_weather_trends
)
from PredictionEnd import (
    get_crop_data,
    get_price_trend_plot,
    get_predicted_price,
    fetch_crop_data,
    plot_price_trend,
    predict_price
)
from dotenv import load_dotenv

load_dotenv()
app = FastAPI()

# Add CORS middleware to allow frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files
app.mount("/static", StaticFiles(directory="static"), name="static")



# Weather endpoints
app.get("/weather/{city}")(weather_endpoint)
app.get("/recommendations/{city}")(recommendations_endpoint)
app.get("/precautions/{city}/{crop}")(precautions_endpoint)
app.get("/weather/graph/{city}")(weather_graph_endpoint)

# Prediction endpoints
app.get("/fetch-crop-data/")(get_crop_data)
app.get("/plot-price-trend/")(get_price_trend_plot)
app.get("/predict-price/")(get_predicted_price)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)