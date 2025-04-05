'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Leaf, 
  Calendar, 
  BarChart, 
  Wheat, 
  Sprout, 
  Tractor, 
  CloudSun, 
  CloudRain, 
  CheckCircle2, 
  AlertTriangle, 
  AlertCircle,
  ArrowRight,
  Camera,
  MessageSquare,
  ShoppingCart,
  User,
  Settings,
  LogOut
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

interface Feature {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  path: string;
  category: 'crop' | 'market' | 'weather' | 'ai' | 'account';
  status: 'available' | 'coming-soon';
}

export default function FeaturesPage() {
  const router = useRouter();
  const { user, profile, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState('all');

  const features: Feature[] = [
    {
      id: 'crop-health',
      title: 'Crop Health Assessment',
      description: 'Upload images of your crops to get AI-powered health assessments and treatment recommendations.',
      icon: <Leaf className="h-6 w-6" />,
      path: '/dashboard/farmer/assess',
      category: 'crop',
      status: 'available'
    },
    {
      id: 'crop-monitor',
      title: 'Crop Health Monitor',
      description: 'Track the health status of your crops over time with visual indicators and detailed reports.',
      icon: <CheckCircle2 className="h-6 w-6" />,
      path: '/dashboard/farmer',
      category: 'crop',
      status: 'available'
    },
    {
      id: 'activity-calendar',
      title: 'Activity Calendar',
      description: 'Plan and manage your farming activities with a customizable calendar and task management system.',
      icon: <Calendar className="h-6 w-6" />,
      path: '/dashboard/farmer',
      category: 'crop',
      status: 'available'
    },
    {
      id: 'market-prices',
      title: 'Market Prices',
      description: 'Stay updated with real-time market prices for various crops to make informed selling decisions.',
      icon: <BarChart className="h-6 w-6" />,
      path: '/dashboard/farmer',
      category: 'market',
      status: 'available'
    },
    {
      id: 'marketplace',
      title: 'Crop Marketplace',
      description: 'Buy and sell crops directly with other farmers through our secure marketplace platform.',
      icon: <ShoppingCart className="h-6 w-6" />,
      path: '/marketplace',
      category: 'market',
      status: 'coming-soon'
    },
    {
      id: 'weather-forecast',
      title: 'Weather Forecast',
      description: 'Get accurate weather forecasts tailored for farming activities to plan your work accordingly.',
      icon: <CloudSun className="h-6 w-6" />,
      path: '/dashboard/farmer',
      category: 'weather',
      status: 'available'
    },
    {
      id: 'ai-assistant',
      title: 'AI Farming Assistant',
      description: 'Get personalized farming advice and answers to your questions from our AI assistant.',
      icon: <MessageSquare className="h-6 w-6" />,
      path: '/dashboard/farmer',
      category: 'ai',
      status: 'available'
    },
    {
      id: 'crop-recommendations',
      title: 'Crop Recommendations',
      description: 'Receive AI-powered recommendations for the best crops to plant based on your soil and climate.',
      icon: <Sprout className="h-6 w-6" />,
      path: '/dashboard/farmer',
      category: 'ai',
      status: 'coming-soon'
    },
    {
      id: 'profile',
      title: 'Farmer Profile',
      description: 'Manage your personal information, farm details, and account settings.',
      icon: <User className="h-6 w-6" />,
      path: '/dashboard/farmer/profile',
      category: 'account',
      status: 'available'
    }
  ];

  const filteredFeatures = activeTab === 'all' 
    ? features 
    : features.filter(feature => feature.category === activeTab);

  const handleFeatureClick = (path: string) => {
    if (user) {
      router.push(path);
    } else {
      router.push('/login');
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Features</h1>
          <p className="text-muted-foreground mt-2">
            Explore all the tools and features available to help you manage your farm efficiently
          </p>
        </div>
        <div className="flex items-center gap-4 mt-4 md:mt-0">
          {user ? (
            <>
              <Button variant="outline" onClick={() => router.push('/dashboard')}>
                Dashboard
              </Button>
              <Button variant="outline" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => router.push('/login')}>
                Sign In
              </Button>
              <Button onClick={() => router.push('/register')}>
                Register
              </Button>
            </>
          )}
        </div>
      </div>

      <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="all">All Features</TabsTrigger>
          <TabsTrigger value="crop">Crop Management</TabsTrigger>
          <TabsTrigger value="market">Marketplace</TabsTrigger>
          <TabsTrigger value="weather">Weather</TabsTrigger>
          <TabsTrigger value="ai">AI Tools</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFeatures.map((feature) => (
              <FeatureCard 
                key={feature.id} 
                feature={feature} 
                onClick={() => handleFeatureClick(feature.path)} 
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="crop" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFeatures.map((feature) => (
              <FeatureCard 
                key={feature.id} 
                feature={feature} 
                onClick={() => handleFeatureClick(feature.path)} 
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="market" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFeatures.map((feature) => (
              <FeatureCard 
                key={feature.id} 
                feature={feature} 
                onClick={() => handleFeatureClick(feature.path)} 
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="weather" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFeatures.map((feature) => (
              <FeatureCard 
                key={feature.id} 
                feature={feature} 
                onClick={() => handleFeatureClick(feature.path)} 
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="ai" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFeatures.map((feature) => (
              <FeatureCard 
                key={feature.id} 
                feature={feature} 
                onClick={() => handleFeatureClick(feature.path)} 
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="account" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFeatures.map((feature) => (
              <FeatureCard 
                key={feature.id} 
                feature={feature} 
                onClick={() => handleFeatureClick(feature.path)} 
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface FeatureCardProps {
  feature: Feature;
  onClick: () => void;
}

function FeatureCard({ feature, onClick }: FeatureCardProps) {
  return (
    <Card className="overflow-hidden transition-all hover:shadow-md cursor-pointer" onClick={onClick}>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-md ${
            feature.category === 'crop' ? 'bg-green-100 text-green-600' :
            feature.category === 'market' ? 'bg-blue-100 text-blue-600' :
            feature.category === 'weather' ? 'bg-sky-100 text-sky-600' :
            feature.category === 'ai' ? 'bg-purple-100 text-purple-600' :
            'bg-gray-100 text-gray-600'
          }`}>
            {feature.icon}
          </div>
          <div>
            <CardTitle className="text-lg">{feature.title}</CardTitle>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className={
                feature.category === 'crop' ? 'border-green-200 text-green-700 bg-green-50' :
                feature.category === 'market' ? 'border-blue-200 text-blue-700 bg-blue-50' :
                feature.category === 'weather' ? 'border-sky-200 text-sky-700 bg-sky-50' :
                feature.category === 'ai' ? 'border-purple-200 text-purple-700 bg-purple-50' :
                'border-gray-200 text-gray-700 bg-gray-50'
              }>
                {feature.category === 'crop' ? 'Crop Management' :
                 feature.category === 'market' ? 'Marketplace' :
                 feature.category === 'weather' ? 'Weather' :
                 feature.category === 'ai' ? 'AI Tools' :
                 'Account'}
              </Badge>
              {feature.status === 'coming-soon' && (
                <Badge variant="outline" className="border-amber-200 text-amber-700 bg-amber-50">
                  Coming Soon
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{feature.description}</p>
      </CardContent>
      <CardFooter className="pt-0">
        <Button 
          variant="ghost" 
          className="ml-auto flex items-center gap-1"
          disabled={feature.status === 'coming-soon'}
        >
          {feature.status === 'coming-soon' ? 'Coming Soon' : 'Access Feature'}
          <ArrowRight className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
} 