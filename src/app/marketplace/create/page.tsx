'use client';

import { CreateListing } from '@/components/marketplace/CreateListing';

export default function CreateListingPage() {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Create New Crop Listing</h1>
      <CreateListing />
    </div>
  );
} 