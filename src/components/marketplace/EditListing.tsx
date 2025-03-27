'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';

interface EditListingProps {
  listingId: string;
}

const formSchema = z.object({
  crop_name: z.string().min(2, {
    message: 'Crop name must be at least 2 characters.',
  }),
  quantity: z.coerce.number().positive({
    message: 'Quantity must be a positive number.',
  }),
  price_per_unit: z.coerce.number().positive({
    message: 'Price must be a positive number.',
  }),
  unit: z.string().min(1, {
    message: 'Unit is required.',
  }),
  description: z.string().min(10, {
    message: 'Description must be at least 10 characters.',
  }).max(500, {
    message: 'Description must not exceed 500 characters.',
  }),
  available: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

type CropListing = {
  id: string;
  crop_name: string;
  quantity: number;
  price_per_unit: number;
  unit: string;
  description: string;
  available: boolean;
  farmer_id: string;
};

export function EditListing({ listingId }: EditListingProps) {
  const { user, profile } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [listing, setListing] = useState<CropListing | null>(null);

  // Form definition
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      crop_name: '',
      quantity: 0,
      price_per_unit: 0,
      unit: '',
      description: '',
      available: true,
    },
  });

  // Fetch listing details on component mount
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
        
        // Initialize form with the listing data
        form.reset({
          crop_name: data.crop_name,
          quantity: data.quantity,
          price_per_unit: data.price_per_unit,
          unit: data.unit,
          description: data.description,
          available: data.available,
        });
      } catch (error) {
        console.error('Error fetching listing:', error);
        setError('Failed to load listing. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (listingId) {
      fetchListing();
    }
  }, [listingId, form]);

  // Check if the user is authorized to edit this listing
  const isAuthorized = user && listing && (user.id === listing.farmer_id);

  // Form submission
  const onSubmit = async (values: FormValues) => {
    if (!isAuthorized) {
      toast({
        title: 'Unauthorized',
        description: 'You do not have permission to edit this listing.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSubmitting(true);
      
      const response = await fetch(`/api/marketplace/listings/${listingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update listing');
      }

      toast({
        title: 'Listing Updated',
        description: 'Your crop listing has been successfully updated.',
      });

      // Redirect to the updated listing page
      router.push(`/marketplace/listing/${listingId}`);
    } catch (error: any) {
      console.error('Error updating listing:', error);
      toast({
        title: 'Update Failed',
        description: error.message || 'Failed to update listing. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading listing details...</span>
      </div>
    );
  }

  // Show error state
  if (error || !listing) {
    return (
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
            <Link href="/marketplace">Back to Marketplace</Link>
          </Button>
        </CardFooter>
      </Card>
    );
  }

  // Show unauthorized state
  if (!isAuthorized) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-destructive">
            <AlertCircle className="h-5 w-5 mr-2" />
            Unauthorized
          </CardTitle>
          <CardDescription>You do not have permission to edit this listing.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Only the farmer who created this listing can edit it.</p>
        </CardContent>
        <CardFooter>
          <Button asChild>
            <Link href={`/marketplace/listing/${listingId}`}>View Listing Details</Link>
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Crop Listing</CardTitle>
        <CardDescription>Update your crop listing details on the marketplace.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="crop_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Crop Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Rice, Wheat, Cotton" {...field} />
                    </FormControl>
                    <FormDescription>
                      Enter the name of the crop you are selling.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unit of Measurement</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select unit" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="kg">Kilogram (kg)</SelectItem>
                        <SelectItem value="ton">Ton</SelectItem>
                        <SelectItem value="quintal">Quintal</SelectItem>
                        <SelectItem value="piece">Piece</SelectItem>
                        <SelectItem value="dozen">Dozen</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      How the crop is measured and sold.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity Available</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" step="0.01" {...field} />
                    </FormControl>
                    <FormDescription>
                      How much of this crop do you have available to sell.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="price_per_unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price per Unit (₹)</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" step="0.01" {...field} />
                    </FormControl>
                    <FormDescription>
                      The price for one unit of your crop.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="available"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Available for Purchase</FormLabel>
                      <FormDescription>
                        Uncheck this if you want to temporarily hide this listing from buyers.
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe your crop - include details like quality, harvest date, etc."
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Provide details about your crop that buyers should know.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2">
              <Button variant="outline" asChild>
                <Link href={`/marketplace/listing/${listingId}`}>Cancel</Link>
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {submitting ? 'Updating...' : 'Update Listing'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
} 