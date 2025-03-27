// This is a simulated API for market prices since we're not connecting to a real API yet
// In a production environment, this would be replaced with actual API calls

export interface CropPrice {
  id: string;
  crop_name: string;
  price_per_kg: number;
  market_name: string;
  state: string;
  last_updated: string;
  price_trend: 'rising' | 'falling' | 'stable';
  percent_change: number;
}

export interface MarketTrend {
  crop_name: string;
  current_price: number;
  historical_prices: { date: string; price: number }[];
  forecast_prices: { date: string; price: number }[];
  analysis: string;
  factors: string[]; // Market factors affecting price
}

// Sample crop data - simulating database or external API
const CROP_PRICE_DATA: CropPrice[] = [
  {
    id: '1',
    crop_name: 'Rice',
    price_per_kg: 42.5,
    market_name: 'Delhi Agricultural Market',
    state: 'Delhi',
    last_updated: '2023-11-15',
    price_trend: 'rising',
    percent_change: 2.4,
  },
  {
    id: '2',
    crop_name: 'Wheat',
    price_per_kg: 30.75,
    market_name: 'Delhi Agricultural Market',
    state: 'Delhi',
    last_updated: '2023-11-15',
    price_trend: 'stable',
    percent_change: 0.2,
  },
  {
    id: '3',
    crop_name: 'Corn',
    price_per_kg: 23.8,
    market_name: 'Delhi Agricultural Market',
    state: 'Delhi',
    last_updated: '2023-11-15',
    price_trend: 'falling',
    percent_change: -1.5,
  },
  {
    id: '4',
    crop_name: 'Sugarcane',
    price_per_kg: 3.25,
    market_name: 'Delhi Agricultural Market',
    state: 'Delhi',
    last_updated: '2023-11-15',
    price_trend: 'rising',
    percent_change: 0.8,
  },
  {
    id: '5',
    crop_name: 'Cotton',
    price_per_kg: 65.4,
    market_name: 'Delhi Agricultural Market',
    state: 'Delhi',
    last_updated: '2023-11-15',
    price_trend: 'rising',
    percent_change: 3.2,
  },
  {
    id: '6',
    crop_name: 'Rice',
    price_per_kg: 41.2,
    market_name: 'Mumbai Agricultural Market',
    state: 'Maharashtra',
    last_updated: '2023-11-15',
    price_trend: 'rising',
    percent_change: 1.8,
  },
  {
    id: '7',
    crop_name: 'Wheat',
    price_per_kg: 29.5,
    market_name: 'Mumbai Agricultural Market',
    state: 'Maharashtra',
    last_updated: '2023-11-15',
    price_trend: 'falling',
    percent_change: -0.7,
  },
  {
    id: '8',
    crop_name: 'Rice',
    price_per_kg: 38.9,
    market_name: 'Kolkata Agricultural Market',
    state: 'West Bengal',
    last_updated: '2023-11-15',
    price_trend: 'stable',
    percent_change: 0.1,
  },
  {
    id: '9',
    crop_name: 'Tomato',
    price_per_kg: 35.0,
    market_name: 'Delhi Agricultural Market',
    state: 'Delhi',
    last_updated: '2023-11-15',
    price_trend: 'falling',
    percent_change: -5.2,
  },
  {
    id: '10',
    crop_name: 'Potato',
    price_per_kg: 22.8,
    market_name: 'Delhi Agricultural Market',
    state: 'Delhi',
    last_updated: '2023-11-15',
    price_trend: 'stable',
    percent_change: 0.3,
  },
  {
    id: '11',
    crop_name: 'Onion',
    price_per_kg: 28.5,
    market_name: 'Delhi Agricultural Market',
    state: 'Delhi',
    last_updated: '2023-11-15',
    price_trend: 'rising',
    percent_change: 7.8,
  },
  {
    id: '12',
    crop_name: 'Soybean',
    price_per_kg: 45.2,
    market_name: 'Delhi Agricultural Market',
    state: 'Delhi',
    last_updated: '2023-11-15',
    price_trend: 'rising',
    percent_change: 1.3,
  },
];

