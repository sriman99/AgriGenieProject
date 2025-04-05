'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { getMarketplaceListing, MarketplaceListing } from '@/lib/marketplace-api'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, Heart, MapPin, Calendar, Tag, Truck, Shield, ArrowLeft } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { Input } from '@/components/ui/input'

interface ListingPageProps {
  params: {
    id: string
  }
}

export default function ListingPage({ params }: ListingPageProps) {
  const { id } = params
  const [listing, setListing] = useState<MarketplaceListing | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(1)
  const { addToCart, addToWishlist, user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  
  useEffect(() => {
    async function fetchListing() {
      setLoading(true)
      setError(null)
      
      try {
        const { data, error } = await getMarketplaceListing(id)
        
        if (error) {
          throw error
        }
        
        if (!data) {
          throw new Error('Listing not found')
        }
        
        setListing({
          id: data.id,
          farmer_id: data.farmerId,
          farmer_name: data.farmerName,
          crop_name: data.cropName,
          description: data.description,
          price: data.price,
          quantity: data.quantity,
          unit: data.unit,
          category: data.category,
          image_url: data.imageUrl,
          location: data.location,
          created_at: data.createdAt,
          updated_at: data.updatedAt,
          is_organic: data.isOrganic,
          harvest_date: data.harvestDate,
          quality: data.quality,
          status: data.status,
        })
      } catch (err: any) {
        setError(err.message || 'Failed to load listing')
        toast({
          title: 'Error',
          description: 'Failed to load listing details. Please try again.',
          variant: 'destructive'
        })
      } finally {
        setLoading(false)
      }
    }
    
    fetchListing()
  }, [id, toast])

  // Check if current user is the owner of this listing
  const isOwnListing = user?.id === listing?.farmer_id

  const handleAddToCart = () => {
    if (!user) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to add items to your cart',
        variant: 'default'
      })
      router.push('/auth?redirect=/marketplace/listings/' + id)
      return
    }

    if (!listing) return

    // Prevent farmers from buying their own products
    if (isOwnListing) {
      toast({
        title: 'Cannot purchase your own product',
        description: 'You cannot purchase products that you have listed.',
        variant: 'destructive'
      })
      return
    }

    // Check if there's enough quantity available
    if (listing.quantity < quantity) {
      toast({
        title: 'Not enough stock',
        description: `Only ${listing.quantity} ${listing.unit}s available.`,
        variant: 'destructive'
      })
      return
    }

    addToCart({
      id: crypto.randomUUID(),
      listingId: listing.id,
      cropName: listing.crop_name,
      price: listing.price,
      quantity: quantity,
      farmerId: listing.farmer_id,
      farmerName: listing.farmer_name,
      unit: listing.unit,
      imageUrl: listing.image_url,
      maxQuantity: listing.quantity
    })

    toast({
      title: 'Added to cart',
      description: `${quantity} ${listing.unit}${quantity > 1 ? 's' : ''} of ${listing.crop_name} added to cart.`,
    })
  }

  const handleAddToWishlist = () => {
    if (!user) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to add items to your wishlist',
        variant: 'default'
      })
      router.push('/auth?redirect=/marketplace/listings/' + id)
      return
    }

    if (!listing) return

    addToWishlist({
      id: crypto.randomUUID(),
      listingId: listing.id,
      cropName: listing.crop_name,
      price: listing.price,
      farmerId: listing.farmer_id,
      farmerName: listing.farmer_name,
      addedAt: new Date(),
      imageUrl: listing.image_url
    })

    toast({
      title: 'Added to wishlist',
      description: `${listing.crop_name} added to your wishlist.`,
    })
  }

  return (
    <div className="container mx-auto py-8">
      <Button 
        variant="ghost" 
        className="mb-4 flex items-center gap-2"
        onClick={() => router.back()}
      >
        <ArrowLeft className="h-4 w-4" />
        Back to listings
      </Button>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      ) : error ? (
        <div className="p-4 text-center">
          <p className="text-red-500">{error}</p>
          <Button
            variant="outline"
            onClick={() => router.push('/marketplace')}
            className="mt-2"
          >
            Back to Marketplace
          </Button>
        </div>
      ) : listing ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="relative h-[400px] bg-muted rounded-lg overflow-hidden">
            {listing.image_url ? (
              <Image
                src={listing.image_url}
                alt={listing.crop_name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full bg-muted">
                <span className="text-muted-foreground text-lg">No image available</span>
              </div>
            )}
          </div>
          
          <div>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-3xl font-bold">{listing.crop_name}</h1>
                <div className="flex items-center mt-1 space-x-2">
                  <Badge>{listing.category}</Badge>
                  {listing.is_organic && (
                    <Badge variant="outline" className="bg-green-50">Organic</Badge>
                  )}
                </div>
              </div>
              <div className="text-2xl font-semibold">
                ${listing.price.toFixed(2)} / {listing.unit}
              </div>
            </div>
            
            <div className="prose max-w-none mb-6">
              <p>{listing.description}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>Location: {listing.location}</span>
              </div>
              {listing.harvest_date && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>Harvested: {new Date(listing.harvest_date).toLocaleDateString()}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4" />
                <span>Available: {listing.quantity} {listing.unit}s</span>
              </div>
              {listing.quality && (
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  <span>Quality: {listing.quality}</span>
                </div>
              )}
            </div>
            
            <Card className="mb-6">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Seller Information</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-medium">{listing.farmer_name}</p>
                <p className="text-sm text-muted-foreground">Farmer</p>
                {isOwnListing && (
                  <Badge variant="secondary" className="mt-2">Your listing</Badge>
                )}
              </CardContent>
            </Card>
            
            <div className="flex flex-col space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-24">
                  <label htmlFor="quantity" className="text-sm font-medium">
                    Quantity:
                  </label>
                </div>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  max={listing.quantity}
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  className="w-20"
                />
                <span className="text-sm text-muted-foreground">
                  {listing.unit}s (Max: {listing.quantity})
                </span>
              </div>
              
              <div className="flex flex-wrap gap-3">
                <Button 
                  size="lg"
                  className="flex-1"
                  onClick={handleAddToCart}
                  disabled={listing.quantity <= 0 || isOwnListing}
                  title={isOwnListing ? "You cannot purchase your own product" : ""}
                >
                  {listing.quantity <= 0 ? 'Out of Stock' : 
                   isOwnListing ? 'Your Own Product' : 'Add to Cart'}
                </Button>
                <Button 
                  size="lg"
                  variant="outline"
                  onClick={handleAddToWishlist}
                >
                  <Heart className="h-4 w-4 mr-2" />
                  Wishlist
                </Button>
              </div>
            </div>
            
            <div className="mt-6 flex items-center text-sm text-muted-foreground">
              <Truck className="h-4 w-4 mr-2" />
              <span>Usually ships within 3-5 business days</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4 text-center">
          <p className="text-lg">Listing not found</p>
          <Button
            variant="outline"
            onClick={() => router.push('/marketplace')}
            className="mt-2"
          >
            Back to Marketplace
          </Button>
        </div>
      )}
    </div>
  )
}