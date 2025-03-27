'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Navbar } from '@/components/dashboard/navbar';
import { CreateListing } from '@/components/marketplace/CreateListing';
import { Toaster } from '@/components/ui/toaster';
import { Loader2 } from 'lucide-react';

export default function NewListingPage() {
  const router = useRouter();
  const { user, profile, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth');
      return;
    }

    if (!isLoading && user && profile?.user_type !== 'farmer') {
      router.push('/marketplace');
      return;
    }
  }, [user, profile, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container py-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Create New Listing</h1>
          <CreateListing />
        </div>
      </main>
      <Toaster />
    </div>
  );
}