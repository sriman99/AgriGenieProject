'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Toaster } from '@/components/ui/toaster';
import { toast } from 'sonner';
import { DashboardShell } from '@/components/dashboard/shell';
import { Loader2, ShoppingBag, CheckCircle, XCircle } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Order {
  id: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  quantity: number;
  total_price: number;
  created_at: string;
  listing: {
    id: string;
    crop_name: string;
    price_per_unit: number;
    unit: string;
  };
  buyer: {
    full_name: string;
  };
}

export default function FarmerOrdersPage() {
  const router = useRouter();
  const { user, profile } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      router.push('/auth');
      return;
    }

    if (profile && profile.user_type !== 'farmer') {
      toast.error('This page is only for farmers');
      router.push('/dashboard');
      return;
    }

    const fetchOrders = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/marketplace/orders');
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch orders');
        }
        const data = await response.json();
        setOrders(data);
      } catch (error: any) {
        setError(error.message || 'Failed to fetch orders');
        toast.error(error.message || 'Failed to fetch orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user, profile, router]);

  const handleUpdateStatus = async (orderId: string, newStatus: Order['status']) => {
    try {
      const response = await fetch(`/api/marketplace/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update order status');
      }

      // Update local state to reflect the change
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );

      toast.success(`Order ${newStatus} successfully`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update order status');
      console.error('Error updating order status:', error);
    }
  };

  const getStatusBadge = (status: Order['status']) => {
    const statusConfig = {
      pending: { label: 'Pending', className: 'bg-yellow-500' },
      accepted: { label: 'Accepted', className: 'bg-blue-500' },
      rejected: { label: 'Rejected', className: 'bg-red-500' },
      completed: { label: 'Completed', className: 'bg-green-600' },
    };

    const config = statusConfig[status];
    return (
      <Badge className={config.className}>
        {config.label}
      </Badge>
    );
  };

  return (
    <DashboardShell>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Manage Orders</h1>
          <p className="text-muted-foreground">
            View and manage orders for your crop listings
          </p>
        </div>
        <Button asChild>
          <Link href="/marketplace/new">Add New Listing</Link>
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-green-600" />
        </div>
      ) : error ? (
        <Card>
          <CardContent className="py-10 text-center">
            <div className="text-red-500 mb-4">{error}</div>
            <Button asChild>
              <Link href="/marketplace">Go to Marketplace</Link>
            </Button>
          </CardContent>
        </Card>
      ) : orders.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center">
            <ShoppingBag className="w-10 h-10 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium mb-2">No Orders Yet</h3>
            <p className="text-muted-foreground mb-4">
              You haven't received any orders yet. Make sure your listings are available in the marketplace.
            </p>
            <Button asChild>
              <Link href="/marketplace/new">Create Listing</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id} className="overflow-hidden">
              <CardHeader className="bg-gray-50 py-4 px-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <CardTitle className="text-base font-medium flex items-center gap-2">
                      Order #{order.id.slice(0, 8)} 
                      {getStatusBadge(order.status)}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Received on {formatDate(order.created_at)}
                    </p>
                  </div>
                  {order.status === 'pending' && (
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-green-600 border-green-600 hover:bg-green-50"
                        onClick={() => handleUpdateStatus(order.id, 'accepted')}
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 border-red-600 hover:bg-red-50"
                        onClick={() => handleUpdateStatus(order.id, 'rejected')}
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  )}
                  {order.status === 'accepted' && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-green-600 border-green-600 hover:bg-green-50"
                      onClick={() => handleUpdateStatus(order.id, 'completed')}
                    >
                      Mark as Completed
                    </Button>
                  )}
                  {(order.status === 'rejected' || order.status === 'completed') && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">Actions</Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/farmer/orders/${order.id}`}>
                            View Details
                          </Link>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Crop</h3>
                    <Link href={`/marketplace/${order.listing.id}`} className="text-green-600 hover:underline font-medium">
                      {order.listing.crop_name}
                    </Link>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Buyer</h3>
                    <p>{order.buyer.full_name}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Quantity</h3>
                    <p>
                      {order.quantity} {order.listing.unit} @ {formatCurrency(order.listing.price_per_unit)}/{order.listing.unit}
                    </p>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Total Price:</span>
                    <span className="text-lg font-bold text-green-600">
                      {formatCurrency(order.total_price)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      <Toaster />
    </DashboardShell>
  );
} 