'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/components/ui/use-toast'
import { createMarketplaceListing } from '@/lib/marketplace-api'
import { ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function CreateListingPage() {
  const { user, profile } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Default form state
  const [formData, setFormData] = useState({
    cropName: '',
    description: '',
    price: '',
    quantity: '',
    unit: 'kg',
    category: 'vegetables',
    imageUrl: '',
    location: '',
    isOrganic: false,
    harvestDate: '',
    quality: 'Standard',
    status: 'active' as 'active'
  })
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }
  
  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }
  
  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: checked }))
  }
  
  const validateForm = () => {
    const requiredFields = ['cropName', 'description', 'price', 'quantity', 'unit', 'category', 'location']
    const missingFields = requiredFields.filter(field => !formData[field as keyof typeof formData])
    
    if (missingFields.length > 0) {
      toast({
        title: 'Missing required fields',
        description: `Please fill in all required fields: ${missingFields.join(', ')}`,
        variant: 'destructive'
      })
      return false
    }
    
    const price = parseFloat(formData.price)
    const quantity = parseFloat(formData.quantity)
    
    if (isNaN(price) || price <= 0) {
      toast({
        title: 'Invalid price',
        description: 'Please enter a valid price greater than zero.',
        variant: 'destructive'
      })
      return false
    }
    
    if (isNaN(quantity) || quantity <= 0) {
      toast({
        title: 'Invalid quantity',
        description: 'Please enter a valid quantity greater than zero.',
        variant: 'destructive'
      })
      return false
    }
    
    return true
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Check if user is authenticated and is a farmer
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'Please sign in to create a listing.',
        variant: 'destructive'
      })
      router.push('/auth?redirect=/marketplace/listings/create')
      return
    }
    
    if (profile?.user_type !== 'farmer') {
      toast({
        title: 'Access denied',
        description: 'Only farmers can create listings.',
        variant: 'destructive'
      })
      router.push('/marketplace')
      return
    }
    
    // Validate form
    if (!validateForm()) {
      return
    }
    
    setIsSubmitting(true)
    
    try {
      // Convert string values to appropriate types and use camelCase for API
      const listingData = {
        cropName: formData.cropName,
        description: formData.description,
        price: parseFloat(formData.price),
        quantity: parseFloat(formData.quantity),
        unit: formData.unit,
        category: formData.category,
        imageUrl: formData.imageUrl || undefined,
        location: formData.location,
        isOrganic: formData.isOrganic,
        harvestDate: formData.harvestDate || undefined,
        quality: formData.quality,
        status: formData.status,
        farmerId: user.id,
        farmerName: profile?.full_name || 'Unknown Farmer',
      }
      
      const { data, error } = await createMarketplaceListing(listingData)
      
      if (error) {
        throw error
      }
      
      toast({
        title: 'Listing created successfully',
        description: `Your listing for ${formData.cropName} has been published to the marketplace.`,
      })
      
      // Redirect to the new listing
      router.push(`/marketplace/listings/${data!.id}`)
      
    } catch (err: any) {
      toast({
        title: 'Error creating listing',
        description: err.message || 'An error occurred while creating your listing.',
        variant: 'destructive'
      })
      console.error('Listing creation error:', err)
    } finally {
      setIsSubmitting(false)
    }
  }
  
  // Redirect if not a farmer
  if (user && profile && profile.user_type !== 'farmer') {
    router.push('/marketplace')
    return null
  }
  
  return (
    <div className="container mx-auto py-8">
      <Button 
        variant="ghost" 
        className="mb-6 flex items-center gap-2"
        onClick={() => router.push('/marketplace')}
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Marketplace
      </Button>
      
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Create Listing</h1>
      </div>
      
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Listing Details</CardTitle>
          <CardDescription>
            Enter the details of the agricultural product you want to sell.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="cropName">Crop/Product Name *</Label>
                <Input
                  id="cropName"
                  name="cropName"
                  placeholder="e.g., Basmati Rice"
                  value={formData.cropName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => handleSelectChange('category', value)}
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fruits">Fruits</SelectItem>
                    <SelectItem value="vegetables">Vegetables</SelectItem>
                    <SelectItem value="grains">Grains & Cereals</SelectItem>
                    <SelectItem value="pulses">Pulses</SelectItem>
                    <SelectItem value="oilseeds">Oilseeds</SelectItem>
                    <SelectItem value="spices">Spices</SelectItem>
                    <SelectItem value="dairy">Dairy Products</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Describe your product, including quality, freshness, and other relevant details..."
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                required
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="price">Price per Unit *</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  min="0.01"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                />
                <p className="text-sm text-muted-foreground">Enter price in USD ($)</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity *</Label>
                <Input
                  id="quantity"
                  name="quantity"
                  type="number"
                  min="1"
                  step="0.1"
                  placeholder="0"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="unit">Unit *</Label>
                <Select
                  value={formData.unit}
                  onValueChange={(value) => handleSelectChange('unit', value)}
                >
                  <SelectTrigger id="unit">
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kg">Kilogram (kg)</SelectItem>
                    <SelectItem value="g">Gram (g)</SelectItem>
                    <SelectItem value="ton">Ton</SelectItem>
                    <SelectItem value="lb">Pound (lb)</SelectItem>
                    <SelectItem value="oz">Ounce (oz)</SelectItem>
                    <SelectItem value="l">Liter (l)</SelectItem>
                    <SelectItem value="ml">Milliliter (ml)</SelectItem>
                    <SelectItem value="piece">Piece</SelectItem>
                    <SelectItem value="dozen">Dozen</SelectItem>
                    <SelectItem value="bundle">Bundle</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="location">Location *</Label>
                <Input
                  id="location"
                  name="location"
                  placeholder="e.g., Punjab, India"
                  value={formData.location}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="harvestDate">Harvest Date (Optional)</Label>
                <Input
                  id="harvestDate"
                  name="harvestDate"
                  type="date"
                  value={formData.harvestDate}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="quality">Quality (Optional)</Label>
                <Select
                  value={formData.quality}
                  onValueChange={(value) => handleSelectChange('quality', value)}
                >
                  <SelectTrigger id="quality">
                    <SelectValue placeholder="Select quality" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Premium">Premium</SelectItem>
                    <SelectItem value="Standard">Standard</SelectItem>
                    <SelectItem value="Economy">Economy</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="imageUrl">Image URL (Optional)</Label>
                <Input
                  id="imageUrl"
                  name="imageUrl"
                  placeholder="https://example.com/image.jpg"
                  value={formData.imageUrl}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="isOrganic"
                checked={formData.isOrganic}
                onCheckedChange={(checked) => handleSwitchChange('isOrganic', checked)}
              />
              <Label htmlFor="isOrganic">This product is certified organic</Label>
            </div>
          </CardContent>
          
          <CardFooter className="flex justify-between">
            <Button 
              type="button" 
              variant="outline"
              onClick={() => router.push('/marketplace')}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Listing'
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}