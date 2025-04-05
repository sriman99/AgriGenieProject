'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from './supabase'
import type { User } from '@supabase/supabase-js'
import type { Database } from './supabase'
import { toast } from 'sonner'

// Define the cart item type
export type CartItem = {
  id: string
  listingId: string
  cropName: string
  price: number
  quantity: number
  farmerId: string
  farmerName: string
  unit: string
  imageUrl?: string
  maxQuantity: number // The maximum quantity available
}

// Define the wishlist item type
export type WishlistItem = {
  id: string
  listingId: string
  cropName: string
  price: number
  farmerId: string
  farmerName: string
  addedAt: Date
  imageUrl?: string
}

type Profile = Database['public']['Tables']['profiles']['Row']

type AuthContextType = {
  user: User | null
  profile: Profile | null
  loading: boolean
  cartItems: CartItem[]
  wishlistItems: WishlistItem[]
  addToCart: (item: CartItem) => void
  removeFromCart: (itemId: string) => void
  updateCartItemQuantity: (itemId: string, quantity: number) => void
  clearCart: () => void
  addToWishlist: (item: WishlistItem) => void
  removeFromWishlist: (itemId: string) => void
  clearWishlist: () => void
  signIn: (email: string, password: string) => Promise<string | undefined>
  signUp: (email: string, password: string, fullName: string, userType: string) => Promise<User | void>
  signOut: () => Promise<void>
}

// Store last signup attempt timestamp
let lastSignupAttempt = 0;
const SIGNUP_COOLDOWN = 60000; // 1 minute cooldown

