'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { AlertCircle, ExternalLink, Loader2, RefreshCw, ShoppingCart } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

interface Order {
  id: string;
  crop_listing_id: string;
  quantity: number;
  total_price: number;
  status: 'pending' | 'accepted' | 'completed' | 'cancelled';
  created_at: string;
  crop_listing: {
    crop_name: string;
    unit: string;
    farmer: {
      full_name: string;
    };
  };
}

export function MyOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user, profile } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/marketplace/orders');
      
      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }
      
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: "Error",
        description: "Failed to fetch your orders. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'accepted':
        return 'default';
      case 'completed':
        return 'success';
      case 'cancelled':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No Orders Found</h3>
          <p className="text-muted-foreground mb-6">
            You haven't placed any orders yet. Browse the marketplace to purchase crops.
          </p>
          <Button asChild>
            <Link href="/marketplace">
              <ShoppingCart className="h-4 w-4 mr-2" />
              Go to Marketplace
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button variant="outline" onClick={fetchOrders}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="space-y-4">
        {orders.map((order) => (
          <Card key={order.id}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {order.crop_listing.crop_name}
                    <Badge variant={getStatusBadgeVariant(order.status) as any}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    Order #{order.id.slice(0, 8)}
                    {' • '}
                    {formatDistanceToNow(new Date(order.created_at), { addSuffix: true })}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Quantity:</span>
                  <span className="font-medium">{order.quantity} {order.crop_listing.unit}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Price:</span>
                  <span className="font-medium">₹{order.total_price.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Seller:</span>
                  <span className="font-medium">
                    {order.crop_listing.farmer?.full_name || 'Unknown Farmer'}
                  </span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="ghost" size="sm" asChild className="ml-auto">
                <Link href={`/marketplace/listing/${order.crop_listing_id}`}>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Listing
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
} 