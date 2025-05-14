
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
          throw error;
        }

        if (data) {
          setProfile({
            id: data.id,
            name: data.name,
            email: data.email,
            role: data.role,
            phone: data.phone || undefined,
            address: data.address || undefined,
            rating: data.avg_rating || 0,
            reviewCount: data.review_count || 0
          });
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
          address: profileData.address
        })
        .eq('id', userId)
        .select();

      if (error) {
        throw error;
      }

      if (data?.[0]) {
        setProfile(prev => prev ? { ...prev, ...profileData } : null);
        
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
