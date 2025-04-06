import { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import MarketplaceListings from '@/components/marketplace/marketplace-listings'

export const metadata: Metadata = {
  title: 'AgriGenie - Marketplace',
  description: 'Buy and sell agricultural products directly from farmers.',
}

export default function MarketplacePage() {
  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Marketplace</h1>
            <p className="text-muted-foreground">
              Connect directly with farmers and buy fresh produce.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/marketplace/cart">
              <Button variant="outline">View Cart</Button>
            </Link>
            <Link href="/marketplace/listings/create">
              <Button>List Your Produce</Button>
            </Link>
          </div>
        </div>

        {/* Our new marketplace listings component with built-in filtering */}
        <MarketplaceListings />

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Direct from Farmers</CardTitle>
              <CardDescription>
                Buy directly from local farmers in your area.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>
                Get fresh, high-quality produce directly from the source. Support local agriculture and reduce the carbon footprint of your food.
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">Learn More</Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Sell Your Crops</CardTitle>
              <CardDescription>
                Are you a farmer? List your produce on our marketplace.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>
                Reach more customers and get fair prices for your agricultural products. Create listings easily and manage your inventory.
              </p>
            </CardContent>
            <CardFooter>
              <Link href="/marketplace/listings/create" className="w-full">
                <Button className="w-full">Start Selling</Button>
              </Link>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Secure Transactions</CardTitle>
              <CardDescription>
                Safe and secure payments for all marketplace transactions.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>
                Our platform ensures secure transactions between buyers and sellers. Purchases are protected with our satisfaction guarantee.
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">Learn More</Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}