// Local storage keys
const CART_STORAGE_KEY = 'agrigenie_cart';
const WISHLIST_STORAGE_KEY = 'agrigenie_wishlist';

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([])
  const supabase = createClient()

  // Load cart and wishlist from local storage when user is authenticated
  useEffect(() => {
    if (user) {
      // Load cart from local storage
      const savedCart = localStorage.getItem(`${CART_STORAGE_KEY}_${user.id}`);
      if (savedCart) {
        try {
          setCartItems(JSON.parse(savedCart));
        } catch (e) {
          console.error('Error parsing cart from local storage:', e);
          setCartItems([]);
        }
      }

      // Load wishlist from local storage
      const savedWishlist = localStorage.getItem(`${WISHLIST_STORAGE_KEY}_${user.id}`);
      if (savedWishlist) {
        try {
          setWishlistItems(JSON.parse(savedWishlist));
        } catch (e) {
          console.error('Error parsing wishlist from local storage:', e);
          setWishlistItems([]);
        }
      }
    } else {
      // Clear cart and wishlist if no user
      setCartItems([]);
      setWishlistItems([]);
    }
  }, [user]);

  // Save cart to local storage when it changes
  useEffect(() => {
    if (user && cartItems.length > 0) {
      localStorage.setItem(`${CART_STORAGE_KEY}_${user.id}`, JSON.stringify(cartItems));
    } else if (user) {
      localStorage.removeItem(`${CART_STORAGE_KEY}_${user.id}`);
    }
  }, [cartItems, user]);

  // Save wishlist to local storage when it changes
  useEffect(() => {
    if (user && wishlistItems.length > 0) {
      localStorage.setItem(`${WISHLIST_STORAGE_KEY}_${user.id}`, JSON.stringify(wishlistItems));
    } else if (user) {
      localStorage.removeItem(`${WISHLIST_STORAGE_KEY}_${user.id}`);
    }
  }, [wishlistItems, user]);

  useEffect(() => {
    const getUser = async () => {
      try {
        // Get the current session
        const { data: { session } } = await supabase.auth.getSession();
        
        // If there's an active session, get the user
        if (session) {
          const { data: { user } } = await supabase.auth.getUser();
          console.log("Auth-context: getUser() user:", user?.id);
          setUser(user);
          
          if (user) {
            const { data: profile, error: profileError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', user.id)
              .single()
            
            if (profileError) {
              console.error("Error fetching profile:", profileError.message);
              // Check if the profile doesn't exist
              if (profileError.code === 'PGRST116') {
                console.log("Profile doesn't exist, creating one from user metadata");
                // Try to create profile from auth metadata as fallback
                const metadata = user.user_metadata;
                if (metadata && metadata.full_name && metadata.user_type) {
                  const { error: insertError } = await supabase
                    .from('profiles')
                    .insert([{
                      id: user.id,
                      email: user.email,
                      full_name: metadata.full_name,
                      user_type: metadata.user_type
                    }]);
                    
                  if (insertError) {
                    console.error("Failed to create profile from metadata:", insertError);
                  } else {
                    // Fetch the profile again after creating it
                    const { data: newProfile } = await supabase
                      .from('profiles')
                      .select('*')
                      .eq('id', user.id)
                      .single();
                    setProfile(newProfile);
                    console.log("Created and set profile from metadata:", newProfile);
                  }
                }
              }
            } else {
              setProfile(profile);
              console.log("Auth-context: profile loaded:", profile?.user_type);
            }
          }
        } else {
          // No active session
          setUser(null);
          setProfile(null);
        }
      } catch (error) {
        console.error('Error fetching user:', error);
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    };

    getUser();

    // Setup auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state change event:", event);
      
      // Update user if session exists
      setUser(session?.user ?? null);
      
      if (session?.user) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
        
        if (profileError) {
          console.error("Error fetching profile on auth change:", profileError.message);
          // Try to create profile from auth metadata if it doesn't exist
          if (profileError.code === 'PGRST116') {
            console.log("Profile doesn't exist on auth change, creating from metadata");
            const metadata = session.user.user_metadata;
            if (metadata && metadata.full_name && metadata.user_type) {
              const { error: insertError } = await supabase
                .from('profiles')
                .insert([{
                  id: session.user.id,
                  email: session.user.email,
                  full_name: metadata.full_name,
                  user_type: metadata.user_type
                }]);
                
              if (insertError) {
                console.error("Failed to create profile from metadata on auth change:", insertError);
              } else {
                // Fetch the profile again after creating it
                const { data: newProfile } = await supabase
                  .from('profiles')
                  .select('*')
                  .eq('id', session.user.id)
                  .single();
                setProfile(newProfile);
                console.log("Created and set profile from metadata on auth change:", newProfile);
              }
            }
          }
        } else {
          setProfile(profile);
          console.log("Auth-context: profile loaded on auth change:", profile?.user_type);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    
    // After successful sign-in, get user profile to determine user type
    if (data.user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('user_type')
        .eq('id', data.user.id)
        .single()
      
      // Return user type for redirection
      return profile?.user_type
    }
  }

  const signUp = async (email: string, password: string, fullName: string, userType: string) => {
    try {
      // Check if enough time has passed since last attempt
      const now = Date.now();
      const timeElapsed = now - lastSignupAttempt;
      
      if (timeElapsed < SIGNUP_COOLDOWN) {
        const waitTime = Math.ceil((SIGNUP_COOLDOWN - timeElapsed) / 1000);
        throw new Error(`Please wait ${waitTime} seconds before trying again`);
      }

      // Update last attempt timestamp
      lastSignupAttempt = now;

      // Step 1: Create auth user
      const { data: { user }, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            user_type: userType
          }
        }
      })

      if (signUpError) {
        if (signUpError.message.includes('rate limit')) {
          throw new Error('Too many signup attempts. Please try again in a few minutes.');
        }
        throw signUpError;
      }

      if (!user) throw new Error('Failed to create user')
      
      console.log("User created successfully:", user.id);
      console.log("Creating profile with user_type:", userType);

      // Step 2: Create profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([
          {
            id: user.id,
            email,
            full_name: fullName,
            user_type: userType
          }
        ])

      if (profileError) {
        console.error('Profile creation error:', profileError)
        throw new Error('Failed to create user profile')
      }
      
      console.log("Profile created successfully");

      toast.success('Account created successfully! Please check your email for verification.')
      return user

    } catch (error: any) {
      console.error('SignUp error:', error)
      if (error.message.includes('already registered')) {
        throw new Error('This email is already registered. Please try signing in.')
      }
      throw error
    }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error

    // Clear cart and wishlist when signing out
    setCartItems([])
    setWishlistItems([])
  }

  // Cart management functions
  const addToCart = (item: CartItem) => {
    setCartItems((prevItems) => {
      // Check if item already exists in cart
      const existingItem = prevItems.find((i) => i.listingId === item.listingId);
      if (existingItem) {
        // Update quantity if item exists
        return prevItems.map((i) => 
          i.listingId === item.listingId 
            ? { ...i, quantity: i.quantity + item.quantity } 
            : i
        );
      } else {
        // Add new item
        return [...prevItems, item];
      }
    });

    toast.success(`Added ${item.cropName} to cart`);
  };

  const removeFromCart = (itemId: string) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== itemId));
  };

  const updateCartItemQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }

    setCartItems((prevItems) => 
      prevItems.map((item) => 
        item.id === itemId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  // Wishlist management functions
  const addToWishlist = (item: WishlistItem) => {
    setWishlistItems((prevItems) => {
      // Check if item already exists
      const existingItem = prevItems.find((i) => i.listingId === item.listingId);
      if (existingItem) {
        return prevItems;
      } else {
        return [...prevItems, item];
      }
    });

    toast.success(`Added ${item.cropName} to wishlist`);
  };

  const removeFromWishlist = (itemId: string) => {
    setWishlistItems((prevItems) => prevItems.filter((item) => item.id !== itemId));
  };

  const clearWishlist = () => {
    setWishlistItems([]);
  };

  const value = {
    user,
    profile,
    loading,
    cartItems,
    wishlistItems,
    addToCart,
    removeFromCart,
    updateCartItemQuantity,
    clearCart,
    addToWishlist,
    removeFromWishlist,
    clearWishlist,
    signIn,
    signUp,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}