'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  ArrowDownIcon, 
  ArrowUpIcon, 
  BarChart3, 
  CoinsIcon, 
  LineChart, 
  MinusIcon, 
  Search,
  TableIcon,
  TrendingUpIcon
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/components/ui/use-toast';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

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

interface TrendData {
  crop_name: string;
  current_price: number;
  historical_prices: Array<{
    date: string;
    price: number;
  }>;
  forecast_prices: Array<{
    date: string;
    price: number;
  }>;
  analysis: string;
  factors: string[];
}

export function MarketPricesWidget() {
  const { toast } = useToast();
  const [state, setState] = useState('Telangana');
  const [commodity, setCommodity] = useState('Wheat');
  const [cropData, setCropData] = useState<PriceData[]>([]);
  const [predictedPrice, setPredictedPrice] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [priceTrend, setPriceTrend] = useState<'up' | 'down' | 'stable'>('stable');
  const [priceChange, setPriceChange] = useState<number>(0);
  const [activeTab, setActiveTab] = useState('trend');

  // Fetch data on initial render
  useEffect(() => {
    fetchInitialData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!state || !commodity) {
      setError('Please enter both state and commodity');
      return;
    }
    await fetchInitialData();
  };

  const fetchInitialData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Fetching data for:', { state, commodity });
      
      // Try to fetch real data first
      const response = await fetch(`/api/fetch-crop-data?state=${encodeURIComponent(state)}&commodity=${encodeURIComponent(commodity)}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('API response:', data);
      
      if (!data.data || data.data.length === 0) {
        // If no data is available, try to fetch mock data
        console.log('No data available, trying mock data');
        const mockResponse = await fetch(`/api/fetch-crop-data?state=${encodeURIComponent(state)}&commodity=${encodeURIComponent(commodity)}&mock=true`);
        
        if (!mockResponse.ok) {
          throw new Error(`Failed to fetch mock data: ${mockResponse.status}`);
        }
        
        const mockData = await mockResponse.json();
        console.log('Mock data response:', mockData);
        
        if (!mockData.data || mockData.data.length === 0) {
          throw new Error('No data available for the selected parameters');
        }
        
        // Process mock data
        const processedData = mockData.data.map((item: any) => ({
          ...item,
          price_per_kg: parseFloat(item.modalPrice) || 0,
          last_updated: item.date,
          market_name: item.market || item.district || 'Unknown Market',
          market: item.market || item.district || 'Unknown Market',
          district: item.district || 'Unknown District'
        }));
        
        setCropData(processedData);
        setPredictedPrice(mockData.predictedPrice);
        
        // Calculate price trend
        if (processedData.length >= 2) {
          const latestPrice = processedData[processedData.length - 1].price_per_kg;
          const previousPrice = processedData[processedData.length - 2].price_per_kg;
          const change = ((latestPrice - previousPrice) / previousPrice) * 100;
          
          setPriceChange(change);
          if (change > 1) {
            setPriceTrend('up');
          } else if (change < -1) {
            setPriceTrend('down');
          } else {
            setPriceTrend('stable');
          }
        }
      } else {
        // Process real data
        const processedData = data.data.map((item: any) => ({
          ...item,
          price_per_kg: parseFloat(item.modalPrice) || 0,
          last_updated: item.date,
          market_name: item.market || item.district || 'Unknown Market',
          market: item.market || item.district || 'Unknown Market',
          district: item.district || 'Unknown District'
        }));
        
        setCropData(processedData);
        setPredictedPrice(data.predictedPrice);
        
        // Calculate price trend
        if (processedData.length >= 2) {
          const latestPrice = processedData[processedData.length - 1].price_per_kg;
          const previousPrice = processedData[processedData.length - 2].price_per_kg;
          const change = ((latestPrice - previousPrice) / previousPrice) * 100;
          
          setPriceChange(change);
          if (change > 1) {
            setPriceTrend('up');
          } else if (change < -1) {
            setPriceTrend('down');
          } else {
            setPriceTrend('stable');
          }
        }
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const [day, month, year] = dateStr.split('/');
    return `${day}/${month}`;
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>
            <Skeleton className="h-8 w-48" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CoinsIcon className="h-5 w-5 text-amber-500" />
          Market Prices
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 space-y-2">
              <label htmlFor="state" className="text-sm font-medium">State</label>
              <Input
                id="state"
                value={state}
                onChange={(e) => setState(e.target.value)}
                placeholder="Enter state name"
              />
            </div>
            <div className="flex-1 space-y-2">
              <label htmlFor="commodity" className="text-sm font-medium">Commodity</label>
              <Input
                id="commodity"
                value={commodity}
                onChange={(e) => setCommodity(e.target.value)}
                placeholder="Enter commodity name"
              />
            </div>
            <Button type="submit" className="h-10">
              Fetch Prices
            </Button>
          </form>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg border">
              <h3 className="text-sm font-medium text-gray-500">Current Price</h3>
              <p className="text-2xl font-bold mt-1">
                {cropData.length > 0 ? (
                  `₹${cropData[cropData.length - 1].price_per_kg.toLocaleString('en-IN')}`
                ) : (
                  <span className="text-gray-400">No data</span>
                )}
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg border">
              <h3 className="text-sm font-medium text-gray-500">Price Trend</h3>
              <div className="flex items-center gap-2 mt-1">
                {cropData.length > 0 ? (
                  <>
                    {priceTrend === 'up' ? (
                      <ArrowUpIcon className="h-5 w-5 text-green-500" />
                    ) : priceTrend === 'down' ? (
                      <ArrowDownIcon className="h-5 w-5 text-red-500" />
                    ) : (
                      <MinusIcon className="h-5 w-5 text-gray-500" />
                    )}
                    <span className={`text-2xl font-bold ${
                      priceTrend === 'up' ? 'text-green-500' :
                      priceTrend === 'down' ? 'text-red-500' :
                      'text-gray-500'
                    }`}>
                      {priceChange > 0 ? '+' : ''}
                      {priceChange.toFixed(1)}%
                    </span>
                  </>
                ) : (
                  <span className="text-gray-400">No data</span>
                )}
              </div>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h3 className="text-sm font-medium text-blue-900">Predicted Price</h3>
              <p className="text-2xl font-bold mt-1 text-blue-800">
                {predictedPrice ? (
                  `₹${predictedPrice.toLocaleString('en-IN')}`
                ) : (
                  <span className="text-gray-400">No data</span>
                )}
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          {cropData.length > 0 && (
            <Tabs defaultValue="trend" value={activeTab} onValueChange={handleTabChange}>
              <TabsList className="w-full">
                <TabsTrigger value="trend" className="flex-1">Price Trend</TabsTrigger>
                <TabsTrigger value="table" className="flex-1">Price Table</TabsTrigger>
                <TabsTrigger value="insights" className="flex-1">Market Insights</TabsTrigger>
              </TabsList>

              {/* Price Trend Chart */}
              <TabsContent value="trend" className="mt-4">
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsLineChart data={cropData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="last_updated" 
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
                        dataKey="price_per_kg" 
                        stroke="#8884d8" 
                        name="Price"
                        strokeWidth={2}
                      />
                    </RechartsLineChart>
                  </ResponsiveContainer>
                </div>
              </TabsContent>
              
              {/* Price History Table */}
              <TabsContent value="table" className="mt-4">
                <div className="bg-white p-4 rounded-lg border">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Price History (Last 7 Days)</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                          <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Market</th>
                          <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                          <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Change</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {cropData.slice(-7).map((item, index, array) => {
                          // Calculate trend compared to previous day
                          let trendColor = 'text-gray-500';
                          let percentChange = 0;
                          
                          if (index > 0) {
                            const prevPrice = array[index - 1].price_per_kg;
                            const currentPrice = item.price_per_kg;
                            percentChange = ((currentPrice - prevPrice) / prevPrice) * 100;
                            
                            if (percentChange > 1) {
                              trendColor = 'text-green-500';
                            } else if (percentChange < -1) {
                              trendColor = 'text-red-500';
                            }
                          }
                          
                          return (
                            <tr key={index} className={index === array.length - 1 ? 'bg-blue-50' : ''}>
                              <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">{item.last_updated}</td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                                {item.market || item.district || item.market_name}
                              </td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">₹{item.price_per_kg.toLocaleString('en-IN')}</td>
                              <td className={`px-4 py-2 whitespace-nowrap text-sm ${trendColor}`}>
                                {percentChange > 0 ? '+' : ''}{percentChange.toFixed(1)}%
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </TabsContent>
              
              {/* Market Insights */}
              <TabsContent value="insights" className="mt-4">
                <div className="bg-muted/30 rounded-lg p-4">
                  <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-blue-600" />
                    Market Insights
                  </h4>
                  {cropData.length > 0 ? (
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        <span className="font-medium">Current Price:</span> ₹{cropData[cropData.length - 1].price_per_kg.toLocaleString('en-IN')}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        <span className="font-medium">Price Trend:</span> {priceTrend === 'up' ? 'Rising' : priceTrend === 'down' ? 'Falling' : 'Stable'} ({priceChange > 0 ? '+' : ''}{priceChange.toFixed(1)}%)
                      </p>
                      {predictedPrice && (
                        <p className="text-sm text-muted-foreground">
                          <span className="font-medium">Predicted Price:</span> ₹{predictedPrice.toLocaleString('en-IN')}
                        </p>
                      )}
                      <p className="text-sm text-muted-foreground">
                        <span className="font-medium">Market:</span> {cropData[cropData.length - 1].market || cropData[cropData.length - 1].district || cropData[cropData.length - 1].market_name || 'Unknown Market'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        <span className="font-medium">Last Updated:</span> {cropData[cropData.length - 1].last_updated}
                      </p>
                      <div className="mt-3 pt-2 border-t border-gray-200">
                        <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-4">
                          {cropData.length >= 3 && (
                            <>
                              <li>
                                {priceTrend === 'up' 
                                  ? `Prices have increased by ${priceChange.toFixed(1)}% over the past week, suggesting strong demand or supply constraints.` 
                                  : priceTrend === 'down' 
                                    ? `Prices have decreased by ${Math.abs(priceChange).toFixed(1)}% over the past week, indicating increased supply or reduced demand.` 
                                    : `Prices have remained relatively stable with only ${Math.abs(priceChange).toFixed(1)}% change over the past week.`}
                              </li>
                              <li>
                                {cropData.length >= 5 
                                  ? `The average price over the last 5 days is ₹${(cropData.slice(-5).reduce((sum, item) => sum + item.price_per_kg, 0) / 5).toLocaleString('en-IN', {maximumFractionDigits: 0})}.` 
                                  : `The average price over the available period is ₹${(cropData.reduce((sum, item) => sum + item.price_per_kg, 0) / cropData.length).toLocaleString('en-IN', {maximumFractionDigits: 0})}.`}
                              </li>
                              {predictedPrice && (
                                <li>
                                  {predictedPrice > cropData[cropData.length - 1].price_per_kg 
                                    ? `Prices are expected to increase by ${((predictedPrice - cropData[cropData.length - 1].price_per_kg) / cropData[cropData.length - 1].price_per_kg * 100).toFixed(1)}% in the coming days.` 
                                    : `Prices are expected to decrease by ${((cropData[cropData.length - 1].price_per_kg - predictedPrice) / cropData[cropData.length - 1].price_per_kg * 100).toFixed(1)}% in the coming days.`}
                                </li>
                              )}
                              <li>
                                {commodity === 'Wheat' 
                                  ? `Wheat prices in ${state} are influenced by seasonal factors, with typically higher prices during the off-season.` 
                                  : commodity === 'Rice' 
                                    ? `Rice prices in ${state} are affected by monsoon patterns and water availability for cultivation.` 
                                    : commodity === 'Groundnut' 
                                      ? `Groundnut prices in ${state} are sensitive to export demand and oil extraction industry requirements.` 
                                      : `Market prices for ${commodity} in ${state} are subject to local supply-demand dynamics.`}
                              </li>
                            </>
                          )}
                        </ul>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No market insights available. Please enter state and commodity to fetch data.</p>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 