'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, Clock, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { getUserOrders } from '@/lib/marketplace-api'
import { useAuth } from '@/lib/auth-context'
import { Suspense } from 'react'

function CheckoutSuccessContent() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get('orderId')
  const router = useRouter()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [orderDetails, setOrderDetails] = useState<{
    id: string;
    createdAt: string;
    totalAmount: number;
    status: string;
  } | null>(null)

  useEffect(() => {
    async function fetchOrderDetails() {
      if (!user || !orderId) {
        return
      }

      try {
        const { data, error } = await getUserOrders(user.id)
        
        if (error) {
          throw error
        }
        
        const order = data?.find(o => o.id === orderId)
        
        if (order) {
          setOrderDetails({
            id: order.id,
            createdAt: order.created_at,
            totalAmount: order.total_amount,
            status: order.status
          })
        }
      } catch (err) {
        console.error('Error fetching order details:', err)
      } finally {
        setLoading(false)
      }
    }
    
    fetchOrderDetails()
  }, [orderId, user])

  // Redirect if there's no order ID in the URL
  useEffect(() => {
    if (!orderId && !loading) {
      router.push('/marketplace')
    }
  }, [orderId, loading, router])

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-2xl mx-auto">
        <Card className="border-green-200">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <CardTitle className="text-2xl">Order Placed Successfully!</CardTitle>
            <CardDescription>
              Your order has been received and is being processed.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {orderDetails ? (
              <div className="rounded-lg bg-muted p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Order Number</p>
                    <p className="font-medium">{orderDetails.id.slice(0, 8)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Date</p>
                    <p className="font-medium">
                      {new Date(orderDetails.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total</p>
                    <p className="font-medium">
                      ${orderDetails.totalAmount.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-orange-500" />
                      <p className="font-medium capitalize">{orderDetails.status}</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-lg bg-muted p-6">
                <p className="text-center text-muted-foreground">
                  Thank you for your purchase. Your order details are being processed.
                </p>
              </div>
            )}
            
            <div className="space-y-2 text-center">
              <p>
                We've sent a confirmation email with all the details of your order.
              </p>
              <p className="text-muted-foreground">
                You'll receive updates about your order status via email.
              </p>
            </div>
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-3">
            <Link href="/marketplace/orders" className="w-full">
              <Button className="w-full">
                View Your Orders
              </Button>
            </Link>
            <Link href="/marketplace" className="w-full">
              <Button variant="outline" className="w-full flex items-center gap-2">
                Continue Shopping
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CheckoutSuccessContent />
    </Suspense>
  )
}