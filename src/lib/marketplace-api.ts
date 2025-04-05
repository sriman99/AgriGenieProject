import { createClient } from './supabase';
import { CartItem, WishlistItem } from './auth-context';

const supabase = createClient();

export type MarketplaceListing = {
  id: string;
  farmer_id: string;  // Changed from farmerId to match DB column
  farmer_name: string; // Changed from farmerName to match DB column
  crop_name: string;  // Changed from cropName to match DB column
  description: string;
  price: number;
  quantity: number;
  unit: string; // e.g., "kg", "ton", etc.
  category: string;
  image_url?: string;  // Changed from imageUrl to match DB column
  location: string;
  created_at: string;  // Changed from createdAt to match DB column
  updated_at: string;  // Changed from updatedAt to match DB column
  is_organic: boolean; // Changed from isOrganic to match DB column
  harvest_date?: string; // Changed from harvestDate to match DB column
  quality?: string;
  status: 'active' | 'sold' | 'reserved';
};

// Define a mapping for frontend to backend naming
// This lets us maintain camelCase in the frontend while using snake_case in DB
export type MarketplaceListingFrontend = {
  id: string;
  farmerId: string;
  farmerName: string;
  cropName: string;
  description: string;
  price: number;
  quantity: number;
  unit: string;
  category: string;
  imageUrl?: string;
  location: string;
  createdAt: string;
  updatedAt: string;
  isOrganic: boolean;
  harvestDate?: string;
  quality?: string;
  status: 'active' | 'sold' | 'reserved';
};

// Conversion functions between DB and frontend formats
export function toFrontendListing(dbListing: MarketplaceListing): MarketplaceListingFrontend {
  return {
    id: dbListing.id,
    farmerId: dbListing.farmer_id,
    farmerName: dbListing.farmer_name,
    cropName: dbListing.crop_name,
    description: dbListing.description,
    price: dbListing.price,
    quantity: dbListing.quantity,
    unit: dbListing.unit,
    category: dbListing.category,
    imageUrl: dbListing.image_url,
    location: dbListing.location,
    createdAt: dbListing.created_at,
    updatedAt: dbListing.updated_at,
    isOrganic: dbListing.is_organic,
    harvestDate: dbListing.harvest_date,
    quality: dbListing.quality,
    status: dbListing.status
  };
}

export function toDbListing(frontendListing: Partial<MarketplaceListingFrontend>): Partial<MarketplaceListing> {
  const dbListing: Partial<MarketplaceListing> = {};
  
  if (frontendListing.id !== undefined) dbListing.id = frontendListing.id;
  if (frontendListing.farmerId !== undefined) dbListing.farmer_id = frontendListing.farmerId;
  if (frontendListing.farmerName !== undefined) dbListing.farmer_name = frontendListing.farmerName;
  if (frontendListing.cropName !== undefined) dbListing.crop_name = frontendListing.cropName;
  if (frontendListing.description !== undefined) dbListing.description = frontendListing.description;
  if (frontendListing.price !== undefined) dbListing.price = frontendListing.price;
  if (frontendListing.quantity !== undefined) dbListing.quantity = frontendListing.quantity;
  if (frontendListing.unit !== undefined) dbListing.unit = frontendListing.unit;
  if (frontendListing.category !== undefined) dbListing.category = frontendListing.category;
  if (frontendListing.imageUrl !== undefined) dbListing.image_url = frontendListing.imageUrl;
  if (frontendListing.location !== undefined) dbListing.location = frontendListing.location;
  if (frontendListing.isOrganic !== undefined) dbListing.is_organic = frontendListing.isOrganic;
  if (frontendListing.harvestDate !== undefined) dbListing.harvest_date = frontendListing.harvestDate;
  if (frontendListing.quality !== undefined) dbListing.quality = frontendListing.quality;
  if (frontendListing.status !== undefined) dbListing.status = frontendListing.status;
  
  return dbListing;
}

