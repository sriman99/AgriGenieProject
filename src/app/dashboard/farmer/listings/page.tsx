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
import { Loader2, Plus, Edit, Trash2 } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Listing {
  id: string;
  crop_name: string;
  quantity: number;
  price_per_unit: number;
  unit: string;
  description: string;
  created_at: string;
  available: boolean;
}

export default function FarmerListingsPage() {
  const router = useRouter();
  const { user, profile } = useAuth();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

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

    const fetchListings = async () => {
      setLoading(true);
      try {
        // We'll use the same API but filter by farmer_id on the server
        const response = await fetch('/api/marketplace/listings');
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch listings');
        }
        const data = await response.json();
        setListings(data);
      } catch (error: any) {
        setError(error.message || 'Failed to fetch listings');
        toast.error(error.message || 'Failed to fetch listings');
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, [user, profile, router]);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const response = await fetch(`/api/marketplace/listings/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete listing');
      }

      setListings(prevListings => prevListings.filter(listing => listing.id !== id));
      toast.success('Listing deleted successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete listing');
      console.error('Error deleting listing:', error);
    } finally {
      setDeletingId(null);
    }
  };

  const toggleAvailability = async (id: string, currentAvailability: boolean) => {
    try {
      const response = await fetch(`/api/marketplace/listings/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ available: !currentAvailability }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update listing');
      }

      setListings(prevListings => 
        prevListings.map(listing => 
          listing.id === id ? { ...listing, available: !currentAvailability } : listing
        )
      );
      
      toast.success(`Listing ${!currentAvailability ? 'available' : 'unavailable'} for purchase`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update listing availability');
      console.error('Error updating listing:', error);
    }
  };

  return (
    <DashboardShell>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Crop Listings</h1>
          <p className="text-muted-foreground">
            Manage your listings in the marketplace
          </p>
        </div>
        <Button asChild>
          <Link href="/marketplace/new">
            <Plus className="w-4 h-4 mr-2" />
            Add New Listing
          </Link>
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
      ) : listings.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center">
            <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
              <Plus className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-lg font-medium mb-2">No Listings Yet</h3>
            <p className="text-muted-foreground mb-4">
              You haven't created any crop listings yet. Start selling your crops in the marketplace.
            </p>
            <Button asChild>
              <Link href="/marketplace/new">Create First Listing</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {listings.map((listing) => (
            <Card key={listing.id} className="overflow-hidden">
              <CardHeader className="bg-gray-50 py-4 px-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <CardTitle className="text-base font-medium flex items-center gap-2">
                      {listing.crop_name}
                      <Badge className={listing.available ? 'bg-green-600' : 'bg-red-500'}>
                        {listing.available ? 'Available' : 'Unavailable'}
                      </Badge>
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Listed on {formatDate(listing.created_at)}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                    >
                      <Link href={`/marketplace/${listing.id}`}>
                        View
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="text-blue-600 border-blue-600 hover:bg-blue-50"
                    >
                      <Link href={`/marketplace/edit/${listing.id}`}>
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Link>
                    </Button>
                    
                    <Button
                      variant={listing.available ? "outline" : "default"}
                      size="sm"
                      onClick={() => toggleAvailability(listing.id, listing.available)}
                    >
                      {listing.available ? 'Mark Unavailable' : 'Make Available'}
                    </Button>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 border-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete your
                            listing for {listing.crop_name}.
                            {/* Additional warning if there are orders */}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction 
                            className="bg-red-600 hover:bg-red-700"
                            onClick={() => handleDelete(listing.id)}
                          >
                            {deletingId === listing.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              "Delete"
                            )}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Available Quantity</h3>
                    <p className="font-semibold">
                      {listing.quantity} {listing.unit}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Price</h3>
                    <p className="font-semibold text-green-600">
                      {formatCurrency(listing.price_per_unit)}/{listing.unit}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Total Value</h3>
                    <p className="font-semibold">
                      {formatCurrency(listing.price_per_unit * listing.quantity)}
                    </p>
                  </div>
                </div>
                {listing.description && (
                  <div className="mt-4 pt-4 border-t">
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Description</h3>
                    <p className="text-gray-700">{listing.description}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      <Toaster />
    </DashboardShell>
  );
} 