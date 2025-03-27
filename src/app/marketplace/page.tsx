'use client';

import { useState } from 'react';
import { Navbar } from '@/components/dashboard/navbar';
import { CropListings } from '@/components/marketplace/listings';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Toaster } from '@/components/ui/toaster';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
  SheetFooter
} from '@/components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function MarketplacePage() {
  const { user, profile } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    minPrice: '0',
    maxPrice: '10000',
    cropType: ''
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search is already reactive with the searchTerm state
  };

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const resetFilters = () => {
    setFilters({
      minPrice: '0',
      maxPrice: '10000',
      cropType: ''
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container py-8">
        <div className="flex flex-col space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Marketplace</h1>
            <p className="text-gray-600 mt-2">Discover and purchase crops directly from farmers</p>
          </div>
          
          <div className="flex flex-col md:flex-row gap-4 justify-between">
            {/* Search Bar */}
            <div className="relative w-full md:w-2/3">
              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <Input
                  type="text"
                  placeholder="Search for crops..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full"
                />
              </form>
            </div>
            
            <div className="flex gap-2">
              {/* Filter Sheet */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2">
                    <SlidersHorizontal size={16} />
                    <span>Filters</span>
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Filter Options</SheetTitle>
                    <SheetDescription>
                      Refine your search with these filters
                    </SheetDescription>
                  </SheetHeader>
                  
                  <div className="py-6 space-y-6">
                    <div className="space-y-4">
                      <Label htmlFor="cropType">Crop Type</Label>
                      <Select
                        value={filters.cropType}
                        onValueChange={(value) => handleFilterChange('cropType', value)}
                      >
                        <SelectTrigger id="cropType">
                          <SelectValue placeholder="Select a crop type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">All Crops</SelectItem>
                          <SelectItem value="Rice">Rice</SelectItem>
                          <SelectItem value="Wheat">Wheat</SelectItem>
                          <SelectItem value="Cotton">Cotton</SelectItem>
                          <SelectItem value="Sugarcane">Sugarcane</SelectItem>
                          <SelectItem value="Corn">Corn</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <Label htmlFor="price-range">Price Range (₹)</Label>
                        <span className="text-sm text-gray-500">
                          ₹{filters.minPrice} - ₹{filters.maxPrice}
                        </span>
                      </div>
                      <div className="pt-4">
                        <Label htmlFor="min-price">Minimum Price</Label>
                        <div className="flex items-center gap-4">
                          <Input
                            id="min-price"
                            type="number"
                            min={0}
                            value={filters.minPrice}
                            onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                            className="w-full"
                          />
                        </div>
                      </div>
                      <div className="pt-4">
                        <Label htmlFor="max-price">Maximum Price</Label>
                        <div className="flex items-center gap-4">
                          <Input
                            id="max-price"
                            type="number"
                            min={0}
                            value={filters.maxPrice}
                            onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                            className="w-full"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <SheetFooter className="flex justify-between sm:justify-between">
                    <Button
                      variant="outline"
                      onClick={resetFilters}
                      className="flex items-center gap-2"
                    >
                      <X size={16} />
                      Reset Filters
                    </Button>
                    <SheetClose asChild>
                      <Button>Apply Filters</Button>
                    </SheetClose>
                  </SheetFooter>
                </SheetContent>
              </Sheet>
              
              {/* Create Listing Button for Farmers */}
              {profile?.user_type === 'farmer' && (
                <Button asChild>
                  <Link href="/marketplace/new">Create Listing</Link>
                </Button>
              )}
            </div>
          </div>
          
          {/* Display Listings with Search and Filter */}
          <CropListings searchTerm={searchTerm} filters={filters} />
        </div>
      </main>
      <Toaster />
    </div>
  );
}