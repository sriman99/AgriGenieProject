'use client';

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth-context";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { agriToasts } from "@/components/ui/toast";
import { api } from "@/lib/utils";

export default function NewListingPage() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const supabase = createClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [priceRecommendation, setPriceRecommendation] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    crop_name: "",
    quantity: "",
    price_per_unit: "",
    unit: "kg",
    description: "",
  });

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/auth');
      } else if (profile?.user_type !== 'farmer') {
        router.push('/dashboard');
      }
    }
  }, [user, loading, profile, router]);

  // Get price recommendation when crop name is entered
  useEffect(() => {
    const getPriceRecommendation = async () => {
      if (formData.crop_name.length > 2) {
        try {
          const response = await api.getPricePrediction(formData.crop_name);
          setPriceRecommendation(`Recommended price: ₹${response.recommended_price}/kg`);
        } catch (error) {
          console.error('Failed to get price recommendation');
        }
      }
    };

    getPriceRecommendation();
  }, [formData.crop_name]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('crop_listings').insert({
        farmer_id: user.id,
        crop_name: formData.crop_name,
        quantity: Number(formData.quantity),
        price_per_unit: Number(formData.price_per_unit),
        unit: formData.unit,
        description: formData.description || null,
        available: true,
      });

      if (error) throw error;

      agriToasts.showToast({
        message: "Successfully listed your crop!",
        type: "success",
      });
      router.push('/marketplace');
    } catch (error) {
      agriToasts.showToast({
        message: "Failed to list crop",
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <main className="min-h-screen p-4 bg-gray-50">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>List New Crop</CardTitle>
            <CardDescription>
              Add your crop to the marketplace
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Crop Name</label>
                <Input
                  placeholder="e.g., Rice, Wheat, Cotton"
                  value={formData.crop_name}
                  onChange={(e) =>
                    setFormData({ ...formData, crop_name: e.target.value })
                  }
                  required
                />
                {priceRecommendation && (
                  <p className="text-sm text-green-600">{priceRecommendation}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Quantity</label>
                  <Input
                    type="number"
                    min="1"
                    placeholder="Amount"
                    value={formData.quantity}
                    onChange={(e) =>
                      setFormData({ ...formData, quantity: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Unit</label>
                  <select
                    className="w-full rounded-md border border-input bg-background px-3 py-2"
                    value={formData.unit}
                    onChange={(e) =>
                      setFormData({ ...formData, unit: e.target.value })
                    }
                  >
                    <option value="kg">Kilogram (kg)</option>
                    <option value="ton">Ton</option>
                    <option value="quintal">Quintal</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Price per {formData.unit}</label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Enter price"
                  value={formData.price_per_unit}
                  onChange={(e) =>
                    setFormData({ ...formData, price_per_unit: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Description (Optional)</label>
                <textarea
                  className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2"
                  placeholder="Add details about quality, harvest date, etc."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>

              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Listing..." : "List Crop"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}