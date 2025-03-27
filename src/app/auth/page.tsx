'use client';

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth-context";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const router = useRouter();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
    userType: "farmer" as "farmer" | "buyer",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return; // Prevent multiple submissions while loading
    setLoading(true);
    
    try {
      if (isLogin) {
        const userType = await signIn(formData.email, formData.password);
        toast.success("Successfully logged in!");
        
        // Redirect based on user type
        if (userType === 'farmer') {
          router.push("/dashboard/farmer");
        } else if (userType === 'buyer') {
          router.push("/dashboard/buyer");
        } else {
          // Default fallback
          router.push("/dashboard");
        }
      } else {
        // Validate input before attempting signup
        if (!formData.email.includes('@')) {
          throw new Error("Please enter a valid email address");
        }

        if (!formData.fullName || formData.fullName.length < 3) {
          throw new Error("Full name must be at least 3 characters long");
        }

        if (!formData.password || formData.password.length < 6) {
          throw new Error("Password must be at least 6 characters long");
        }

        try {
          await signUp(
            formData.email,
            formData.password,
            formData.fullName,
            formData.userType
          );

          // Clear form data after successful signup
          setFormData({
            email: "",
            password: "",
            fullName: "",
            userType: "farmer"
          });
          setIsLogin(true); // Switch to login view
        } catch (signupError: any) {
          if (signupError.message.includes('rate limit') || signupError.message.includes('wait')) {
            // Show rate limit error with countdown
            toast.error(signupError.message, {
              duration: 5000,
            });
            return;
          }
          throw signupError;
        }
      }
    } catch (error: any) {
      console.error("Auth error:", error);
      toast.error(error.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center p-4 bg-gradient-to-b from-green-50 to-green-100">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-green-800">
            {isLogin ? "Welcome Back to AgriGenie" : "Join AgriGenie"}
          </CardTitle>
          <CardDescription>
            {isLogin
              ? "Sign in to access your smart farming assistant"
              : "Create an account to start your smart farming journey"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-1">
                <Input
                  placeholder="Full Name"
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData({ ...formData, fullName: e.target.value })
                  }
                  required
                  minLength={3}
                  disabled={loading}
                />
                <p className="text-xs text-gray-500">
                  Minimum 3 characters required
                </p>
              </div>
            )}
            <div className="space-y-1">
              <Input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-1">
              <Input
                type="password"
                placeholder="Password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                required
                minLength={6}
                disabled={loading}
              />
              <p className="text-xs text-gray-500">
                {!isLogin && "Minimum 6 characters required"}
              </p>
            </div>
            {!isLogin && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium">I am a:</h3>
                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant={formData.userType === "farmer" ? "default" : "outline"}
                    className="flex-1"
                    onClick={() =>
                      setFormData({ ...formData, userType: "farmer" })
                    }
                    disabled={loading}
                  >
                    🌾 Farmer
                  </Button>
                  <Button
                    type="button"
                    variant={formData.userType === "buyer" ? "default" : "outline"}
                    className="flex-1"
                    onClick={() => setFormData({ ...formData, userType: "buyer" })}
                    disabled={loading}
                  >
                    🛒 Buyer
                  </Button>
                </div>
              </div>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading 
                ? "Please wait..." 
                : isLogin 
                  ? "Sign In" 
                  : "Create Account"}
            </Button>
            <Button
              type="button"
              variant="link"
              className="w-full"
              onClick={() => {
                if (!loading) {
                  setIsLogin(!isLogin);
                  setFormData({
                    email: "",
                    password: "",
                    fullName: "",
                    userType: "farmer"
                  });
                }
              }}
              disabled={loading}
            >
              {isLogin
                ? "Don't have an account? Sign up"
                : "Already have an account? Sign in"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}