'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  SearchIcon 
} from 'lucide-react';
import { 
  getCropPrices, 
  getCropPricesByCrop, 
  getCropPricesByMarket, 
  getCropPricesByState,
  getAvailableCrops,
  getAvailableMarkets,
  getAvailableStates,
  getMarketTrend,
  CropPrice,
  MarketTrend
} from '@/lib/market-api';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/components/ui/use-toast';

export function MarketPricesWidget() {
  const { toast } = useToast();
  const [marketPrices, setMarketPrices] = useState<any[]>([]);
  const [filteredPrices, setFilteredPrices] = useState<any[]>([]);
  const [trendData, setTrendData] = useState<any | null>(null);
  const [trendLoading, setTrendLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [availableCrops, setAvailableCrops] = useState<string[]>([]);
  const [availableMarkets, setAvailableMarkets] = useState<string[]>([]);
  const [availableStates, setAvailableStates] = useState<string[]>([]);
  const [selectedCrop, setSelectedCrop] = useState<string>('all-crops');
  const [selectedMarket, setSelectedMarket] = useState<string>('all-markets');
  const [selectedState, setSelectedState] = useState<string>('all-states');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    filterCropPrices();
  }, [marketPrices, selectedCrop, selectedMarket, selectedState, searchTerm]);

  useEffect(() => {
    if (selectedCrop && activeTab === 'trend') {
      fetchTrendData(selectedCrop);
    }
  }, [selectedCrop, activeTab]);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      // Simulate API call to get market prices
      // In a real app, this would come from your backend
      const prices = [
        {
          id: '1',
          crop_name: 'Rice',
          price_per_kg: 42.50,
          price_trend: 'rising' as const,
          percent_change: 2.3,
          market_name: 'Warangal Agricultural Market',
          state: 'Telangana',
          last_updated: new Date().toISOString()
        },
        {
          id: '2',
          crop_name: 'Wheat',
          price_per_kg: 31.20,
          price_trend: 'stable' as const,
          percent_change: 0.1,
          market_name: 'Hyderabad Market Yard',
          state: 'Telangana',
          last_updated: new Date().toISOString()
        },
        {
          id: '3',
          crop_name: 'Cotton',
          price_per_kg: 75.80,
          price_trend: 'falling' as const,
          percent_change: -1.8,
          market_name: 'Pune Wholesale Market',
          state: 'Maharashtra',
          last_updated: new Date().toISOString()
        },
        {
          id: '4',
          crop_name: 'Sugarcane',
          price_per_kg: 3.75,
          price_trend: 'rising' as const,
          percent_change: 3.2,
          market_name: 'Kolhapur Agricultural Market',
          state: 'Maharashtra',
          last_updated: new Date().toISOString()
        },
        {
          id: '5',
          crop_name: 'Rice',
          price_per_kg: 44.25,
          price_trend: 'rising' as const,
          percent_change: 4.1,
          market_name: 'Bengaluru Market Complex',
          state: 'Karnataka',
          last_updated: new Date().toISOString()
        },
      ];
      
      // Extract unique values for filters
      const crops = Array.from(new Set(prices.map(price => price.crop_name)));
      const markets = Array.from(new Set(prices.map(price => price.market_name)));
      const states = Array.from(new Set(prices.map(price => price.state)));
      
      setMarketPrices(prices);
      setFilteredPrices(prices);
      setAvailableCrops(crops);
      setAvailableMarkets(markets);
      setAvailableStates(states);
      
      // Optionally set a default crop for trends
      if (crops.length > 0) {
        setSelectedCrop(crops[0]);
      }
    } catch (error) {
      console.error('Error fetching market prices:', error);
      toast({
        title: 'Error',
        description: 'Failed to load market prices',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchTrendData = async (cropName: string) => {
    if (!cropName || cropName === 'all-crops') return;
    
    setTrendLoading(true);
    try {
      // Simulate API call to get trend data
      // In a real app, this would come from your backend
      const oneDay = 24 * 60 * 60 * 1000;
      const today = new Date();
      
      // Generate 14 days of historical data
      const historicalPrices = Array.from({ length: 14 }, (_, i) => {
        const date = new Date(today.getTime() - (13 - i) * oneDay);
        // Generate a somewhat realistic price with small daily variations
        let basePrice = 0;
        switch(cropName) {
          case 'Rice': basePrice = 42; break;
          case 'Wheat': basePrice = 31; break;
          case 'Cotton': basePrice = 75; break;
          case 'Sugarcane': basePrice = 3.8; break;
          default: basePrice = 40;
        }
        
        const variance = (Math.random() - 0.5) * 2; // Random value between -1 and 1
        return {
          date: date.toISOString().split('T')[0],
          price: +(basePrice + variance).toFixed(2)
        };
      });
      
      // Generate 7 days of forecast data
      const forecastPrices = Array.from({ length: 7 }, (_, i) => {
        const date = new Date(today.getTime() + (i + 1) * oneDay);
        const lastHistoricalPrice = historicalPrices[historicalPrices.length - 1].price;
        // Add a trend to the forecast
        const trend = Math.random() > 0.5 ? 0.2 : -0.2; // Either slightly up or down
        const variance = (Math.random() - 0.5) * 1.5; // Random value between -0.75 and 0.75
        const forecastPrice = +(lastHistoricalPrice + trend * (i + 1) + variance).toFixed(2);
        
        return {
          date: date.toISOString().split('T')[0],
          price: forecastPrice
        };
      });
      
      const trendData = {
        crop_name: cropName,
        current_price: historicalPrices[historicalPrices.length - 1].price,
        historical_prices: historicalPrices,
        forecast_prices: forecastPrices,
        analysis: `The market for ${cropName} is showing ${
          forecastPrices[forecastPrices.length - 1].price > historicalPrices[historicalPrices.length - 1].price
            ? 'an upward trend with potential for price increases in the coming week.'
            : 'a downward trend with possible price decreases in the coming week.'
        }`
      };
      
      setTrendData(trendData);
    } catch (error) {
      console.error('Error fetching trend data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load trend data',
        variant: 'destructive',
      });
    } finally {
      setTrendLoading(false);
    }
  };

  const filterCropPrices = async () => {
    setLoading(true);
    try {
      let filtered = [...marketPrices];
      
      // Apply crop filter
      if (selectedCrop && selectedCrop !== 'all-crops') {
        filtered = filtered.filter(price => price.crop_name === selectedCrop);
      }
      
      // Apply market filter
      if (selectedMarket && selectedMarket !== 'all-markets') {
        filtered = filtered.filter(price => price.market_name === selectedMarket);
      }
      
      // Apply state filter
      if (selectedState && selectedState !== 'all-states') {
        filtered = filtered.filter(price => price.state === selectedState);
      }
      
      // Apply search filter
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        filtered = filtered.filter(price => 
          price.crop_name.toLowerCase().includes(term) ||
          price.market_name.toLowerCase().includes(term) ||
          price.state.toLowerCase().includes(term)
        );
      }
      
      setFilteredPrices(filtered);
    } catch (error) {
      console.error('Error filtering prices:', error);
      toast({
        title: 'Error',
        description: 'Failed to filter market prices',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCropSelect = (value: string) => {
    setSelectedCrop(value);
    if (value && value !== 'all-crops') {
      fetchTrendData(value);
    }
  };

  const handleMarketSelect = (value: string) => {
    setSelectedMarket(value);
  };

  const handleStateSelect = (value: string) => {
    setSelectedState(value);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    filterCropPrices();
  };

  const resetFilters = () => {
    setSelectedCrop('all-crops');
    setSelectedMarket('all-markets');
    setSelectedState('all-states');
    setSearchTerm('');
  };

  const getPriceTrendIcon = (trend: 'rising' | 'falling' | 'stable', percentChange: number) => {
    if (trend === 'rising') {
      return <ArrowUpIcon className="h-4 w-4 text-green-600" />;
    } else if (trend === 'falling') {
      return <ArrowDownIcon className="h-4 w-4 text-red-600" />;
    } else {
      return <MinusIcon className="h-4 w-4 text-gray-500" />;
    }
  };

  const getPriceTrendClass = (trend: 'rising' | 'falling' | 'stable') => {
    if (trend === 'rising') {
      return 'text-green-600';
    } else if (trend === 'falling') {
      return 'text-red-600';
    } else {
      return 'text-gray-500';
    }
  };
  
  // Formats a date string from yyyy-mm-dd to a more readable format
  const formatDate = (dateString: string) => {
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>
            <Skeleton className="h-8 w-48" />
          </CardTitle>
          <CardDescription>
            <Skeleton className="h-4 w-64" />
          </CardDescription>
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
        <CardDescription>
          Current agricultural commodity prices across different markets
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full mb-4">
            <TabsTrigger value="all" className="flex-1">All Prices</TabsTrigger>
            <TabsTrigger value="trend" className="flex-1">Price Trends</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all">
            <div className="space-y-4">
              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                <Select value={selectedCrop} onValueChange={handleCropSelect}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Crop" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all-crops">All Crops</SelectItem>
                    {availableCrops.map((crop) => (
                      <SelectItem key={crop} value={crop}>{crop}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select value={selectedMarket} onValueChange={handleMarketSelect}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Market" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all-markets">All Markets</SelectItem>
                    {availableMarkets.map((market) => (
                      <SelectItem key={market} value={market}>{market}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select value={selectedState} onValueChange={handleStateSelect}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select State" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all-states">All States</SelectItem>
                    {availableStates.map((state) => (
                      <SelectItem key={state} value={state}>{state}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <form onSubmit={handleSearch} className="flex gap-2">
                  <Input
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1"
                  />
                  <Button type="submit" size="icon" variant="ghost">
                    <SearchIcon className="h-4 w-4" />
                  </Button>
                </form>
              </div>
              
              {/* Filter indicators */}
              {(selectedCrop !== 'all-crops' || selectedMarket !== 'all-markets' || selectedState !== 'all-states' || searchTerm) && (
                <div className="flex flex-wrap items-center gap-2 my-2">
                  <span className="text-sm text-muted-foreground">Filters:</span>
                  {selectedCrop !== 'all-crops' && (
                    <Badge variant="outline" className="flex items-center gap-1">
                      Crop: {selectedCrop}
                    </Badge>
                  )}
                  {selectedMarket !== 'all-markets' && (
                    <Badge variant="outline" className="flex items-center gap-1">
                      Market: {selectedMarket}
                    </Badge>
                  )}
                  {selectedState !== 'all-states' && (
                    <Badge variant="outline" className="flex items-center gap-1">
                      State: {selectedState}
                    </Badge>
                  )}
                  {searchTerm && (
                    <Badge variant="outline" className="flex items-center gap-1">
                      Search: {searchTerm}
                    </Badge>
                  )}
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={resetFilters}
                    className="h-7 px-2 text-xs"
                  >
                    Reset
                  </Button>
                </div>
              )}
              
              {/* Price table */}
              <ScrollArea className="h-[320px]">
                <div className="border rounded-md">
                  <div className="grid grid-cols-6 gap-2 p-3 font-medium text-sm bg-muted border-b">
                    <div>Crop</div>
                    <div>Price (₹/kg)</div>
                    <div>Change</div>
                    <div className="col-span-2">Market</div>
                    <div>Updated</div>
                  </div>
                  
                  {filteredPrices.length === 0 ? (
                    <div className="p-4 text-center text-muted-foreground">
                      No prices found with the selected filters
                    </div>
                  ) : (
                    filteredPrices.map((price) => (
                      <div 
                        key={price.id} 
                        className="grid grid-cols-6 gap-2 p-3 text-sm border-b last:border-b-0 hover:bg-muted/50"
                      >
                        <div className="font-medium">{price.crop_name}</div>
                        <div>₹{price.price_per_kg.toFixed(2)}</div>
                        <div className={`flex items-center gap-1 ${getPriceTrendClass(price.price_trend)}`}>
                          {getPriceTrendIcon(price.price_trend, price.percent_change)}
                          {price.percent_change > 0 ? '+' : ''}{price.percent_change.toFixed(1)}%
                        </div>
                        <div className="col-span-2">{price.market_name}, {price.state}</div>
                        <div className="text-muted-foreground">{formatDate(price.last_updated)}</div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
              
              <p className="text-xs text-muted-foreground text-right mt-2">
                Last updated: {new Date().toLocaleDateString()} 
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="trend">
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-4">
                <h3 className="text-lg font-medium">Price Trend Analysis</h3>
                
                <Select value={selectedCrop} onValueChange={handleCropSelect}>
                  <SelectTrigger className="w-full sm:w-[200px]">
                    <SelectValue placeholder="Select a crop" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableCrops.map((crop) => (
                      <SelectItem key={crop} value={crop}>{crop}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {trendLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-[200px] w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                </div>
              ) : !trendData ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <LineChart className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-1">No Trend Data Available</h3>
                  <p className="text-sm text-muted-foreground">
                    Please select a crop to view its price trend analysis
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-xl font-semibold">{trendData.crop_name}</h3>
                      <p className="text-muted-foreground">Current Price: <span className="font-medium">₹{trendData.current_price.toFixed(2)}/kg</span></p>
                    </div>
                    <Badge variant="outline" className="flex items-center gap-1">
                      {trendData.forecast_prices[trendData.forecast_prices.length - 1].price > trendData.current_price ? (
                        <>
                          <ArrowUpIcon className="h-3 w-3 text-green-600" />
                          <span className="text-green-600">Upward Trend</span>
                        </>
                      ) : trendData.forecast_prices[trendData.forecast_prices.length - 1].price < trendData.current_price ? (
                        <>
                          <ArrowDownIcon className="h-3 w-3 text-red-600" />
                          <span className="text-red-600">Downward Trend</span>
                        </>
                      ) : (
                        <>
                          <MinusIcon className="h-3 w-3 text-gray-500" />
                          <span className="text-gray-500">Stable</span>
                        </>
                      )}
                    </Badge>
                  </div>
                  
                  {/* Price chart - Display as simple table for now */}
                  <div className="bg-muted/30 rounded-lg p-4">
                    <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                      <BarChart3 className="h-4 w-4 text-blue-600" />
                      Price Trend Over Time
                    </h4>
                    
                    <div className="mb-6">
                      <p className="text-xs text-muted-foreground mb-1">Historical Prices</p>
                      <div className="flex justify-between">
                        {trendData.historical_prices.map((item, index) => (
                          <div key={index} className="flex flex-col items-center">
                            <span className="text-xs text-muted-foreground">{formatDate(item.date)}</span>
                            <span className="text-sm font-medium">₹{item.price.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Forecast Prices</p>
                      <div className="flex justify-between">
                        {trendData.forecast_prices.map((item, index) => (
                          <div key={index} className="flex flex-col items-center">
                            <span className="text-xs text-muted-foreground">{formatDate(item.date)}</span>
                            <span className={`text-sm font-medium ${
                              item.price > trendData.current_price ? 'text-green-600' : 
                              item.price < trendData.current_price ? 'text-red-600' : 
                              'text-gray-600'
                            }`}>
                              ₹{item.price.toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  {/* Market factors */}
                  <div>
                    <h4 className="text-sm font-medium mb-2">Key Market Factors</h4>
                    <ul className="space-y-1">
                      {trendData.factors.map((factor, index) => (
                        <li key={index} className="text-sm flex items-start gap-2">
                          <span className="text-muted-foreground">•</span>
                          <span>{factor}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <p className="text-xs text-muted-foreground text-right mt-2">
                    The forecast is based on historical trends and market analysis
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
} 