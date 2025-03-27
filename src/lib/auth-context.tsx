'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from './supabase'
import type { User } from '@supabase/supabase-js'
import type { Database } from './supabase'
import { toast } from 'sonner'

type Profile = Database['public']['Tables']['profiles']['Row']
type AuthContextType = {
  user: User | null
  profile: Profile | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<string | undefined>
  signUp: (email: string, password: string, fullName: string, userType: string) => Promise<User | void>
  signOut: () => Promise<void>
}

// Store last signup attempt timestamp
let lastSignupAttempt = 0;
const SIGNUP_COOLDOWN = 60000; // 1 minute cooldown

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        console.log("Auth-context: getUser() user:", user?.id);
        setUser(user)
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
      } catch (error) {
        console.error('Error fetching user:', error)
      }
      setLoading(false)
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state change event:", event);
      setUser(session?.user ?? null)
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
        setProfile(null)
      }
      setLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

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
  }

  const value = {
    user,
    profile,
    loading,
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