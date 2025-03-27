'use client';

import { EditListing } from '@/components/marketplace/EditListing';
import { useParams } from 'next/navigation';

export default function EditListingPage() {
  const params = useParams();
  const listingId = params.id as string;

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Edit Crop Listing</h1>
      <EditListing listingId={listingId} />
    </div>
  );
} 