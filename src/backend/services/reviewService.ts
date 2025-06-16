
import { collections } from '../mongodb/client';
import { Review } from '@/types';

// Get reviews for a specific user
export async function getUserReviews(userId: string): Promise<Review[]> {
  try {
    // Fetch reviews
    const reviewsData = await collections.reviews
      .find({ to_user_id: userId })
      .toArray();
    
    // Fetch user names
    const userIds = reviewsData.map(review => review.from_user_id);
    const usersData = await collections.profiles
      .find({ _id: { $in: userIds } })
      .toArray();
    
    // Create a map of user IDs to names
    const userMap = new Map();
    usersData?.forEach(user => {
      userMap.set(user._id, user.name);
    });

    // Combine data
    return reviewsData.map(item => ({
      id: item._id,
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
    const result = await collections.reviews.insertOne({
      from_user_id: reviewData.fromUserId,
      to_user_id: reviewData.toUserId,
      rating: reviewData.rating,
      comment: reviewData.comment,
      created_at: new Date().toISOString()
    });

    return { id: result.insertedId, ...reviewData, created_at: new Date().toISOString() };
  } catch (error) {
    console.error('Error adding review:', error);
    throw error;
  }
}

// Get reviews written by a user
export async function getReviewsByUser(userId: string): Promise<Review[]> {
  try {
    // Fetch reviews
    const reviewsData = await collections.reviews
      .find({ from_user_id: userId })
      .toArray();
    
    // Fetch user names
    const userIds = reviewsData.map(review => review.to_user_id);
    const usersData = await collections.profiles
      .find({ _id: { $in: userIds } })
      .toArray();
    
    // Create a map of user IDs to names
    const userMap = new Map();
    usersData?.forEach(user => {
      userMap.set(user._id, user.name);
    });

    return reviewsData.map(item => ({
      id: item._id,
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
