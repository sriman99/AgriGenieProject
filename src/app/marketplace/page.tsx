'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Navbar } from '@/components/dashboard/navbar';
import { Button } from '@/components/ui/button';
import { CropListings } from '@/components/marketplace/listings';
import { Input } from '@/components/ui/input';
import { Toaster } from '@/components/ui/toaster';
import { toast } from 'sonner';
import { Search, Filter, X, ShoppingCart } from 'lucide-react';

export default function MarketplacePage() {
  const router = useRouter();
  const { user, profile } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    minPrice: '',
    maxPrice: '',
    cropType: ''
  });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user) {
      router.push('/auth');
    }
  }, [user, router]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const resetFilters = () => {
    setFilters({
      minPrice: '',
      maxPrice: '',
      cropType: ''
    });
  };

  const isFarmer = profile?.user_type === 'farmer';

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Marketplace</h1>
            <p className="text-gray-600">Browse and purchase crops directly from farmers</p>
          </div>
          {isFarmer && (
            <Link href="/marketplace/new" className="mt-4 md:mt-0">
              <Button variant="default">
                <ShoppingCart className="mr-2 h-4 w-4" />
                Create Listing
              </Button>
            </Link>
          )}
        </div>

        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search crops, farmers..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="pl-10"
              />
            </div>
            <Button 
              variant="outline" 
              onClick={() => setFilterOpen(!filterOpen)}
              className="md:w-auto w-full"
            >
              <Filter className="mr-2 h-4 w-4" />
              {filterOpen ? 'Hide Filters' : 'Show Filters'}
            </Button>
          </div>

          {filterOpen && (
            <div className="mt-4 p-4 border rounded-md bg-white">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium">Filter Options</h3>
                <Button variant="ghost" size="sm" onClick={resetFilters}>
                  <X className="mr-2 h-4 w-4" />
                  Reset
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Min Price (₹)</label>
                  <Input
                    type="number"
                    name="minPrice"
                    placeholder="Min Price"
                    value={filters.minPrice}
                    onChange={handleFilterChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Price (₹)</label>
                  <Input
                    type="number"
                    name="maxPrice"
                    placeholder="Max Price"
                    value={filters.maxPrice}
                    onChange={handleFilterChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Crop Type</label>
                  <select
                    name="cropType"
                    value={filters.cropType}
                    onChange={handleFilterChange}
                    className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">All Crops</option>
                    <option value="Rice">Rice</option>
                    <option value="Wheat">Wheat</option>
                    <option value="Cotton">Cotton</option>
                    <option value="Sugarcane">Sugarcane</option>
                    <option value="Corn">Corn</option>
                    <option value="Soybeans">Soybeans</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        <CropListings 
          searchTerm={searchTerm}
          filters={filters}
        />
      </main>
      <Toaster />
    </div>
  );
}