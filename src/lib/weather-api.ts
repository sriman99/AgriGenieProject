const WEATHER_API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
const WEATHER_API_BASE_URL = 'https://api.openweathermap.org/data/2.5';

export interface WeatherData {
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    humidity: number;
  };
  weather: Array<{
    id: number;
    main: string;
    description: string;
    icon: string;
  }>;
  wind: {
    speed: number;
    deg: number;
  };
  rain?: {
    '1h'?: number;
    '3h'?: number;
  };
  clouds: {
    all: number;
  };
  dt: number;
  sys: {
    country: string;
    sunrise: number;
    sunset: number;
  };
  timezone: number;
  name: string;
}

export interface ForecastData {
  list: Array<{
    dt: number;
    main: {
      temp: number;
      feels_like: number;
      temp_min: number;
      temp_max: number;
      pressure: number;
      humidity: number;
    };
    weather: Array<{
      id: number;
      main: string;
      description: string;
      icon: string;
    }>;
    clouds: {
      all: number;
    };
    wind: {
      speed: number;
      deg: number;
    };
    rain?: {
      '3h'?: number;
    };
    dt_txt: string;
  }>;
  city: {
    name: string;
    country: string;
    sunrise: number;
    sunset: number;
  };
}

// Get current weather by location name
export async function getCurrentWeather(location: string): Promise<WeatherData> {
  try {
    const response = await fetch(
      `${WEATHER_API_BASE_URL}/weather?q=${location},in&units=metric&appid=${WEATHER_API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error(`Weather API returned ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching current weather:', error);
    throw error;
  }
}

// Get weather forecast for 5 days
export async function getWeatherForecast(location: string): Promise<ForecastData> {
  try {
    const response = await fetch(
      `${WEATHER_API_BASE_URL}/forecast?q=${location},in&units=metric&appid=${WEATHER_API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error(`Weather forecast API returned ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching weather forecast:', error);
    throw error;
  }
}

// Get weather by coordinates
export async function getWeatherByCoordinates(lat: number, lon: number): Promise<WeatherData> {
  try {
    const response = await fetch(
      `${WEATHER_API_BASE_URL}/weather?lat=${lat}&lon=${lon}&units=metric&appid=${WEATHER_API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error(`Weather API returned ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching weather by coordinates:', error);
    throw error;
  }
}

// Calculate suitable crop recommendations based on weather
export function getCropSuitabilityFromWeather(weatherData: WeatherData): { crop: string; suitability: number; reason: string }[] {
  const { main, weather, wind } = weatherData;
  const temperature = main.temp;
  const humidity = main.humidity;
  const windSpeed = wind.speed;
  const conditions = weather[0].main.toLowerCase();
  
  const crops = [
    {
      crop: 'Rice',
      suitability: calculateSuitability(
        temperature >= 20 && temperature <= 35,
        humidity >= 60 && humidity <= 90,
        windSpeed < 10,
        !['snow', 'thunderstorm'].includes(conditions)
      ),
      reason: getReason('Rice', temperature, humidity, windSpeed, conditions)
    },
    {
      crop: 'Wheat',
      suitability: calculateSuitability(
        temperature >= 15 && temperature <= 25,
        humidity >= 40 && humidity <= 70,
        windSpeed < 15,
        !['thunderstorm', 'rain'].includes(conditions)
      ),
      reason: getReason('Wheat', temperature, humidity, windSpeed, conditions)
    },
    {
      crop: 'Cotton',
      suitability: calculateSuitability(
        temperature >= 20 && temperature <= 35,
        humidity >= 40 && humidity <= 60,
        windSpeed < 20,
        !['snow', 'thunderstorm'].includes(conditions)
      ),
      reason: getReason('Cotton', temperature, humidity, windSpeed, conditions)
    },
    {
      crop: 'Sugarcane',
      suitability: calculateSuitability(
        temperature >= 20 && temperature <= 35,
        humidity >= 60 && humidity <= 90,
        windSpeed < 15,
        !['snow'].includes(conditions)
      ),
      reason: getReason('Sugarcane', temperature, humidity, windSpeed, conditions)
    },
    {
      crop: 'Corn',
      suitability: calculateSuitability(
        temperature >= 18 && temperature <= 32,
        humidity >= 40 && humidity <= 80,
        windSpeed < 15,
        !['snow', 'thunderstorm'].includes(conditions)
      ),
      reason: getReason('Corn', temperature, humidity, windSpeed, conditions)
    }
  ];
  
  return crops.sort((a, b) => b.suitability - a.suitability);
}

// Helper function to calculate suitability score (0-100)
function calculateSuitability(
  tempOk: boolean,
  humidityOk: boolean,
  windOk: boolean,
  conditionsOk: boolean
): number {
  let score = 0;
  if (tempOk) score += 40;
  if (humidityOk) score += 25;
  if (windOk) score += 15;
  if (conditionsOk) score += 20;
  return score;
}

// Helper function to generate reasons
function getReason(
  crop: string,
  temp: number,
  humidity: number,
  windSpeed: number,
  conditions: string
): string {
  const reasons = [];
  
  switch (crop) {
    case 'Rice':
      if (temp < 20 || temp > 35) reasons.push(`Temperature (${temp}°C) outside optimal range of 20-35°C`);
      if (humidity < 60 || humidity > 90) reasons.push(`Humidity (${humidity}%) outside optimal range of 60-90%`);
      if (windSpeed >= 10) reasons.push(`Wind speed (${windSpeed}m/s) too high`);
      if (['snow', 'thunderstorm'].includes(conditions)) reasons.push(`${conditions} weather conditions not suitable`);
      break;
    case 'Wheat':
      if (temp < 15 || temp > 25) reasons.push(`Temperature (${temp}°C) outside optimal range of 15-25°C`);
      if (humidity < 40 || humidity > 70) reasons.push(`Humidity (${humidity}%) outside optimal range of 40-70%`);
      if (windSpeed >= 15) reasons.push(`Wind speed (${windSpeed}m/s) too high`);
      if (['thunderstorm', 'rain'].includes(conditions)) reasons.push(`${conditions} weather conditions not suitable`);
      break;
    case 'Cotton':
      if (temp < 20 || temp > 35) reasons.push(`Temperature (${temp}°C) outside optimal range of 20-35°C`);
      if (humidity < 40 || humidity > 60) reasons.push(`Humidity (${humidity}%) outside optimal range of 40-60%`);
      if (windSpeed >= 20) reasons.push(`Wind speed (${windSpeed}m/s) too high`);
      if (['snow', 'thunderstorm'].includes(conditions)) reasons.push(`${conditions} weather conditions not suitable`);
      break;
    case 'Sugarcane':
      if (temp < 20 || temp > 35) reasons.push(`Temperature (${temp}°C) outside optimal range of 20-35°C`);
      if (humidity < 60 || humidity > 90) reasons.push(`Humidity (${humidity}%) outside optimal range of 60-90%`);
      if (windSpeed >= 15) reasons.push(`Wind speed (${windSpeed}m/s) too high`);
      if (['snow'].includes(conditions)) reasons.push(`${conditions} weather conditions not suitable`);
      break;
    case 'Corn':
      if (temp < 18 || temp > 32) reasons.push(`Temperature (${temp}°C) outside optimal range of 18-32°C`);
      if (humidity < 40 || humidity > 80) reasons.push(`Humidity (${humidity}%) outside optimal range of 40-80%`);
      if (windSpeed >= 15) reasons.push(`Wind speed (${windSpeed}m/s) too high`);
      if (['snow', 'thunderstorm'].includes(conditions)) reasons.push(`${conditions} weather conditions not suitable`);
      break;
  }
  
  if (reasons.length === 0) {
    return `Current conditions are favorable for ${crop}`;
  } else {
    return reasons.join('. ');
  }
} 