export type Order = {
  id: string;
  user_id: string;  // Changed from userId to match DB
  farmer_id: string; // Changed from farmerId to match DB
  total_amount: number; // Changed from totalAmount to match DB
  status: 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shipping_address: ShippingAddress; // Changed from shippingAddress to match DB
  payment_method: string; // Changed from paymentMethod to match DB
  created_at: string; // Changed from createdAt to match DB
  updated_at: string; // Changed from updatedAt to match DB
};

export type OrderItem = {
  id?: string;
  order_id?: string;
  listing_id: string;
  crop_name: string;
  price: number;
  quantity: number;
  unit: string;
  total_price: number;
};

export type ShippingAddress = {
  fullName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phoneNumber: string;
};

// Function to fetch all marketplace listings
export async function getMarketplaceListings(
  filters?: {
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    search?: string;
  }
): Promise<{ data: MarketplaceListingFrontend[] | null; error: Error | null }> {
  try {
    let query = supabase.from('marketplace_listings').select('*');
    
    // Apply filters if provided
    if (filters) {
      if (filters.category) {
        query = query.eq('category', filters.category);
      }
      
      if (filters.minPrice !== undefined) {
        query = query.gte('price', filters.minPrice);
      }
      
      if (filters.maxPrice !== undefined) {
        query = query.lte('price', filters.maxPrice);
      }
      
      if (filters.search) {
        query = query.ilike('crop_name', `%${filters.search}%`); // Changed cropName to crop_name
      }
    }
    
    // Only get active listings by default
    query = query.eq('status', 'active');
    
    const { data, error } = await query;
    
    if (error) {
      throw error;
    }
    
    // Convert the DB format to frontend format
    const frontendData = data?.map(listing => toFrontendListing(listing as MarketplaceListing)) || null;
    
    return { data: frontendData, error: null };
  } catch (error) {
    console.error('Error fetching marketplace listings:', error);
    return { data: null, error: error as Error };
  }
}

// Function to fetch a specific listing by ID
export async function getMarketplaceListing(
  id: string
): Promise<{ data: MarketplaceListingFrontend | null; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('marketplace_listings')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      throw error;
    }
    
    // Convert to frontend format
    const frontendData = data ? toFrontendListing(data as MarketplaceListing) : null;
    
    return { data: frontendData, error: null };
  } catch (error) {
    console.error(`Error fetching listing with ID ${id}:`, error);
    return { data: null, error: error as Error };
  }
}

// Function to create a new listing (for farmers)
export async function createMarketplaceListing(
  listing: Omit<MarketplaceListingFrontend, 'id' | 'createdAt' | 'updatedAt'>
): Promise<{ data: MarketplaceListingFrontend | null; error: Error | null }> {
  try {
    // Convert frontend format to DB format
    const dbListing = toDbListing(listing);
    
    const { data, error } = await supabase
      .from('marketplace_listings')
      .insert([dbListing])
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    // Convert back to frontend format
    const frontendData = data ? toFrontendListing(data as MarketplaceListing) : null;
    
    return { data: frontendData, error: null };
  } catch (error) {
    console.error('Error creating marketplace listing:', error);
    return { data: null, error: error as Error };
  }
}

// Function to update an existing listing (for farmers)
export async function updateMarketplaceListing(
  id: string,
  updates: Partial<MarketplaceListingFrontend>
): Promise<{ data: MarketplaceListingFrontend | null; error: Error | null }> {
  try {
    // Convert frontend updates to DB format
    const dbUpdates = toDbListing(updates);
    
    // Add updated_at timestamp
    dbUpdates.updated_at = new Date().toISOString();
    
    const { data, error } = await supabase
      .from('marketplace_listings')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    // Convert back to frontend format
    const frontendData = data ? toFrontendListing(data as MarketplaceListing) : null;
    
    return { data: frontendData, error: null };
  } catch (error) {
    console.error(`Error updating listing with ID ${id}:`, error);
    return { data: null, error: error as Error };
  }
}

