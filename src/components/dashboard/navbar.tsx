'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Leaf, ShoppingCart, User, Settings, LogOut, BarChart3, MessageSquare, Package, PlusCircle, Store } from 'lucide-react';

export function Navbar() {
  const pathname = usePathname();
  const { user, profile, signOut } = useAuth();
  
  const isActive = (path: string) => pathname === path;

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <nav className="border-b bg-white sticky top-0 z-50">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard">
            <div className="flex items-center space-x-2">
              <Leaf className="h-6 w-6 text-green-600" />
              <h1 className="text-xl font-bold text-gray-900">AgriGenie</h1>
            </div>
          </Link>
          
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/dashboard" passHref>
              <Button variant={isActive('/dashboard') ? 'default' : 'ghost'}>
                <BarChart3 className="mr-2 h-4 w-4" />
                Dashboard
              </Button>
            </Link>

            <Link href="/marketplace" passHref>
              <Button variant={pathname.startsWith('/marketplace') && pathname === '/marketplace' ? 'default' : 'ghost'}>
                <Store className="mr-2 h-4 w-4" />
                Marketplace
              </Button>
            </Link>

            {profile?.user_type === 'farmer' && (
              <>
                <Link href="/marketplace/my-listings" passHref>
                  <Button variant={pathname === '/marketplace/my-listings' ? 'default' : 'ghost'}>
                    <Leaf className="mr-2 h-4 w-4" />
                    My Listings
                  </Button>
                </Link>
                <Link href="/marketplace/new" passHref>
                  <Button variant={pathname === '/marketplace/new' ? 'default' : 'ghost'}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create Listing
                  </Button>
                </Link>
              </>
            )}
            
            <Link href="/marketplace/orders" passHref>
              <Button variant={pathname === '/marketplace/orders' ? 'default' : 'ghost'}>
                <Package className="mr-2 h-4 w-4" />
                Orders
              </Button>
            </Link>
            
            <Link href="/chatbot" passHref>
              <Button variant={pathname === '/chatbot' ? 'default' : 'ghost'}>
                <MessageSquare className="mr-2 h-4 w-4" />
                AI Chatbot
              </Button>
            </Link>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <span>{profile?.full_name || 'User'}</span>
                  <span className="text-xs text-muted-foreground">{profile?.email}</span>
                  <span className="text-xs font-medium text-green-600 capitalize">{profile?.user_type}</span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <Link href="/profile">
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Profile Settings</span>
                </DropdownMenuItem>
              </Link>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
} 