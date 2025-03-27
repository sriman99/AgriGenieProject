'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import Link from 'next/link';
import { Eye, Edit, AlertTriangle, Plus, Loader2, Trash } from 'lucide-react';
import { get, del } from '@/lib/api-client';

type Listing = {
  id: string;
  crop_name: string;
  quantity: number;
  price_per_unit: number;
  unit: string;
  available: boolean;
  created_at: string;
  description: string;
};

export function MyListings() {
  const { user, profile } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [listingToDelete, setListingToDelete] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      return;
    }

    if (profile?.user_type !== 'farmer') {
      router.push('/marketplace');
      return;
    }

    fetchListings();
  }, [user, profile, router]);

  const fetchListings = async () => {
    try {
      setLoading(true);
      console.log('Fetching my listings...');
      const data = await get<Listing[]>('/api/marketplace/listings/my-listings');
      console.log('My listings fetched successfully:', data.length);
      setListings(data);
    } catch (error) {
      console.error('Error fetching listings:', error);
      setError('Failed to load your listings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = (listingId: string) => {
    setListingToDelete(listingId);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!listingToDelete) return;

    try {
      setDeleteLoading(true);
      await del(`/api/marketplace/listings/${listingToDelete}`);
      
      // Remove the deleted listing from the state
      setListings(listings.filter(listing => listing.id !== listingToDelete));
      
      toast({
        title: 'Listing Deleted',
        description: 'Your listing has been successfully deleted.',
      });
    } catch (error: any) {
      console.error('Error deleting listing:', error);
      toast({
        title: 'Deletion Failed',
        description: error.message || 'Failed to delete listing. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setDeleteLoading(false);
      setDeleteDialogOpen(false);
      setListingToDelete(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
        
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-32 mb-1" />
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            </CardContent>
            <CardFooter>
              <div className="flex justify-end w-full space-x-2">
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-10 w-24" />
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-destructive">
            <AlertTriangle className="h-5 w-5 mr-2" />
            Error
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>{error}</p>
        </CardContent>
        <CardFooter>
          <Button onClick={fetchListings}>Retry</Button>
        </CardFooter>
      </Card>
    );
  }

  if (profile?.user_type !== 'farmer') {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Access Denied</CardTitle>
          <CardDescription>Only farmers can manage listings.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>This section is only available to farmers. If you are a farmer, please update your profile settings.</p>
        </CardContent>
        <CardFooter>
          <Button asChild>
            <Link href="/marketplace">Go to Marketplace</Link>
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">My Listings</h2>
        <Button asChild>
          <Link href="/marketplace/create">
            <Plus className="h-4 w-4 mr-2" />
            Create New Listing
          </Link>
        </Button>
      </div>
      
      {listings.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No Listings Yet</CardTitle>
            <CardDescription>You haven't created any crop listings yet.</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Start selling your crops by creating your first listing.</p>
          </CardContent>
          <CardFooter>
            <Button asChild>
              <Link href="/marketplace/create">
                <Plus className="h-4 w-4 mr-2" />
                Create First Listing
              </Link>
            </Button>
          </CardFooter>
        </Card>
      ) : (
        listings.map((listing) => (
          <Card key={listing.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{listing.crop_name}</CardTitle>
                  <CardDescription>
                    Listed on {new Date(listing.created_at).toLocaleDateString()}
                  </CardDescription>
                </div>
                <Badge variant={listing.available ? "default" : "outline"}>
                  {listing.available ? "Available" : "Not Available"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <h3 className="text-sm font-medium mb-1">Quantity</h3>
                  <p>{listing.quantity} {listing.unit}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium mb-1">Price</h3>
                  <p>₹{listing.price_per_unit.toFixed(2)}/{listing.unit}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium mb-1">Total Value</h3>
                  <p>₹{(listing.price_per_unit * listing.quantity).toFixed(2)}</p>
                </div>
              </div>
              {listing.description && (
                <div className="mt-4">
                  <h3 className="text-sm font-medium mb-1">Description</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">{listing.description}</p>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <div className="flex justify-end w-full space-x-2">
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/marketplace/listing/${listing.id}`}>
                    <Eye className="h-4 w-4 mr-2" />
                    View
                  </Link>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/marketplace/edit/${listing.id}`}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Link>
                </Button>
                <Button variant="destructive" size="sm" onClick={() => confirmDelete(listing.id)}>
                  <Trash className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </CardFooter>
          </Card>
        ))
      )}
      
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Listing</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this listing? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleteLoading}>
              {deleteLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Listing"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 