// Function to delete a listing (for farmers)
export async function deleteMarketplaceListing(
  id: string
): Promise<{ success: boolean; error: Error | null }> {
  try {
    const { error } = await supabase
      .from('marketplace_listings')
      .delete()
      .eq('id', id);
    
    if (error) {
      throw error;
    }
    
    return { success: true, error: null };
  } catch (error) {
    console.error(`Error deleting listing with ID ${id}:`, error);
    return { success: false, error: error as Error };
  }
}

// Function to create a new order
export async function createOrder(
  order: Omit<Order, 'id' | 'created_at' | 'updated_at'>
): Promise<{ data: Order | null; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('marketplace_orders')
      .insert([order])
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    return { data: data as Order, error: null };
  } catch (error) {
    console.error('Error creating order:', error);
    return { data: null, error: error as Error };
  }
}

// Function to create a new order with items
export async function createOrderWithItems(
  orderData: Omit<Order, 'id' | 'created_at' | 'updated_at'>,
  orderItems: Omit<OrderItem, 'id' | 'order_id'>[]
): Promise<{ data: { order: Order | null, items: OrderItem[] | null }; error: Error | null }> {
  try {
    // Start a Supabase transaction
    const { data: order, error: orderError } = await supabase
      .from('marketplace_orders')
      .insert([orderData])
      .select()
      .single();
    
    if (orderError) {
      throw orderError;
    }

    // Once order is created, create the order items with the order ID
    const itemsWithOrderId = orderItems.map(item => ({
      ...item,
      order_id: order.id
    }));

    const { data: items, error: itemsError } = await supabase
      .from('order_items')
      .insert(itemsWithOrderId)
      .select();
    
    if (itemsError) {
      throw itemsError;
    }
    
    return { data: { order: order as Order, items: items as OrderItem[] }, error: null };
  } catch (error) {
    console.error('Error creating order with items:', error);
    return { data: { order: null, items: null }, error: error as Error };
  }
}

// Function to get items for a specific order
export async function getOrderItems(
  orderId: string
): Promise<{ data: OrderItem[] | null; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', orderId);
    
    if (error) {
      throw error;
    }
    
    return { data: data as OrderItem[], error: null };
  } catch (error) {
    console.error(`Error fetching items for order ${orderId}:`, error);
    return { data: null, error: error as Error };
  }
}

// Function to get user's orders
export async function getUserOrders(
  userId: string
): Promise<{ data: Order[] | null; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('marketplace_orders')
      .select('*')
      .eq('user_id', userId) // Changed from userId to user_id
      .order('created_at', { ascending: false }); // Changed from createdAt to created_at
    
    if (error) {
      throw error;
    }
    
    return { data: data as Order[], error: null };
  } catch (error) {
    console.error(`Error fetching orders for user ${userId}:`, error);
    return { data: null, error: error as Error };
  }
}

// Function to get farmer's received orders
export async function getFarmerOrders(
  farmerId: string
): Promise<{ data: Order[] | null; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('marketplace_orders')
      .select('*')
      .eq('farmer_id', farmerId) // Changed from farmerId to farmer_id
      .order('created_at', { ascending: false }); // Changed from createdAt to created_at
    
    if (error) {
      throw error;
    }
    
    return { data: data as Order[], error: null };
  } catch (error) {
    console.error(`Error fetching orders for farmer ${farmerId}:`, error);
    return { data: null, error: error as Error };
  }
}

// Function to update order status
export async function updateOrderStatus(
  orderId: string,
  status: Order['status']
): Promise<{ success: boolean; error: Error | null }> {
  try {
    const { error } = await supabase
      .from('marketplace_orders')
      .update({
        status,
        updated_at: new Date().toISOString() // Changed from updatedAt to updated_at
      })
      .eq('id', orderId);
    
    if (error) {
      throw error;
    }
    
    return { success: true, error: null };
  } catch (error) {
    console.error(`Error updating status for order ${orderId}:`, error);
    return { success: false, error: error as Error };
  }
}