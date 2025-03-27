'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Toaster } from '@/components/ui/toaster';
import { toast } from 'sonner';
import { Navbar } from '@/components/dashboard/navbar';
import { ArrowLeft, Loader2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface ListingFormData {
  crop_name: string;
  quantity: number;
  price_per_unit: number;
  unit: string;
  description: string;
  available: boolean;
}

export default function EditListingPage() {
  const router = useRouter();
  const params = useParams();
  const { user, profile } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<ListingFormData>({
    crop_name: '',
    quantity: 0,
    price_per_unit: 0,
    unit: 'kg',
    description: '',
    available: true,
  });
  const [error, setError] = useState<string | null>(null);

  const listingId = params?.id as string;

  // Redirect if not authenticated or not a farmer
  useEffect(() => {
    if (!user) {
      router.push('/auth');
      return;
    }

    if (profile && profile.user_type !== 'farmer') {
      toast.error('Only farmers can edit listings');
      router.push('/marketplace');
      return;
    }

    // Fetch the existing listing data
    const fetchListing = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/marketplace/listings/${listingId}`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch listing');
        }
        
        const data = await response.json();
        
        // Verify ownership
        if (data.farmer_id !== user.id) {
          toast.error('You can only edit your own listings');
          router.push('/marketplace');
          return;
        }
        
        // Populate form
        setFormData({
          crop_name: data.crop_name,
          quantity: data.quantity,
          price_per_unit: data.price_per_unit,
          unit: data.unit,
          description: data.description || '',
          available: data.available,
        });
      } catch (error: any) {
        setError(error.message || 'Failed to fetch listing details');
        toast.error(error.message || 'Failed to fetch listing details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchListing();
  }, [listingId, user, profile, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.crop_name) {
      toast.error('Please select a crop type');
      return;
    }
    
    if (formData.quantity <= 0) {
      toast.error('Quantity must be greater than zero');
      return;
    }
    
    if (formData.price_per_unit <= 0) {
      toast.error('Price must be greater than zero');
      return;
    }
    
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/marketplace/listings/${listingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update listing');
      }

      toast.success('Listing updated successfully');
      router.push(`/marketplace/${listingId}`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update listing. Please try again.');
      console.error('Error updating listing:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'quantity' || name === 'price_per_unit' 
        ? parseFloat(value) || 0 
        : value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  if (isLoading) {
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

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="container py-12">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Error Loading Listing</h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <Button asChild>
              <Link href="/marketplace">Return to Marketplace</Link>
            </Button>
          </div>
        </main>
        <Toaster />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container py-8">
        <Link href={`/marketplace/${listingId}`} className="inline-flex items-center text-green-600 hover:text-green-700 mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Listing
        </Link>
        
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Edit Listing</CardTitle>
              <CardDescription>
                Update your crop listing information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Crop Name</label>
                  <Select
                    value={formData.crop_name}
                    onValueChange={(value) => handleSelectChange('crop_name', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select crop" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Rice">Rice</SelectItem>
                      <SelectItem value="Wheat">Wheat</SelectItem>
                      <SelectItem value="Cotton">Cotton</SelectItem>
                      <SelectItem value="Sugarcane">Sugarcane</SelectItem>
                      <SelectItem value="Corn">Corn</SelectItem>
                      <SelectItem value="Soybeans">Soybeans</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Quantity</label>
                    <Input
                      type="number"
                      name="quantity"
                      value={formData.quantity}
                      onChange={handleChange}
                      min={0}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Unit</label>
                    <Select
                      value={formData.unit}
                      onValueChange={(value) => handleSelectChange('unit', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select unit" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="kg">Kilogram (kg)</SelectItem>
                        <SelectItem value="quintal">Quintal</SelectItem>
                        <SelectItem value="ton">Ton</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Price per {formData.unit}</label>
                  <Input
                    type="number"
                    name="price_per_unit"
                    value={formData.price_per_unit}
                    onChange={handleChange}
                    min={0}
                    step={0.01}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Add details about quality, harvest date, etc."
                    rows={4}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="available"
                    checked={formData.available}
                    onCheckedChange={(checked) => 
                      setFormData(prev => ({ ...prev, available: checked }))
                    }
                  />
                  <Label htmlFor="available">Available for Purchase</Label>
                </div>

                <div className="flex space-x-3">
                  <Button type="submit" className="flex-1" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      "Update Listing"
                    )}
                  </Button>
                  <Link href={`/marketplace/${listingId}`}>
                    <Button type="button" variant="outline" className="flex-1">
                      Cancel
                    </Button>
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
      <Toaster />
    </div>
  );
} 