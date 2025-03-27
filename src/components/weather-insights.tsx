'use client';
import { useState, useEffect } from 'react';
import { api } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Loader2, Cloud, Droplets, Wind, Thermometer } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface WeatherData {
  date: string;
  temperature: number;
  humidity: number;
  rainfall: number;
  windSpeed: number;
}

interface WeatherInsight {
  current: {
    temperature: number;
    humidity: number;
    rainfall: number;
    windSpeed: number;
    condition: string;
  };
  forecast: WeatherData[];
  recommendations: string[];
}

export function WeatherInsights({ location }: { location: string }) {
  const [weather, setWeather] = useState<WeatherInsight | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWeather = async () => {
    try {
      setLoading(true);
      const weatherData = await api.getWeatherData(location);
      const recommendations = await api.getWeatherRecommendations(location);

      const forecast = weatherData.map((item: any) => ({
        date: new Date(item['Date & Time']).toLocaleDateString(),
        temperature: item['Temperature (C)'],
        humidity: item['Humidity (%)'],
        rainfall: item['Rain (mm)'],
        windSpeed: item['Wind Speed (m/s)'],
      }));

      setWeather({
        current: {
          temperature: forecast[0].temperature,
          humidity: forecast[0].humidity,
          rainfall: forecast[0].rainfall,
          windSpeed: forecast[0].windSpeed,
          condition: weatherData[0]['Weather Description'],
        },
        forecast,
        recommendations: recommendations.split('\n'),
      });
    } catch (err) {
      setError('Failed to fetch weather data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather();
  }, [location]);

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <Skeleton className="h-6 w-3/4" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error || !weather) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center space-y-4">
            <p className="text-red-500">{error || 'No weather data available'}</p>
            <Button onClick={fetchWeather} variant="outline">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Current Weather</span>
            <span className="text-lg font-semibold capitalize">
              {weather.current.condition}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="flex items-center space-x-2 rounded-lg bg-blue-50 p-4">
              <Thermometer className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-blue-600">Temperature</p>
                <p className="text-lg font-bold text-blue-700">
                  {weather.current.temperature}°C
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2 rounded-lg bg-green-50 p-4">
              <Droplets className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-green-600">Humidity</p>
                <p className="text-lg font-bold text-green-700">
                  {weather.current.humidity}%
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2 rounded-lg bg-purple-50 p-4">
              <Cloud className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm text-purple-600">Rainfall</p>
                <p className="text-lg font-bold text-purple-700">
                  {weather.current.rainfall}mm
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2 rounded-lg bg-orange-50 p-4">
              <Wind className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-sm text-orange-600">Wind Speed</p>
                <p className="text-lg font-bold text-orange-700">
                  {weather.current.windSpeed}m/s
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="w-full">
        <CardHeader>
          <CardTitle>Weather Forecast</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weather.forecast}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="temperature"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="humidity"
                  stroke="#22c55e"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="w-full">
        <CardHeader>
          <CardTitle>Weather Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {weather.recommendations.map((rec, index) => (
              <li key={index} className="flex items-start space-x-2">
                <span className="mt-1 h-2 w-2 rounded-full bg-green-500" />
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
} 