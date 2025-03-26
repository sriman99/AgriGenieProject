'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.push('/dashboard');
      } else {
        router.push('/auth');
      }
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center p-4 bg-gradient-to-b from-green-50 to-green-100">
        <Card>
          <CardContent className="p-8">
            <div className="flex flex-col items-center space-y-4">
              <div className="text-2xl font-bold text-green-800">AgriGenie</div>
              <div className="text-sm text-gray-500">Loading...</div>
            </div>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-to-b from-green-50 to-green-100">
      <div className="text-center space-y-6 max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold text-green-800">
          Welcome to AgriGenie
        </h1>
        <p className="text-xl text-gray-600">
          AI-Powered Smart Farming & Direct Marketplace
        </p>
        <div className="flex gap-4 justify-center">
          <Button
            size="lg"
            onClick={() => router.push('/auth')}
          >
            Get Started
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => router.push('/auth')}
          >
            Learn More
          </Button>
        </div>
      </div>
    </main>
  );
}
