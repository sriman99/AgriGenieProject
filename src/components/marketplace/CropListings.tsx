'use client';

import { useState, useEffect } from 'react';
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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import Link from 'next/link';

interface CropListingsProps {
  searchTerm?: string;
  filters?: {
    minPrice?: number;
    maxPrice?: number;
    cropType?: string;
  };
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
  farmer: {
    full_name: string;
  };
};

export function CropListings({ searchTerm = '', filters = {} }: CropListingsProps) {
  const { user, profile } = useAuth();
  const [listings, setListings] = useState<CropListing[]>([]);
  const [filteredListings, setFilteredListings] = useState<CropListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchaseQuantity, setPurchaseQuantity] = useState<number>(1);
  const [selectedListing, setSelectedListing] = useState<CropListing | null>(null);
  const [purchaseDialogOpen, setPurchaseDialogOpen] = useState(false);
  const [purchaseLoading, setPurchaseLoading] = useState(false);
  const { toast } = useToast();

  // Fetch all available listings
  const fetchListings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/marketplace/listings?available_only=true');
      if (!response.ok) {
        throw new Error('Failed to fetch listings');
      }
      const data = await response.json();
      setListings(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching listings:', error);
      toast({
        title: 'Error',
        description: 'Failed to load marketplace listings. Please try again.',
        variant: 'destructive',
      });
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchListings();
  }, []);

  // Apply filters and search
  useEffect(() => {
    if (!listings.length) return;

    let filtered = [...listings];

    // Apply search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (listing) =>
          listing.crop_name.toLowerCase().includes(term) ||
          listing.description.toLowerCase().includes(term) ||
          listing.farmer.full_name.toLowerCase().includes(term)
      );
    }

    // Apply price filters
    if (filters.minPrice !== undefined) {
      filtered = filtered.filter((listing) => listing.price_per_unit >= filters.minPrice!);
    }
    if (filters.maxPrice !== undefined) {
      filtered = filtered.filter((listing) => listing.price_per_unit <= filters.maxPrice!);
    }
    if (filters.cropType && filters.cropType !== 'all') {
      filtered = filtered.filter((listing) => listing.crop_name === filters.cropType);
    }

    setFilteredListings(filtered);
  }, [listings, searchTerm, filters]);

  // Handle purchase of a crop listing
  const handlePurchase = async () => {
    if (!selectedListing || !user) return;

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

      if (purchaseQuantity > selectedListing.quantity) {
        toast({
          title: 'Insufficient quantity',
          description: `Only ${selectedListing.quantity} ${selectedListing.unit} available.`,
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
          crop_listing_id: selectedListing.id,
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
        description: `You have purchased ${purchaseQuantity} ${selectedListing.unit} of ${selectedListing.crop_name}.`,
      });

      // Close dialog and reset
      setPurchaseDialogOpen(false);
      setPurchaseQuantity(1);
      setSelectedListing(null);

      // Refresh listings
      fetchListings();
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

  // Open purchase dialog with selected listing
  const openPurchaseDialog = (listing: CropListing) => {
    setSelectedListing(listing);
    setPurchaseQuantity(1);
    setPurchaseDialogOpen(true);
  };

  // Calculate total price
  const calculateTotalPrice = () => {
    if (!selectedListing) return 0;
    return purchaseQuantity * selectedListing.price_per_unit;
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, index) => (
          <Card key={index} className="overflow-hidden">
            <CardHeader className="pb-3">
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-24 w-full mb-4" />
              <div className="flex justify-between">
                <Skeleton className="h-5 w-1/3" />
                <Skeleton className="h-5 w-1/4" />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Skeleton className="h-9 w-24" />
              <Skeleton className="h-9 w-24" />
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  if (filteredListings.length === 0) {
    return (
      <div className="text-center p-8 border border-dashed rounded-lg">
        <h3 className="text-lg font-medium mb-2">No listings found</h3>
        <p className="text-muted-foreground mb-4">
          {searchTerm || filters.minPrice || filters.maxPrice || filters.cropType
            ? 'Try adjusting your search or filters'
            : 'There are no crop listings available at the moment'}
        </p>
        <Button asChild>
          <Link href="/marketplace">Clear filters</Link>
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredListings.map((listing) => (
          <Card key={listing.id} className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl">{listing.crop_name}</CardTitle>
                  <CardDescription>
                    By {listing.farmer.full_name} • {new Date(listing.created_at).toLocaleDateString()}
                  </CardDescription>
                </div>
                <Badge>{listing.unit}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                {listing.description}
              </p>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-lg font-semibold">
                    ₹{listing.price_per_unit.toFixed(2)}/{listing.unit}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Available: {listing.quantity} {listing.unit}
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" asChild>
                <Link href={`/marketplace/${listing.id}`}>View Details</Link>
              </Button>
              {profile?.user_type === 'buyer' && (
                <Button onClick={() => openPurchaseDialog(listing)}>Buy Now</Button>
              )}
              {profile?.user_type === 'farmer' && listing.farmer.full_name === profile.full_name && (
                <Button variant="outline" asChild>
                  <Link href={`/marketplace/edit/${listing.id}`}>Edit</Link>
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>

      <Dialog open={purchaseDialogOpen} onOpenChange={setPurchaseDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Purchase Crop</DialogTitle>
            <DialogDescription>
              Complete your purchase of{' '}
              {selectedListing ? `${selectedListing.crop_name} from ${selectedListing.farmer.full_name}` : ''}
            </DialogDescription>
          </DialogHeader>

          {selectedListing && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="crop">Crop</Label>
                  <div id="crop" className="text-sm mt-1">
                    {selectedListing.crop_name}
                  </div>
                </div>
                <div>
                  <Label htmlFor="price">Price per {selectedListing.unit}</Label>
                  <div id="price" className="text-sm mt-1">
                    ₹{selectedListing.price_per_unit.toFixed(2)}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="available">Available Quantity</Label>
                  <div id="available" className="text-sm mt-1">
                    {selectedListing.quantity} {selectedListing.unit}
                  </div>
                </div>
                <div>
                  <Label htmlFor="quantity">Purchase Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min={1}
                    max={selectedListing.quantity}
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
          )}

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
    </>
  );
} 