'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, TrendingUp, TrendingDown, Minus, Search } from "lucide-react";
import { toast } from "sonner";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface CropData {
  date: string;
  minPrice: number;
  maxPrice: number;
  modalPrice: number;
  district?: string;
  market?: string;
}

interface PriceData {
  id: string;
  crop_name: string;
  price_per_kg: number;
  price_trend: 'rising' | 'falling' | 'stable';
  percent_change: number;
  market_name: string;
  district: string;
  market: string;
  state: string;
  last_updated: string;
}

export function MarketPrices() {
  const [state, setState] = useState("Telangana");
  const [commodity, setCommodity] = useState("Groundnut");
  const [cropData, setCropData] = useState<CropData[]>([]);
  const [predictedPrice, setPredictedPrice] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [priceTrend, setPriceTrend] = useState<'up' | 'down' | 'stable'>('stable');
  const [priceChange, setPriceChange] = useState(0);
  const [showSearch, setShowSearch] = useState(false);

  const fetchData = async () => {
    if (!state || !commodity) return;
    
    setLoading(true);
    setError("");
    
    try {
      // First try with real data
      let response = await fetch(
        `/api/fetch-crop-data/?state=${encodeURIComponent(state)}&commodity=${encodeURIComponent(commodity)}`
      );
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to fetch crop data');
      }
      
      let data = await response.json();
      
      // If no data is available, try with mock data
      if (!data.data || data.data.length === 0) {
        console.log('No data available, trying with mock data');
        response = await fetch(
          `/api/fetch-crop-data/?state=${encodeURIComponent(state)}&commodity=${encodeURIComponent(commodity)}&mock=true`
        );
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || 'Failed to fetch mock data');
        }
        
        data = await response.json();
        
        if (!data.data || data.data.length === 0) {
          throw new Error(`No data available for ${commodity} in ${state}. Please try a different state or commodity.`);
        }
        
        // Show a toast notification that we're using mock data
        toast.info(data.message || 'Using mock data for demonstration purposes');
      }
      
      // Ensure all price values are numbers
      const processedData = data.data.map((item: any) => ({
        ...item,
        minPrice: typeof item.minPrice === 'number' ? item.minPrice : parseFloat(item.minPrice) || 0,
        maxPrice: typeof item.maxPrice === 'number' ? item.maxPrice : parseFloat(item.maxPrice) || 0,
        modalPrice: typeof item.modalPrice === 'number' ? item.modalPrice : parseFloat(item.modalPrice) || 0
      }));
      
      // Sort the data by date to ensure chronological order
      processedData.sort((a: CropData, b: CropData) => {
        const [dayA, monthA, yearA] = a.date.split('/');
        const [dayB, monthB, yearB] = b.date.split('/');
        const dateA = new Date(parseInt(yearA), parseInt(monthA) - 1, parseInt(dayA));
        const dateB = new Date(parseInt(yearB), parseInt(monthB) - 1, parseInt(dayB));
        return dateA.getTime() - dateB.getTime();
      });
      
      setCropData(processedData);
      setPredictedPrice(data.predictedPrice);

      // Calculate price trend
      if (processedData.length >= 2) {
        const latestPrice = processedData[processedData.length - 1].modalPrice;
        const previousPrice = processedData[processedData.length - 2].modalPrice;
        const change = ((latestPrice - previousPrice) / previousPrice) * 100;
        
        setPriceChange(change);
        if (change > 1) setPriceTrend('up');
        else if (change < -1) setPriceTrend('down');
        else setPriceTrend('stable');
      }

      // Transform the data to match our PriceData interface
      const transformedData: PriceData[] = processedData.slice(-7).map((item: any, index: number) => {
        // Create a date object for the current item
        const [day, month, year] = item.date.split('/');
        const currentDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        
        // Format the date as DD/MM
        const formattedDate = `${day}/${month}`;
        
        // Ensure all price values are numbers
        const modalPrice = typeof item.modalPrice === 'number' ? item.modalPrice : parseFloat(item.modalPrice) || 0;
        const minPrice = typeof item.minPrice === 'number' ? item.minPrice : parseFloat(item.minPrice) || 0;
        const maxPrice = typeof item.maxPrice === 'number' ? item.maxPrice : parseFloat(item.maxPrice) || 0;
        
        // Get market name from the API response
        const marketName = item.market || 'Local Market';
        const district = item.district || '';
        
        return {
          id: `price-${index}`,
          crop_name: commodity,
          price_per_kg: modalPrice,
          price_trend: index > 0 ? 
            (modalPrice > parseFloat(processedData[index - 1].modalPrice) ? 'rising' : 
             modalPrice < parseFloat(processedData[index - 1].modalPrice) ? 'falling' : 'stable') : 'stable',
          percent_change: index > 0 ? 
            ((modalPrice - parseFloat(processedData[index - 1].modalPrice)) / parseFloat(processedData[index - 1].modalPrice)) * 100 : 0,
          market_name: marketName,
          district: district,
          market: marketName,
          state: state,
          last_updated: formattedDate
        };
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch data. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
      // Set empty data to avoid UI errors
      setCropData([]);
      setPredictedPrice(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchData();
    setShowSearch(false);
  };

  const getTrendIcon = () => {
    switch (priceTrend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatDate = (dateStr: string) => {
    const [day, month, year] = dateStr.split('/');
    return `${day}/${month}`;
  };

  return (
    <Card className="col-span-3">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="flex items-center gap-2">
          Market Prices
          {cropData.length > 0 && (
            <span className="flex items-center gap-1 text-sm font-normal">
              {getTrendIcon()}
              <span className={priceTrend === 'up' ? 'text-green-500' : priceTrend === 'down' ? 'text-red-500' : 'text-gray-500'}>
                {priceChange > 0 ? '+' : ''}{priceChange.toFixed(1)}%
              </span>
            </span>
          )}
        </CardTitle>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowSearch(!showSearch)}
          className="h-8 w-8"
        >
          <Search className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        {showSearch && (
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="space-y-2">
              <label htmlFor="state" className="text-sm font-medium">State</label>
              <Input
                id="state"
                value={state}
                onChange={(e) => setState(e.target.value)}
                placeholder="Enter state name"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="commodity" className="text-sm font-medium">Commodity</label>
              <Input
                id="commodity"
                value={commodity}
                onChange={(e) => setCommodity(e.target.value)}
                placeholder="Enter commodity name"
              />
            </div>
            <Button type="submit" className="md:col-span-2">
              Fetch Prices
            </Button>
          </form>
        )}

        {loading && (
          <div className="flex justify-center items-center h-32">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        )}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {cropData.length > 0 && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-lg border">
                <h3 className="text-sm font-medium text-gray-500">Current Price</h3>
                <p className="text-2xl font-bold mt-1">
                  ₹{cropData.length > 0 ? cropData[cropData.length - 1].modalPrice.toLocaleString('en-IN') : 'N/A'}
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg border">
                <h3 className="text-sm font-medium text-gray-500">Price Range</h3>
                <p className="text-2xl font-bold mt-1">
                  ₹{cropData.length > 0 ? cropData[cropData.length - 1].minPrice.toLocaleString('en-IN') : 'N/A'} - ₹{cropData.length > 0 ? cropData[cropData.length - 1].maxPrice.toLocaleString('en-IN') : 'N/A'}
                </p>
              </div>
              {predictedPrice && (
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h3 className="text-sm font-medium text-blue-900">Predicted Price</h3>
                  <p className="text-2xl font-bold mt-1 text-blue-800">
                    ₹{predictedPrice.toLocaleString('en-IN')}
                  </p>
                </div>
              )}
            </div>

            {/* Price History Table */}
            {cropData.length > 0 && (
              <div className="mt-4 bg-white p-4 rounded-lg border">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Price History (Last 7 Days)</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Market</th>
                        <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Min Price</th>
                        <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Max Price</th>
                        <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Modal Price</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {cropData.slice(-7).map((item, index, array) => {
                        return (
                          <tr key={index} className={index === array.length - 1 ? 'bg-blue-50' : ''}>
                            <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">{item.date}</td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                              {item.market || item.district || state}
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">₹{item.minPrice.toLocaleString('en-IN')}</td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">₹{item.maxPrice.toLocaleString('en-IN')}</td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">₹{item.modalPrice.toLocaleString('en-IN')}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={cropData.slice(-7)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={formatDate}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }} 
                    tickFormatter={(value) => `₹${value.toLocaleString('en-IN')}`}
                  />
                  <Tooltip 
                    formatter={(value: number) => [`₹${value.toLocaleString('en-IN')}`, '']}
                    labelFormatter={formatDate}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="modalPrice" 
                    stroke="#8884d8" 
                    name="Modal Price"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <span className="text-gray-500">Last Updated:</span>
                <p className="font-medium">{cropData[cropData.length - 1].date}</p>
              </div>
              <div className="text-center">
                <span className="text-gray-500">Market:</span>
                <p className="font-medium">{state}</p>
              </div>
              <div className="text-center">
                <span className="text-gray-500">Commodity:</span>
                <p className="font-medium">{commodity}</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 