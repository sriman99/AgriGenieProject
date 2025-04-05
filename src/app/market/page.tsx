'use client';

import { MarketAnalysis } from "@/components/layout/market/analysis";
import { Toaster } from "@/components/ui/toaster";

export default function MarketPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Market Analysis</h1>
        <p className="text-muted-foreground mb-8">
          Get real-time market insights, price predictions, and recommendations for your crops.
        </p>
        <MarketAnalysis />
      </div>
      <Toaster />
    </div>
  );
} 