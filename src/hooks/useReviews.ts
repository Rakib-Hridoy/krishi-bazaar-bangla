
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Review } from '@/types';
import { toast } from '@/components/ui/use-toast';

export function useReviews(userId?: string) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchReviews = async () => {
      if (!userId) {
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        
        // Fetch reviews
        const { data: reviewsData, error: reviewsError } = await supabase
          .from('reviews')
          .select(`
            id,
            from_user_id,
            to_user_id,
            rating,
            comment,
            created_at
          `)
          .eq('to_user_id', userId)
          .order('created_at', { ascending: false });

        if (reviewsError) {
          throw reviewsError;
        }
        
        // Fetch user names from safe_public_profiles
        const userIds = reviewsData.map(review => review.from_user_id);
        const { data: usersData, error: usersError } = await supabase
          .from('safe_public_profiles')
          .select('id, name')
          .in('id', userIds);
          
        if (usersError) {
          throw usersError;
        }
        
        // Create a map of user IDs to names
        const userMap = new Map();
        usersData?.forEach(user => {
          userMap.set(user.id, user.name);
        });

        // Combine data
        const formattedReviews: Review[] = reviewsData.map(item => ({
          id: item.id,
          fromUserId: item.from_user_id,
          fromUserName: userMap.get(item.from_user_id) || 'অজানা ব্যবহারকারী',
          toUserId: item.to_user_id,
          rating: Number(item.rating),
          comment: item.comment || '',
          createdAt: item.created_at
        }));

        setReviews(formattedReviews);
      } catch (err: any) {
        console.error('Error fetching reviews:', err);
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReviews();
  }, [userId]);

  const addReview = async (reviewData: { fromUserId: string, toUserId: string, rating: number, comment: string }) => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .insert({
          from_user_id: reviewData.fromUserId,
          to_user_id: reviewData.toUserId,
          rating: reviewData.rating,
          comment: reviewData.comment
        })
        .select();

      if (error) {
        throw error;
      }

      toast({
        title: "রিভিউ যোগ করা হয়েছে",
        description: "আপনার রিভিউ সফলভাবে যোগ করা হয়েছে।"
      });

      // Add new review to local state if it's for the current user
      if (reviewData.toUserId === userId) {
        const newReview = data[0];
        setReviews(prev => [{
          id: newReview.id,
          fromUserId: newReview.from_user_id,
          fromUserName: 'আপনি', // This will be replaced on next fetch
          toUserId: newReview.to_user_id,
          rating: Number(newReview.rating),
          comment: newReview.comment || '',
          createdAt: newReview.created_at
        }, ...prev]);
      }

      return data[0];
    } catch (error: any) {
      console.error('Error adding review:', error);
      toast({
        title: "রিভিউ যোগ করতে সমস্যা",
        description: error.message || "রিভিউ যোগ করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।",
        variant: "destructive"
      });
      throw error;
    }
  };

  return { reviews, isLoading, error, addReview };
}

export async function getUserReviews(userId: string): Promise<Review[]> {
  try {
    // Fetch reviews
    const { data: reviewsData, error: reviewsError } = await supabase
      .from('reviews')
      .select(`
        id,
        from_user_id,
        to_user_id,
        rating,
        comment,
        created_at
      `)
      .eq('from_user_id', userId)
      .order('created_at', { ascending: false });

    if (reviewsError) {
      throw reviewsError;
    }
    
    // Fetch user names from safe_public_profiles
    const userIds = reviewsData.map(review => review.to_user_id);
    const { data: usersData, error: usersError } = await supabase
      .from('safe_public_profiles')
      .select('id, name')
      .in('id', userIds);
      
    if (usersError) {
      throw usersError;
    }
    
    // Create a map of user IDs to names
    const userMap = new Map();
    usersData?.forEach(user => {
      userMap.set(user.id, user.name);
    });

    return reviewsData.map(item => ({
      id: item.id,
      fromUserId: item.from_user_id,
      fromUserName: 'আপনি',
      toUserId: item.to_user_id,
      rating: Number(item.rating),
      comment: item.comment || '',
      createdAt: item.created_at
    }));
  } catch (error) {
    console.error('Error fetching user reviews:', error);
    return [];
  }
}
