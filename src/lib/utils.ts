import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const FASTAPI_URL = process.env.FASTAPI_BASE_URL || 'http://localhost:8000'

// Helper function to get auth token
const getToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

export const api = {
  // AI Features
  chat: async (message: string) => {
    const response = await fetch(`${FASTAPI_URL}/ai/chat`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      },
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
      headers: {
        'Authorization': `Bearer ${getToken()}`
      },
      body: formData,
    })
    if (!response.ok) throw new Error('Disease detection API request failed')
    return response.json()
  },

  // Weather Features
  getWeatherData: async (city: string) => {
    const response = await fetch(`${FASTAPI_URL}/weather/${city}`, {
      headers: {
        'Authorization': `Bearer ${getToken()}`
      }
    });
    if (!response.ok) throw new Error('Failed to fetch weather data');
    return response.json();
  },

  getWeatherRecommendations: async (city: string) => {
    const response = await fetch(`${FASTAPI_URL}/recommendations/${city}`, {
      headers: {
        'Authorization': `Bearer ${getToken()}`
      }
    });
    if (!response.ok) throw new Error('Failed to fetch weather recommendations');
    return response.json();
  },

  getCropPrecautions: async (city: string, crop: string) => {
    const response = await fetch(`${FASTAPI_URL}/precautions/${city}/${crop}`, {
      headers: {
        'Authorization': `Bearer ${getToken()}`
      }
    });
    if (!response.ok) throw new Error('Failed to fetch crop precautions');
    return response.json();
  },

  getWeatherGraph: async (city: string) => {
    const response = await fetch(`${FASTAPI_URL}/weather/graph/${city}`, {
      headers: {
        'Authorization': `Bearer ${getToken()}`
      }
    });
    if (!response.ok) throw new Error('Failed to fetch weather graph');
    return response.json();
  },

  // Market Price Prediction Features
  getCropData: async (state: string, commodity: string, days: number = 7) => {
    const response = await fetch(`${FASTAPI_URL}/fetch-crop-data/?state=${state}&commodity=${commodity}&days=${days}`, {
      headers: {
        'Authorization': `Bearer ${getToken()}`
      }
    });
    if (!response.ok) throw new Error('Failed to fetch crop data');
    return response.json();
  },

  getPriceTrendPlot: async (state: string, commodity: string) => {
    const response = await fetch(`${FASTAPI_URL}/plot-price-trend/?state=${state}&commodity=${commodity}`, {
      headers: {
        'Authorization': `Bearer ${getToken()}`
      }
    });
    if (!response.ok) throw new Error('Failed to fetch price trend plot');
    return response.json();
  },

  getPredictedPrice: async (state: string, commodity: string) => {
    const response = await fetch(`${FASTAPI_URL}/predict-price/?state=${state}&commodity=${commodity}`, {
      headers: {
        'Authorization': `Bearer ${getToken()}`
      }
    });
    if (!response.ok) throw new Error('Failed to fetch predicted price');
    return response.json();
  },

  // Market Analysis Features
  getMarketPrices: async (cropName: string) => {
    const response = await fetch(`${FASTAPI_URL}/market-analysis/prices/${cropName}`, {
      headers: {
        'Authorization': `Bearer ${getToken()}`
      }
    });
    if (!response.ok) throw new Error('Failed to fetch market prices');
    return response.json();
  },

  getMarketAnalysis: async (cropName: string) => {
    const response = await fetch(`${FASTAPI_URL}/market-analysis/analysis/${cropName}`, {
      headers: {
        'Authorization': `Bearer ${getToken()}`
      }
    });
    if (!response.ok) throw new Error('Failed to fetch market analysis');
    return response.json();
  },

  getPricePrediction: async (cropName: string) => {
    const response = await fetch(`${FASTAPI_URL}/market-analysis/predict/${cropName}`, {
      headers: {
        'Authorization': `Bearer ${getToken()}`
      }
    });
    if (!response.ok) throw new Error('Failed to fetch price prediction');
    return response.json();
  },

  getMarketRecommendations: async (cropName: string) => {
    const response = await fetch(`${FASTAPI_URL}/market-analysis/recommendations/${cropName}`, {
      headers: {
        'Authorization': `Bearer ${getToken()}`
      }
    });
    if (!response.ok) throw new Error('Failed to fetch market recommendations');
    return response.json();
  },

  // Marketplace Features
  getOrders: async () => {
    const response = await fetch(`${FASTAPI_URL}/marketplace/orders`, {
      headers: {
        'Authorization': `Bearer ${getToken()}`
      }
    });
    if (!response.ok) throw new Error('Failed to fetch orders');
    return response.json();
  },

  // Real-time Features
  subscribeToUpdates: async (userId: string) => {
    const response = await fetch(`${FASTAPI_URL}/realtime/subscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      },
      body: JSON.stringify({ user_id: userId })
    });
    if (!response.ok) throw new Error('Failed to subscribe to updates');
    return response.json();
  }
}

export const agriToasts = {
  showToast: ({ message, type }: { message: string; type: 'success' | 'error' | 'warning' }) => {
    // Implementation of toast notification
    console.log(`[${type}] ${message}`);
  },
  warning: (message: string) => {
    agriToasts.showToast({ message, type: 'warning' });
  },
  error: (message: string) => {
    agriToasts.showToast({ message, type: 'error' });
  },
  success: (message: string) => {
    agriToasts.showToast({ message, type: 'success' });
  }
}

/**
 * Format a number as currency in Indian Rupees
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format a date string to a readable format
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

/**
 * Format a date string to include time
 */
export function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  }).format(date);
}

/**
 * Truncate text with ellipsis if it exceeds the maximum length
 */
export function truncateText(text: string, maxLength: number = 100): string {
  if (!text || text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

/**
 * Calculate time elapsed since a given date
 */
export function timeElapsed(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const secondsDiff = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (secondsDiff < 60) return `${secondsDiff} seconds ago`;
  
  const minutesDiff = Math.floor(secondsDiff / 60);
  if (minutesDiff < 60) return `${minutesDiff} minute${minutesDiff !== 1 ? 's' : ''} ago`;
  
  const hoursDiff = Math.floor(minutesDiff / 60);
  if (hoursDiff < 24) return `${hoursDiff} hour${hoursDiff !== 1 ? 's' : ''} ago`;
  
  const daysDiff = Math.floor(hoursDiff / 24);
  if (daysDiff < 30) return `${daysDiff} day${daysDiff !== 1 ? 's' : ''} ago`;
  
  const monthsDiff = Math.floor(daysDiff / 30);
  if (monthsDiff < 12) return `${monthsDiff} month${monthsDiff !== 1 ? 's' : ''} ago`;
  
  const yearsDiff = Math.floor(monthsDiff / 12);
  return `${yearsDiff} year${yearsDiff !== 1 ? 's' : ''} ago`;
}
