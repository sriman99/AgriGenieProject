'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from "@/lib/auth-context";
import { Navbar } from "@/components/navbar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OrderManagement } from "@/components/marketplace/order-management";
import { MyOrders } from "@/components/marketplace/orders";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/toaster";
import { Loader2 } from "lucide-react";

export default function OrdersPage() {
  const router = useRouter();
  const { user, profile, isLoading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/signin');
    }
  }, [user, authLoading, router]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container py-6 max-w-6xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Marketplace Orders</h1>
          <p className="text-muted-foreground mt-2">
            {profile?.user_type === 'farmer' 
              ? "View and manage orders placed for your crop listings" 
              : "View your placed orders and their current status"}
          </p>
        </div>

        <div className="flex justify-between items-center mb-6">
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList>
              <TabsTrigger value="all">All Orders</TabsTrigger>
              {profile?.user_type === 'farmer' && (
                <>
                  <TabsTrigger value="pending">Pending</TabsTrigger>
                  <TabsTrigger value="accepted">Accepted</TabsTrigger>
                  <TabsTrigger value="completed">Completed</TabsTrigger>
                </>
              )}
            </TabsList>
          </Tabs>
          
          <Button variant="outline" onClick={() => router.push('/marketplace')}>
            Back to Marketplace
          </Button>
        </div>

        <div className="space-y-6">
          {/* Use OrderManagement for farmers for better control */}
          {profile?.user_type === 'farmer' ? (
            <OrderManagement />
          ) : (
            <MyOrders />
          )}
        </div>
      </div>
      <Toaster />
    </div>
  )
} 