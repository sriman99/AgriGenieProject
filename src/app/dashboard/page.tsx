'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  BarChart, 
  Calendar, 
  CircleDollarSign, 
  LineChart, 
  Tractor, 
  ShoppingCart, 
  TrendingUp, 
  CloudSun,
  Leaf,
  MessageCircle,
  Settings
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { redirect } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { WeatherWidget } from '@/components/dashboard/weather-widget';
import { MarketPricesWidget } from '@/components/dashboard/market-prices-widget';
import { GeminiChat } from '@/components/dashboard/gemini-chat';
import Link from 'next/link';

export default function DashboardPage() {
  const { user, profile, loading } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Wait for auth to load
    if (!loading) {
      if (!user) {
        redirect('/login');
      }
      
      // Redirect to type-specific dashboard if profile exists
      if (profile) {
        // This is commented out so we can see this dashboard screen
        // if (profile.user_type === 'farmer') {
        //   redirect('/dashboard/farmer');
        // } else if (profile.user_type === 'buyer') {
        //   redirect('/dashboard/buyer');
        // }
      }
      
      // Simulate data loading
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [user, profile, loading]);
  
  if (loading || isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
          {Array(3).fill(0).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-1/3" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-24 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {Array(2).fill(0).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-1/3" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-[300px] w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 h-16 w-16">
            <div className="absolute transform rotate-45 bg-green-600 text-center text-white font-medium py-1 right-[-35px] top-[32px] w-[170px]">
              {profile?.user_type === 'farmer' ? 'Farmer' : profile?.user_type === 'buyer' ? 'Buyer' : 'Guest'}
            </div>
          </div>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tractor className="h-5 w-5 text-green-600" />
              Farmer Dashboard
            </CardTitle>
            <CardDescription>
              Manage your crops, listings, and monitor sales
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <p className="text-sm text-muted-foreground">
                Access tools for farmers to track crop growth, manage marketplace listings, and optimize profits.
              </p>
              <div className="flex justify-between">
                <Button variant="outline" size="sm" asChild>
                  <Link href="/dashboard/farmer">Access</Link>
                </Button>
                <Button variant="ghost" size="sm" disabled={profile?.user_type !== 'farmer'}>
                  {profile?.user_type === 'farmer' ? 'Current Role' : 'Not Your Role'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 h-16 w-16">
            <div className="absolute transform rotate-45 bg-blue-600 text-center text-white font-medium py-1 right-[-35px] top-[32px] w-[170px]">
              {profile?.user_type === 'farmer' ? 'Farmer' : profile?.user_type === 'buyer' ? 'Buyer' : 'Guest'}
            </div>
          </div>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-blue-600" />
              Buyer Dashboard
            </CardTitle>
            <CardDescription>
              Browse crops, track orders, and manage purchases
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <p className="text-sm text-muted-foreground">
                Find the best deals on crops, manage your orders, and track your purchase history.
              </p>
              <div className="flex justify-between">
                <Button variant="outline" size="sm" asChild>
                  <Link href="/dashboard/buyer">Access</Link>
                </Button>
                <Button variant="ghost" size="sm" disabled={profile?.user_type !== 'buyer'}>
                  {profile?.user_type === 'buyer' ? 'Current Role' : 'Not Your Role'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-gray-600" />
              Account Settings
            </CardTitle>
            <CardDescription>
              Manage your account and preferences
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <p className="text-sm text-muted-foreground">
                Update your profile, change your password, and configure notification settings.
              </p>
              <Button variant="outline" size="sm" asChild>
                <Link href="/settings">Manage Settings</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2">
        <WeatherWidget />
        <MarketPricesWidget />
      </div>
      
      <div className="h-[600px]">
        <GeminiChat />
      </div>
    </div>
  );
}