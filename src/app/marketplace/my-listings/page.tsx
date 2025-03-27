'use client';

import { MyListings } from '@/components/marketplace/MyListings';

export default function MyListingsPage() {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">My Crop Listings</h1>
      <MyListings />
    </div>
  );
} 