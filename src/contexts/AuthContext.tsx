
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { User, Session } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';

interface Profile {
  id: string;
  name: string;
  email: string;
  role: 'buyer' | 'seller' | 'admin';
  phone?: string;
  address?: string;
  avatar_url?: string;
  rating?: number;
  reviewCount?: number;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role: 'buyer' | 'seller') => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch user profile from Supabase
  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id, 
          name, 
          email, 
          role, 
          phone, 
          address, 
          avatar_url,
          (SELECT COUNT(*) FROM reviews WHERE to_user_id = profiles.id) as review_count,
          (SELECT AVG(rating) FROM reviews WHERE to_user_id = profiles.id) as avg_rating
        `)
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }

      if (data) {
        return {
          ...data,
          rating: data.avg_rating || 0,
          reviewCount: data.review_count || 0,
        } as Profile;
      }

      return null;
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
      return null;
    }
  };

  // Refresh user profile
  const refreshProfile = async () => {
    if (user) {
      const userProfile = await fetchUserProfile(user.id);
      if (userProfile) {
        setProfile(userProfile);
      }
    }
  };

  useEffect(() => {
    const setupAuth = async () => {
      // Set up auth state change listener
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          setSession(session);
          setUser(session?.user ?? null);

          // Fetch user profile on auth state change
          if (session?.user) {
            setTimeout(async () => {
              const userProfile = await fetchUserProfile(session.user.id);
              setProfile(userProfile);
              setIsLoading(false);
            }, 0);
          } else {
            setProfile(null);
            setIsLoading(false);
          }
        }
      );

      // Check for existing session
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        const userProfile = await fetchUserProfile(session.user.id);
        setProfile(userProfile);
      }

      setIsLoading(false);
      
      return () => {
        subscription.unsubscribe();
      };
    };

    setupAuth();
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        throw error;
      }

      if (data?.user) {
        const userProfile = await fetchUserProfile(data.user.id);
        setProfile(userProfile);
        
        toast({
          title: "লগইন সফল",
          description: `স্বাগতম, ${userProfile?.name || data.user.email}!`,
        });

        navigate('/dashboard');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      toast({
        title: "লগইন ব্যর্থ",
        description: error.message || "লগইন করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Register function
  const register = async (name: string, email: string, password: string, role: 'buyer' | 'seller') => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role,
          }
        }
      });

      if (error) {
        throw error;
      }

      if (data?.user) {
        toast({
          title: "রেজিস্ট্রেশন সফল",
          description: "আপনার অ্যাকাউন্ট সফলভাবে তৈরি করা হয়েছে।",
        });
        
        navigate('/dashboard');
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      toast({
        title: "রেজিস্ট্রেশন ব্যর্থ",
        description: error.message || "রেজিস্ট্রেশন করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setProfile(null);
      navigate('/');
      
      toast({
        title: "লগআউট সফল",
        description: "আপনি সফলভাবে লগআউট করেছেন।",
      });
    } catch (error: any) {
      console.error('Logout error:', error);
      toast({
        title: "লগআউট ব্যর্থ",
        description: error.message || "লগআউট করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।",
        variant: "destructive"
      });
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      session,
      login,
      register,
      logout,
      isAuthenticated: !!user,
      isLoading,
      refreshProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
