import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, ShoppingBag } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import Link from 'next/link';

interface CropListing {
  id: string;
  farmer_id: string;
  crop_name: string;
  quantity: number;
  price_per_unit: number;
  unit: string;
  description: string | null;
  available: boolean;
  created_at: string;
  farmer: {
    full_name: string;
  };
}

interface PurchaseDialogProps {
  listing: CropListing;
  onPurchase: (quantity: number) => Promise<void>;
}

function PurchaseDialog({ listing, onPurchase }: PurchaseDialogProps) {
  const [quantity, setQuantity] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      await onPurchase(quantity);
      toast({
        title: "Success",
        description: `Successfully ordered ${quantity} ${listing.unit} of ${listing.crop_name}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to place order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Purchase {listing.crop_name}</DialogTitle>
        <DialogDescription>
          Enter the quantity you want to purchase
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <p className="text-sm text-muted-foreground">
            Available: {listing.quantity} {listing.unit}
          </p>
          <p className="text-sm text-muted-foreground">
            Price: ₹{listing.price_per_unit}/{listing.unit}
          </p>
        </div>
        <Input
          type="number"
          min={1}
          max={listing.quantity}
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
          required
        />
        <div>
          <p className="font-semibold">
            Total Price: ₹{(quantity * listing.price_per_unit).toFixed(2)}
          </p>
        </div>
        <Button type="submit" className="w-full" disabled={isProcessing}>
          {isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            "Confirm Purchase"
          )}
        </Button>
      </form>
    </DialogContent>
  );
}

interface CropListingsProps {
  searchTerm?: string;
  filters?: {
    minPrice?: string;
    maxPrice?: string;
    cropType?: string;
  };
}

export function CropListings({ searchTerm = '', filters = {} }: CropListingsProps) {
  const [listings, setListings] = useState<CropListing[]>([]);
  const [filteredListings, setFilteredListings] = useState<CropListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user, profile } = useAuth();
  const { toast } = useToast();

  // Fetch listings
  useEffect(() => {
    fetchListings();
  }, []);

  // Apply filters when listings or filter criteria change
  useEffect(() => {
    if (listings.length > 0) {
      applyFilters();
    }
  }, [listings, searchTerm, filters]);

  const fetchListings = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/marketplace/listings');
      if (!response.ok) throw new Error('Failed to fetch listings');
      const data = await response.json();
      setListings(data);
      setFilteredListings(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch listings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let result = [...listings];
    
    // Search term filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(listing => 
        listing.crop_name.toLowerCase().includes(term) ||
        listing.farmer.full_name.toLowerCase().includes(term) ||
        (listing.description && listing.description.toLowerCase().includes(term))
      );
    }
    
    // Price filters
    if (filters.minPrice) {
      const minPrice = parseFloat(filters.minPrice);
      result = result.filter(listing => listing.price_per_unit >= minPrice);
    }
    
    if (filters.maxPrice) {
      const maxPrice = parseFloat(filters.maxPrice);
      result = result.filter(listing => listing.price_per_unit <= maxPrice);
    }
    
    // Crop type filter
    if (filters.cropType) {
      result = result.filter(listing => listing.crop_name === filters.cropType);
    }
    
    setFilteredListings(result);
  };

  const handlePurchase = async (listingId: string, quantity: number) => {
    try {
      const response = await fetch('/api/marketplace/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          crop_listing_id: listingId,
          quantity
        })
      });

      if (!response.ok) throw new Error('Failed to place order');
      
      // Refresh listings after successful purchase
      fetchListings();
    } catch (error) {
      throw error; // Let the PurchaseDialog handle the error
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  if (filteredListings.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">
            {listings.length === 0
              ? "No crops currently listed."
              : "No crops match your search criteria."}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredListings.map((listing) => (
        <Card key={listing.id} className="hover:shadow-lg transition-shadow overflow-hidden">
          <div className="relative h-40 bg-gray-100">
            <div className="absolute inset-0 bg-gradient-to-r from-green-50 to-green-100 flex items-center justify-center">
              <ShoppingBag className="h-12 w-12 text-green-600 opacity-20" />
            </div>
            {!listing.available && (
              <div className="absolute inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center">
                <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                  Sold Out
                </span>
              </div>
            )}
          </div>
          <CardHeader>
            <CardTitle className="flex justify-between items-start">
              <Link href={`/marketplace/${listing.id}`} className="hover:text-green-600 transition-colors">
                {listing.crop_name}
              </Link>
              <span className="text-lg font-bold text-green-600">
                ₹{listing.price_per_unit}/{listing.unit}
              </span>
            </CardTitle>
            <CardDescription>
              Listed by {listing.farmer.full_name}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm">
                Available: {listing.quantity} {listing.unit}
              </p>
              {listing.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">{listing.description}</p>
              )}
              <div className="flex justify-between pt-4">
                <Link href={`/marketplace/${listing.id}`}>
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </Link>
                {profile?.user_type === 'buyer' && listing.available && (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="sm">Purchase</Button>
                    </DialogTrigger>
                    <PurchaseDialog
                      listing={listing}
                      onPurchase={(quantity) => handlePurchase(listing.id, quantity)}
                    />
                  </Dialog>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
} 