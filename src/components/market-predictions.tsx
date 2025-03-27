'use client';
import { useState, useEffect } from 'react';
import { api } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Loader2, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface PriceData {
  date: string;
  price: number;
  predicted: boolean;
}

interface MarketPrediction {
  currentPrice: number;
  predictedPrice: number;
  trend: 'up' | 'down' | 'stable';
  confidence: number;
  historicalData: PriceData[];
}

export function MarketPredictions({ cropName, state }: { cropName: string; state: string }) {
  const [prediction, setPrediction] = useState<MarketPrediction | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPrediction = async () => {
    try {
      setLoading(true);
      // Get historical data
      const cropData = await api.getCropData(state, cropName);
      // Get price prediction
      const pricePrediction = await api.getPredictedPrice(state, cropName);
      // Get price trend plot
      const trendPlot = await api.getPriceTrendPlot(state, cropName);

      const historicalData = cropData.data.map((item: any) => ({
        date: item.Date,
        price: item.Modal_Price,
        predicted: false,
      }));

      const predictedData = {
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        price: pricePrediction.predicted_price,
        predicted: true,
      };

      const trend = predictedData.price > historicalData[historicalData.length - 1].price ? 'up' : 'down';

      setPrediction({
        currentPrice: historicalData[historicalData.length - 1].price,
        predictedPrice: predictedData.price,
        trend,
        confidence: 85, // This could come from the API
        historicalData: [...historicalData, predictedData],
      });
    } catch (err) {
      setError('Failed to fetch market predictions');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrediction();
  }, [cropName, state]);

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <Skeleton className="h-6 w-3/4" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error || !prediction) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center space-y-4">
            <p className="text-red-500">{error || 'No prediction data available'}</p>
            <Button onClick={fetchPrediction} variant="outline">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Market Price Prediction</span>
          <div className="flex items-center space-x-2">
            <DollarSign className="h-5 w-5 text-green-500" />
            <span className="text-lg font-bold">
              {prediction.currentPrice.toFixed(2)}
            </span>
            {prediction.trend === 'up' ? (
              <TrendingUp className="h-5 w-5 text-green-500" />
            ) : (
              <TrendingDown className="h-5 w-5 text-red-500" />
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={prediction.historicalData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="price"
                stroke="#8884d8"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="rounded-lg bg-green-50 p-4">
            <h4 className="font-semibold text-green-700">Predicted Price</h4>
            <p className="text-2xl font-bold text-green-600">
              ₹{prediction.predictedPrice.toFixed(2)}
            </p>
          </div>
          <div className="rounded-lg bg-blue-50 p-4">
            <h4 className="font-semibold text-blue-700">Confidence</h4>
            <p className="text-2xl font-bold text-blue-600">
              {prediction.confidence}%
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 