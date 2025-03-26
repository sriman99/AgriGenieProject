'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "@/lib/utils";
import { agriToasts } from "@/components/ui/toast";
import { AlertTriangle, Bot, Search, Store, TrendingUp, RefreshCw } from "lucide-react";

interface WeatherAlert {
  type: string;
  severity: 'low' | 'medium' | 'high';
  message: string;
  location: string;
}

interface MarketTrend {
  crop_name: string;
  price_change: number;
  recommendation: string;
}

export default function DashboardPage() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const [weatherAlert, setWeatherAlert] = useState<WeatherAlert | null>(null);
  const [marketTrends, setMarketTrends] = useState<MarketTrend[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth');
    }
  }, [user, loading, router]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;
      
      setIsLoading(true);
      setError(null);
      try {
        const [weatherData, marketData] = await Promise.all([
          api.getWeatherAlerts('current-location'),
          api.getMarketPrices()
        ]);

        setWeatherAlert(weatherData);
        setMarketTrends(marketData.slice(0, 5)); // Show top 5 trends
      } catch (error) {
        console.error('Dashboard data fetch error:', error);
        setError('Failed to fetch dashboard data');
        agriToasts.error("Failed to fetch dashboard data. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const features = [
    {
      title: "AI Chatbot",
      description: "Get instant farming advice and weather updates",
      link: "/chatbot",
      icon: <Bot className="h-6 w-6" />,
      color: "bg-blue-100 text-blue-700",
    },
    {
      title: "Disease Detection",
      description: "Scan your crops for diseases and get treatment recommendations",
      link: "/disease-detection",
      icon: <Search className="h-6 w-6" />,
      color: "bg-red-100 text-red-700",
    },
    {
      title: "Marketplace",
      description: profile?.user_type === 'farmer' 
        ? "List your crops and track orders" 
        : "Browse and purchase crops directly from farmers",
      link: "/marketplace",
      icon: <Store className="h-6 w-6" />,
      color: "bg-green-100 text-green-700",
    },
    {
      title: "Price Analysis",
      description: "Track market prices and get AI-powered selling recommendations",
      link: "/price-analysis",
      icon: <TrendingUp className="h-6 w-6" />,
      color: "bg-purple-100 text-purple-700",
    },
  ];

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="relative overflow-hidden">
              <CardHeader>
                <Skeleton className="h-6 w-1/3" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <main className="container mx-auto p-6 space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
          <Button 
            variant="outline" 
            size="sm" 
            className="ml-auto"
            onClick={() => window.location.reload()}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {features.map((feature, index) => (
          <Link key={index} href={feature.link}>
            <Card className="hover:shadow-lg transition-shadow duration-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {feature.title === "AI Chatbot" && <Bot className="h-5 w-5" />}
                  {feature.title === "Disease Detection" && <Search className="h-5 w-5" />}
                  {feature.title === "Marketplace" && <Store className="h-5 w-5" />}
                  {feature.title === "Price Analysis" && <TrendingUp className="h-5 w-5" />}
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {weatherAlert && (
        <Card className="bg-orange-50 border-orange-200">
          <CardHeader>
            <CardTitle className="text-orange-800">Weather Alert</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-2 text-orange-700">
              <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">{weatherAlert.type}</p>
                <p className="text-sm mt-1">{weatherAlert.message}</p>
                <p className="text-sm text-orange-600 mt-2">Location: {weatherAlert.location}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {marketTrends.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Market Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {marketTrends.map((trend, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="font-medium">{trend.crop_name}</span>
                  <div className="flex items-center gap-2">
                    <span className={trend.price_change >= 0 ? "text-green-600" : "text-red-600"}>
                      {trend.price_change >= 0 ? "+" : ""}{trend.price_change}%
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {trend.recommendation}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </main>
  );
}