import { createBrowserClient } from '@supabase/ssr'

export const createClient = () => {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// Database types for TypeScript
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string
          user_type: 'farmer' | 'buyer' | 'admin'
          created_at: string
          updated_at: string
        }
      }
      crop_listings: {
        Row: {
          id: string
          farmer_id: string
          crop_name: string
          quantity: number
          price_per_unit: number
          unit: string
          description: string | null
          available: boolean
          created_at: string
        }
      }
      orders: {
        Row: {
          id: string
          buyer_id: string
          crop_listing_id: string
          quantity: number
          total_price: number
          status: 'pending' | 'accepted' | 'completed' | 'cancelled'
          created_at: string
        }
      }
      disease_detections: {
        Row: {
          id: string
          farmer_id: string
          crop_name: string
          image_url: string
          detection_result: JSON
          created_at: string
        }
      }
      market_prices: {
        Row: {
          id: string
          crop_name: string
          price: number
          market_location: string
          date: string
        }
      }
      ai_insights: {
        Row: {
          id: string
          user_id: string
          insight_type: 'price_prediction' | 'weather_alert' | 'disease_alert'
          content: JSON
          created_at: string
        }
      }
    }
  }
}