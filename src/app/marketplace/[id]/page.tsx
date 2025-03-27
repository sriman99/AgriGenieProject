'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Toaster } from '@/components/ui/toaster';
import { toast } from 'sonner';
import { Navbar } from '@/components/dashboard/navbar';
import { ArrowLeft, CalendarIcon, Loader2, MapPin, User } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Listing {
  id: string;
  crop_name: string;
  quantity: number;
  price_per_unit: number;
  unit: string;
  description: string;
  created_at: string;
  available: boolean;
  farmer_name: string;
  farmer_id: string;
  location?: string;
}

export default function ListingDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user, profile } = useAuth();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const listingId = params?.id as string;

  useEffect(() => {
    if (!user) {
      router.push('/auth');
      return;
    }

    const fetchListing = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/marketplace/listings/${listingId}`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch listing');
        }
        const data = await response.json();
        setListing(data);
      } catch (error: any) {
        setError(error.message || 'Failed to fetch listing');
        toast.error(error.message || 'Failed to fetch listing');
      } finally {
        setLoading(false);
      }
    };

    fetchListing();
  }, [listingId, user, router]);

  const handleBuy = async () => {
    if (!user || !listing) return;

    // Validate quantity
    if (quantity <= 0) {
      toast.error('Quantity must be greater than zero');
      return;
    }

    if (quantity > listing.quantity) {
      toast.error(`Only ${listing.quantity} ${listing.unit} available`);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/marketplace/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listing_id: listing.id,
          quantity: quantity,
          total_price: quantity * listing.price_per_unit
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to place order');
      }

      toast.success('Order placed successfully!');
      setDialogOpen(false);
      router.push('/dashboard/buyer/orders');
    } catch (error: any) {
      toast.error(error.message || 'Failed to place order. Please try again.');
      console.error('Error placing order:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="container py-12">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-green-600" />
          </div>
        </main>
        <Toaster />
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="container py-12">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Listing Not Found</h1>
            <p className="text-gray-600 mb-6">
              {error || 'The listing you are looking for does not exist or has been removed.'}
            </p>
            <Button asChild>
              <Link href="/marketplace">Return to Marketplace</Link>
            </Button>
          </div>
        </main>
        <Toaster />
      </div>
    );
  }

  const isOwner = user && listing.farmer_id === user.id;
  const isBuyer = profile?.user_type === 'buyer';

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container py-8">
        <Link href="/marketplace" className="inline-flex items-center text-green-600 hover:text-green-700 mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Marketplace
        </Link>
        
        <div className="max-w-3xl mx-auto">
          <Card className="overflow-hidden">
            <div className="bg-green-600 h-24 relative"></div>
            
            <CardHeader className="pb-4">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl mb-2">{listing.crop_name}</CardTitle>
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {formatCurrency(listing.price_per_unit)} / {listing.unit}
                  </div>
                </div>
                <Badge className={listing.available ? 'bg-green-600' : 'bg-red-500'}>
                  {listing.available ? 'Available' : 'Unavailable'}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6 pb-6">
              <div className="flex flex-col md:flex-row gap-8">
                <div className="flex-1 space-y-4">
                  <div>
                    <h3 className="text-sm text-gray-500 mb-1">Available Quantity</h3>
                    <p className="font-semibold">
                      {listing.quantity} {listing.unit}
                    </p>
                  </div>
                  
                  {listing.description && (
                    <div>
                      <h3 className="text-sm text-gray-500 mb-1">Description</h3>
                      <p className="text-gray-700">{listing.description}</p>
                    </div>
                  )}
                </div>
                
                <div className="flex-1 space-y-4">
                  <div className="flex items-start gap-2">
                    <User className="w-5 h-5 text-gray-500 mt-0.5" />
                    <div>
                      <h3 className="text-sm text-gray-500">Seller</h3>
                      <p className="font-semibold">{listing.farmer_name}</p>
                    </div>
                  </div>
                  
                  {listing.location && (
                    <div className="flex items-start gap-2">
                      <MapPin className="w-5 h-5 text-gray-500 mt-0.5" />
                      <div>
                        <h3 className="text-sm text-gray-500">Location</h3>
                        <p className="font-semibold">{listing.location}</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-start gap-2">
                    <CalendarIcon className="w-5 h-5 text-gray-500 mt-0.5" />
                    <div>
                      <h3 className="text-sm text-gray-500">Listed on</h3>
                      <p className="font-semibold">{formatDate(listing.created_at)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>

            <CardFooter className="border-t pt-6 flex justify-between">
              {isOwner ? (
                <div className="space-x-4">
                  <Button variant="outline" onClick={() => router.push(`/marketplace/edit/${listing.id}`)}>
                    Edit Listing
                  </Button>
                  {listing.available && (
                    <Button variant="destructive" onClick={() => {
                      // Mark as unavailable logic
                      toast.info('Feature coming soon');
                    }}>
                      Mark as Unavailable
                    </Button>
                  )}
                </div>
              ) : isBuyer && listing.available ? (
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full md:w-auto">Buy Now</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Confirm Purchase</DialogTitle>
                      <DialogDescription>
                        Please confirm your order details for {listing.crop_name}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="quantity">Quantity ({listing.unit})</Label>
                        <Input
                          id="quantity"
                          type="number"
                          min={1}
                          max={listing.quantity}
                          value={quantity}
                          onChange={(e) => setQuantity(Math.min(listing.quantity, Math.max(1, parseInt(e.target.value) || 1)))}
                        />
                      </div>
                      
                      <div className="text-sm space-y-2">
                        <div className="flex justify-between">
                          <span>Price per {listing.unit}:</span>
                          <span>{formatCurrency(listing.price_per_unit)}</span>
                        </div>
                        <div className="flex justify-between font-bold">
                          <span>Total Price:</span>
                          <span>{formatCurrency(quantity * listing.price_per_unit)}</span>
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                      <Button 
                        onClick={handleBuy} 
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          "Confirm Order"
                        )}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              ) : (
                <p className="text-gray-500">
                  {!listing.available 
                    ? 'This listing is currently unavailable' 
                    : 'You need a buyer account to purchase'}
                </p>
              )}
              
              <Button variant="ghost" asChild>
                <Link href="/marketplace">Back to Listings</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </main>
      <Toaster />
    </div>
  );
} 