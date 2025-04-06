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
  ArrowRight,
  Plus,
  X
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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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

interface Task {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  duration: string;
  type: 'upcoming' | 'past';
  status: string;
  icon: string;
}

export default function FarmerDashboard() {
  const { user, profile, loading } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [recentAssessments, setRecentAssessments] = useState<AssessmentResult[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    duration: '',
    type: 'upcoming',
    status: 'Pending',
    icon: 'CloudSun'
  });
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);
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
      
      // Load tasks from localStorage
      try {
        const storedTasks = localStorage.getItem('farmerTasks');
        if (storedTasks) {
          const parsedTasks = JSON.parse(storedTasks);
          setTasks(parsedTasks);
        } else {
          // Initialize with sample tasks if none exist
          const sampleTasks: Task[] = [
            {
              id: '1',
              title: 'Apply fertilizer to Field A',
              description: 'Apply NPK fertilizer to the wheat field',
              date: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(), // Tomorrow
              time: '06:00',
              duration: '3 hours',
              type: 'upcoming' as const,
              status: 'Clear skies, ideal conditions',
              icon: 'CloudSun'
            },
            {
              id: '2',
              title: 'Irrigate the corn field',
              description: 'Set up sprinklers for the corn field',
              date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2).toISOString(), // Day after tomorrow
              time: '08:00',
              duration: '2 hours',
              type: 'upcoming' as const,
              status: 'Moderate rainfall expected',
              icon: 'CloudRain'
            },
            {
              id: '3',
              title: 'Harvest wheat from Field B',
              description: 'Complete the wheat harvest in Field B',
              date: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // Yesterday
              time: '10:00',
              duration: '6 hours',
              type: 'past' as const,
              status: 'Completed',
              icon: 'Wheat'
            }
          ];
          setTasks(sampleTasks);
          localStorage.setItem('farmerTasks', JSON.stringify(sampleTasks));
        }
      } catch (error) {
        console.error('Error loading stored tasks:', error);
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
  
  // Format date for input field
  const formatDateForInput = (date: Date) => {
    return date.toISOString().split('T')[0];
  };
  
  // Handle adding a new task
  const handleAddTask = () => {
    if (!newTask.title || !newTask.date || !newTask.time) {
      return;
    }
    
    const task: Task = {
      id: Date.now().toString(),
      title: newTask.title,
      description: newTask.description,
      date: new Date(newTask.date).toISOString(),
      time: newTask.time,
      duration: newTask.duration,
      type: newTask.type as 'upcoming' | 'past',
      status: newTask.status,
      icon: newTask.icon
    };
    
    const updatedTasks = [...tasks, task];
    setTasks(updatedTasks);
    
    // Save to localStorage
    try {
      localStorage.setItem('farmerTasks', JSON.stringify(updatedTasks));
    } catch (error) {
      console.error('Error saving tasks to localStorage:', error);
    }
    
    setIsAddTaskOpen(false);
    
    // Reset form
    setNewTask({
      title: '',
      description: '',
      date: '',
      time: '',
      duration: '',
      type: 'upcoming',
      status: 'Pending',
      icon: 'CloudSun'
    });
  };
  
  // Get icon component based on icon name
  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'CloudSun':
        return <CloudSun className="h-5 w-5" />;
      case 'Tractor':
        return <Tractor className="h-5 w-5" />;
      case 'Sprout':
        return <Sprout className="h-5 w-5" />;
      case 'BarChart':
        return <BarChart className="h-5 w-5" />;
      case 'Wheat':
        return <Wheat className="h-5 w-5" />;
      default:
        return <CloudSun className="h-5 w-5" />;
    }
  };
  
  // Handle marking a task as complete
  const handleCompleteTask = (taskId: string) => {
    const updatedTasks = tasks.map(task => {
      if (task.id === taskId) {
        return {
          ...task,
          type: 'past' as const,
          status: 'Completed'
        };
      }
      return task;
    });
    
    setTasks(updatedTasks);
    
    // Save to localStorage
    try {
      localStorage.setItem('farmerTasks', JSON.stringify(updatedTasks));
    } catch (error) {
      console.error('Error saving tasks to localStorage:', error);
    }
  };
  
  // Handle deleting a task
  const handleDeleteTask = (taskId: string) => {
    setTaskToDelete(taskId);
    setIsDeleteConfirmOpen(true);
  };
  
  // Confirm task deletion
  const confirmDeleteTask = () => {
    if (taskToDelete) {
      const updatedTasks = tasks.filter(task => task.id !== taskToDelete);
      setTasks(updatedTasks);
      
      // Save to localStorage
      try {
        localStorage.setItem('farmerTasks', JSON.stringify(updatedTasks));
      } catch (error) {
        console.error('Error saving tasks to localStorage:', error);
      }
      
      setIsDeleteConfirmOpen(false);
      setTaskToDelete(null);
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
      {/* First Row: Full Width Statistics */}
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
      
      {/* Second Row: Weather and Crop Health - Two Halves */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
        {/* Weather Widget */}
        <Card className="h-full">
          <CardHeader>
            <CardTitle>Weather Information</CardTitle>
            <CardDescription>Current weather and forecast for your region</CardDescription>
          </CardHeader>
          <CardContent>
        <WeatherWidget />
          </CardContent>
        </Card>
      
        {/* Crop Health Monitor */}
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sprout className="h-5 w-5 text-green-600" />
              Crop Health Monitor
            </CardTitle>
            <CardDescription>
              Current health status of your crops
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-end mb-4">
              <Button 
                onClick={() => router.push('/dashboard/farmer/assess')}
                size="sm"
                className="flex items-center gap-1"
              >
                <Leaf className="h-4 w-4" />
                Assess
              </Button>
            </div>
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
      </div>
      
      {/* Third Row: Market Prices + Calendar and AI Assistant */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
        {/* First Half: Market Prices and Calendar Stacked */}
        <div className="space-y-4">
          {/* Market Prices */}
          <Card>
            <CardHeader>
              <CardTitle>Market Prices</CardTitle>
              <CardDescription>Current market prices for your crops</CardDescription>
            </CardHeader>
            <CardContent>
              <MarketPricesWidget />
            </CardContent>
          </Card>
          
          {/* Activity Calendar */}
          <Card className="lg:col-span-2">
            <CardHeader className="pb-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-blue-500" />
                  <div>
                    <CardTitle>Activity Calendar</CardTitle>
                    <CardDescription>
                      Your upcoming farming activities and events
                    </CardDescription>
                  </div>
                </div>
                <Dialog open={isAddTaskOpen} onOpenChange={setIsAddTaskOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="flex items-center gap-1">
                      <Plus className="h-4 w-4" />
                      Add Task
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle>Add New Task</DialogTitle>
                      <DialogDescription>
                        Create a new farming activity or event
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="title" className="text-right">
                          Title
                        </Label>
                        <Input
                          id="title"
                          value={newTask.title}
                          onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                          className="col-span-3"
                          placeholder="Task title"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="description" className="text-right">
                          Description
                        </Label>
                        <Textarea
                          id="description"
                          value={newTask.description}
                          onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                          className="col-span-3"
                          placeholder="Task description"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="date" className="text-right">
                          Date
                        </Label>
                        <Input
                          id="date"
                          type="date"
                          value={newTask.date}
                          onChange={(e) => setNewTask({...newTask, date: e.target.value})}
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="time" className="text-right">
                          Time
                        </Label>
                        <Input
                          id="time"
                          type="time"
                          value={newTask.time}
                          onChange={(e) => setNewTask({...newTask, time: e.target.value})}
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="duration" className="text-right">
                          Duration
                        </Label>
                        <Input
                          id="duration"
                          value={newTask.duration}
                          onChange={(e) => setNewTask({...newTask, duration: e.target.value})}
                          className="col-span-3"
                          placeholder="e.g. 2 hours"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="icon" className="text-right">
                          Icon
                        </Label>
                        <Select 
                          value={newTask.icon} 
                          onValueChange={(value) => setNewTask({...newTask, icon: value})}
                        >
                          <SelectTrigger className="col-span-3">
                            <SelectValue placeholder="Select an icon" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="CloudSun">Weather</SelectItem>
                            <SelectItem value="Tractor">Tractor</SelectItem>
                            <SelectItem value="Sprout">Planting</SelectItem>
                            <SelectItem value="BarChart">Market</SelectItem>
                            <SelectItem value="Wheat">Harvest</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="status" className="text-right">
                          Status
                        </Label>
                        <Input
                          id="status"
                          value={newTask.status}
                          onChange={(e) => setNewTask({...newTask, status: e.target.value})}
                          className="col-span-3"
                          placeholder="Task status"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsAddTaskOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleAddTask}>Add Task</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="upcoming">
                <TabsList className="w-full">
                  <TabsTrigger value="upcoming" className="flex-1">Upcoming</TabsTrigger>
                  <TabsTrigger value="past" className="flex-1">Past</TabsTrigger>
                </TabsList>
                <TabsContent value="upcoming" className="pt-4">
                  <div className="space-y-4">
                    {tasks.filter(task => task.type === 'upcoming').map((task, index) => (
                      <div key={task.id} className="flex items-start gap-3 pb-4 border-b group">
                        <div className="bg-primary/10 p-2 rounded-md text-primary">
                          {getIconComponent(task.icon)}
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm font-medium">{task.title}</h4>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(task.date).toLocaleDateString()}, {task.time} - {task.duration}
                          </p>
                          <div className="text-xs mt-2 text-green-600">
                            {task.status}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                                  onClick={() => handleCompleteTask(task.id)}
                                >
                                  <CheckCircle2 className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Mark as complete</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                                  onClick={() => handleDeleteTask(task.id)}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Delete task</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
                <TabsContent value="past" className="pt-4">
                  <div className="space-y-4">
                    {tasks.filter(task => task.type === 'past').map((task, index) => (
                      <div key={task.id} className="flex items-start gap-3 pb-4 border-b group">
                        <div className="bg-muted p-2 rounded-md text-muted-foreground">
                          {getIconComponent(task.icon)}
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm font-medium">{task.title}</h4>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(task.date).toLocaleDateString()}, {task.time} - {task.duration}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">{task.status}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                                  onClick={() => handleDeleteTask(task.id)}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Delete task</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
        
        {/* Second Half: AI Assistant */}
        <Card className="h-full flex flex-col">
          <CardHeader>
            <CardTitle>AI Farming Assistant</CardTitle>
            <CardDescription>Get personalized farming advice and insights</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 overflow-auto">
            <div className="h-[950px] overflow-auto">
              <GeminiChat />
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Task</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this task? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteConfirmOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDeleteTask}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 