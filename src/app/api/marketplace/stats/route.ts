import { createClient } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const supabase = createClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get user profile to determine type
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("user_type")
      .eq("id", user.id)
      .single();

    if (profileError || !profileData) {
      return NextResponse.json(
        { error: "User profile not found" },
        { status: 404 }
      );
    }

    const userType = profileData.user_type;

    if (userType === "farmer") {
      // Fetch farmer-specific stats
      const [
        listingsResult,
        activeListingsResult,
        ordersResult,
        pendingOrdersResult,
        earningsResult
      ] = await Promise.all([
        // Total listings by this farmer
        supabase
          .from("crop_listings")
          .select("id", { count: "exact" })
          .eq("farmer_id", user.id),
        
        // Active listings by this farmer
        supabase
          .from("crop_listings")
          .select("id", { count: "exact" })
          .eq("farmer_id", user.id)
          .eq("available", true),
        
        // Total orders for this farmer's listings
        supabase
          .from("marketplace_orders")
          .select("id", { count: "exact" })
          .eq("farmer_id", user.id),
        
        // Pending orders for this farmer's listings
        supabase
          .from("marketplace_orders")
          .select("id", { count: "exact" })
          .eq("farmer_id", user.id)
          .eq("status", "pending"),
        
        // Total earnings from completed orders
        supabase
          .from("marketplace_orders")
          .select("total_price")
          .eq("farmer_id", user.id)
          .in("status", ["completed", "accepted"])
      ]);

      // Calculate total earnings
      const totalEarnings = (earningsResult.data || []).reduce(
        (sum, order) => sum + (order.total_price || 0),
        0
      );

      return NextResponse.json({
        total_listings: listingsResult.count || 0,
        active_listings: activeListingsResult.count || 0,
        total_orders: ordersResult.count || 0,
        pending_orders: pendingOrdersResult.count || 0,
        total_earnings: totalEarnings
      });
    } 
    else if (userType === "buyer") {
      // Fetch buyer-specific stats
      const [
        ordersResult,
        pendingOrdersResult,
        spentResult
      ] = await Promise.all([
        // Total orders by this buyer
        supabase
          .from("marketplace_orders")
          .select("id", { count: "exact" })
          .eq("buyer_id", user.id),
        
        // Pending orders by this buyer
        supabase
          .from("marketplace_orders")
          .select("id", { count: "exact" })
          .eq("buyer_id", user.id)
          .eq("status", "pending"),
        
        // Total spent on all orders
        supabase
          .from("marketplace_orders")
          .select("total_price")
          .eq("buyer_id", user.id)
      ]);

      // Calculate total spent
      const totalSpent = (spentResult.data || []).reduce(
        (sum, order) => sum + (order.total_price || 0),
        0
      );

      return NextResponse.json({
        total_orders: ordersResult.count || 0,
        pending_orders: pendingOrdersResult.count || 0,
        total_spent: totalSpent
      });
    }
    
    // Default response for other user types
    return NextResponse.json(
      { error: "Invalid user type for marketplace stats" },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("Error fetching marketplace stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch marketplace stats" },
      { status: 500 }
    );
  }
} 