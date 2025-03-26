import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const FASTAPI_URL = process.env.FASTAPI_BASE_URL || 'http://localhost:8000'

export const api = {
  chat: async (message: string) => {
    const response = await fetch(`${FASTAPI_URL}/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message })
    })
    if (!response.ok) throw new Error('Chat API request failed')
    return response.json()
  },

  detectDisease: async (image: File, cropName: string) => {
    const formData = new FormData()
    formData.append('file', image)
    formData.append('crop_name', cropName)

    const response = await fetch(`${FASTAPI_URL}/ai/detect-disease`, {
      method: 'POST',
      body: formData,
    })
    if (!response.ok) throw new Error('Disease detection API request failed')
    return response.json()
  },

  getMarketPrices: async (cropName?: string) => {
    const url = new URL(`${FASTAPI_URL}/market/prices`)
    if (cropName) url.searchParams.append('crop_name', cropName)
    
    const response = await fetch(url.toString())
    if (!response.ok) throw new Error('Market prices API request failed')
    return response.json()
  },

  getPricePrediction: async (cropName: string) => {
    const response = await fetch(`${FASTAPI_URL}/market/predict-price/${cropName}`)
    if (!response.ok) throw new Error('Price prediction API request failed')
    return response.json()
  },

  getWeatherAlerts: async (location: string) => {
    const response = await fetch(`${FASTAPI_URL}/weather/alerts?location=${location}`)
    if (!response.ok) throw new Error('Weather alerts API request failed')
    return response.json()
  }
}
