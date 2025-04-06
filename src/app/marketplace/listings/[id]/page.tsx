import { Metadata } from 'next'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import ListingDetails from './listing-details'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const cookieStore = cookies()
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  const supabase = createClient(supabaseUrl, supabaseKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
    },
  })

  const { data: listing } = await supabase
    .from('listings')
    .select('title')
    .eq('id', params.id)
    .single()

  return {
    title: listing?.title || 'Listing Details',
  }
}

async function getListing(id: string) {
  const cookieStore = cookies()
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  const supabase = createClient(supabaseUrl, supabaseKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
    },
  })

  const { data: listing } = await supabase
    .from('listings')
    .select(`
      *,
      seller:profiles(*)
    `)
    .eq('id', id)
    .single()

  return listing
}

export default async function Page({ params }: { params: { id: string } }) {
  const listing = await getListing(params.id)

  if (!listing) {
    return (
      <div className="container mx-auto py-8">
        <h1 className="text-2xl font-bold">Listing not found</h1>
      </div>
    )
  }

  return <ListingDetails listing={listing} />
}