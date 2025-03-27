import { Chatbot } from "@/components/ai/chatbot";
import { Toaster } from "@/components/ui/toaster";

export default function ChatbotPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">AI Farming Assistant</h1>
        <p className="text-muted-foreground mb-8">
          Get instant farming advice, crop recommendations, and weather-based guidance from our AI assistant.
        </p>
        <Chatbot />
      </div>
      <Toaster />
    </div>
  );
}