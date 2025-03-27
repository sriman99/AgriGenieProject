'use client';

import { useState } from 'react';
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
import { post } from '@/lib/api-client';

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
});

type FormValues = z.infer<typeof formSchema>;

export function CreateListing() {
  const { user, profile } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);

  // Form definition
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      crop_name: '',
      quantity: 0,
      price_per_unit: 0,
      unit: 'kg',
      description: '',
    },
  });

  // Check if user is a farmer
  if (profile?.user_type !== 'farmer') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-destructive">
            <AlertCircle className="h-5 w-5 mr-2" />
            Unauthorized
          </CardTitle>
          <CardDescription>You do not have permission to create listings.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Only farmers can create crop listings on the marketplace.</p>
        </CardContent>
        <CardFooter>
          <Button asChild>
            <Link href="/marketplace">Browse Marketplace</Link>
          </Button>
        </CardFooter>
      </Card>
    );
  }

  // Form submission
  const onSubmit = async (values: FormValues) => {
    try {
      setSubmitting(true);
      console.log('Creating listing with values:', values);
      
      // Use our API client instead of fetch directly
      await post('/api/marketplace/listings', values);

      console.log('Listing created successfully');
      toast({
        title: 'Listing Created',
        description: 'Your crop listing has been successfully created.',
      });

      // Redirect to marketplace after success
      router.push('/marketplace/my-listings');
    } catch (error: any) {
      console.error('Error creating listing:', error);
      toast({
        title: 'Creation Failed',
        description: error.message || 'Failed to create listing. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Listing</CardTitle>
        <CardDescription>List your crops for sale in the marketplace.</CardDescription>
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
                <Link href="/marketplace">Cancel</Link>
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {submitting ? 'Creating...' : 'Create Listing'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
} 