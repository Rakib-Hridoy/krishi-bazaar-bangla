
import { supabase } from '../supabase/client';
import { Review } from '@/types';

// Get reviews for a specific user
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
      .eq('to_user_id', userId)
      .order('created_at', { ascending: false });

    if (reviewsError) {
      throw reviewsError;
    }
    
    // Fetch user names in a separate query
    const userIds = reviewsData.map(review => review.from_user_id);
    const { data: usersData, error: usersError } = await supabase
      .from('profiles')
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
    return reviewsData.map(item => ({
      id: item.id,
      fromUserId: item.from_user_id,
      fromUserName: userMap.get(item.from_user_id) || 'অজানা ব্যবহারকারী',
      toUserId: item.to_user_id,
      rating: Number(item.rating),
      comment: item.comment || '',
      createdAt: item.created_at
    }));
  } catch (error) {
    console.error('Error fetching reviews:', error);
    throw error;
  }
}

// Add a new review
export async function addReview(reviewData: { fromUserId: string, toUserId: string, rating: number, comment: string }) {
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

    return data[0];
  } catch (error) {
    console.error('Error adding review:', error);
    throw error;
  }
}

// Get reviews written by a user
export async function getReviewsByUser(userId: string): Promise<Review[]> {
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
    
    // Fetch user names in a separate query
    const userIds = reviewsData.map(review => review.to_user_id);
    const { data: usersData, error: usersError } = await supabase
      .from('profiles')
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
