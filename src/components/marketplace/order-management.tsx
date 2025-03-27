'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, ExternalLink, AlertTriangle } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Order {
  id: string;
  buyer_id: string;
  crop_listing_id: string;
  quantity: number;
  total_price: number;
  status: 'pending' | 'accepted' | 'completed' | 'cancelled';
  created_at: string;
  crop_listing: {
    crop_name: string;
    unit: string;
    farmer?: {
      full_name: string;
    };
  };
  buyer?: {
    full_name: string;
  };
}

export function OrderManagement() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const { user, profile } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/marketplace/orders');
      if (!response.ok) throw new Error('Failed to fetch orders');
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch orders. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setIsUpdating(orderId);
    try {
      const response = await fetch(`/api/marketplace/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (!response.ok) throw new Error('Failed to update order status');
      
      const updatedOrder = await response.json();
      
      // Update local state
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status: updatedOrder.status } : order
      ));
      
      toast({
        title: "Success",
        description: `Order status updated to ${newStatus}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update order status. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(null);
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

  const statusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'accepted', label: 'Accepted' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

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
          <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No Orders Found</h3>
          {profile?.user_type === 'farmer' ? (
            <p className="text-muted-foreground mb-6">
              You haven't received any orders yet. Make sure your listings are available in the marketplace.
            </p>
          ) : (
            <p className="text-muted-foreground mb-6">
              You haven't placed any orders yet. Browse the marketplace to purchase crops.
            </p>
          )}
          <Button asChild>
            <Link href="/marketplace">Go to Marketplace</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const isFarmer = profile?.user_type === 'farmer';

  return (
    <div className="space-y-6">
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
                {isFarmer ? (
                  <>
                    <span className="text-muted-foreground">Buyer:</span>
                    <span className="font-medium">{order.buyer?.full_name || order.buyer_id}</span>
                  </>
                ) : (
                  <>
                    <span className="text-muted-foreground">Seller:</span>
                    <span className="font-medium">
                      {order.crop_listing.farmer?.full_name || 'Unknown Farmer'}
                    </span>
                  </>
                )}
              </div>
            </div>
          </CardContent>
          <CardFooter className="pt-2 flex justify-between">
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/marketplace/${order.crop_listing_id}`}>
                <ExternalLink className="h-4 w-4 mr-2" /> 
                View Listing
              </Link>
            </Button>
            
            {isFarmer && order.status !== 'completed' && order.status !== 'cancelled' && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Status:</span>
                <Select
                  defaultValue={order.status}
                  onValueChange={(value) => handleStatusChange(order.id, value)}
                  disabled={isUpdating === order.id}
                >
                  <SelectTrigger className="w-[150px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map(option => (
                      <SelectItem 
                        key={option.value} 
                        value={option.value}
                        disabled={
                          // Prevent illogical status changes
                          (order.status === 'pending' && option.value === 'completed') ||
                          (order.status === 'cancelled') ||
                          (order.status === 'completed')
                        }
                      >
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {isUpdating === order.id && (
                  <Loader2 className="h-4 w-4 animate-spin ml-2" />
                )}
              </div>
            )}
          </CardFooter>
        </Card>
      ))}
    </div>
  );
} 