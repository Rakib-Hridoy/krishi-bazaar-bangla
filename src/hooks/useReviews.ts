
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
        
        const { data, error } = await supabase
          .from('reviews')
          .select(`
            id,
            from_user_id,
            profiles:from_user_id (name),
            to_user_id,
            rating,
            comment,
            created_at
          `)
          .eq('to_user_id', userId)
          .order('created_at', { ascending: false });

        if (error) {
          throw error;
        }

        const formattedReviews: Review[] = data.map(item => ({
          id: item.id,
          fromUserId: item.from_user_id,
          fromUserName: item.profiles?.name || 'অজানা ব্যবহারকারী',
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
    const { data, error } = await supabase
      .from('reviews')
      .select(`
        id,
        from_user_id,
        profiles:from_user_id (name),
        to_user_id,
        rating,
        comment,
        created_at
      `)
      .eq('from_user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return data.map(item => ({
      id: item.id,
      fromUserId: item.from_user_id,
      fromUserName: item.profiles?.name || 'অজানা ব্যবহারকারী',
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
