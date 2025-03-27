'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

type Order = {
  id: string;
  status: string;
  quantity: number;
  total_price: number;
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
};

export function OrdersList() {
  const { user, profile } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('all');
  const { toast } = useToast();

  // Fetch orders for the current user (different views for farmers and buyers)
  const fetchOrders = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const response = await fetch('/api/marketplace/orders');
      
      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }
      
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: 'Error',
        description: 'Failed to load orders. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [user]);

  // Filter orders based on active tab
  const filteredOrders = orders.filter((order) => {
    if (activeTab === 'all') return true;
    return order.status === activeTab;
  });

  // Update order status (only farmers can do this)
  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const response = await fetch(`/api/marketplace/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update order status');
      }

      // Update local state
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === orderId ? { ...order, status } : order
        )
      );

      toast({
        title: 'Status Updated',
        description: `Order has been marked as ${status}.`,
      });
    } catch (error: any) {
      console.error('Error updating order status:', error);
      toast({
        title: 'Update Failed',
        description: error.message || 'Failed to update order status.',
        variant: 'destructive',
      });
    }
  };

  // Get badge color based on status
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'pending':
        return 'secondary';
      case 'accepted':
        return 'default';
      case 'completed':
        return 'success';
      case 'rejected':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  if (!user || !profile) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Authentication Required</CardTitle>
          <CardDescription>Please sign in to view your orders.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>
            <Skeleton className="h-8 w-48" />
          </CardTitle>
          <CardDescription>
            <Skeleton className="h-4 w-64" />
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-10 w-full mb-4" />
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (orders.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Orders</CardTitle>
          <CardDescription>
            {profile.user_type === 'buyer'
              ? 'Your purchase orders will appear here.'
              : 'Orders for your crop listings will appear here.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-8">
          <p className="text-muted-foreground mb-4">No orders found</p>
          {profile.user_type === 'buyer' && (
            <Button asChild>
              <a href="/marketplace">Browse Marketplace</a>
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Orders</CardTitle>
        <CardDescription>
          {profile.user_type === 'buyer'
            ? 'Track the status of your crop purchases.'
            : 'Manage orders for your crops from buyers.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="accepted">Accepted</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
          </TabsList>
          
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Crop</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Total Price</TableHead>
                  {profile.user_type === 'buyer' ? (
                    <TableHead>Farmer</TableHead>
                  ) : (
                    <TableHead>Buyer</TableHead>
                  )}
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  {profile.user_type === 'farmer' && <TableHead>Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={profile.user_type === 'farmer' ? 7 : 6} className="text-center h-24">
                      No {activeTab !== 'all' ? activeTab : ''} orders found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">
                        {order.crop_listing.crop_name}
                      </TableCell>
                      <TableCell>
                        {order.quantity} {order.crop_listing.unit}
                      </TableCell>
                      <TableCell>₹{order.total_price.toFixed(2)}</TableCell>
                      {profile.user_type === 'buyer' ? (
                        <TableCell>{order.crop_listing.farmer?.full_name}</TableCell>
                      ) : (
                        <TableCell>{order.buyer?.full_name}</TableCell>
                      )}
                      <TableCell>
                        {new Date(order.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(order.status)}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </Badge>
                      </TableCell>
                      {profile.user_type === 'farmer' && (
                        <TableCell>
                          {order.status === 'pending' && (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => updateOrderStatus(order.id, 'accepted')}
                              >
                                Accept
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateOrderStatus(order.id, 'rejected')}
                              >
                                Reject
                              </Button>
                            </div>
                          )}
                          {order.status === 'accepted' && (
                            <Button
                              size="sm"
                              onClick={() => updateOrderStatus(order.id, 'completed')}
                            >
                              Mark Completed
                            </Button>
                          )}
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
} 