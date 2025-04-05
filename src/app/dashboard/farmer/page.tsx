'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart, 
  Calendar, 
  Coins,
  Leaf, 
  LineChart, 
  Wheat, 
  Sprout, 
  TrendingUp, 
  Tractor, 
  CloudSun
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { redirect } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { WeatherWidget } from '@/components/dashboard/weather-widget';
import { MarketPricesWidget } from '@/components/dashboard/market-prices-widget';
import { GeminiChat } from '@/components/dashboard/gemini-chat';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

interface StatCardProps {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
}

function StatCard({ title, value, description, icon, trend, trendValue }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="h-8 w-8 bg-primary/10 rounded-md flex items-center justify-center text-primary">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
        {trend && (
          <div className={`flex items-center text-xs mt-1 ${
            trend === 'up' ? 'text-green-600' : 
            trend === 'down' ? 'text-red-600' : 
            'text-gray-600'
          }`}>
            {trend === 'up' ? <TrendingUp className="h-3 w-3 mr-1" /> : 
              trend === 'down' ? <LineChart className="h-3 w-3 mr-1" /> : 
              <LineChart className="h-3 w-3 mr-1" />}
            {trendValue}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function FarmerDashboard() {
  const { user, profile, loading } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  
  useEffect(() => {
    // Wait for auth to load
    if (!loading) {
      if (!user) {
        redirect('/login');
      } else if (profile && profile.user_type !== 'farmer') {
        redirect('/dashboard');
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
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array(4).fill(0).map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <Skeleton className="h-5 w-1/3" />
                <Skeleton className="h-8 w-8 rounded-md" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-1/2 mb-1" />
                <Skeleton className="h-4 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
          {Array(2).fill(0).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-1/3" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-[200px] w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Active Listings" 
          value="7" 
          description="Total active crop listings in marketplace"
          icon={<Wheat className="h-4 w-4" />}
          trend="up"
          trendValue="10% from last month"
        />
        <StatCard 
          title="Total Revenue" 
          value="₹42,500" 
          description="Total earned from crop sales"
          icon={<Coins className="h-4 w-4" />}
          trend="up"
          trendValue="8% from last month"
        />
        <StatCard 
          title="Avg. Price per kg" 
          value="₹34.75" 
          description="Average price per kg across all crops"
          icon={<Sprout className="h-4 w-4" />}
          trend="up"
          trendValue="2.5% from last week"
        />
        <StatCard 
          title="Total Sales" 
          value="1,250kg" 
          description="Total weight of crops sold"
          icon={<Tractor className="h-4 w-4" />}
          trend="neutral"
          trendValue="Similar to last month"
        />
      </div>
      
      <div className="grid gap-4 grid-cols-1 xl:grid-cols-2">
        <WeatherWidget />
        <MarketPricesWidget />
      </div>
      
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sprout className="h-5 w-5 text-green-600" />
              Crop Health Monitor
            </CardTitle>
            <CardDescription>
              Current health status of your crops
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-end mb-4">
              <Button 
                onClick={() => router.push('/dashboard/farmer/assess')}
                className="flex items-center gap-2"
              >
                <Leaf className="h-4 w-4" />
                Assess Crop Health
              </Button>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Leaf className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-medium">Rice (Field A)</span>
                  </div>
                  <span className="text-sm font-medium">85%</span>
                </div>
                <Progress value={85} className="h-2" />
                <p className="text-xs text-muted-foreground">Optimal growth rate, est. harvest in 45 days</p>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Leaf className="h-4 w-4 text-amber-500" />
                    <span className="text-sm font-medium">Wheat (Field B)</span>
                  </div>
                  <span className="text-sm font-medium">70%</span>
                </div>
                <Progress value={70} className="h-2" />
                <p className="text-xs text-muted-foreground">Some signs of stress, needs additional water</p>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Leaf className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium">Corn (Field C)</span>
                  </div>
                  <span className="text-sm font-medium">90%</span>
                </div>
                <Progress value={90} className="h-2" />
                <p className="text-xs text-muted-foreground">Excellent condition, est. harvest in 30 days</p>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Leaf className="h-4 w-4 text-red-500" />
                    <span className="text-sm font-medium">Tomatoes (Greenhouse)</span>
                  </div>
                  <span className="text-sm font-medium">60%</span>
                </div>
                <Progress value={60} className="h-2" />
                <p className="text-xs text-muted-foreground text-red-500">
                  Alert: Possible disease detected
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="lg:col-span-2">
          <CardHeader className="pb-0">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-500" />
              Activity Calendar
            </CardTitle>
            <CardDescription>
              Your upcoming farming activities and events
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="upcoming">
              <TabsList className="w-full">
                <TabsTrigger value="upcoming" className="flex-1">Upcoming</TabsTrigger>
                <TabsTrigger value="past" className="flex-1">Past</TabsTrigger>
              </TabsList>
              <TabsContent value="upcoming" className="pt-4">
                <div className="space-y-4">
                  <div className="flex items-start gap-3 pb-4 border-b">
                    <div className="bg-primary/10 p-2 rounded-md text-primary">
                      <CloudSun className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium">Apply fertilizer to Field A</h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        Tomorrow, 6:00 AM - 9:00 AM
                      </p>
                      <div className="text-xs mt-2 text-green-600">
                        Weather forecast: Clear skies, ideal conditions
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 pb-4 border-b">
                    <div className="bg-primary/10 p-2 rounded-md text-primary">
                      <Tractor className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium">Harvest Corn (Field C)</h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        Mar 15, 2024, 7:00 AM - 5:00 PM
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">Ready for harvest</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 pb-4 border-b">
                    <div className="bg-primary/10 p-2 rounded-md text-primary">
                      <Sprout className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium">Start planting for next season (Field B)</h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        Mar 20, 2024, 6:00 AM - 4:00 PM
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">Seeds ready</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="bg-primary/10 p-2 rounded-md text-primary">
                      <BarChart className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium">Local Farmers Market</h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        Mar 25, 2024, 8:00 AM - 2:00 PM
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">Opportunity to sell direct</span>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="past" className="pt-4">
                <div className="space-y-4">
                  <div className="flex items-start gap-3 pb-4 border-b">
                    <div className="bg-muted p-2 rounded-md text-muted-foreground">
                      <Wheat className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium">Field A irrigation</h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        Mar 5, 2024, 6:00 AM - 10:00 AM
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">Completed</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 pb-4 border-b">
                    <div className="bg-muted p-2 rounded-md text-muted-foreground">
                      <Tractor className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium">Tomato greenhouse maintenance</h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        Mar 2, 2024, 9:00 AM - 11:00 AM
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">Completed</span>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
      
      <div className="h-[600px]">
        <GeminiChat />
      </div>
    </div>
  );
} 