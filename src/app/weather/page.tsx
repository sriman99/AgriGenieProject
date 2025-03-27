'use client';
import { WeatherInsights } from '@/components/weather-insights';
import { Toaster } from '@/components/ui/toaster';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

export default function WeatherPage() {
  const [location, setLocation] = useState('Hyderabad');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b">
        <div className="container flex h-16 items-center px-4">
          <h1 className="text-2xl font-bold">Weather Insights</h1>
        </div>
      </div>
      <main className="container py-6">
        <div className="mb-6">
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Location
          </label>
          <Input
            placeholder="Enter location (e.g., Hyderabad)"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full md:w-1/2"
          />
        </div>
        <WeatherInsights location={location} />
      </main>
      <Toaster />
    </div>
  );
} 