'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart, 
  Calendar, 
  Coins,
  Leaf, 
  LineChart, 
  Wheat, 
  Sprout, 
  TrendingUp, 
  Tractor, 
  CloudSun,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { redirect } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { WeatherWidget } from '@/components/dashboard/weather-widget';
import { MarketPricesWidget } from '@/components/dashboard/market-prices-widget';
import { GeminiChat } from '@/components/dashboard/gemini-chat';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface StatCardProps {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
}

function StatCard({ title, value, description, icon, trend, trendValue }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="h-8 w-8 bg-primary/10 rounded-md flex items-center justify-center text-primary">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
        {trend && (
          <div className={`flex items-center text-xs mt-1 ${
            trend === 'up' ? 'text-green-600' : 
            trend === 'down' ? 'text-red-600' : 
            'text-gray-600'
          }`}>
            {trend === 'up' ? <TrendingUp className="h-3 w-3 mr-1" /> : 
              trend === 'down' ? <LineChart className="h-3 w-3 mr-1" /> : 
              <LineChart className="h-3 w-3 mr-1" />}
            {trendValue}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface Disease {
  name: string;
  probability: number;
  description?: string;
  treatment?: string;
}

interface TreatmentPlan {
  immediate_steps: string[];
  long_term_prevention: string[];
  organic_alternatives: string[];
  chemical_solutions: string[];
}

interface AssessmentResult {
  diseases: Disease[];
  treatment_plan: TreatmentPlan;
  imageUrl: string;
  timestamp: string;
}

export default function FarmerDashboard() {
  const { user, profile, loading } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [recentAssessments, setRecentAssessments] = useState<AssessmentResult[]>([]);
  const router = useRouter();
  
  // Sample preview data for empty state
  const previewData = [
    {
      name: "Tomato Plant",
      status: "healthy",
      percentage: 95,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
      icon: <CheckCircle2 className="h-4 w-4 text-green-500" />,
      label: "Healthy",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
      message: "No issues detected, plant is healthy"
    },
    {
      name: "Wheat Field",
      status: "warning",
      percentage: 75,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
      icon: <AlertTriangle className="h-4 w-4 text-amber-500" />,
      label: "Warning",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
      message: "Watch for: Powdery Mildew"
    },
    {
      name: "Corn Crop",
      status: "critical",
      percentage: 45,
      color: "text-red-500",
      bgColor: "bg-red-500/10",
      icon: <AlertCircle className="h-4 w-4 text-red-500" />,
      label: "Critical",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
      message: "Alert: Northern Corn Leaf Blight detected - immediate action recommended"
    }
  ];
  
  useEffect(() => {
    // Wait for auth to load
    if (!loading) {
      if (!user) {
        redirect('/login');
      } else if (profile && profile.user_type !== 'farmer') {
        redirect('/dashboard');
      }
      
      // Load recent assessments from localStorage
      try {
        const stored = localStorage.getItem('cropAssessments');
        if (stored) {
          const assessments = JSON.parse(stored);
          setRecentAssessments(assessments);
        }
      } catch (error) {
        console.error('Error loading stored assessments:', error);
      }
      
      // Simulate data loading
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [user, profile, loading]);
  
  // Get health status based on disease probability
  const getHealthStatus = (diseases: Disease[]) => {
    if (diseases.length === 0) return { 
      status: 'healthy', 
      percentage: 100, 
      color: 'text-green-500', 
      bgColor: 'bg-green-500/10',
      icon: <CheckCircle2 className="h-4 w-4 text-green-500" />,
      label: 'Healthy'
    };
    
    // Calculate average health (inverse of disease probability)
    const avgHealth = diseases.reduce((sum, disease) => sum + (1 - disease.probability), 0) / diseases.length;
    const percentage = Math.round(avgHealth * 100);
    
    if (percentage >= 80) {
      return { 
        status: 'healthy', 
        percentage, 
        color: 'text-green-500', 
        bgColor: 'bg-green-500/10',
        icon: <CheckCircle2 className="h-4 w-4 text-green-500" />,
        label: 'Healthy'
      };
    } else if (percentage >= 60) {
      return { 
        status: 'warning', 
        percentage, 
        color: 'text-amber-500', 
        bgColor: 'bg-amber-500/10',
        icon: <AlertTriangle className="h-4 w-4 text-amber-500" />,
        label: 'Warning'
      };
    } else {
      return { 
        status: 'critical', 
        percentage, 
        color: 'text-red-500', 
        bgColor: 'bg-red-500/10',
        icon: <AlertCircle className="h-4 w-4 text-red-500" />,
        label: 'Critical'
      };
    }
  };
  
  // Get status message based on health
  const getStatusMessage = (diseases: Disease[], health: number) => {
    if (diseases.length === 0) return "No issues detected, plant is healthy";
    
    if (health >= 80) {
      return "Good condition, continue regular care";
    } else if (health >= 60) {
      return `Watch for: ${diseases.map(d => d.name).join(', ')}`;
    } else {
      return `Alert: ${diseases[0].name} detected - immediate action recommended`;
    }
  };
  
  // Format date to relative time
  const formatRelativeTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return 'just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
    } else {
      return date.toLocaleDateString();
    }
  };
  
  if (loading || isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array(4).fill(0).map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <Skeleton className="h-5 w-1/3" />
                <Skeleton className="h-8 w-8 rounded-md" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-1/2 mb-1" />
                <Skeleton className="h-4 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
          {Array(2).fill(0).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-1/3" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-[200px] w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Active Listings" 
          value="7" 
          description="Total active crop listings in marketplace"
          icon={<Wheat className="h-4 w-4" />}
          trend="up"
          trendValue="10% from last month"
        />
        <StatCard 
          title="Total Revenue" 
          value="₹42,500" 
          description="Total earned from crop sales"
          icon={<Coins className="h-4 w-4" />}
          trend="up"
          trendValue="8% from last month"
        />
        <StatCard 
          title="Avg. Price per kg" 
          value="₹34.75" 
          description="Average price per kg across all crops"
          icon={<Sprout className="h-4 w-4" />}
          trend="up"
          trendValue="2.5% from last week"
        />
        <StatCard 
          title="Total Sales" 
          value="1,250kg" 
          description="Total weight of crops sold"
          icon={<Tractor className="h-4 w-4" />}
          trend="neutral"
          trendValue="Similar to last month"
        />
      </div>
      
      <div className="grid gap-4 grid-cols-1 xl:grid-cols-2">
        <WeatherWidget />
        <MarketPricesWidget />
      </div>
      
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-3">
        <Card className="lg:col-span-1 overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="bg-green-500/10 p-2 rounded-full">
                  <Sprout className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <CardTitle>Crop Health Monitor</CardTitle>
                  <CardDescription>
                    Current health status of your crops
                  </CardDescription>
                </div>
              </div>
              <Button 
                onClick={() => router.push('/dashboard/farmer/assess')}
                size="sm"
                className="flex items-center gap-1"
              >
                <Leaf className="h-4 w-4" />
                Assess
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentAssessments.length > 0 ? (
                recentAssessments.slice(0, 4).map((assessment, index) => {
                  const health = getHealthStatus(assessment.diseases);
                  return (
                    <div 
                      key={index} 
                      className={`group relative rounded-lg border p-3 transition-all hover:shadow-md ${health.bgColor}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className={`mt-1 rounded-full p-1.5 ${health.bgColor}`}>
                            {health.icon}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">
                                {assessment.diseases.length > 0 
                                  ? assessment.diseases[0].name 
                                  : 'Healthy Plant'}
                              </span>
                              <Badge variant="outline" className={`${health.color} border-current`}>
                                {health.label}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                              <Clock className="h-3 w-3" />
                              <span>{formatRelativeTime(assessment.timestamp)}</span>
                            </div>
                          </div>
                        </div>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => router.push('/dashboard/farmer/assess')}
                              >
                                <ArrowRight className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>View details</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <div className="mt-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium">Health Score</span>
                          <span className={`text-xs font-medium ${health.color}`}>
                            {health.percentage}%
                          </span>
                        </div>
                        <Progress 
                          value={health.percentage} 
                          className={`h-2 ${health.status === 'critical' ? 'bg-red-100' : health.status === 'warning' ? 'bg-amber-100' : 'bg-green-100'}`}
                        />
                      </div>
                      <p className={`text-xs mt-2 ${health.status === 'critical' ? 'text-red-500 font-medium' : 'text-muted-foreground'}`}>
                        {getStatusMessage(assessment.diseases, health.percentage)}
                      </p>
                    </div>
                  );
                })
              ) : (
                <>
                  <div className="flex flex-col items-center justify-center py-4 text-center">
                    <div className="bg-muted rounded-full p-3 mb-3">
                      <Leaf className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground mb-2">No crop health assessments yet</p>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => router.push('/dashboard/farmer/assess')}
                      className="flex items-center gap-1"
                    >
                      <Leaf className="h-4 w-4" />
                      Assess your crops now
                    </Button>
                  </div>
                  
                  <div className="mt-6">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-medium">Preview</h3>
                      <Badge variant="outline" className="text-xs">Sample Data</Badge>
                    </div>
                    
                    {previewData.map((item, index) => (
                      <div 
                        key={index} 
                        className={`group relative rounded-lg border p-3 transition-all hover:shadow-md ${item.bgColor} mb-3`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <div className={`mt-1 rounded-full p-1.5 ${item.bgColor}`}>
                              {item.icon}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{item.name}</span>
                                <Badge variant="outline" className={`${item.color} border-current`}>
                                  {item.label}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                                <Clock className="h-3 w-3" />
                                <span>{formatRelativeTime(item.timestamp)}</span>
                              </div>
                            </div>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => router.push('/dashboard/farmer/assess')}
                          >
                            <ArrowRight className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="mt-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-medium">Health Score</span>
                            <span className={`text-xs font-medium ${item.color}`}>
                              {item.percentage}%
                            </span>
                          </div>
                          <Progress 
                            value={item.percentage} 
                            className={`h-2 ${item.status === 'critical' ? 'bg-red-100' : item.status === 'warning' ? 'bg-amber-100' : 'bg-green-100'}`}
                          />
                        </div>
                        <p className={`text-xs mt-2 ${item.status === 'critical' ? 'text-red-500 font-medium' : 'text-muted-foreground'}`}>
                          {item.message}
                        </p>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card className="lg:col-span-2">
          <CardHeader className="pb-0">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-500" />
              Activity Calendar
            </CardTitle>
            <CardDescription>
              Your upcoming farming activities and events
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="upcoming">
              <TabsList className="w-full">
                <TabsTrigger value="upcoming" className="flex-1">Upcoming</TabsTrigger>
                <TabsTrigger value="past" className="flex-1">Past</TabsTrigger>
              </TabsList>
              <TabsContent value="upcoming" className="pt-4">
                <div className="space-y-4">
                  <div className="flex items-start gap-3 pb-4 border-b">
                    <div className="bg-primary/10 p-2 rounded-md text-primary">
                      <CloudSun className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium">Apply fertilizer to Field A</h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        Tomorrow, 6:00 AM - 9:00 AM
                      </p>
                      <div className="text-xs mt-2 text-green-600">
                        Weather forecast: Clear skies, ideal conditions
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 pb-4 border-b">
                    <div className="bg-primary/10 p-2 rounded-md text-primary">
                      <Tractor className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium">Harvest Corn (Field C)</h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        Mar 15, 2024, 7:00 AM - 5:00 PM
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">Ready for harvest</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 pb-4 border-b">
                    <div className="bg-primary/10 p-2 rounded-md text-primary">
                      <Sprout className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium">Start planting for next season (Field B)</h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        Mar 20, 2024, 6:00 AM - 4:00 PM
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">Seeds ready</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="bg-primary/10 p-2 rounded-md text-primary">
                      <BarChart className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium">Local Farmers Market</h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        Mar 25, 2024, 8:00 AM - 2:00 PM
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">Opportunity to sell direct</span>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="past" className="pt-4">
                <div className="space-y-4">
                  <div className="flex items-start gap-3 pb-4 border-b">
                    <div className="bg-muted p-2 rounded-md text-muted-foreground">
                      <Wheat className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium">Field A irrigation</h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        Mar 5, 2024, 6:00 AM - 10:00 AM
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">Completed</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 pb-4 border-b">
                    <div className="bg-muted p-2 rounded-md text-muted-foreground">
                      <Tractor className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium">Tomato greenhouse maintenance</h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        Mar 2, 2024, 9:00 AM - 11:00 AM
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">Completed</span>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
      
      <div className="h-[600px]">
        <GeminiChat />
      </div>
    </div>
  );
} 