
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@/types';
import { toast } from '@/components/ui/use-toast';

export function useUserProfile(userId?: string) {
  const [profile, setProfile] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!userId) {
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        
        const { data: currentUser } = await supabase.auth.getUser();
        
        // If viewing own profile, get complete data
        if (currentUser?.user?.id === userId) {
          const { data, error } = await supabase
            .from('profiles')
            .select(`
              id, 
              name, 
              email, 
              role, 
              phone, 
              address, 
              avatar_url
            `)
            .eq('id', userId)
            .single();

          if (error) {
            throw error;
          }
          
          // Fetch review data for own profile
          const { data: reviewData, error: reviewError } = await supabase
            .from('reviews')
            .select('rating')
            .eq('to_user_id', userId);
            
          if (reviewError) {
            console.error('Error fetching reviews:', reviewError);
          }
          
          // Calculate average rating and review count
          const reviewCount = reviewData?.length || 0;
          const avgRating = reviewData?.length 
            ? reviewData.reduce((sum, review) => sum + (review.rating || 0), 0) / reviewData.length 
            : 0;

          if (data) {
            setProfile({
              id: data.id,
              name: data.name,
              email: data.email,
              role: data.role as 'buyer' | 'seller' | 'admin',
              phone: data.phone || undefined,
              address: data.address || undefined,
              avatar: data.avatar_url || undefined,
              rating: avgRating,
              reviewCount: reviewCount
            });
          }
        } else {
          // For other users, get only basic public information
          // Filter sensitive data by only selecting public columns
          const { data, error } = await supabase
            .from('profiles')
            .select('id, name, role, avatar_url')
            .eq('id', userId)
            .single();
            
          if (error) {
            if (error.code === 'PGRST116') {
              // No user found
              throw new Error('User not found');
            }
            throw error;
          }
          
          // Fetch review data for public profiles
          const { data: reviewData, error: reviewError } = await supabase
            .from('reviews')
            .select('rating')
            .eq('to_user_id', userId);
            
          if (reviewError) {
            console.error('Error fetching reviews:', reviewError);
          }
          
          // Calculate average rating and review count
          const reviewCount = reviewData?.length || 0;
          const avgRating = reviewData?.length 
            ? reviewData.reduce((sum, review) => sum + (review.rating || 0), 0) / reviewData.length 
            : 0;

          if (data) {
            setProfile({
              id: data.id,
              name: data.name,
              email: '', // Not exposed for other users
              role: data.role as 'buyer' | 'seller' | 'admin',
              phone: undefined, // Not exposed for other users
              address: undefined, // Not exposed for other users
              avatar: data.avatar_url || undefined,
              rating: avgRating,
              reviewCount: reviewCount
            });
          }
        }
      } catch (err: any) {
        console.error('Error fetching user profile:', err);
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, [userId]);

  const updateProfile = async (profileData: Partial<User>) => {
    if (!userId) {
      toast({
        title: "প্রোফাইল আপডেট করতে সমস্যা",
        description: "প্রোফাইল আপডেট করতে লগইন করা প্রয়োজন।",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          name: profileData.name,
          phone: profileData.phone,
          address: profileData.address,
          avatar_url: profileData.avatar
        })
        .eq('id', userId)
        .select();

      if (error) {
        throw error;
      }

      if (data?.[0]) {
        setProfile(prev => prev ? { 
          ...prev, 
          name: profileData.name || prev.name,
          phone: profileData.phone || prev.phone,
          address: profileData.address || prev.address,
          avatar: profileData.avatar || prev.avatar
        } : null);
        
        toast({
          title: "প্রোফাইল আপডেট করা হয়েছে",
          description: "আপনার প্রোফাইল সফলভাবে আপডেট করা হয়েছে।"
        });
      }
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        title: "প্রোফাইল আপডেট করতে সমস্যা",
        description: error.message || "প্রোফাইল আপডেট করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।",
        variant: "destructive"
      });
    }
  };

  return { profile, isLoading, error, updateProfile };
}
