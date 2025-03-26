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
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, fullName: string, userType: string) => Promise<void>
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
        setUser(user)
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single()
          setProfile(profile)
        }
      } catch (error) {
        console.error('Error fetching user:', error)
      }
      setLoading(false)
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
        setProfile(profile)
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
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
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
    signOut
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