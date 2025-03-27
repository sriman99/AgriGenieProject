'use client';
import { useState, useEffect } from 'react';
import { api } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface AIInsight {
  type: 'market' | 'weather' | 'crop';
  title: string;
  content: string;
  timestamp: string;
}

export function AIInsights({ cropName, location }: { cropName: string; location: string }) {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInsights = async () => {
    try {
      setLoading(true);
      // Get market analysis
      const marketAnalysis = await api.getMarketAnalysis(cropName);
      // Get weather recommendations
      const weatherRecs = await api.getWeatherRecommendations(location);
      // Get crop precautions
      const precautions = await api.getCropPrecautions(location, cropName);

      const newInsights: AIInsight[] = [
        {
          type: 'market',
          title: 'Market Analysis',
          content: marketAnalysis.analysis,
          timestamp: new Date().toISOString()
        },
        {
          type: 'weather',
          title: 'Weather Recommendations',
          content: weatherRecs.recommendations,
          timestamp: new Date().toISOString()
        },
        {
          type: 'crop',
          title: 'Crop Precautions',
          content: precautions.precautions,
          timestamp: new Date().toISOString()
        }
      ];

      setInsights(newInsights);
    } catch (err) {
      setError('Failed to fetch insights');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, [cropName, location]);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="w-full">
            <CardHeader>
              <Skeleton className="h-6 w-3/4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-24 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center space-y-4">
            <p className="text-red-500">{error}</p>
            <Button onClick={fetchInsights} variant="outline">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {insights.map((insight, index) => (
        <Card key={index} className="w-full transition-all hover:shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xl font-bold">
              {insight.title}
            </CardTitle>
            <span className="text-sm text-muted-foreground">
              {new Date(insight.timestamp).toLocaleDateString()}
            </span>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none">
              {insight.content.split('\n').map((line, i) => (
                <p key={i}>{line}</p>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
} 