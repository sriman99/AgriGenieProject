'use client';
import { useState } from 'react';
import { AIInsights } from './ai-insights';
import { MarketPredictions } from './market-predictions';
import { WeatherInsights } from './weather-insights';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';


export function Dashboard() {
  const [location, setLocation] = useState('Hyderabad');
  const [cropName, setCropName] = useState('Rice');
  const [state, setState] = useState('Telangana');

  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocation(e.target.value);
  };

  const handleCropChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCropName(e.target.value);
  };

  const handleStateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setState(e.target.value);
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex flex-col space-y-4 md:flex-row md:space-x-4 md:space-y-0">
        <div className="flex-1">
          <Input
            placeholder="Enter location (e.g., Hyderabad)"
            value={location}
            onChange={handleLocationChange}
            className="w-full"
          />
        </div>
        <div className="flex-1">
          <Input
            placeholder="Enter crop name (e.g., Rice)"
            value={cropName}
            onChange={handleCropChange}
            className="w-full"
          />
        </div>
        <div className="flex-1">
          <Input
            placeholder="Enter state (e.g., Telangana)"
            value={state}
            onChange={handleStateChange}
            className="w-full"
          />
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="market">Market</TabsTrigger>
          <TabsTrigger value="weather">Weather</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Market Predictions</CardTitle>
              </CardHeader>
              <CardContent>
                <MarketPredictions cropName={cropName} state={state} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Weather Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <WeatherInsights location={location} />
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>AI-Powered Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <AIInsights cropName={cropName} location={location} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="market" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Market Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <MarketPredictions cropName={cropName} state={state} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="weather" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Weather Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <WeatherInsights location={location} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 