'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart, 
  Calendar, 
  CircleDollarSign, 
  LineChart, 
  Package, 
  ShoppingCart, 
  TrendingUp, 
  ReceiptText,
  CheckCircle
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { redirect } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { WeatherWidget } from '@/components/dashboard/weather-widget';
import { MarketPricesWidget } from '@/components/dashboard/market-prices-widget';
import { GeminiChat } from '@/components/dashboard/gemini-chat';
import Link from 'next/link';

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

export default function BuyerDashboard() {
  const { user, profile, loading } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Wait for auth to load
    if (!loading) {
      if (!user) {
        redirect('/login');
      } else if (profile && profile.user_type !== 'buyer') {
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
          title="Total Orders" 
          value="12" 
          description="Orders placed in the marketplace"
          icon={<ShoppingCart className="h-4 w-4" />}
          trend="up"
          trendValue="20% from last month"
        />
        <StatCard 
          title="Total Spent" 
          value="₹28,750" 
          description="Total spent on produce"
          icon={<CircleDollarSign className="h-4 w-4" />}
          trend="down"
          trendValue="5% from last month"
        />
        <StatCard 
          title="Avg. Order Value" 
          value="₹2,395" 
          description="Average value per order"
          icon={<ReceiptText className="h-4 w-4" />}
          trend="up"
          trendValue="3.2% from last week"
        />
        <StatCard 
          title="Completed Orders" 
          value="10" 
          description="Orders received and completed"
          icon={<CheckCircle className="h-4 w-4" />}
          trend="neutral"
          trendValue="Similar to last month"
        />
      </div>
      
      <div className="grid gap-4 grid-cols-1 xl:grid-cols-2">
        <MarketPricesWidget />
        <WeatherWidget />
      </div>
      
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-7">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-amber-500" />
              Available Crops
            </CardTitle>
            <CardDescription>
              Crops currently available in the marketplace
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="rounded-md border">
                <div className="grid grid-cols-6 gap-2 p-3 text-sm font-medium bg-muted border-b">
                  <div className="col-span-2">Crop</div>
                  <div>Quantity</div>
                  <div>Price</div>
                  <div>Seller</div>
                  <div className="text-right">Action</div>
                </div>
                
                <div className="divide-y">
                  <div className="grid grid-cols-6 gap-2 p-3 text-sm hover:bg-muted/50">
                    <div className="col-span-2 font-medium">Rice (Basmati)</div>
                    <div>250 kg</div>
                    <div>₹42.50/kg</div>
                    <div>Ravi Farms</div>
                    <div className="text-right">
                      <Button size="sm" variant="outline" asChild>
                        <Link href="/marketplace">View</Link>
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-6 gap-2 p-3 text-sm hover:bg-muted/50">
                    <div className="col-span-2 font-medium">Wheat (Organic)</div>
                    <div>500 kg</div>
                    <div>₹30.75/kg</div>
                    <div>Green Harvest</div>
                    <div className="text-right">
                      <Button size="sm" variant="outline" asChild>
                        <Link href="/marketplace">View</Link>
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-6 gap-2 p-3 text-sm hover:bg-muted/50">
                    <div className="col-span-2 font-medium">Tomatoes (Fresh)</div>
                    <div>100 kg</div>
                    <div>₹35.00/kg</div>
                    <div>Organic Valley</div>
                    <div className="text-right">
                      <Button size="sm" variant="outline" asChild>
                        <Link href="/marketplace">View</Link>
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-6 gap-2 p-3 text-sm hover:bg-muted/50">
                    <div className="col-span-2 font-medium">Potatoes</div>
                    <div>300 kg</div>
                    <div>₹22.80/kg</div>
                    <div>Farmstead Inc.</div>
                    <div className="text-right">
                      <Button size="sm" variant="outline" asChild>
                        <Link href="/marketplace">View</Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button variant="default" asChild>
                  <Link href="/marketplace">Browse All Crops</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="lg:col-span-4">
          <CardHeader className="pb-0">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-500" />
              Recent Activity
            </CardTitle>
            <CardDescription>
              Your recent marketplace activity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="orders">
              <TabsList className="w-full">
                <TabsTrigger value="orders" className="flex-1">Recent Orders</TabsTrigger>
                <TabsTrigger value="savings" className="flex-1">Price Savings</TabsTrigger>
              </TabsList>
              <TabsContent value="orders" className="pt-4">
                <div className="space-y-4">
                  <div className="flex items-start gap-3 pb-4 border-b">
                    <div className="bg-primary/10 p-2 rounded-md text-primary">
                      <ShoppingCart className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <h4 className="text-sm font-medium">Order #1245</h4>
                        <Badge>Delivered</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Rice (25kg) • Wheat (10kg)
                      </p>
                      <div className="flex justify-between mt-2 text-xs">
                        <span className="text-muted-foreground">Mar 10, 2024</span>
                        <span className="font-medium">₹1,815.00</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 pb-4 border-b">
                    <div className="bg-primary/10 p-2 rounded-md text-primary">
                      <ShoppingCart className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <h4 className="text-sm font-medium">Order #1244</h4>
                        <Badge>In Transit</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Potatoes (50kg) • Onions (25kg)
                      </p>
                      <div className="flex justify-between mt-2 text-xs">
                        <span className="text-muted-foreground">Mar 8, 2024</span>
                        <span className="font-medium">₹1,854.50</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="bg-primary/10 p-2 rounded-md text-primary">
                      <ShoppingCart className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <h4 className="text-sm font-medium">Order #1243</h4>
                        <Badge>Delivered</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Tomatoes (20kg) • Corn (15kg)
                      </p>
                      <div className="flex justify-between mt-2 text-xs">
                        <span className="text-muted-foreground">Mar 3, 2024</span>
                        <span className="font-medium">₹1,057.00</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end mt-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href="/dashboard/buyer/orders">View All Orders</Link>
                    </Button>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="savings" className="pt-4">
                <div className="space-y-4">
                  <div className="rounded-md border p-4">
                    <h3 className="font-medium mb-2">Price Analysis</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Based on your purchase history, you've saved compared to market averages.
                    </p>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Rice</Badge>
                          <span className="text-sm">10% below market average</span>
                        </div>
                        <span className="text-sm font-medium text-green-600">Saved ₹425</span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Wheat</Badge>
                          <span className="text-sm">5% below market average</span>
                        </div>
                        <span className="text-sm font-medium text-green-600">Saved ₹185</span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Tomatoes</Badge>
                          <span className="text-sm">3% above market average</span>
                        </div>
                        <span className="text-sm font-medium text-red-600">Extra ₹105</span>
                      </div>
                    </div>
                    
                    <div className="mt-4 flex justify-between pt-3 border-t">
                      <span className="font-medium">Overall Savings</span>
                      <span className="font-medium text-green-600">₹505 (This Month)</span>
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