// Sample trend data for crops
const MARKET_TREND_DATA: Record<string, MarketTrend> = {
  'Rice': {
    crop_name: 'Rice',
    current_price: 42.5,
    historical_prices: [
      { date: '2023-10-15', price: 40.2 },
      { date: '2023-10-22', price: 40.8 },
      { date: '2023-10-29', price: 41.3 },
      { date: '2023-11-05', price: 41.5 },
      { date: '2023-11-12', price: 42.1 },
      { date: '2023-11-15', price: 42.5 },
    ],
    forecast_prices: [
      { date: '2023-11-22', price: 42.8 },
      { date: '2023-11-29', price: 43.2 },
      { date: '2023-12-06', price: 43.5 },
      { date: '2023-12-13', price: 43.7 },
    ],
    analysis: 'Stable',
    factors: [
      'Increased demand during festival season',
      'Limited supply due to delayed harvests',
      'Favorable government policies',
    ],
  },
  'Wheat': {
    crop_name: 'Wheat',
    current_price: 30.75,
    historical_prices: [
      { date: '2023-10-15', price: 30.9 },
      { date: '2023-10-22', price: 31.1 },
      { date: '2023-10-29', price: 30.8 },
      { date: '2023-11-05', price: 30.7 },
      { date: '2023-11-12', price: 30.7 },
      { date: '2023-11-15', price: 30.75 },
    ],
    forecast_prices: [
      { date: '2023-11-22', price: 30.8 },
      { date: '2023-11-29', price: 30.9 },
      { date: '2023-12-06', price: 31.0 },
      { date: '2023-12-13', price: 31.2 },
    ],
    analysis: 'Stable',
    factors: [
      'Stable domestic supply',
      'Normal demand patterns',
      'Adequate storage in government warehouses',
    ],
  },
  'Corn': {
    crop_name: 'Corn',
    current_price: 23.8,
    historical_prices: [
      { date: '2023-10-15', price: 24.5 },
      { date: '2023-10-22', price: 24.3 },
      { date: '2023-10-29', price: 24.1 },
      { date: '2023-11-05', price: 24.0 },
      { date: '2023-11-12', price: 23.9 },
      { date: '2023-11-15', price: 23.8 },
    ],
    forecast_prices: [
      { date: '2023-11-22', price: 23.7 },
      { date: '2023-11-29', price: 23.6 },
      { date: '2023-12-06', price: 23.5 },
      { date: '2023-12-13', price: 23.4 },
    ],
    analysis: 'Stable',
    factors: [
      'Increased supply from recent harvest',
      'Lower demand from poultry industry',
      'International market price drops',
    ],
  },
};

// Get all current crop prices
export async function getCropPrices(): Promise<CropPrice[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return CROP_PRICE_DATA;
}

// Get crop prices by market
export async function getCropPricesByMarket(marketName: string): Promise<CropPrice[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return CROP_PRICE_DATA.filter(crop => crop.market_name.includes(marketName));
}

// Get crop prices by state
export async function getCropPricesByState(state: string): Promise<CropPrice[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return CROP_PRICE_DATA.filter(crop => crop.state.includes(state));
}

// Get crop prices by crop name
export async function getCropPricesByCrop(cropName: string): Promise<CropPrice[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return CROP_PRICE_DATA.filter(crop => 
    crop.crop_name.toLowerCase().includes(cropName.toLowerCase())
  );
}

// Get market trend for a specific crop
export async function getMarketTrend(cropName: string): Promise<MarketTrend | null> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));
  return MARKET_TREND_DATA[cropName] || null;
}

// Get all available markets
export async function getAvailableMarkets(): Promise<string[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  return [...new Set(CROP_PRICE_DATA.map(crop => crop.market_name))];
}

// Get all available states
export async function getAvailableStates(): Promise<string[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  return [...new Set(CROP_PRICE_DATA.map(crop => crop.state))];
}

// Get all unique crop names
export async function getAvailableCrops(): Promise<string[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  return [...new Set(CROP_PRICE_DATA.map(crop => crop.crop_name))];
}

// Get price comparison between markets for a specific crop
export async function getCropPriceComparison(cropName: string): Promise<{market: string; price: number}[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 700));
  const relevantCrops = CROP_PRICE_DATA.filter(crop => crop.crop_name === cropName);
  return relevantCrops.map(crop => ({
    market: crop.market_name,
    price: crop.price_per_kg
  }));
} 