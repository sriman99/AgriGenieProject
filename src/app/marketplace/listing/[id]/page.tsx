'use client';

import { ListingDetail } from '@/components/marketplace/ListingDetail';
import { useParams } from 'next/navigation';

export default function ListingDetailPage() {
  const params = useParams();
  const listingId = params.id as string;

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Crop Details</h1>
      <ListingDetail listingId={listingId} />
    </div>
  );
} 