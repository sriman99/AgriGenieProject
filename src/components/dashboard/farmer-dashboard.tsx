'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { BarChart, LineChart, Calendar, PieChart, TrendingUp, ShoppingCart, Leaf, Sprout } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { AIInsights } from '../ai-insights';
import { MarketPredictions } from '../market-predictions';
import { WeatherInsights } from '../weather-insights';

interface CropListing {
  id: string;
  crop_name: string;
  quantity: number;
  price_per_unit: number;
  unit: string;
  available: boolean;
  created_at: string;
}

interface Order {
  id: string;
  quantity: number;
  total_price: number;
  status: string;
  created_at: string;
  crop_listing: {
    crop_name: string;
  };
  buyer: {
    full_name: string;
  };
}

export function FarmerDashboard() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [myListings, setMyListings] = useState<CropListing[]>([]);
  const [myOrders, setMyOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [location, setLocation] = useState('Hyderabad');
  const [cropName, setCropName] = useState('Rice');
  const [state, setState] = useState('Telangana');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        // Fetch farmer's listings
        const listingsResponse = await fetch('/api/marketplace/listings?farmer_only=true');
        if (listingsResponse.ok) {
          const listingsData = await listingsResponse.json();
          setMyListings(listingsData);
        }

        // Fetch orders for farmer's listings
        const ordersResponse = await fetch('/api/marketplace/orders');
        if (ordersResponse.ok) {
          const ordersData = await ordersResponse.json();
          setMyOrders(ordersData);
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load dashboard data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  // Calculate dashboard stats
  const totalListings = myListings.length;
  const activeListings = myListings.filter(listing => listing.available).length;
  const totalSales = myOrders.reduce((sum, order) => sum + order.total_price, 0);
  const pendingOrders = myOrders.filter(order => order.status === 'pending').length;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome, {profile?.full_name || 'Farmer'}</h1>
          <p className="text-gray-600">Here's what's happening with your farm today</p>
        </div>
        <div className="flex mt-4 md:mt-0 space-x-3">
          <Link href="/marketplace/new">
            <Button variant="default">
              <ShoppingCart className="mr-2 h-4 w-4" />
              Create Listing
            </Button>
          </Link>
          <Link href="/disease-detection">
            <Button variant="outline">
              <Leaf className="mr-2 h-4 w-4" />
              Crop Health Check
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-x-4">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-muted-foreground">Active Listings</span>
                <span className="text-2xl font-bold">{activeListings}</span>
              </div>
              <div className="p-2 bg-green-100 rounded-full">
                <Sprout className="h-5 w-5 text-green-600" />
              </div>
            </div>
            <div className="mt-4 text-xs text-green-600">
              {activeListings === totalListings ? 'All listings active' : `${activeListings} of ${totalListings} listings active`}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-x-4">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-muted-foreground">Total Sales</span>
                <span className="text-2xl font-bold">₹{totalSales.toFixed(2)}</span>
              </div>
              <div className="p-2 bg-green-100 rounded-full">
                <BarChart className="h-5 w-5 text-green-600" />
              </div>
            </div>
            <div className="mt-4 text-xs text-green-600">
              From {myOrders.length} orders
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-x-4">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-muted-foreground">Pending Orders</span>
                <span className="text-2xl font-bold">{pendingOrders}</span>
              </div>
              <div className="p-2 bg-green-100 rounded-full">
                <Calendar className="h-5 w-5 text-green-600" />
              </div>
            </div>
            <div className="mt-4 text-xs text-green-600">
              Requires your attention
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-x-4">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-muted-foreground">Market Trend</span>
                <span className="text-2xl font-bold">+5.2%</span>
              </div>
              <div className="p-2 bg-green-100 rounded-full">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
            </div>
            <div className="mt-4 text-xs text-green-600">
              Prices trending upward
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for detailed information */}
      <Tabs defaultValue="overview" className="space-y-4" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="market">Market</TabsTrigger>
          <TabsTrigger value="crops">My Crops</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Market Predictions</CardTitle>
                <CardDescription>Forecast for your crops</CardDescription>
              </CardHeader>
              <CardContent>
                <MarketPredictions cropName={cropName} state={state} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Weather Insights</CardTitle>
                <CardDescription>Weather forecast for your region</CardDescription>
              </CardHeader>
              <CardContent>
                <WeatherInsights location={location} />
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>AI-Powered Insights</CardTitle>
              <CardDescription>Smart recommendations for your farm</CardDescription>
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
              <CardDescription>Detailed market trends and forecasts</CardDescription>
            </CardHeader>
            <CardContent>
              <MarketPredictions cropName={cropName} state={state} />
            </CardContent>
            <CardFooter>
              <Link href="/market/analysis">
                <Button variant="outline">View Detailed Analysis</Button>
              </Link>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="crops" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>My Listings</CardTitle>
                <CardDescription>Manage your crop listings</CardDescription>
              </div>
              <Link href="/marketplace/new">
                <Button>Add New Listing</Button>
              </Link>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-4">Loading listings...</div>
              ) : myListings.length > 0 ? (
                <div className="space-y-4">
                  {myListings.map((listing) => (
                    <div key={listing.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <div className="font-medium">{listing.crop_name}</div>
                        <div className="text-sm text-muted-foreground">
                          {listing.quantity} {listing.unit} • ₹{listing.price_per_unit}/{listing.unit}
                        </div>
                      </div>
                      <div className="flex items-center">
                        <span className={`text-xs px-2 py-1 rounded ${listing.available ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                          {listing.available ? 'Available' : 'Sold Out'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p>You don't have any listings yet.</p>
                  <Link href="/marketplace/new">
                    <Button variant="link">Create your first listing</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
              <CardDescription>Manage orders for your crops</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-4">Loading orders...</div>
              ) : myOrders.length > 0 ? (
                <div className="space-y-4">
                  {myOrders.slice(0, 5).map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <div className="font-medium">{order.crop_listing.crop_name}</div>
                        <div className="text-sm text-muted-foreground">
                          Ordered by {order.buyer.full_name} • {order.quantity} units • ₹{order.total_price}
                        </div>
                      </div>
                      <div className="flex items-center">
                        <span className={`text-xs px-2 py-1 rounded ${
                          order.status === 'completed' ? 'bg-blue-100 text-blue-800' : 
                          order.status === 'accepted' ? 'bg-green-100 text-green-800' : 
                          order.status === 'rejected' ? 'bg-red-100 text-red-800' : 
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">No orders received yet.</div>
              )}
            </CardContent>
            <CardFooter>
              <Link href="/marketplace/orders">
                <Button variant="outline">View All Orders</Button>
              </Link>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 