'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getUserOrders, getFarmerOrders, Order } from '@/lib/marketplace-api'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2, Package, Clock, CheckCircle, X, ArrowLeft } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import Link from 'next/link'

export default function OrdersPage() {
  const { user, profile } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [buyerOrders, setBuyerOrders] = useState<Order[]>([])
  const [farmerOrders, setFarmerOrders] = useState<Order[]>([])
  
  // Determine if the user is a farmer
  const isFarmer = profile?.user_type === 'farmer'
  
  useEffect(() => {
    // Redirect to login if not authenticated
    if (!user) {
      router.push('/auth?redirect=/marketplace/orders')
      return
    }
    
    async function fetchOrders() {
      setLoading(true)
      setError(null)
      
      try {
        // Always fetch buyer orders
        if (!user) {
          throw new Error('User is not authenticated');
        }
        const { data: buyerData, error: buyerError } = await getUserOrders(user.id)
        
        if (buyerError) {
          throw buyerError
        }
        
        setBuyerOrders(buyerData || [])
        
        // If user is a farmer, also fetch farmer orders
        if (isFarmer) {
          const { data: farmerData, error: farmerError } = await getFarmerOrders(user.id)
          
          if (farmerError) {
            throw farmerError
          }
          
          setFarmerOrders(farmerData || [])
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load orders')
      } finally {
        setLoading(false)
      }
    }
    
    fetchOrders()
  }, [user, isFarmer, router])
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>
      case 'paid':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Paid</Badge>
      case 'processing':
        return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">Processing</Badge>
      case 'shipped':
        return <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">Shipped</Badge>
      case 'delivered':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Delivered</Badge>
      case 'cancelled':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Cancelled</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'paid':
        return <CheckCircle className="h-4 w-4 text-blue-500" />
      case 'processing':
        return <Package className="h-4 w-4 text-purple-500" />
      case 'shipped':
        return <Package className="h-4 w-4 text-indigo-500" />
      case 'delivered':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'cancelled':
        return <X className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }
  
  // If not authenticated
  if (!user) {
    return null // Will redirect in useEffect
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
      
      <h1 className="text-3xl font-bold tracking-tight mb-6">Your Orders</h1>
      
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
      ) : (
        <Tabs defaultValue="purchases" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="purchases">Your Purchases</TabsTrigger>
            {isFarmer && <TabsTrigger value="sales">Your Sales</TabsTrigger>}
          </TabsList>
          
          <TabsContent value="purchases">
            {buyerOrders.length === 0 ? (
              <Card>
                <CardHeader className="text-center">
                  <CardTitle>No orders found</CardTitle>
                  <CardDescription>
                    You haven't made any purchases yet.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center pb-6">
                  <Link href="/marketplace">
                    <Button>Browse Products</Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {buyerOrders.map((order) => (
                  <Card key={order.id}>
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">Order #{order.id.slice(0, 8)}</CardTitle>
                          <CardDescription>
                            Placed on {format(new Date(order.created_at), 'MMMM d, yyyy')}
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(order.status)}
                          {getStatusBadge(order.status)}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <h3 className="font-medium mb-2">Items</h3>
                          <div className="space-y-2">
                            {order.items.map((item) => (
                              <div key={item.id} className="flex justify-between items-center">
                                <div>
                                  <p>{item.crop_name}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {item.quantity} {item.unit}{item.quantity > 1 ? 's' : ''} × ${item.price.toFixed(2)}
                                  </p>
                                </div>
                                <p className="font-medium">${item.total_price.toFixed(2)}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <div className="flex justify-between border-t pt-4 mt-4">
                          <p className="font-medium">Total</p>
                          <p className="font-medium">${order.total_amount.toFixed(2)}</p>
                        </div>
                      </div>
                      
                      <div className="mt-6">
                        <Button 
                          variant="outline" 
                          className="w-full"
                          onClick={() => router.push(`/marketplace/orders/${order.id}`)}
                        >
                          View Order Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          
          {isFarmer && (
            <TabsContent value="sales">
              {farmerOrders.length === 0 ? (
                <Card>
                  <CardHeader className="text-center">
                    <CardTitle>No sales found</CardTitle>
                    <CardDescription>
                      You haven't received any orders yet.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex justify-center pb-6">
                    <Link href="/marketplace/listings/create">
                      <Button>Create Listing</Button>
                    </Link>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-6">
                  {farmerOrders.map((order) => (
                    <Card key={order.id}>
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg">Order #{order.id.slice(0, 8)}</CardTitle>
                            <CardDescription>
                              Received on {format(new Date(order.created_at), 'MMMM d, yyyy')}
                            </CardDescription>
                          </div>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(order.status)}
                            {getStatusBadge(order.status)}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div>
                            <h3 className="font-medium mb-2">Items</h3>
                            <div className="space-y-2">
                              {order.items.map((item) => (
                                <div key={item.id} className="flex justify-between items-center">
                                  <div>
                                    <p>{item.crop_name}</p>
                                    <p className="text-sm text-muted-foreground">
                                      {item.quantity} {item.unit}{item.quantity > 1 ? 's' : ''} × ${item.price.toFixed(2)}
                                    </p>
                                  </div>
                                  <p className="font-medium">${item.total_price.toFixed(2)}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                          
                          <div className="flex justify-between border-t pt-4 mt-4">
                            <p className="font-medium">Total</p>
                            <p className="font-medium">${order.total_amount.toFixed(2)}</p>
                          </div>
                        </div>
                        
                        <div className="mt-6 flex flex-col sm:flex-row gap-3">
                          <Button 
                            variant="outline" 
                            className="flex-1"
                            onClick={() => router.push(`/marketplace/orders/${order.id}`)}
                          >
                            View Order Details
                          </Button>
                          
                          {order.status === 'pending' && (
                            <Button 
                              className="flex-1"
                              onClick={() => router.push(`/marketplace/orders/${order.id}/update`)}
                            >
                              Process Order
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          )}
        </Tabs>
      )}
    </div>
  )
}