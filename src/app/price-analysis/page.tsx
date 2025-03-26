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
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Search, TrendingUp, TrendingDown, Minus, RefreshCw, AlertTriangle } from "lucide-react";

interface PriceData {
  date: string;
  price: number;
  volume: number;
}

interface PricePrediction {
  crop_name: string;
  current_price: number;
  predicted_price: number;
  confidence: number;
  recommendation: string;
}

export default function PriceAnalysisPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [selectedCrop, setSelectedCrop] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [priceHistory, setPriceHistory] = useState<PriceData[]>([]);
  const [prediction, setPrediction] = useState<PricePrediction | null>(null);
  const [retryCount, setRetryCount] = useState(0);

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
    setError(null);
    try {
      const [marketData, predictionData] = await Promise.all([
        api.getMarketPrices(cropName),
        api.getPricePrediction(cropName),
      ]);

      setPriceHistory(marketData);
      setPrediction(predictionData);

      if (predictionData.predicted_price > predictionData.current_price * 1.1) {
        agriToasts.showToast({
          message: `Good time to sell ${cropName}! Price expected to rise by ${Math.round((predictionData.predicted_price / predictionData.current_price - 1) * 100)}%`,
          type: "info"
        });
      }
    } catch (error) {
      console.error('Price data fetch error:', error);
      setError('Failed to fetch price data. Please try again.');
      agriToasts.error("Failed to fetch price data");
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 space-y-4">
        <Skeleton className="h-12 w-3/4" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  const getPriceChangeIndicator = () => {
    if (!prediction) return null;
    const change = (prediction.predicted_price / prediction.current_price - 1) * 100;
    if (change > 5) {
      return <TrendingUp className="h-6 w-6 text-green-600" />;
    } else if (change < -5) {
      return <TrendingDown className="h-6 w-6 text-red-600" />;
    }
    return <Minus className="h-6 w-6 text-gray-600" />;
  };

  return (
    <main className="min-h-screen p-4 md:p-8 bg-gradient-to-b from-purple-50 to-white">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-purple-800">
              Price Analysis
            </h1>
            <p className="text-gray-600">
              Track market prices and get AI-powered predictions
            </p>
          </div>
          
          {selectedCrop && !isLoading && (
            <Button
              variant="outline"
              onClick={() => {
                setRetryCount(c => c + 1);
                fetchPriceData(selectedCrop);
              }}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          )}
        </div>

        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle>Select Crop</CardTitle>
            <CardDescription>
              Choose a crop to view its price history and predictions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
              {commonCrops.map((crop) => (
                <Button
                  key={crop}
                  variant={selectedCrop === crop ? "default" : "outline"}
                  onClick={() => {
                    setSelectedCrop(crop);
                    fetchPriceData(crop);
                  }}
                  disabled={isLoading}
                  className="w-full"
                >
                  {crop}
                </Button>
              ))}
            </div>
            
            <div className="mt-4 flex gap-2">
              <Input
                type="text"
                placeholder="Search other crops..."
                value={selectedCrop}
                onChange={(e) => setSelectedCrop(e.target.value)}
                className="max-w-xs"
              />
              <Button
                onClick={() => selectedCrop && fetchPriceData(selectedCrop)}
                disabled={!selectedCrop || isLoading}
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription className="flex items-center justify-between">
              {error}
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setRetryCount(c => c + 1);
                  selectedCrop && fetchPriceData(selectedCrop);
                }}
              >
                Try Again
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
          </div>
        ) : (
          prediction && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-none shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Current Price
                    {getPriceChangeIndicator()}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-3xl font-bold">
                    ₹{prediction.current_price.toFixed(2)}
                    <span className="text-sm text-gray-500 ml-1">per kg</span>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="font-semibold">Prediction</h3>
                    <p className="text-gray-700">
                      Expected to {prediction.predicted_price > prediction.current_price ? 'rise to' : 'fall to'} ₹{prediction.predicted_price.toFixed(2)} 
                      <span className="text-sm text-gray-500 ml-1">
                        ({Math.abs(Math.round((prediction.predicted_price / prediction.current_price - 1) * 100))}% {prediction.predicted_price > prediction.current_price ? 'increase' : 'decrease'})
                      </span>
                    </p>
                    <p className="text-sm text-gray-600">
                      Confidence: {Math.round(prediction.confidence * 100)}%
                    </p>
                  </div>

                  <Alert className={
                    prediction.predicted_price > prediction.current_price * 1.1
                      ? 'bg-green-50 border-green-200'
                      : prediction.predicted_price < prediction.current_price * 0.9
                      ? 'bg-red-50 border-red-200'
                      : 'bg-gray-50 border-gray-200'
                  }>
                    <AlertDescription className="text-gray-700">
                      {prediction.recommendation}
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm">
                <CardHeader>
                  <CardTitle>Price History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {priceHistory.map((data, index) => (
                      <div
                        key={data.date}
                        className="flex items-center justify-between p-2 rounded-lg bg-gray-50"
                      >
                        <div>
                          <p className="font-medium">{new Date(data.date).toLocaleDateString()}</p>
                          <p className="text-sm text-gray-600">Volume: {data.volume}kg</p>
                        </div>
                        <div className="text-lg font-semibold">
                          ₹{data.price.toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )
        )}
      </div>
    </main>
  );
}