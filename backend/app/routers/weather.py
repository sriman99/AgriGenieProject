import requests
import pandas as pd
import os
import matplotlib.pyplot as plt
from datetime import datetime
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

OPENWEATHER_API_KEY = os.getenv("OPENWEATHER_API_KEY")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

def get_city_coordinates(city):
    url = f"https://api.openweathermap.org/data/2.5/weather/?q={city}&appid={OPENWEATHER_API_KEY}&units=metric"    
    response = requests.get(url)
    data = response.json()
    
    if not data:
        raise ValueError("Invalid city name or no data found")
    return data["coord"]["lat"], data["coord"]["lon"]

def fetch_weather_data(city):
    lat, lon = get_city_coordinates(city)
    api_key = "61d962dcd38830f6c04d85132964718d"
    url = f"https://api.openweathermap.org/data/2.5/forecast?lat={lat}&lon={lon}&cnt=20&units=metric&appid={OPENWEATHER_API_KEY}"
    
    response = requests.get(url)
    data = response.json()
    if "list" not in data:
        raise ValueError("Invalid response from weather API")
    
    records = []
    for entry in data["list"]:
        date = datetime.utcfromtimestamp(entry["dt"]).strftime('%Y-%m-%d %H:%M:%S')
        temp = entry["main"]["temp"]  
        humidity = entry["main"]["humidity"]
        rain = entry.get("rain", {}).get("3h", 0)  
        wind_speed = entry["wind"]["speed"]
        weather_desc = entry["weather"][0]["description"]
        
        records.append({
            "Date & Time": date,
            "Temperature (C)": temp,
            "Humidity (%)": humidity,
            "Rain (mm)": rain,
            "Wind Speed (m/s)": wind_speed,
            "Weather Description": weather_desc
        })
    
    df = pd.DataFrame(records)
    return df

def plot_weather_trends(df, city):
    fig, axes = plt.subplots(3, 1, figsize=(10, 12), sharex=True)
    
    axes[0].plot(df["Date & Time"], df["Temperature (C)"], marker='o', linestyle='-', color='r')
    axes[0].set_ylabel("Temperature (C)")
    axes[0].set_title(f"Temperature Trends in {city}")
    axes[0].grid()
    
    axes[1].plot(df["Date & Time"], df["Humidity (%)"], marker='o', linestyle='-', color='b')
    axes[1].set_ylabel("Humidity (%)")
    axes[1].set_title(f"Humidity Trends in {city}")
    axes[1].grid()
    
    axes[2].bar(df["Date & Time"], df["Rain (mm)"], color='g', alpha=0.5)
    axes[2].set_ylabel("Rainfall (mm)")
    axes[2].set_title(f"Rainfall Trends in {city}")
    axes[2].set_xticks(range(len(df)))
    axes[2].set_xticklabels(df["Date & Time"], rotation=45, ha='right')
    axes[2].grid()
    
    plt.tight_layout()
    plt.show()

def get_crop_recommendations(weather_data, city):
    genai.configure(api_key=GEMINI_API_KEY)
    model = genai.GenerativeModel("gemini-1.5-pro-002")
    # prompt = f"""
    # Based on the following weather data for {city}, suggest the best crops to grow and precautions for existing crops:
    
    # Temperature: {weather_data['Temperature (C)'].mean()}°C
    # Humidity: {weather_data['Humidity (%)'].mean()}%
    # Rainfall: {weather_data['Rain (mm)'].mean()} mm
    # Wind Speed: {weather_data['Wind Speed (m/s)'].mean()} m/s
    # Weather Condition: {weather_data['Weather Description'].mode()[0]}
    
    # Provide recommendations in a structured manner.
    # """
    prompt = f"""
    Given the weather data for {city}, suggest 2-3 suitable crops and key precautions:
    
    Temp: {weather_data['Temperature (C)'].mean()}°C
    Humidity: {weather_data['Humidity (%)'].mean()}%
    Rain: {weather_data['Rain (mm)'].mean()} mm
    Wind: {weather_data['Wind Speed (m/s)'].mean()} m/s
    Condition: {weather_data['Weather Description'].mode()[0]}
    
    Keep the response short and concise.
    """
    response = model.generate_content(prompt)
    return response.text

def get_crop_precautions(weather_data, city, crop):
    genai.configure(api_key=GEMINI_API_KEY)
    model = genai.GenerativeModel("gemini-1.5-pro-002")
    # prompt = f"""
    # Based on the following weather data for {city}, provide necessary precautions and alerts for farmers growing {crop}:
    
    # Temperature: {weather_data['Temperature (C)'].mean()}°C
    # Humidity: {weather_data['Humidity (%)'].mean()}%
    # Rainfall: {weather_data['Rain (mm)'].mean()} mm
    # Wind Speed: {weather_data['Wind Speed (m/s)'].mean()} m/s
    # Weather Condition: {weather_data['Weather Description'].mode()[0]}
    
    # Provide detailed precautions in case of extreme weather conditions.
    # """
    prompt = f"""
    Briefly list key precautions for {crop} in {city} based on:
    
    Temp: {weather_data['Temperature (C)'].mean()}°C
    Humidity: {weather_data['Humidity (%)'].mean()}%
    Rain: {weather_data['Rain (mm)'].mean()} mm
    Wind: {weather_data['Wind Speed (m/s)'].mean()} m/s
    Condition: {weather_data['Weather Description'].mode()[0]}
    
    Provide only essential points.
    """
    response = model.generate_content(prompt)
    return response.text

if __name__ == "__main__":
    city = "Hyderabad"
    crop = "Paddy"
    df_weather = fetch_weather_data(city)
    print("\nWeather Data:")
    print(df_weather.to_string(index=False))
    # plot_weather_trends(df_weather, city)
    
    recommendations = get_crop_recommendations(df_weather, city)
    print("\nAI-based Crop Recommendations:")
    print(recommendations)
    
    crop_precautions = get_crop_precautions(df_weather, city, crop)
    print("\nAI-based Crop Precautions:")
    print(crop_precautions)
