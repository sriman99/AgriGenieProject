'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { BarChart, ShoppingBag, ShoppingCart, Truck, Clock, Search } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { AIInsights } from '../ai-insights';
import { MarketPredictions } from '../market-predictions';

interface CropListing {
  id: string;
  farmer_id: string;
  crop_name: string;
  quantity: number;
  price_per_unit: number;
  unit: string;
  description: string;
  available: boolean;
  created_at: string;
  farmer: {
    full_name: string;
  };
}

interface Order {
  id: string;
  quantity: number;
  total_price: number;
  status: string;
  created_at: string;
  crop_listing: {
    crop_name: string;
    unit: string;
    farmer: {
      full_name: string;
    };
  };
}

export function BuyerDashboard() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [recentListings, setRecentListings] = useState<CropListing[]>([]);
  const [myOrders, setMyOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        // Fetch recent listings
        const listingsResponse = await fetch('/api/marketplace/listings?limit=6');
        if (listingsResponse.ok) {
          const listingsData = await listingsResponse.json();
          setRecentListings(listingsData);
        }

        // Fetch buyer's orders
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
  const totalOrders = myOrders.length;
  const pendingOrders = myOrders.filter(order => order.status === 'pending').length;
  const completedOrders = myOrders.filter(order => order.status === 'completed').length;
  const totalSpent = myOrders.reduce((sum, order) => sum + order.total_price, 0);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome, {profile?.full_name || 'Buyer'}</h1>
          <p className="text-gray-600">Find the best quality produce directly from farmers</p>
        </div>
        <div className="flex mt-4 md:mt-0 space-x-3">
          <Link href="/marketplace">
            <Button variant="default">
              <ShoppingCart className="mr-2 h-4 w-4" />
              Browse Marketplace
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
                <span className="text-sm font-medium text-muted-foreground">Total Orders</span>
                <span className="text-2xl font-bold">{totalOrders}</span>
              </div>
              <div className="p-2 bg-green-100 rounded-full">
                <ShoppingBag className="h-5 w-5 text-green-600" />
              </div>
            </div>
            <div className="mt-4 text-xs text-green-600">
              Your purchasing history
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-x-4">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-muted-foreground">Total Spent</span>
                <span className="text-2xl font-bold">₹{totalSpent.toFixed(2)}</span>
              </div>
              <div className="p-2 bg-green-100 rounded-full">
                <BarChart className="h-5 w-5 text-green-600" />
              </div>
            </div>
            <div className="mt-4 text-xs text-green-600">
              From {totalOrders} orders
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
                <Clock className="h-5 w-5 text-green-600" />
              </div>
            </div>
            <div className="mt-4 text-xs text-green-600">
              Awaiting processing
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-x-4">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-muted-foreground">Completed</span>
                <span className="text-2xl font-bold">{completedOrders}</span>
              </div>
              <div className="p-2 bg-green-100 rounded-full">
                <Truck className="h-5 w-5 text-green-600" />
              </div>
            </div>
            <div className="mt-4 text-xs text-green-600">
              Successfully received
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for detailed information */}
      <Tabs defaultValue="overview" className="space-y-4" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
          <TabsTrigger value="orders">My Orders</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Market Trends</CardTitle>
                <CardDescription>Latest price trends and forecasts</CardDescription>
              </CardHeader>
              <CardContent>
                <MarketPredictions cropName="Rice" state="Telangana" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Listings</CardTitle>
                <CardDescription>Latest crops available in the marketplace</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-4">Loading listings...</div>
                ) : recentListings.length > 0 ? (
                  <div className="space-y-4">
                    {recentListings.slice(0, 3).map((listing) => (
                      <div key={listing.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <div className="font-medium">{listing.crop_name}</div>
                          <div className="text-xs text-muted-foreground">
                            By {listing.farmer.full_name} • ₹{listing.price_per_unit}/{listing.unit}
                          </div>
                        </div>
                        <Link href={`/marketplace/${listing.id}`}>
                          <Button variant="ghost" size="sm">View</Button>
                        </Link>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">No listings available.</div>
                )}
              </CardContent>
              <CardFooter>
                <Link href="/marketplace">
                  <Button variant="outline">View All Listings</Button>
                </Link>
              </CardFooter>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>AI-Powered Insights</CardTitle>
              <CardDescription>Smart recommendations for your purchases</CardDescription>
            </CardHeader>
            <CardContent>
              <AIInsights cropName="Various" location="India" />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="marketplace" className="space-y-4">
          <Card>
            <CardHeader className="space-y-6">
              <CardTitle>Marketplace</CardTitle>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search crops..."
                  className="pl-10 pr-4 py-2 w-full border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-4">Loading listings...</div>
              ) : recentListings.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {recentListings
                    .filter(listing => 
                      searchTerm === '' || 
                      listing.crop_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      listing.farmer.full_name.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map((listing) => (
                      <div key={listing.id} className="border rounded-lg overflow-hidden">
                        <div className="p-4">
                          <h3 className="font-bold text-lg">{listing.crop_name}</h3>
                          <p className="text-sm text-muted-foreground mb-2">By {listing.farmer.full_name}</p>
                          <div className="grid grid-cols-2 gap-2 my-2">
                            <div className="text-sm">
                              <span className="text-muted-foreground">Price:</span> ₹{listing.price_per_unit}/{listing.unit}
                            </div>
                            <div className="text-sm">
                              <span className="text-muted-foreground">Available:</span> {listing.quantity} {listing.unit}
                            </div>
                          </div>
                          {listing.description && (
                            <p className="text-sm mt-2 line-clamp-2">{listing.description}</p>
                          )}
                        </div>
                        <div className="bg-gray-50 p-3 flex justify-end">
                          <Link href={`/marketplace/${listing.id}`}>
                            <Button variant="default" size="sm">View Details</Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-center py-4">No listings available.</div>
              )}
            </CardContent>
            <CardFooter>
              <Link href="/marketplace">
                <Button variant="outline">View All Listings</Button>
              </Link>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="orders" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>My Orders</CardTitle>
              <CardDescription>Track and manage your purchases</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-4">Loading orders...</div>
              ) : myOrders.length > 0 ? (
                <div className="space-y-4">
                  {myOrders.map((order) => (
                    <div key={order.id} className="border rounded-lg overflow-hidden">
                      <div className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-bold text-lg">{order.crop_listing.crop_name}</h3>
                            <p className="text-sm text-muted-foreground">
                              From {order.crop_listing.farmer.full_name}
                            </p>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded ${
                            order.status === 'completed' ? 'bg-blue-100 text-blue-800' : 
                            order.status === 'accepted' ? 'bg-green-100 text-green-800' : 
                            order.status === 'rejected' ? 'bg-red-100 text-red-800' : 
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 mt-3">
                          <div className="text-sm">
                            <span className="text-muted-foreground">Quantity:</span> {order.quantity} {order.crop_listing.unit}
                          </div>
                          <div className="text-sm">
                            <span className="text-muted-foreground">Total:</span> ₹{order.total_price.toFixed(2)}
                          </div>
                          <div className="text-sm col-span-2">
                            <span className="text-muted-foreground">Ordered on:</span> {new Date(order.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p>You haven't placed any orders yet.</p>
                  <Link href="/marketplace">
                    <Button variant="link">Browse Marketplace</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 