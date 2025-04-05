'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Trash2, Plus, Minus, ArrowLeft, ShoppingBag } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import Link from 'next/link'

export default function CartPage() {
  const { cartItems, updateCartItemQuantity, removeFromCart, clearCart, user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  
  // Calculate subtotal
  const subtotal = cartItems.reduce((total, item) => {
    return total + (item.price * item.quantity)
  }, 0)
  
  // Fixed shipping fee for simplicity
  const shippingFee = cartItems.length > 0 ? 5.99 : 0
  
  // Calculate total
  const total = subtotal + shippingFee
  
  const handleQuantityChange = (itemId: string, newQuantity: number, maxQuantity: number) => {
    if (newQuantity < 1) {
      return
    }
    
    if (newQuantity > maxQuantity) {
      toast({
        title: 'Maximum quantity exceeded',
        description: `Only ${maxQuantity} available in stock.`,
        variant: 'destructive'
      })
      newQuantity = maxQuantity
    }
    
    updateCartItemQuantity(itemId, newQuantity)
  }
  
  const handleRemove = (itemId: string) => {
    removeFromCart(itemId)
    toast({
      title: 'Item removed',
      description: 'The item has been removed from your cart.',
    })
  }
  
  const handleCheckout = () => {
    if (!user) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to proceed to checkout',
        variant: 'default'
      })
      router.push('/auth?redirect=/marketplace/cart')
      return
    }
    
    if (cartItems.length === 0) {
      toast({
        title: 'Empty cart',
        description: 'Your cart is empty. Add some items before checkout.',
        variant: 'destructive'
      })
      return
    }
    
    router.push('/marketplace/checkout')
  }
  
  return (
    <div className="container mx-auto py-8">
      <Button 
        variant="ghost" 
        className="mb-6 flex items-center gap-2"
        onClick={() => router.back()}
      >
        <ArrowLeft className="h-4 w-4" />
        Continue Shopping
      </Button>
      
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Your Cart</h1>
        {cartItems.length > 0 && (
          <Button 
            variant="outline" 
            onClick={() => {
              clearCart()
              toast({
                title: 'Cart cleared',
                description: 'All items have been removed from your cart.',
              })
            }}
          >
            Clear Cart
          </Button>
        )}
      </div>
      
      {cartItems.length === 0 ? (
        <div className="text-center py-12">
          <div className="flex justify-center mb-4">
            <ShoppingBag className="h-16 w-16 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-medium mb-2">Your cart is empty</h2>
          <p className="text-muted-foreground mb-6">
            Looks like you haven't added anything to your cart yet.
          </p>
          <Link href="/marketplace">
            <Button>Browse Marketplace</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <div className="space-y-4">
              {cartItems.map((item) => (
                <Card key={item.id} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="flex flex-col sm:flex-row">
                      <div className="relative w-full h-48 sm:w-48 sm:h-auto flex-shrink-0 bg-muted">
                        {item.imageUrl ? (
                          <Image
                            src={item.imageUrl}
                            alt={item.cropName}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full bg-muted">
                            <span className="text-muted-foreground">No image</span>
                          </div>
                        )}
                      </div>
                      <div className="p-4 flex-grow flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-medium">
                                <Link 
                                  href={`/marketplace/listings/${item.listingId}`}
                                  className="hover:underline"
                                >
                                  {item.cropName}
                                </Link>
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                Seller: {item.farmerName}
                              </p>
                              <p className="text-sm mt-1">
                                ${item.price.toFixed(2)} / {item.unit}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemove(item.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between mt-4">
                          <div className="flex items-center">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 rounded-r-none"
                              onClick={() => handleQuantityChange(item.id, item.quantity - 1, item.maxQuantity)}
                              disabled={item.quantity <= 1}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <Input
                              type="number"
                              min="1"
                              max={item.maxQuantity}
                              value={item.quantity}
                              onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value) || 1, item.maxQuantity)}
                              className="h-8 w-16 rounded-none text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            />
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 rounded-l-none"
                              onClick={() => handleQuantityChange(item.id, item.quantity + 1, item.maxQuantity)}
                              disabled={item.quantity >= item.maxQuantity}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                          <div className="font-medium">
                            ${(item.price * item.quantity).toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
          
          <div>
            <Card>
              <CardContent className="p-6">
                <h3 className="font-medium text-lg mb-4">Order Summary</h3>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span>${shippingFee.toFixed(2)}</span>
                  </div>
                  <div className="border-t pt-2 mt-2 flex justify-between font-medium">
                    <span>Total</span>
                    <span className="text-xl">${total.toFixed(2)}</span>
                  </div>
                </div>
                
                <Button 
                  className="w-full mt-6" 
                  size="lg"
                  onClick={handleCheckout}
                >
                  Proceed to Checkout
                </Button>
                
                <div className="mt-4 text-sm text-muted-foreground">
                  <p>Shipping costs calculated at checkout.</p>
                  <p className="mt-2">Need help? Contact our support team.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}