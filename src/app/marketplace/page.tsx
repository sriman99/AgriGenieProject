'use client';

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth-context";
import { createClient } from "@/lib/supabase";
import { api } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { agriToasts } from "@/components/ui/toast";

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      await onPurchase(quantity);
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
          <p className="text-sm text-gray-500">
            Available: {listing.quantity} {listing.unit}
          </p>
          <p className="text-sm text-gray-500">
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
          {isProcessing ? "Processing..." : "Confirm Purchase"}
        </Button>
      </form>
    </DialogContent>
  );
}

export default function MarketplacePage() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const [listings, setListings] = useState<CropListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth');
    }
  }, [user, loading, router]);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const { data, error } = await supabase
          .from('crop_listings')
          .select('*, farmer:profiles(full_name)')
          .eq('available', true)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setListings(data);
      } catch (error) {
        agriToasts.showToast({
          message: "Failed to fetch listings",
          type: "error"
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchListings();
    }
  }, [user]);

  const handlePurchase = async (listingId: string, quantity: number) => {
    try {
      const listing = listings.find(l => l.id === listingId);
      if (!listing) return;

      const { error } = await supabase.from('orders').insert({
        buyer_id: user?.id,
        crop_listing_id: listingId,
        quantity,
        total_price: quantity * listing.price_per_unit,
        status: 'pending'
      });

      if (error) throw error;

      agriToasts.showToast({
        message: `Successfully ordered ${quantity} ${listing.unit} of ${listing.crop_name}`,
        type: "success"
      });

      // Refresh listings
      router.refresh();
    } catch (error) {
      agriToasts.showToast({
        message: "Failed to place order",
        type: "error"
      });
    }
  };

  if (loading || isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <main className="min-h-screen p-4 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Marketplace</h1>
          {profile?.user_type === 'farmer' && (
            <Button onClick={() => router.push('/marketplace/new')}>
              List New Crop
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((listing) => (
            <Card key={listing.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>{listing.crop_name}</CardTitle>
                <CardDescription>
                  Listed by {listing.farmer.full_name}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p>
                    Price: ₹{listing.price_per_unit}/{listing.unit}
                  </p>
                  <p>
                    Available: {listing.quantity} {listing.unit}
                  </p>
                  {listing.description && (
                    <p className="text-sm text-gray-500">{listing.description}</p>
                  )}
                  {profile?.user_type === 'buyer' && (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button className="w-full">Purchase</Button>
                      </DialogTrigger>
                      <PurchaseDialog
                        listing={listing}
                        onPurchase={(quantity) =>
                          handlePurchase(listing.id, quantity)
                        }
                      />
                    </Dialog>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {listings.length === 0 && !isLoading && (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-gray-500">No crops currently listed.</p>
              {profile?.user_type === 'farmer' && (
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => router.push('/marketplace/new')}
                >
                  List Your First Crop
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}