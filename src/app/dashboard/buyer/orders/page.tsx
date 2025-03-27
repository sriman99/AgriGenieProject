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
import { Loader2, ShoppingBag } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

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
  farmer: {
    full_name: string;
  };
}

export default function BuyerOrdersPage() {
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

    if (profile && profile.user_type !== 'buyer') {
      toast.error('This page is only for buyers');
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
          <h1 className="text-2xl font-bold tracking-tight">My Orders</h1>
          <p className="text-muted-foreground">
            View and manage your marketplace orders
          </p>
        </div>
        <Button asChild>
          <Link href="/marketplace">Marketplace</Link>
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
              You haven't placed any orders yet. Visit the marketplace to purchase crops.
            </p>
            <Button asChild>
              <Link href="/marketplace">Browse Marketplace</Link>
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
                      Placed on {formatDate(order.created_at)}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                  >
                    <Link href={`/dashboard/buyer/orders/${order.id}`}>
                      View Details
                    </Link>
                  </Button>
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
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Seller</h3>
                    <p>{order.farmer.full_name}</p>
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