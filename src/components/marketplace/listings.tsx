'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Search, ShoppingBasket, AlertCircle } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import Link from 'next/link';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { get, post } from "@/lib/api-client";

interface CropListingsProps {
  searchTerm?: string;
  filters?: {
    minPrice?: string;
    maxPrice?: string;
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
  farmer_id: string;
  farmer: {
    full_name: string;
  };
};

export function CropListings({ searchTerm = '', filters = {} }: CropListingsProps) {
  const [listings, setListings] = useState<CropListing[]>([]);
  const [filteredListings, setFilteredListings] = useState<CropListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [purchaseDialogOpen, setPurchaseDialogOpen] = useState(false);
  const [selectedListing, setSelectedListing] = useState<CropListing | null>(null);
  const [purchaseQuantity, setPurchaseQuantity] = useState(1);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const { user, profile, loading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  // Fetch listings on component mount
  useEffect(() => {
    const loadListings = async () => {
      // If user is still loading from auth context, wait
      if (loading) {
        return;
      }
      
      // Only fetch listings if user is authenticated
      if (user) {
        fetchListings();
      } else {
        console.log('User not authenticated, redirecting to login');
        // Redirect to login if not authenticated
        toast({
          title: "Authentication Required",
          description: "Please sign in to view marketplace listings.",
          variant: "destructive",
        });
        router.push('/auth');
      }
    };
    
    loadListings();
  }, [user, loading]);

  // Filter listings when searchTerm or filters change
  useEffect(() => {
    if (listings.length) {
      applyFilters();
    }
  }, [listings, searchTerm, filters]);

  const fetchListings = async () => {
    try {
      setIsLoading(true);
      console.log('Fetching marketplace listings');
      const data = await get<CropListing[]>('/api/marketplace/listings?available_only=true');
      console.log('Listings fetched successfully:', data.length);
      setListings(data);
      setFilteredListings(data);
    } catch (error) {
      console.error('Error fetching listings:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch listings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...listings];
    
    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(listing => 
        listing.crop_name.toLowerCase().includes(searchLower) || 
        listing.description?.toLowerCase().includes(searchLower)
      );
    }
    
    // Apply price filters
    if (filters.minPrice) {
      const minPrice = parseFloat(filters.minPrice);
      filtered = filtered.filter(listing => listing.price_per_unit >= minPrice);
    }
    
    if (filters.maxPrice) {
      const maxPrice = parseFloat(filters.maxPrice);
      filtered = filtered.filter(listing => listing.price_per_unit <= maxPrice);
    }
    
    // Apply crop type filter
    if (filters.cropType) {
      filtered = filtered.filter(listing => listing.crop_name === filters.cropType);
    }
    
    setFilteredListings(filtered);
  };

  const handlePurchase = async () => {
    if (!selectedListing || !user) return;

    try {
      setIsPurchasing(true);

      // Validate quantity
      if (purchaseQuantity <= 0) {
        toast({
          title: "Invalid quantity",
          description: "Please enter a quantity greater than zero.",
          variant: "destructive",
        });
        return;
      }

      if (purchaseQuantity > selectedListing.quantity) {
        toast({
          title: "Insufficient quantity",
          description: `Only ${selectedListing.quantity} ${selectedListing.unit} available.`,
          variant: "destructive",
        });
        return;
      }

      // Create order
      await post('/api/marketplace/orders', {
        crop_listing_id: selectedListing.id,
        quantity: purchaseQuantity,
      });

      // Success
      toast({
        title: "Order Placed",
        description: `Your order for ${purchaseQuantity} ${selectedListing.unit} of ${selectedListing.crop_name} has been placed successfully.`,
      });

      // Close dialog and refresh listings
      setPurchaseDialogOpen(false);
      fetchListings();
    } catch (error: any) {
      console.error('Error placing order:', error);
      toast({
        title: "Order Failed",
        description: error.message || 'Failed to place order. Please try again.',
        variant: "destructive",
      });
    } finally {
      setIsPurchasing(false);
    }
  };

  const openPurchaseDialog = (listing: CropListing) => {
    setSelectedListing(listing);
    setPurchaseQuantity(1);
    setPurchaseDialogOpen(true);
  };

  const calculateTotalPrice = () => {
    if (!selectedListing) return 0;
    return purchaseQuantity * selectedListing.price_per_unit;
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  // Show empty state
  if (filteredListings.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No Listings Found</h3>
          <p className="text-muted-foreground mb-6">
            {searchTerm || filters.minPrice || filters.maxPrice || filters.cropType 
              ? "No matching listings found. Try adjusting your search or filters."
              : "There are no crop listings available at the moment."}
          </p>
          {searchTerm || filters.minPrice || filters.maxPrice || filters.cropType ? (
            <Button onClick={() => router.push('/marketplace')}>
              Clear Filters
            </Button>
          ) : null}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredListings.map((listing) => (
          <Card key={listing.id} className="overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl">
                    {listing.crop_name}
                  </CardTitle>
                  <CardDescription>
                    By {listing.farmer.full_name}
                  </CardDescription>
                </div>
                <Badge>{listing.unit}</Badge>
              </div>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Price:</span>
                  <span className="font-bold">₹{listing.price_per_unit} per {listing.unit}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Available:</span>
                  <span className="font-medium">{listing.quantity} {listing.unit}</span>
                </div>
                {listing.description && (
                  <div className="mt-4">
                    <p className="text-sm text-muted-foreground line-clamp-2">{listing.description}</p>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="pt-2 flex justify-between">
              <Button variant="outline" asChild className="w-1/2">
                <Link href={`/marketplace/listing/${listing.id}`}>
                  View Details
                </Link>
              </Button>
              <Button 
                className="w-1/2"
                onClick={() => openPurchaseDialog(listing)}
                disabled={profile?.user_type !== 'buyer'}
              >
                <ShoppingBasket className="h-4 w-4 mr-2" />
                Purchase
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Purchase Dialog */}
      {selectedListing && (
        <Dialog open={purchaseDialogOpen} onOpenChange={setPurchaseDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Purchase {selectedListing.crop_name}</DialogTitle>
              <DialogDescription>
                Complete your purchase from {selectedListing.farmer.full_name}
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Crop</Label>
                  <p className="text-sm mt-1">{selectedListing.crop_name}</p>
                </div>
                <div>
                  <Label>Price per {selectedListing.unit}</Label>
                  <p className="text-sm mt-1">₹{selectedListing.price_per_unit}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Available Quantity</Label>
                  <p className="text-sm mt-1">{selectedListing.quantity} {selectedListing.unit}</p>
                </div>
                <div>
                  <Label htmlFor="purchase-quantity">Purchase Quantity</Label>
                  <Input
                    id="purchase-quantity"
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
                <p className="text-lg font-bold mt-1">₹{calculateTotalPrice().toFixed(2)}</p>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setPurchaseDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handlePurchase} disabled={isPurchasing}>
                {isPurchasing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Confirm Purchase"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
} 