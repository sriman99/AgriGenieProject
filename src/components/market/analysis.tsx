import React, { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, TrendingUp, TrendingDown, AlertTriangle } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface MarketAnalysis {
  current_price: number;
  predicted_price: number;
  price_trend: string;
  best_time_to_sell: string;
  market_recommendations: string[];
  risk_factors: string[];
  supply_demand_analysis: string;
}

export function MarketAnalysis() {
  const [cropName, setCropName] = useState<string>('Rice');
  const [state, setState] = useState<string>('Telangana');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [analysis, setAnalysis] = useState<MarketAnalysis | null>(null);
  const { toast } = useToast();

  const fetchAnalysis = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/market-analysis/analysis/${cropName}?state=${state}`);
      if (!response.ok) {
        throw new Error('Failed to fetch market analysis');
      }
      const data = await response.json();
      setAnalysis(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch market analysis. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (cropName && state) {
      fetchAnalysis();
    }
  }, [cropName, state]);

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Market Analysis</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Crop Name</label>
              <Select value={cropName} onValueChange={setCropName}>
                <SelectTrigger>
                  <SelectValue placeholder="Select crop" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Rice">Rice</SelectItem>
                  <SelectItem value="Wheat">Wheat</SelectItem>
                  <SelectItem value="Cotton">Cotton</SelectItem>
                  <SelectItem value="Sugarcane">Sugarcane</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">State</label>
              <Select value={state} onValueChange={setState}>
                <SelectTrigger>
                  <SelectValue placeholder="Select state" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Telangana">Telangana</SelectItem>
                  <SelectItem value="Andhra Pradesh">Andhra Pradesh</SelectItem>
                  <SelectItem value="Karnataka">Karnataka</SelectItem>
                  <SelectItem value="Maharashtra">Maharashtra</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button 
            onClick={fetchAnalysis} 
            disabled={isLoading || !cropName || !state}
            className="w-full md:w-auto"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              'Update Analysis'
            )}
          </Button>
        </div>
      </Card>

      {analysis && (
        <>
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">Price Analysis</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Current Price</p>
                <p className="text-2xl font-bold">₹{analysis.current_price.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">Predicted Price</p>
                <p className="text-2xl font-bold">₹{analysis.predicted_price.toFixed(2)}</p>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              {analysis.price_trend === 'increasing' ? (
                <TrendingUp className="text-green-500" />
              ) : (
                <TrendingDown className="text-red-500" />
              )}
              <span className="font-medium">
                Price Trend: {analysis.price_trend}
              </span>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">Market Insights</h3>
            <div className="space-y-6">
              <div>
                <h4 className="font-medium mb-2">Best Time to Sell</h4>
                <p className="text-muted-foreground">{analysis.best_time_to_sell}</p>
              </div>

              <div>
                <h4 className="font-medium mb-2">Market Recommendations</h4>
                <ul className="list-disc list-inside space-y-1">
                  {analysis.market_recommendations.map((rec, index) => (
                    <li key={index} className="text-muted-foreground">{rec}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-medium mb-2">Risk Factors</h4>
                <ul className="list-disc list-inside space-y-1">
                  {analysis.risk_factors.map((risk, index) => (
                    <li key={index} className="text-muted-foreground flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-yellow-500 mt-1 shrink-0" />
                      <span>{risk}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-medium mb-2">Supply & Demand Analysis</h4>
                <p className="text-muted-foreground">{analysis.supply_demand_analysis}</p>
              </div>
            </div>
          </Card>
        </>
      )}
    </div>
  );
} 