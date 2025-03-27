import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
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

export function CreateListing() {
  const [formData, setFormData] = useState<ListingFormData>({
    crop_name: '',
    quantity: 0,
    price_per_unit: 0,
    unit: 'kg',
    description: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/marketplace/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to create listing');

      toast({
        title: "Success",
        description: "Your crop has been listed successfully.",
      });

      // Reset form
      setFormData({
        crop_name: '',
        quantity: 0,
        price_per_unit: 0,
        unit: 'kg',
        description: '',
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create listing. Please try again.",
        variant: "destructive",
      });
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
      [name]: value,
    }));
  };

  return (
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
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, crop_name: value }))
              }
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
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, unit: value }))
                }
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

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating Listing...
              </>
            ) : (
              "Create Listing"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
} 