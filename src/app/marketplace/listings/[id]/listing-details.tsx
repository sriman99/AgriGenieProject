'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { formatPrice } from '@/lib/utils'

interface ListingDetailsProps {
  listing: {
    id: string
    title: string
    description: string
    price: number
    quantity: number
    unit: string
    category: string
    condition: string
    organic: boolean
    seller: {
      id: string
      full_name: string
      avatar_url: string | null
    }
  }
}

export default function ListingDetails({ listing }: ListingDetailsProps) {
  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{listing.title}</CardTitle>
              <CardDescription>Listed by {listing.seller.full_name}</CardDescription>
            </div>
            <Avatar>
              <AvatarImage src={listing.seller.avatar_url || ''} />
              <AvatarFallback>
                {listing.seller.full_name?.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div>
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-sm text-gray-600">{listing.description}</p>
            </div>
            <Separator />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold mb-2">Price</h3>
                <p className="text-2xl font-bold text-green-600">
                  {formatPrice(listing.price)}
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Quantity Available</h3>
                <p className="text-2xl font-bold">{listing.quantity} {listing.unit}</p>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Details</h3>
              <div className="flex gap-2 flex-wrap">
                <Badge>{listing.category}</Badge>
                <Badge variant="outline">{listing.condition}</Badge>
                {listing.organic && <Badge variant="secondary">Organic</Badge>}
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Link href="/marketplace">
            <Button variant="outline">Back to Marketplace</Button>
          </Link>
          <div className="space-x-2">
            <Button variant="outline">Add to Cart</Button>
            <Button>Buy Now</Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
} 