'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import Link from 'next/link';
import { AlertCircle, ArrowLeft, Edit, Trash } from 'lucide-react';

interface ListingDetailProps {
  listingId: string;
}

type CropListing = {
  id: string;
  crop_name: string;
  quantity: number;
  price_per_unit: number;
  unit: string;
  description: string;
  available: boolean;
  created_at: string;
  farmer_id: string;
  farmer: {
    full_name: string;
  };
};

export function ListingDetail({ listingId }: ListingDetailProps) {
  const { user, profile } = useAuth();
  const router = useRouter();
  const [listing, setListing] = useState<CropListing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [purchaseQuantity, setPurchaseQuantity] = useState<number>(1);
  const [purchaseDialogOpen, setPurchaseDialogOpen] = useState(false);
  const [purchaseLoading, setPurchaseLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const { toast } = useToast();

  // Fetch listing details
  useEffect(() => {
    const fetchListing = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/marketplace/listings/${listingId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch listing details');
        }
        
        const data = await response.json();
        setListing(data);
        setPurchaseQuantity(1); // Reset purchase quantity when listing changes
      } catch (error) {
        console.error('Error fetching listing details:', error);
        setError('Failed to load listing details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (listingId) {
      fetchListing();
    }
  }, [listingId]);

  // Handle purchase of crop
  const handlePurchase = async () => {
    if (!listing || !user) return;

    try {
      setPurchaseLoading(true);

      // Check if quantity is valid
      if (purchaseQuantity <= 0) {
        toast({
          title: 'Invalid quantity',
          description: 'Please enter a quantity greater than zero.',
          variant: 'destructive',
        });
        return;
      }

      if (purchaseQuantity > listing.quantity) {
        toast({
          title: 'Insufficient quantity',
          description: `Only ${listing.quantity} ${listing.unit} available.`,
          variant: 'destructive',
        });
        return;
      }

      // Create order
      const response = await fetch('/api/marketplace/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          crop_listing_id: listing.id,
          quantity: purchaseQuantity,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to place order');
      }

      // Success
      toast({
        title: 'Order placed successfully',
        description: `You have purchased ${purchaseQuantity} ${listing.unit} of ${listing.crop_name}.`,
      });

      // Close dialog and redirect to orders page
      setPurchaseDialogOpen(false);
      router.push('/marketplace/orders');
    } catch (error: any) {
      console.error('Error placing order:', error);
      toast({
        title: 'Order failed',
        description: error.message || 'Failed to place order. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setPurchaseLoading(false);
    }
  };

  // Delete listing (only for farmers who own the listing)
  const handleDelete = async () => {
    if (!listing || !user) return;

    try {
      setDeleteLoading(true);

      const response = await fetch(`/api/marketplace/listings/${listing.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete listing');
      }

      // Success
      toast({
        title: 'Listing Deleted',
        description: 'Your listing has been successfully deleted.',
      });

      // Close dialog and redirect to marketplace
      setDeleteDialogOpen(false);
      router.push('/marketplace');
    } catch (error: any) {
      console.error('Error deleting listing:', error);
      toast({
        title: 'Deletion Failed',
        description: error.message || 'Failed to delete listing. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  // Calculate total price
  const calculateTotalPrice = () => {
    if (!listing) return 0;
    return purchaseQuantity * listing.price_per_unit;
  };

  // Check if current user is the owner of the listing
  const isOwner = user && listing?.farmer_id === user.id;

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center mb-4">
          <Button variant="ghost" className="mr-2">
            <ArrowLeft className="h-4 w-4 mr-2" />
            <Skeleton className="h-4 w-16" />
          </Button>
        </div>
        
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-32" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            
            <div className="flex justify-between items-center mt-6">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-6 w-24" />
            </div>
          </CardContent>
          <CardFooter>
            <Skeleton className="h-10 w-full" />
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/marketplace">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Marketplace
          </Link>
        </Button>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-destructive">
              <AlertCircle className="h-5 w-5 mr-2" />
              Error
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error || 'Listing not found'}</p>
          </CardContent>
          <CardFooter>
            <Button asChild>
              <Link href="/marketplace">Browse Other Listings</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Button variant="ghost" asChild className="mb-4">
        <Link href="/marketplace">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Marketplace
        </Link>
      </Button>
      
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">{listing.crop_name}</CardTitle>
              <CardDescription>
                Listed by {listing.farmer.full_name} on{' '}
                {new Date(listing.created_at).toLocaleDateString()}
              </CardDescription>
            </div>
            <Badge className="text-sm">{listing.unit}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="text-sm font-medium mb-1">Description</h3>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {listing.description}
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mt-6">
            <div>
              <h3 className="text-sm font-medium mb-1">Quantity Available</h3>
              <p className="text-lg">
                {listing.quantity} {listing.unit}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium mb-1">Price per Unit</h3>
              <p className="text-lg font-semibold">
                ₹{listing.price_per_unit.toFixed(2)}/{listing.unit}
              </p>
            </div>
          </div>
          
          {!listing.available && (
            <div className="bg-amber-50 border border-amber-200 p-3 rounded-md text-amber-800 flex items-center">
              <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
              <p>This crop is no longer available for purchase.</p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          {isOwner ? (
            <div className="flex space-x-2 w-full">
              <Button variant="outline" asChild className="flex-1">
                <Link href={`/marketplace/edit/${listing.id}`}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Listing
                </Link>
              </Button>
              <Button variant="destructive" className="flex-1" onClick={() => setDeleteDialogOpen(true)}>
                <Trash className="h-4 w-4 mr-2" />
                Delete Listing
              </Button>
            </div>
          ) : (
            <Button
              className="w-full"
              disabled={!listing.available || profile?.user_type !== 'buyer'}
              onClick={() => setPurchaseDialogOpen(true)}
            >
              {profile?.user_type !== 'buyer'
                ? 'Only Buyers Can Purchase'
                : 'Purchase Now'}
            </Button>
          )}
        </CardFooter>
      </Card>

      {/* Purchase Dialog */}
      <Dialog open={purchaseDialogOpen} onOpenChange={setPurchaseDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Purchase {listing.crop_name}</DialogTitle>
            <DialogDescription>
              Complete your purchase from {listing.farmer.full_name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="listing-crop">Crop</Label>
                <div id="listing-crop" className="text-sm mt-1">
                  {listing.crop_name}
                </div>
              </div>
              <div>
                <Label htmlFor="listing-price">Price per {listing.unit}</Label>
                <div id="listing-price" className="text-sm mt-1">
                  ₹{listing.price_per_unit.toFixed(2)}
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="listing-available">Available Quantity</Label>
                <div id="listing-available" className="text-sm mt-1">
                  {listing.quantity} {listing.unit}
                </div>
              </div>
              <div>
                <Label htmlFor="purchase-quantity">Purchase Quantity</Label>
                <Input
                  id="purchase-quantity"
                  type="number"
                  min={1}
                  max={listing.quantity}
                  value={purchaseQuantity}
                  onChange={(e) => setPurchaseQuantity(Number(e.target.value))}
                  className="mt-1"
                />
              </div>
            </div>
            
            <div>
              <Label>Total Price</Label>
              <div className="text-lg font-bold mt-1">₹{calculateTotalPrice().toFixed(2)}</div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setPurchaseDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handlePurchase} disabled={purchaseLoading}>
              {purchaseLoading ? 'Processing...' : 'Confirm Purchase'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
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
              {deleteLoading ? 'Deleting...' : 'Delete Listing'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 