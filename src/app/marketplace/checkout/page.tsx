'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/components/ui/use-toast'
import { createOrder, ShippingAddress } from '@/lib/marketplace-api'
import { Check, ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function CheckoutPage() {
  const { cartItems, user, profile, clearCart } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('credit_card')
  
  // Form state
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    fullName: profile?.full_name || '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
    phoneNumber: '',
  })
  
  // Calculate order totals
  const subtotal = cartItems.reduce((total, item) => {
    return total + (item.price * item.quantity)
  }, 0)
  
  const shippingFee = cartItems.length > 0 ? 5.99 : 0
  const total = subtotal + shippingFee
  
  // Update shipping info
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setShippingAddress((prev) => ({ ...prev, [name]: value }))
  }
  
  // Validate form
  const isFormValid = () => {
    const required = [
      'fullName', 
      'addressLine1', 
      'city', 
      'state', 
      'postalCode', 
      'country', 
      'phoneNumber'
    ]
    
    return required.every(field => 
      shippingAddress[field as keyof ShippingAddress]?.trim() !== ''
    )
  }
  
  // Handle checkout submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to complete your purchase',
        variant: 'destructive'
      })
      router.push('/auth?redirect=/marketplace/checkout')
      return
    }
    
    if (cartItems.length === 0) {
      toast({
        title: 'Empty cart',
        description: 'Your cart is empty. Add some items before checkout.',
        variant: 'destructive'
      })
      router.push('/marketplace')
      return
    }
    
    if (!isFormValid()) {
      toast({
        title: 'Incomplete information',
        description: 'Please fill in all required fields.',
        variant: 'destructive'
      })
      return
    }
    
    setIsSubmitting(true)
    
    try {
      // Get the farmer ID from the first item (for simplicity)
      // In a real-world scenario, you might need to handle multiple farmers
      const farmerId = cartItems[0].farmerId
      
      // Create order items
      const orderItems = cartItems.map(item => ({
        id: crypto.randomUUID(),
        listing_id: item.listingId,
        crop_name: item.cropName,
        price: item.price,
        quantity: item.quantity,
        unit: item.unit,
        total_price: item.price * item.quantity
      }))
      
      // Create the order
      const { data, error } = await createOrder({
        user_id: user.id,
        farmer_id: farmerId,
        items: orderItems,
        total_amount: total,
        status: 'pending',
        shipping_address: shippingAddress,
        payment_method: paymentMethod,
      })
      
      if (error) {
        throw error
      }
      
      // Success
      toast({
        title: 'Order placed successfully!',
        description: `Your order #${data!.id.slice(0, 8)} has been placed.`,
      })
      
      // Clear cart and redirect to success page
      clearCart()
      router.push('/marketplace/checkout/success?orderId=' + data!.id)
      
    } catch (err: any) {
      toast({
        title: 'Checkout failed',
        description: err.message || 'An error occurred during checkout.',
        variant: 'destructive'
      })
    } finally {
      setIsSubmitting(false)
    }
  }
  
  // Redirect if cart is empty
  if (!user) {
    return (
      <div className="container mx-auto py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Sign in Required</h1>
        <p className="mb-6">Please sign in to proceed with checkout.</p>
        <Link href="/auth?redirect=/marketplace/checkout">
          <Button>Sign In</Button>
        </Link>
      </div>
    )
  }
  
  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
        <p className="mb-6">Add some items to your cart before proceeding to checkout.</p>
        <Link href="/marketplace">
          <Button>Browse Marketplace</Button>
        </Link>
      </div>
    )
  }
  
  return (
    <div className="container mx-auto py-8">
      <Button 
        variant="ghost" 
        className="mb-6 flex items-center gap-2"
        onClick={() => router.push('/marketplace/cart')}
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Cart
      </Button>
      
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Checkout</h1>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            {/* Shipping Information */}
            <Card>
              <CardHeader>
                <CardTitle>Shipping Information</CardTitle>
                <CardDescription>
                  Enter your shipping details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name *</Label>
                    <Input
                      id="fullName"
                      name="fullName"
                      placeholder="Enter your full name"
                      value={shippingAddress.fullName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber">Phone Number *</Label>
                    <Input
                      id="phoneNumber"
                      name="phoneNumber"
                      placeholder="Enter your phone number"
                      value={shippingAddress.phoneNumber}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="addressLine1">Address Line 1 *</Label>
                  <Input
                    id="addressLine1"
                    name="addressLine1"
                    placeholder="Street address, P.O. box"
                    value={shippingAddress.addressLine1}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="addressLine2">Address Line 2 (Optional)</Label>
                  <Input
                    id="addressLine2"
                    name="addressLine2"
                    placeholder="Apartment, suite, unit, building, floor, etc."
                    value={shippingAddress.addressLine2}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      name="city"
                      placeholder="City"
                      value={shippingAddress.city}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State/Province *</Label>
                    <Input
                      id="state"
                      name="state"
                      placeholder="State or province"
                      value={shippingAddress.state}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="postalCode">Postal Code *</Label>
                    <Input
                      id="postalCode"
                      name="postalCode"
                      placeholder="Postal code"
                      value={shippingAddress.postalCode}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="country">Country *</Label>
                  <Input
                    id="country"
                    name="country"
                    placeholder="Country"
                    value={shippingAddress.country}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </CardContent>
            </Card>
            
            {/* Payment Information */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Method</CardTitle>
                <CardDescription>
                  Select your preferred payment method
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <RadioGroup 
                  value={paymentMethod} 
                  onValueChange={setPaymentMethod}
                  className="space-y-3"
                >
                  <div className="flex items-center space-x-2 border p-3 rounded-md">
                    <RadioGroupItem value="credit_card" id="credit_card" />
                    <Label htmlFor="credit_card" className="flex-grow cursor-pointer">
                      Credit / Debit Card
                    </Label>
                    <div className="flex space-x-1">
                      <div className="h-6 w-8 bg-slate-200 rounded"></div>
                      <div className="h-6 w-8 bg-slate-200 rounded"></div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 border p-3 rounded-md">
                    <RadioGroupItem value="upi" id="upi" />
                    <Label htmlFor="upi" className="flex-grow cursor-pointer">
                      UPI Payment
                    </Label>
                    <div className="flex space-x-1">
                      <div className="h-6 w-8 bg-slate-200 rounded"></div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 border p-3 rounded-md">
                    <RadioGroupItem value="cod" id="cod" />
                    <Label htmlFor="cod" className="flex-grow cursor-pointer">
                      Cash on Delivery
                    </Label>
                  </div>
                </RadioGroup>
                
                {paymentMethod === 'credit_card' && (
                  <div className="mt-4 space-y-4 p-4 border rounded-md">
                    <div className="space-y-2">
                      <Label htmlFor="cardNumber">Card Number</Label>
                      <Input id="cardNumber" placeholder="1234 5678 9012 3456" disabled />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="expiry">Expiry Date</Label>
                        <Input id="expiry" placeholder="MM/YY" disabled />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cvv">CVV</Label>
                        <Input id="cvv" placeholder="123" disabled />
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      This is a demo application. No actual payment will be processed.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* Order Summary */}
          <div>
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span>
                        {item.cropName} ({item.quantity} {item.unit}
                        {item.quantity > 1 ? 's' : ''})
                      </span>
                      <span>${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Shipping</span>
                    <span>${shippingFee.toFixed(2)}</span>
                  </div>
                </div>
                
                <Separator />
                
                <div className="flex justify-between font-medium">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full" 
                  size="lg"
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Complete Purchase'
                  )}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </form>
    </div>
  )
}