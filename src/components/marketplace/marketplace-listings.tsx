'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { getMarketplaceListings, MarketplaceListingFrontend } from '@/lib/marketplace-api'
import { useAuth } from '@/lib/auth-context'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Leaf, Search, Filter, RefreshCw, AlertCircle, ShoppingCart } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

// Default product image if none is provided
const DEFAULT_IMAGE = '/images/default-product.jpg'

// Category options
const CATEGORIES = [
  { value: '', label: 'All Categories' },
  { value: 'fruits', label: 'Fruits' },
  { value: 'vegetables', label: 'Vegetables' },
  { value: 'grains', label: 'Grains & Cereals' },
  { value: 'pulses', label: 'Pulses' },
  { value: 'oilseeds', label: 'Oilseeds' },
  { value: 'spices', label: 'Spices' },
  { value: 'dairy', label: 'Dairy Products' },
  { value: 'other', label: 'Other' },
]

// Sort options
const SORT_OPTIONS = [
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
]

export default function MarketplaceListings() {
  const { user, profile, addToCart, addToWishlist } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  
  // State for listings
  const [listings, setListings] = useState<MarketplaceListingFrontend[]>([])
  const [filteredListings, setFilteredListings] = useState<MarketplaceListingFrontend[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // State for filters
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    minPrice: 0,
    maxPrice: 10000,
    organicOnly: false,
  })
  
  // Sort state
  const [sortOption, setSortOption] = useState('newest')
  
  // Filter panel visibility
  const [showFilters, setShowFilters] = useState(false)
  
  // Load listings on component mount
  useEffect(() => {
    fetchListings()
  }, [])
  
  // Apply filters and sort when data or filters change
  useEffect(() => {
    applyFiltersAndSort()
  }, [listings, filters, sortOption])
  
  // Fetch all listings from the API
  const fetchListings = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const { data, error } = await getMarketplaceListings()
      
      if (error) {
        throw error
      }
      
      setListings(data || [])
    } catch (err: any) {
      console.error('Error fetching marketplace listings:', err)
      setError('Failed to load listings. Please try again.')
    } finally {
      setLoading(false)
    }
  }
  
  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(prev => ({ ...prev, search: e.target.value }))
  }
  
  // Handle price range change
  const handlePriceChange = (value: number[]) => {
    setFilters(prev => ({ ...prev, minPrice: value[0], maxPrice: value[1] }))
  }
  
  // Reset all filters
  const resetFilters = () => {
    setFilters({
      search: '',
      category: '',
      minPrice: 0,
      maxPrice: 10000,
      organicOnly: false,
    })
    setSortOption('newest')
  }
  
  // Apply filters and sorting to the listings
  const applyFiltersAndSort = () => {
    // Apply filters
    let result = [...listings]
    
    // Text search (crop name, description, location)
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      result = result.filter(
        listing =>
          listing.cropName.toLowerCase().includes(searchLower) ||
          listing.description.toLowerCase().includes(searchLower) ||
          listing.location.toLowerCase().includes(searchLower)
      )
    }
    
    // Category filter
    if (filters.category) {
      result = result.filter(listing => listing.category === filters.category)
    }
    
    // Price range filter
    result = result.filter(
      listing => listing.price >= filters.minPrice && listing.price <= filters.maxPrice
    )
    
    // Organic only filter
    if (filters.organicOnly) {
      result = result.filter(listing => listing.isOrganic)
    }
    
    // Apply sorting
    switch (sortOption) {
      case 'price-asc':
        result.sort((a, b) => a.price - b.price)
        break
      case 'price-desc':
        result.sort((a, b) => b.price - a.price)
        break
      case 'newest':
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        break
      case 'oldest':
        result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
        break
      default:
        break
    }
    
    setFilteredListings(result)
  }
  
  // Handle add to cart
  const handleAddToCart = (listing: MarketplaceListingFrontend) => {
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'Please sign in to add items to your cart.',
        variant: 'destructive',
      })
      router.push('/auth?redirect=/marketplace')
      return
    }
    
    addToCart({
          id: listing.id,
          listingId: listing.id, // Assuming listing.id is the correct value for listingId
          cropName: listing.cropName,
          price: listing.price,
          quantity: 1,
          maxQuantity: listing.quantity, // Assuming listing.quantity is the correct value for maxQuantity
          unit: listing.unit,
          imageUrl: listing.imageUrl,
          farmerId: listing.farmerId,
          farmerName: listing.farmerName,
        })
    
    toast({
      title: 'Added to cart',
      description: `${listing.cropName} has been added to your cart.`,
    })
  }
  
  // Handle add to wishlist
  const handleAddToWishlist = (listing: MarketplaceListingFrontend) => {
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'Please sign in to add items to your wishlist.',
        variant: 'destructive',
      })
      router.push('/auth?redirect=/marketplace')
      return
    }
    
    addToWishlist({
      id: listing.id,
      listingId: listing.id, // Assuming listing.id is the correct value for listingId
      cropName: listing.cropName,
      price: listing.price,
      imageUrl: listing.imageUrl,
      farmerId: listing.farmerId, // Assuming listing.farmerId exists
      farmerName: listing.farmerName, // Assuming listing.farmerName exists
      addedAt: new Date(), // Adding the current timestamp as a Date object
    })
    
    toast({
      title: 'Added to wishlist',
      description: `${listing.cropName} has been added to your wishlist.`,
    })
  }
  
  // Format price with currency
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price)
  }
  
  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="flex flex-col items-center gap-2">
          <RefreshCw className="h-8 w-8 animate-spin text-primary" />
          <p className="text-lg font-medium">Loading marketplace listings...</p>
        </div>
      </div>
    )
  }
  
  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="flex flex-col items-center gap-2 text-center max-w-md">
          <AlertCircle className="h-10 w-10 text-destructive" />
          <h3 className="text-xl font-semibold">Oops, something went wrong</h3>
          <p className="text-muted-foreground">{error}</p>
          <Button onClick={fetchListings} className="mt-4">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    )
  }
  
  return (
    <div className="container mx-auto py-6">
      {/* Search and filter bar */}
      <div className="flex flex-col md:flex-row gap-4 mb-6 items-start md:items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products by name, description, or location..."
            className="pl-9"
            value={filters.search}
            onChange={handleSearchChange}
          />
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4 mr-2" />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </Button>
          
          <Select value={sortOption} onValueChange={setSortOption}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button variant="ghost" size="sm" onClick={resetFilters}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset
          </Button>
        </div>
      </div>
      
      {/* Filter panel */}
      {showFilters && (
        <div className="bg-card border rounded-lg p-4 mb-6">
          <h3 className="text-lg font-medium mb-4">Filter Products</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <Label htmlFor="category-filter">Category</Label>
              <Select
                value={filters.category}
                onValueChange={value => setFilters(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger id="category-filter">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(category => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Price Range</Label>
              <div className="pt-6 px-2">
                <Slider
                  defaultValue={[filters.minPrice, filters.maxPrice]}
                  min={0}
                  max={10000}
                  step={10}
                  onValueChange={handlePriceChange}
                />
                <div className="flex justify-between mt-2 text-sm text-muted-foreground">
                  <span>{formatPrice(filters.minPrice)}</span>
                  <span>{formatPrice(filters.maxPrice)}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 pt-8">
              <Switch
                id="organic-only"
                checked={filters.organicOnly}
                onCheckedChange={checked => setFilters(prev => ({ ...prev, organicOnly: checked }))}
              />
              <Label htmlFor="organic-only" className="flex items-center">
                <Leaf className="h-4 w-4 mr-1 text-green-600" />
                Organic Products Only
              </Label>
            </div>
          </div>
        </div>
      )}
      
      {/* Results count */}
      <div className="mb-4">
        <p className="text-muted-foreground">
          Showing {filteredListings.length} {filteredListings.length === 1 ? 'product' : 'products'}
        </p>
      </div>
      
      {/* Product grid */}
      {filteredListings.length === 0 ? (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
            <AlertCircle className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No products found</h3>
          <p className="text-muted-foreground mb-4">
            Try adjusting your search or filter criteria
          </p>
          <Button onClick={resetFilters}>Reset Filters</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredListings.map(listing => (
            <Card key={listing.id} className="overflow-hidden flex flex-col h-full">
              <Link href={`/marketplace/listings/${listing.id}`}>
                <div className="aspect-square relative overflow-hidden">
                  <Image
                    src={listing.imageUrl || DEFAULT_IMAGE}
                    alt={listing.cropName}
                    fill
                    className="object-cover transition-transform hover:scale-105"
                    onError={(e) => {
                      // Fallback if image fails to load
                      const target = e.target as HTMLImageElement;
                      target.onerror = null;
                      target.src = DEFAULT_IMAGE;
                    }}
                  />
                  {listing.isOrganic && (
                    <Badge className="absolute top-2 right-2 bg-green-600">
                      <Leaf className="h-3 w-3 mr-1" /> Organic
                    </Badge>
                  )}
                </div>
              </Link>
              
              <CardContent className="flex-grow pt-4">
                <Link 
                  href={`/marketplace/listings/${listing.id}`}
                  className="hover:underline"
                >
                  <h3 className="font-medium text-lg line-clamp-2">{listing.cropName}</h3>
                </Link>
                
                <div className="flex justify-between items-start mt-2">
                  <div>
                    <p className="font-semibold text-lg text-primary">
                      {formatPrice(listing.price)} / {listing.unit}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {listing.location}
                    </p>
                  </div>
                  <Badge variant="outline">{listing.category}</Badge>
                </div>
                
                <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                  {listing.description}
                </p>
                
                <div className="text-xs text-muted-foreground mt-2">
                  Available: {listing.quantity} {listing.unit} · Added {formatDate(listing.createdAt)}
                </div>
              </CardContent>
              
              <CardFooter className="border-t p-4 gap-2">
                <Button 
                  className="flex-1" 
                  size="sm"
                  onClick={() => handleAddToCart(listing)}
                >
                  <ShoppingCart className="h-4 w-4 mr-1" />
                  Add to Cart
                </Button>
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={() => router.push(`/marketplace/listings/${listing.id}`)}
                >
                  Details
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}