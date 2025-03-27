'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { AreaChart, Cloud, CloudRain, Droplets, ThermometerSun, Wind } from 'lucide-react';
import { getCurrentWeather, getWeatherForecast, getCropSuitabilityFromWeather, WeatherData, ForecastData } from '@/lib/weather-api';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';

export function WeatherWidget() {
  const [location, setLocation] = useState<string>('Delhi');
  const [searchLocation, setSearchLocation] = useState<string>('Delhi');
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [forecast, setForecast] = useState<ForecastData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('current');
  const [cropSuitability, setCropSuitability] = useState<{ crop: string; suitability: number; reason: string }[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchWeatherData(location);
  }, [location]);

  const fetchWeatherData = async (loc: string) => {
    if (!loc) return;
    
    setLoading(true);
    try {
      const weatherData = await getCurrentWeather(loc);
      setWeather(weatherData);
      
      const forecastData = await getWeatherForecast(loc);
      setForecast(forecastData);
      
      if (weatherData) {
        const suitability = getCropSuitabilityFromWeather(weatherData);
        setCropSuitability(suitability);
      }
    } catch (error) {
      console.error('Error fetching weather data:', error);
      toast({
        title: 'Error fetching weather data',
        description: 'Please check the location name and try again',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setLocation(searchLocation);
  };

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          setLoading(true);
          try {
            const { latitude, longitude } = position.coords;
            const weatherData = await getWeatherByCoordinates(latitude, longitude);
            setWeather(weatherData);
            setLocation(weatherData.name);
            setSearchLocation(weatherData.name);
            
            const forecastData = await getWeatherForecast(weatherData.name);
            setForecast(forecastData);
            
            if (weatherData) {
              const suitability = getCropSuitabilityFromWeather(weatherData);
              setCropSuitability(suitability);
            }
          } catch (error) {
            console.error('Error fetching weather by location:', error);
            toast({
              title: 'Error fetching weather data',
              description: 'Could not get weather for your current location',
              variant: 'destructive',
            });
          } finally {
            setLoading(false);
          }
        },
        (error) => {
          console.error('Geolocation error:', error);
          toast({
            title: 'Location error',
            description: 'Could not access your location. Please check browser permissions.',
            variant: 'destructive',
          });
        }
      );
    } else {
      toast({
        title: 'Geolocation not supported',
        description: 'Your browser does not support geolocation',
        variant: 'destructive',
      });
    }
  };

  // Format date from timestamp
  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
  };

  // Format time from timestamp
  const formatTime = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Get weather icon URL
  const getWeatherIconUrl = (iconCode: string) => {
    return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
  };

  // Render loading skeleton
  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>
            <Skeleton className="h-8 w-48" />
          </CardTitle>
          <CardDescription>
            <Skeleton className="h-4 w-32" />
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Weather Information</span>
          {weather && (
            <div className="flex items-center text-sm font-normal">
              <img 
                src={getWeatherIconUrl(weather.weather[0].icon)} 
                alt={weather.weather[0].description}
                className="h-10 w-10"
              />
              <span className="ml-2">{Math.round(weather.main.temp)}°C</span>
            </div>
          )}
        </CardTitle>
        <CardDescription>
          <form onSubmit={handleSearch} className="flex gap-2 mt-2">
            <Input
              placeholder="Enter location"
              value={searchLocation}
              onChange={(e) => setSearchLocation(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" variant="outline" size="sm">
              Search
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              onClick={handleUseCurrentLocation}
            >
              Current Location
            </Button>
          </form>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="current" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full">
            <TabsTrigger value="current" className="flex-1">Current</TabsTrigger>
            <TabsTrigger value="forecast" className="flex-1">Forecast</TabsTrigger>
            <TabsTrigger value="crops" className="flex-1">Crop Advisory</TabsTrigger>
          </TabsList>
          
          <TabsContent value="current">
            {weather && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">{weather.name}, {weather.sys.country}</h3>
                  <span className="text-sm text-muted-foreground">
                    {formatDate(weather.dt)} {formatTime(weather.dt)}
                  </span>
                </div>
                
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  <div className="flex flex-col items-center justify-center gap-2 p-4 bg-muted rounded-lg flex-1">
                    <div className="flex items-center gap-2">
                      <ThermometerSun className="h-5 w-5 text-orange-500" />
                      <span className="text-sm font-medium">Temperature</span>
                    </div>
                    <span className="text-2xl font-bold">{Math.round(weather.main.temp)}°C</span>
                    <div className="text-xs text-muted-foreground">
                      Feels like {Math.round(weather.main.feels_like)}°C
                    </div>
                    <div className="flex gap-2 text-xs">
                      <span>Min: {Math.round(weather.main.temp_min)}°C</span>
                      <span>Max: {Math.round(weather.main.temp_max)}°C</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-center justify-center gap-2 p-4 bg-muted rounded-lg flex-1">
                    <div className="flex items-center gap-2">
                      <Cloud className="h-5 w-5 text-blue-500" />
                      <span className="text-sm font-medium">Conditions</span>
                    </div>
                    <div className="flex items-center">
                      <img 
                        src={getWeatherIconUrl(weather.weather[0].icon)} 
                        alt={weather.weather[0].description}
                        className="h-10 w-10"
                      />
                      <span className="text-lg font-semibold capitalize">
                        {weather.weather[0].description}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Cloud coverage: {weather.clouds.all}%
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex flex-col items-center justify-center gap-1 p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-1">
                      <Droplets className="h-4 w-4 text-blue-500" />
                      <span className="text-sm font-medium">Humidity</span>
                    </div>
                    <span className="text-xl font-bold">{weather.main.humidity}%</span>
                  </div>
                  
                  <div className="flex flex-col items-center justify-center gap-1 p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-1">
                      <Wind className="h-4 w-4 text-blue-500" />
                      <span className="text-sm font-medium">Wind</span>
                    </div>
                    <span className="text-xl font-bold">{weather.wind.speed} m/s</span>
                  </div>
                  
                  <div className="flex flex-col items-center justify-center gap-1 p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-1">
                      <CloudRain className="h-4 w-4 text-blue-500" />
                      <span className="text-sm font-medium">Precipitation</span>
                    </div>
                    <span className="text-xl font-bold">
                      {weather.rain?.['1h'] ? `${weather.rain['1h']} mm` : '0 mm'}
                    </span>
                  </div>
                </div>
                
                <div className="flex justify-between text-xs text-muted-foreground">
                  <div>
                    Sunrise: {formatTime(weather.sys.sunrise)}
                  </div>
                  <div>
                    Sunset: {formatTime(weather.sys.sunset)}
                  </div>
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="forecast">
            {forecast && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">5-Day Forecast for {forecast.city.name}</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
                  {forecast.list
                    .filter((_, index) => index % 8 === 0) // Get one forecast per day (every 24h)
                    .slice(0, 5)
                    .map((day, index) => (
                      <div key={index} className="flex flex-col items-center p-2 border rounded-lg">
                        <div className="text-sm font-medium">
                          {formatDate(day.dt)}
                        </div>
                        <img 
                          src={getWeatherIconUrl(day.weather[0].icon)} 
                          alt={day.weather[0].description} 
                          className="h-10 w-10"
                        />
                        <div className="text-lg font-bold">
                          {Math.round(day.main.temp)}°C
                        </div>
                        <div className="text-xs text-center capitalize">
                          {day.weather[0].description}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {day.main.humidity}% · {day.wind.speed} m/s
                        </div>
                      </div>
                    ))}
                </div>
                
                <div className="mt-4">
                  <h4 className="text-sm font-semibold mb-2">Detailed Forecast (Next 24 Hours)</h4>
                  <div className="overflow-x-auto">
                    <div className="flex gap-2 pb-2">
                      {forecast.list.slice(0, 8).map((item, index) => (
                        <div key={index} className="flex flex-col items-center p-2 border rounded-lg min-w-[80px]">
                          <div className="text-xs font-medium">
                            {formatTime(item.dt)}
                          </div>
                          <img 
                            src={getWeatherIconUrl(item.weather[0].icon)} 
                            alt={item.weather[0].description} 
                            className="h-8 w-8"
                          />
                          <div className="text-sm font-bold">
                            {Math.round(item.main.temp)}°C
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {item.wind.speed} m/s
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="crops">
            {cropSuitability.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Crop Suitability Analysis</h3>
                <p className="text-sm text-muted-foreground">
                  Based on current weather conditions in {weather?.name}
                </p>
                
                <div className="space-y-3">
                  {cropSuitability.map((crop, index) => (
                    <div key={index} className="border rounded-lg p-3">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-medium">{crop.crop}</h4>
                        <Badge 
                          variant={crop.suitability >= 75 ? "outline" : 
                                 crop.suitability >= 50 ? "default" : 
                                 "destructive"}
                          className={crop.suitability >= 75 ? "bg-green-500" : 
                                    crop.suitability >= 50 ? "bg-amber-500" : 
                                    "bg-red-500"}
                        >
                          {crop.suitability}/100
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{crop.reason}</p>
                      <div className="mt-2 w-full bg-secondary h-2 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${
                            crop.suitability >= 75 ? "bg-green-500" : 
                            crop.suitability >= 50 ? "bg-amber-500" : 
                            "bg-red-500"
                          }`} 
                          style={{ width: `${crop.suitability}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="text-sm text-muted-foreground mt-4">
                  <p className="flex items-center gap-1">
                    <AreaChart className="h-4 w-4" />
                    <span>Suitability score is based on temperature, humidity, wind conditions, and weather patterns</span>
                  </p>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

import { getWeatherByCoordinates } from '@/lib/weather-api'; 