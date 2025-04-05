"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export function Navigation() {
  const { user, profile, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  const handleSignOut = async () => {
    try {
      await signOut();
      // Force a page refresh after sign out to clear any cached state
      window.location.href = "/auth";
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  if (!user || pathname === "/auth") return null;

  return (
    <nav className="border-b bg-white sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <Link href="/dashboard">
              <span className="text-xl font-bold text-green-600">
                AgriGenie
              </span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <Link href="/dashboard">
              <Button variant={isActive("/dashboard") ? "default" : "ghost"}>
                Dashboard
              </Button>
            </Link>

            <Link href="/chatbot">
              <Button variant={isActive("/chatbot") ? "default" : "ghost"}>
                AI Assistant
              </Button>
            </Link>

            {profile?.user_type === "farmer" && (
              <Link href="/disease-detection">
                <Button
                  variant={isActive("/disease-detection") ? "default" : "ghost"}
                >
                  Disease Detection
                </Button>
              </Link>
            )}

            <Link href="/marketplace">
              <Button variant={isActive("/marketplace") ? "default" : "ghost"}>
                Marketplace
              </Button>
            </Link>

            <Link href="/price-analysis">
              <Button
                variant={isActive("/price-analysis") ? "default" : "ghost"}
              >
                Price Analysis
              </Button>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  {profile?.full_name || "Account"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => router.push("/profile")}>
                  Profile Settings
                </DropdownMenuItem>
                {profile?.user_type === "farmer" ? (
                  <DropdownMenuItem
                    onClick={() => router.push("/marketplace/my-listings")}
                  >
                    My Listings
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem onClick={() => router.push("/orders")}>
                    My Orders
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  onClick={handleSignOut}
                  className="text-red-600"
                >
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden border-t">
        <div className="grid grid-cols-4 gap-1 p-2">
          <Link href="/dashboard">
            <Button
              variant={isActive("/dashboard") ? "default" : "ghost"}
              className="w-full"
              size="sm"
            >
              Home
            </Button>
          </Link>

          <Link href="/chatbot">
            <Button
              variant={isActive("/chatbot") ? "default" : "ghost"}
              className="w-full"
              size="sm"
            >
              AI
            </Button>
          </Link>

          <Link href="/marketplace">
            <Button
              variant={isActive("/marketplace") ? "default" : "ghost"}
              className="w-full"
              size="sm"
            >
              Market
            </Button>
          </Link>

          <Link href="/price-analysis">
            <Button
              variant={isActive("/price-analysis") ? "default" : "ghost"}
              className="w-full"
              size="sm"
            >
              Prices
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}
