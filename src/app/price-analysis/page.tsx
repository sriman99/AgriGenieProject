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
import { api } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { agriToasts } from "@/components/ui/toast";

interface PriceData {
  date: string;
  price: number;
  market_location: string;
}

interface PricePrediction {
  crop_name: string;
  current_price: number;
  predicted_price: number;
  recommendation: string;
  confidence: number;
  best_selling_time: string;
}

export default function PriceAnalysisPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [selectedCrop, setSelectedCrop] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [priceHistory, setPriceHistory] = useState<PriceData[]>([]);
  const [prediction, setPrediction] = useState<PricePrediction | null>(null);
  const [commonCrops] = useState([
    "Rice",
    "Wheat",
    "Cotton",
    "Sugarcane",
    "Corn",
    "Soybeans",
  ]);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth');
    }
  }, [user, loading, router]);

  const fetchPriceData = async (cropName: string) => {
    setIsLoading(true);
    try {
      const [marketData, predictionData] = await Promise.all([
        api.getMarketPrices(cropName),
        api.getPricePrediction(cropName),
      ]);

      setPriceHistory(marketData);
      setPrediction(predictionData);

      // Show notification if it's a good time to sell
      if (predictionData.predicted_price > predictionData.current_price * 1.1) {
        agriToasts.priceAlert(cropName, predictionData.predicted_price.toString());
      }
    } catch (error) {
      agriToasts.showToast({
        message: "Failed to fetch price data",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCropSelect = (crop: string) => {
    setSelectedCrop(crop);
    fetchPriceData(crop);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <main className="min-h-screen p-4 bg-gray-50">
      <div className="max-w-7xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Market Price Analysis</CardTitle>
            <CardDescription>
              Track market prices and get AI-powered predictions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Input
                type="text"
                placeholder="Search for a crop..."
                value={selectedCrop}
                onChange={(e) => setSelectedCrop(e.target.value)}
              />
              <div className="flex flex-wrap gap-2">
                {commonCrops.map((crop) => (
                  <Button
                    key={crop}
                    variant={selectedCrop === crop ? "default" : "outline"}
                    onClick={() => handleCropSelect(crop)}
                  >
                    {crop}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {isLoading ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p>Loading price data...</p>
            </CardContent>
          </Card>
        ) : (
          selectedCrop && (
            <>
              {/* Price Prediction Card */}
              {prediction && (
                <Card className="border-green-200">
                  <CardHeader>
                    <CardTitle>AI Price Prediction</CardTitle>
                    <CardDescription>
                      Based on market trends and AI analysis
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Current Price</p>
                        <p className="text-2xl font-bold">
                          ₹{prediction.current_price}/kg
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Predicted Price</p>
                        <p className="text-2xl font-bold text-green-600">
                          ₹{prediction.predicted_price}/kg
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Best Selling Time</p>
                        <p className="text-2xl font-bold">
                          {prediction.best_selling_time}
                        </p>
                      </div>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <p className="font-medium text-green-800">
                        Recommendation:
                      </p>
                      <p className="text-green-700">{prediction.recommendation}</p>
                      <p className="text-sm text-green-600 mt-2">
                        Confidence: {prediction.confidence}%
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Price History Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Price History</CardTitle>
                  <CardDescription>
                    Recent market prices for {selectedCrop}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {priceHistory.map((data, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center border-b pb-2"
                      >
                        <div>
                          <p className="font-medium">{data.market_location}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(data.date).toLocaleDateString()}
                          </p>
                        </div>
                        <p className="text-lg font-semibold">
                          ₹{data.price}/kg
                        </p>
                      </div>
                    ))}
                    {priceHistory.length === 0 && (
                      <p className="text-center text-gray-500">
                        No recent price data available
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </>
          )
        )}

        {/* Quick Actions */}
        <div className="flex gap-4">
          <Button
            variant="outline"
            onClick={() => router.push('/marketplace')}
          >
            Go to Marketplace
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push('/chatbot')}
          >
            Discuss with AI Assistant
          </Button>
        </div>
      </div>
    </main>
  );