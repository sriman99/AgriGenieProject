'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { AlertCircle, Edit, Loader2, Plus, RefreshCw, Trash } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import Link from 'next/link';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDistanceToNow } from 'date-fns';

interface CropListing {
  id: string;
  crop_name: string;
  quantity: number;
  price_per_unit: number;
  unit: string;
  description: string;
  available: boolean;
  created_at: string;
  farmer_id: string;
}

export function FarmerListings() {
  const [listings, setListings] = useState<CropListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedListing, setSelectedListing] = useState<CropListing | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  // Fetch farmer's listings on component mount
  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/marketplace/listings/my-listings');
      
      if (!response.ok) {
        throw new Error('Failed to fetch listings');
      }
      
      const data = await response.json();
      setListings(data);
    } catch (error) {
      console.error('Error fetching listings:', error);
      toast({
        title: "Error",
        description: "Failed to fetch your listings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedListing) return;
    
    try {
      setIsDeleting(true);
      const response = await fetch(`/api/marketplace/listings/${selectedListing.id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete listing');
      }
      
      // Update listings state
      setListings(listings.filter(listing => listing.id !== selectedListing.id));
      
      toast({
        title: "Success",
        description: "Listing deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting listing:', error);
      toast({
        title: "Error",
        description: "Failed to delete listing. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setSelectedListing(null);
    }
  };

  const confirmDelete = (listing: CropListing) => {
    setSelectedListing(listing);
    setDeleteDialogOpen(true);
  };

  const toggleAvailability = async (listing: CropListing) => {
    try {
      const response = await fetch(`/api/marketplace/listings/${listing.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...listing,
          available: !listing.available,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update listing availability');
      }
      
      // Update listings state
      setListings(listings.map(item => 
        item.id === listing.id ? { ...item, available: !item.available } : item
      ));
      
      toast({
        title: "Success",
        description: `Listing marked as ${!listing.available ? 'available' : 'unavailable'}`,
      });
    } catch (error) {
      console.error('Error updating listing:', error);
      toast({
        title: "Error",
        description: "Failed to update listing. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Filter listings based on active tab
  const filteredListings = () => {
    if (activeTab === "all") return listings;
    if (activeTab === "available") return listings.filter(listing => listing.available);
    if (activeTab === "unavailable") return listings.filter(listing => !listing.available);
    return listings;
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  // Show empty state
  if (listings.length === 0) {
    return (
      <Card className="w-full">
        <CardContent className="p-8 text-center">
          <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No Listings Found</h3>
          <p className="text-muted-foreground mb-6">
            You haven't created any crop listings yet. Start selling your crops by creating your first listing.
          </p>
          <Button asChild>
            <Link href="/marketplace/new">
              <Plus className="h-4 w-4 mr-2" />
              Create New Listing
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="available">Available</TabsTrigger>
            <TabsTrigger value="unavailable">Unavailable</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchListings} className="sm:w-auto">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button asChild>
            <Link href="/marketplace/new">
              <Plus className="h-4 w-4 mr-2" />
              New Listing
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredListings().map((listing) => (
          <Card key={listing.id} className="overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl">
                    {listing.crop_name}
                  </CardTitle>
                  <CardDescription>
                    Listed {formatDistanceToNow(new Date(listing.created_at), { addSuffix: true })}
                  </CardDescription>
                </div>
                <Badge variant={listing.available ? "success" : "secondary"}>
                  {listing.available ? 'Available' : 'Unavailable'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Price:</span>
                  <span className="font-medium">₹{listing.price_per_unit} per {listing.unit}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Quantity:</span>
                  <span className="font-medium">{listing.quantity} {listing.unit}</span>
                </div>
                {listing.description && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium mb-1">Description:</h4>
                    <p className="text-sm text-muted-foreground line-clamp-2">{listing.description}</p>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="pt-2 grid grid-cols-2 gap-2">
              <Button variant="outline" asChild className="w-full">
                <Link href={`/marketplace/edit/${listing.id}`}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Link>
              </Button>
              <Button
                variant={listing.available ? "ghost" : "default"}
                className="w-full"
                onClick={() => toggleAvailability(listing)}
              >
                {listing.available ? 'Hide' : 'Show'}
              </Button>
              <Button
                variant="destructive"
                className="w-full col-span-2"
                onClick={() => confirmDelete(listing)}
              >
                <Trash className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Listing</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this listing? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          {selectedListing && (
            <div className="py-4">
              <h4 className="font-medium">{selectedListing.crop_name}</h4>
              <p className="text-sm text-muted-foreground">{selectedListing.quantity} {selectedListing.unit} at ₹{selectedListing.price_per_unit} per {selectedListing.unit}</p>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trash className="h-4 w-4 mr-2" />}
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 