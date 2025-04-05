'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { 
  Card, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Wheat, ThumbsUp, ThumbsDown, Leaf, ShoppingCart, BarChart4 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { 
  generateFarmingRecommendation, 
  generateDiseaseDiagnosis,
  generateMarketInsights,
  farmingChatbotResponse
} from '@/lib/gemini';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ReactMarkdown from 'react-markdown';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
};

type SuggestionCategory = 'farming' | 'market' | 'disease' | 'general';

type Suggestion = {
  text: string;
  category: SuggestionCategory;
  icon: React.ReactNode;
};

export function GeminiChat() {
  const { user, profile } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('chat');
  const [recommendationPrompt, setRecommendationPrompt] = useState('');
  const [recommendation, setRecommendation] = useState('');
  const [marketQuery, setMarketQuery] = useState('');
  const [marketInsight, setMarketInsight] = useState('');
  const [diseasePrompt, setDiseasePrompt] = useState('');
  const [diagnosisResult, setDiagnosisResult] = useState('');
  const [selectedCrop, setSelectedCrop] = useState<string>('Generic crop');
  const [systemError, setSystemError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Welcome message when component mounts
  useEffect(() => {
    if (messages.length === 0) {
      const userType = profile?.user_type || 'user';
      const welcomeMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: `👋 Hello${user?.email ? ' ' + user.email.split('@')[0] : ''}! I'm your AgriGenie AI assistant. As a ${userType}, I can help you with farming advice, market insights, crop disease diagnosis, and more. How can I assist you today?`,
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
    }
  }, [user, profile, messages.length]);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Generate a list of suggested questions based on user type
  const getSuggestions = (): Suggestion[] => {
    const userType = profile?.user_type || 'user';
    
    const commonSuggestions: Suggestion[] = [
      { 
        text: 'What crops grow best in hot and dry climate?', 
        category: 'farming',
        icon: <Wheat className="h-4 w-4" />
      },
      { 
        text: 'How to identify common tomato diseases?', 
        category: 'disease',
        icon: <Leaf className="h-4 w-4" />
      },
    ];
    
    const farmerSuggestions: Suggestion[] = [
      { 
        text: 'What is the market outlook for rice this season?', 
        category: 'market',
        icon: <BarChart4 className="h-4 w-4" />
      },
      { 
        text: 'How can I improve soil fertility naturally?', 
        category: 'farming',
        icon: <Wheat className="h-4 w-4" />
      },
    ];
    
    const buyerSuggestions: Suggestion[] = [
      { 
        text: 'What factors affect crop prices?', 
        category: 'market',
        icon: <ShoppingCart className="h-4 w-4" />
      },
      { 
        text: 'How to identify quality produce when buying?', 
        category: 'general',
        icon: <ShoppingCart className="h-4 w-4" />
      },
    ];
    
    return [
      ...commonSuggestions,
      ...(userType === 'farmer' ? farmerSuggestions : []),
      ...(userType === 'buyer' ? buyerSuggestions : []),
    ];
  };

  // Convert Message[] to the format expected by the Gemini API
  const formatMessagesForGemini = () => {
    // Skip the first message (welcome message)
    // Start with a minimal history to avoid token limits
    const messageHistory = messages.slice(Math.max(0, messages.length - 5));
    
    return messageHistory.map(msg => ({
      role: msg.role === 'user' ? 'user' as const : 'bot' as const,
      content: msg.content 
    }));
  };

  // Handle sending a new message
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!input.trim()) return;
    
    // Create user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };
    
    // Add user message to chat
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setSystemError(null);
    
    try {
      // Format messages for Gemini API
      const chatHistory = formatMessagesForGemini();
      
      // If this is the first user message after welcome, we need special handling
      const isFirstUserMessage = messages.length === 1 && messages[0].role === 'assistant';
      
      // For the first message, we don't pass the welcome message as history
      const responseText = await farmingChatbotResponse(
        input,
        isFirstUserMessage ? [] : chatHistory
      );
      
      // Create AI response message
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: responseText,
        timestamp: new Date(),
      };
      
      // Add AI response to chat
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error generating response:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      setSystemError(`Failed to get response: ${errorMessage}`);
      
      toast({
        title: 'Error',
        description: 'Failed to get a response. Please try again.',
        variant: 'destructive',
      });
      
      const errorAssistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'I apologize, but I encountered an error processing your request. Please try again.',
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, errorAssistantMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: Suggestion) => {
    setInput(suggestion.text);
    // Automatically send the suggestion after a short delay
    setTimeout(() => handleSendMessage(), 100);
  };

  // Handle generating farming recommendations
  const handleGenerateRecommendation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recommendationPrompt.trim()) return;
    
    setIsLoading(true);
    setSystemError(null);
    
    try {
      const response = await generateFarmingRecommendation(
        recommendationPrompt,
        "India", // Location
        "Sandy loam", // Default soil type
        { temp: 30, humidity: 60 } // Sample weather data
      );
      setRecommendation(response);
    } catch (error) {
      console.error('Error generating recommendation:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setSystemError(`Failed to generate recommendation: ${errorMessage}`);
      
      toast({
        title: 'Error',
        description: 'Failed to generate recommendation. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle generating market insights
  const handleGenerateMarketInsight = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!marketQuery.trim()) return;
    
    setIsLoading(true);
    setSystemError(null);
    
    try {
      const response = await generateMarketInsights(
        marketQuery,
        { lastMonth: 40, lastWeek: 42 }, // Sample historical data
        { demand: "high", supply: "medium" } // Sample market trends
      );
      
      setMarketInsight(response);
    } catch (error) {
      console.error('Error generating market insight:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setSystemError(`Failed to generate market insight: ${errorMessage}`);
      
      toast({
        title: 'Error',
        description: 'Failed to generate market insight. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle generating disease diagnosis
  const handleGenerateDiagnosis = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!diseasePrompt.trim()) return;
    
    setIsLoading(true);
    setSystemError(null);
    
    try {
      const response = await generateDiseaseDiagnosis(
        selectedCrop, // Use selected crop instead of hardcoded value
        diseasePrompt // Symptoms
      );
      
      setDiagnosisResult(response);
    } catch (error) {
      console.error('Error generating diagnosis:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setSystemError(`Failed to generate diagnosis: ${errorMessage}`);
      
      toast({
        title: 'Error',
        description: 'Failed to generate diagnosis. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full h-full flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="bg-green-100 p-1 rounded-md">
            <Wheat className="h-5 w-5 text-green-700" />
          </span>
          AgriGenie AI Assistant
        </CardTitle>
        <CardDescription>
          Your personal AI assistant for farming advice, market insights, and more
        </CardDescription>
      </CardHeader>
      
      {systemError && (
        <div className="mx-6 mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-800 text-sm">
          <p className="font-medium">System Error</p>
          <p>{systemError}</p>
          <p className="text-xs mt-1">Please check your API key configuration or try again later.</p>
        </div>
      )}
      
      <Tabs defaultValue="chat" value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="mx-6">
          <TabsTrigger value="chat" className="flex-1">Chat</TabsTrigger>
          <TabsTrigger value="farming" className="flex-1">Farming Advice</TabsTrigger>
          <TabsTrigger value="market" className="flex-1">Market Insights</TabsTrigger>
          <TabsTrigger value="disease" className="flex-1">Disease Diagnosis</TabsTrigger>
        </TabsList>
        
        {/* Chat Tab */}
        <TabsContent value="chat" className="flex-1 flex flex-col px-6 data-[state=active]:flex-1">
          <ScrollArea className="flex-1">
            <div className="space-y-4 p-2">
              {messages.map((message) => (
                <div 
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex gap-2 max-w-[80%] ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <Avatar className={message.role === 'user' ? 'bg-primary' : 'bg-green-600'}>
                      <AvatarFallback>
                        {message.role === 'user' ? user?.email?.charAt(0).toUpperCase() || 'U' : 'AI'}
                      </AvatarFallback>
                    </Avatar>
                    <div 
                      className={`p-3 rounded-lg ${
                        message.role === 'user' 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        <ReactMarkdown>{message.content}</ReactMarkdown>
                      </div>
                      <div className="text-xs mt-1 opacity-70">
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex gap-2 max-w-[80%]">
                    <Avatar className="bg-green-600">
                      <AvatarFallback>AI</AvatarFallback>
                    </Avatar>
                    <div className="p-3 rounded-lg bg-muted">
                      <Skeleton className="h-4 w-[200px] mb-2" />
                      <Skeleton className="h-4 w-[170px] mb-2" />
                      <Skeleton className="h-4 w-[130px]" />
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
          
          {/* Suggestions */}
          {messages.length < 3 && (
            <div className="p-2 mt-2">
              <p className="text-sm text-muted-foreground mb-2">Suggested questions:</p>
              <div className="flex flex-wrap gap-2">
                {getSuggestions().map((suggestion, index) => (
                  <Button 
                    key={index} 
                    variant="outline" 
                    size="sm" 
                    className="h-auto py-1 px-2 text-xs"
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    {suggestion.icon}
                    <span className="ml-1">{suggestion.text}</span>
                  </Button>
                ))}
              </div>
            </div>
          )}
          
          <form onSubmit={handleSendMessage} className="mt-4">
            <div className="flex gap-2">
              <Input
                placeholder="Ask me anything about farming, crops, or market trends..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isLoading}
                className="flex-1"
              />
              <Button type="submit" disabled={isLoading || !input.trim()}>
                Send
              </Button>
            </div>
          </form>
        </TabsContent>
        
        {/* Farming Advice Tab */}
        <TabsContent value="farming" className="px-6 data-[state=active]:flex-1 flex flex-col">
          <ScrollArea className="flex-1">
            <div className="space-y-4 p-2">
              <div className="bg-muted p-4 rounded-lg">
                <h3 className="font-medium flex items-center gap-2 mb-2">
                  <Wheat className="h-5 w-5 text-green-600" />
                  Farming Recommendations
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Get personalized recommendations for crop selection, farming techniques, and more.
                </p>
                
                <form onSubmit={handleGenerateRecommendation} className="space-y-3">
                  <div>
                    <label htmlFor="recommendation-prompt" className="text-sm font-medium">
                      What would you like advice on?
                    </label>
                    <Input
                      id="recommendation-prompt"
                      placeholder="E.g., Best crops for sandy soil in hot climate"
                      value={recommendationPrompt}
                      onChange={(e) => setRecommendationPrompt(e.target.value)}
                      disabled={isLoading}
                      className="mt-1"
                    />
                  </div>
                  
                  <Button type="submit" disabled={isLoading || !recommendationPrompt.trim()}>
                    {isLoading ? 'Generating...' : 'Get Recommendation'}
                  </Button>
                </form>
              </div>
              
              {recommendation && (
                <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Leaf className="h-4 w-4 text-green-600" />
                    Recommendation
                  </h4>
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <ReactMarkdown>{recommendation}</ReactMarkdown>
                  </div>
                  
                  <div className="mt-3 flex gap-2">
                    <Button size="sm" variant="outline" className="h-8">
                      <ThumbsUp className="h-4 w-4 mr-1" />
                      Helpful
                    </Button>
                    <Button size="sm" variant="outline" className="h-8">
                      <ThumbsDown className="h-4 w-4 mr-1" />
                      Not helpful
                    </Button>
                  </div>
                </div>
              )}
              
              {isLoading && !recommendation && (
                <div className="bg-muted p-4 rounded-lg">
                  <Skeleton className="h-4 w-[200px] mb-2" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-[70%]" />
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>
        
        {/* Market Insights Tab */}
        <TabsContent value="market" className="px-6 data-[state=active]:flex-1 flex flex-col">
          <ScrollArea className="flex-1">
            <div className="space-y-4 p-2">
              <div className="bg-muted p-4 rounded-lg">
                <h3 className="font-medium flex items-center gap-2 mb-2">
                  <BarChart4 className="h-5 w-5 text-blue-600" />
                  Market Insights
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Get AI-generated insights on agricultural markets, price trends, and demand forecasts.
                </p>
                
                <form onSubmit={handleGenerateMarketInsight} className="space-y-3">
                  <div>
                    <label htmlFor="market-query" className="text-sm font-medium">
                      What market information are you looking for?
                    </label>
                    <Input
                      id="market-query"
                      placeholder="E.g., Rice market trends in India for 2023"
                      value={marketQuery}
                      onChange={(e) => setMarketQuery(e.target.value)}
                      disabled={isLoading}
                      className="mt-1"
                    />
                  </div>
                  
                  <Button type="submit" disabled={isLoading || !marketQuery.trim()}>
                    {isLoading ? 'Analyzing...' : 'Get Market Insight'}
                  </Button>
                </form>
              </div>
              
              {marketInsight && (
                <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <BarChart4 className="h-4 w-4 text-blue-600" />
                    Market Analysis
                  </h4>
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <ReactMarkdown>{marketInsight}</ReactMarkdown>
                  </div>
                  
                  <div className="mt-3 flex gap-2">
                    <Button size="sm" variant="outline" className="h-8">
                      <ThumbsUp className="h-4 w-4 mr-1" />
                      Helpful
                    </Button>
                    <Button size="sm" variant="outline" className="h-8">
                      <ThumbsDown className="h-4 w-4 mr-1" />
                      Not helpful
                    </Button>
                  </div>
                </div>
              )}
              
              {isLoading && !marketInsight && (
                <div className="bg-muted p-4 rounded-lg">
                  <Skeleton className="h-4 w-[200px] mb-2" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-[70%]" />
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>
        
        {/* Disease Diagnosis Tab */}
        <TabsContent value="disease" className="px-6 data-[state=active]:flex-1 flex flex-col">
          <ScrollArea className="flex-1">
            <div className="space-y-4 p-2">
              <div className="bg-muted p-4 rounded-lg">
                <h3 className="font-medium flex items-center gap-2 mb-2">
                  <Leaf className="h-5 w-5 text-red-600" />
                  Crop Disease Diagnosis
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Describe symptoms to get potential disease identification and treatment options.
                </p>
                
                <form onSubmit={handleGenerateDiagnosis} className="space-y-3">
                  <div>
                    <label htmlFor="crop-select" className="text-sm font-medium block mb-1">
                      Select crop
                    </label>
                    <Select value={selectedCrop} onValueChange={setSelectedCrop}>
                      <SelectTrigger id="crop-select">
                        <SelectValue placeholder="Select a crop" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Rice">Rice</SelectItem>
                        <SelectItem value="Wheat">Wheat</SelectItem>
                        <SelectItem value="Cotton">Cotton</SelectItem>
                        <SelectItem value="Sugarcane">Sugarcane</SelectItem>
                        <SelectItem value="Tomato">Tomato</SelectItem>
                        <SelectItem value="Potato">Potato</SelectItem>
                        <SelectItem value="Corn">Corn</SelectItem>
                        <SelectItem value="Generic crop">Other/Unknown</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label htmlFor="disease-prompt" className="text-sm font-medium">
                      Describe the symptoms or problem
                    </label>
                    <Input
                      id="disease-prompt"
                      placeholder="E.g., Yellow spots on leaves and wilting"
                      value={diseasePrompt}
                      onChange={(e) => setDiseasePrompt(e.target.value)}
                      disabled={isLoading}
                      className="mt-1"
                    />
                  </div>
                  
                  <Button type="submit" disabled={isLoading || !diseasePrompt.trim()}>
                    {isLoading ? 'Diagnosing...' : 'Get Diagnosis'}
                  </Button>
                </form>
              </div>
              
              {diagnosisResult && (
                <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Leaf className="h-4 w-4 text-red-600" />
                    Diagnosis Result
                  </h4>
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <ReactMarkdown>{diagnosisResult}</ReactMarkdown>
                  </div>
                  
                  <div className="mt-3 flex gap-2">
                    <Button size="sm" variant="outline" className="h-8">
                      <ThumbsUp className="h-4 w-4 mr-1" />
                      Helpful
                    </Button>
                    <Button size="sm" variant="outline" className="h-8">
                      <ThumbsDown className="h-4 w-4 mr-1" />
                      Not helpful
                    </Button>
                  </div>
                </div>
              )}
              
              {isLoading && !diagnosisResult && (
                <div className="bg-muted p-4 rounded-lg">
                  <Skeleton className="h-4 w-[200px] mb-2" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-[70%]" />
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
      
      <CardFooter className="flex justify-between text-xs text-muted-foreground border-t pt-3">
        <div>
          Powered by Gemini AI
        </div>
        <div>
          {profile?.user_type === 'farmer' ? (
            <Badge variant="outline" className="bg-green-50">Farmer View</Badge>
          ) : profile?.user_type === 'buyer' ? (
            <Badge variant="outline" className="bg-blue-50">Buyer View</Badge>
          ) : (
            <Badge variant="outline">Guest View</Badge>
          )}
        </div>
      </CardFooter>
    </Card>
  );
} 