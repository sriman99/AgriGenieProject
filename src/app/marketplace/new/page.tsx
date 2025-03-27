'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { Navbar } from '@/components/dashboard/navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Toaster } from '@/components/ui/toaster';
import { toast } from 'sonner';
import { Loader2, ArrowLeft } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ListingFormData {
  crop_name: string;
  quantity: number;
  price_per_unit: number;
  unit: string;
  description: string;
}

export default function CreateListingPage() {
  const router = useRouter();
  const { user, profile } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<ListingFormData>({
    crop_name: '',
    quantity: 0,
    price_per_unit: 0,
    unit: 'kg',
    description: '',
  });

  // Redirect if not authenticated or not a farmer
  useEffect(() => {
    if (!user) {
      router.push('/auth');
    } else if (profile && profile.user_type !== 'farmer') {
      toast.error('Only farmers can create listings');
      router.push('/marketplace');
    }
  }, [user, profile, router]);

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
      const response = await fetch('/api/marketplace/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create listing');
      }

      toast.success('Your crop has been listed successfully');
      router.push('/marketplace');
    } catch (error: any) {
      toast.error(error.message || 'Failed to create listing. Please try again.');
      console.error('Error creating listing:', error);
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

  if (!user || !profile) {
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container py-8">
        <Link href="/marketplace" className="inline-flex items-center text-green-600 hover:text-green-700 mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Marketplace
        </Link>
        
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Create New Listing</CardTitle>
              <CardDescription>
                List your crops for sale in the marketplace
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

                <div className="flex space-x-3">
                  <Button type="submit" className="flex-1" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating Listing...
                      </>
                    ) : (
                      "Create Listing"
                    )}
                  </Button>
                  <Link href="/marketplace">
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