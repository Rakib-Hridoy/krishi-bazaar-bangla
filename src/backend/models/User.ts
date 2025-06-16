
import { User } from '@/types';
import { collections } from '../mongodb/client';

// Mock ObjectId class for browser environment
class MockObjectId {
  private id: string;
  
  constructor(id?: string) {
    this.id = id || Math.random().toString(36).substr(2, 9);
  }
  
  toString(): string {
    return this.id;
  }
  
  static isValid(id: string): boolean {
    return typeof id === 'string' && id.length > 0;
  }
}

export class UserModel {
  // Get user by ID
  static async findById(userId: string): Promise<User | null> {
    try {
      if (!MockObjectId.isValid(userId)) {
        return null;
      }
      
      const userData = await collections.profiles.findOne({ _id: userId });
      
      if (!userData) return null;
      
      const reviewData = await collections.reviews
        .find({ to_user_id: userId })
        .toArray();
      
      // Calculate average rating and review count
      const reviewCount = reviewData?.length || 0;
      const avgRating = reviewData?.length 
        ? reviewData.reduce((sum, review) => sum + (review.rating || 0), 0) / reviewData.length 
        : 0;
      
      return {
        id: userData._id.toString(),
        name: userData.name,
        email: userData.email,
        phone: userData.phone || undefined,
        role: userData.role as 'buyer' | 'seller' | 'admin',
        address: userData.address || undefined,
        avatar: userData.avatar_url || undefined,
        rating: avgRating,
        reviewCount: reviewCount
      };
    } catch (error) {
      console.error('Error in UserModel.findById:', error);
      return null;
    }
  }

  // Get user by email
  static async findByEmail(email: string): Promise<User | null> {
    try {
      const userData = await collections.profiles.findOne({ email });
      
      if (!userData) return null;
      
      const reviewData = await collections.reviews
        .find({ to_user_id: userData._id })
        .toArray();
      
      // Calculate average rating and review count
      const reviewCount = reviewData?.length || 0;
      const avgRating = reviewData?.length 
        ? reviewData.reduce((sum, review) => sum + (review.rating || 0), 0) / reviewData.length 
        : 0;
      
      return {
        id: userData._id.toString(),
        name: userData.name,
        email: userData.email,
        phone: userData.phone || undefined,
        role: userData.role as 'buyer' | 'seller' | 'admin',
        address: userData.address || undefined,
        avatar: userData.avatar_url || undefined,
        rating: avgRating,
        reviewCount: reviewCount
      };
    } catch (error) {
      console.error('Error in UserModel.findByEmail:', error);
      return null;
    }
  }

  // Get user by phone
  static async findByPhone(phone: string): Promise<User | null> {
    try {
      const userData = await collections.profiles.findOne({ phone });
      
      if (!userData) return null;
      
      const reviewData = await collections.reviews
        .find({ to_user_id: userData._id })
        .toArray();
      
      // Calculate average rating and review count
      const reviewCount = reviewData?.length || 0;
      const avgRating = reviewData?.length 
        ? reviewData.reduce((sum, review) => sum + (review.rating || 0), 0) / reviewData.length 
        : 0;
      
      return {
        id: userData._id.toString(),
        name: userData.name,
        email: userData.email,
        phone: userData.phone || undefined,
        role: userData.role as 'buyer' | 'seller' | 'admin',
        address: userData.address || undefined,
        avatar: userData.avatar_url || undefined,
        rating: avgRating,
        reviewCount: reviewCount
      };
    } catch (error) {
      console.error('Error in UserModel.findByPhone:', error);
      return null;
    }
  }

  // Update user profile
  static async updateProfile(userId: string, profileData: Partial<User>): Promise<User | null> {
    try {
      if (!MockObjectId.isValid(userId)) {
        return null;
      }

      const result = await collections.profiles.findOneAndUpdate(
        { _id: userId },
        { 
          $set: {
            name: profileData.name,
            phone: profileData.phone,
            address: profileData.address,
            avatar_url: profileData.avatar
          } 
        },
        { returnDocument: 'after' }
      );
      
      if (!result) return null;
      
      return this.findById(userId);
    } catch (error) {
      console.error('Error in UserModel.updateProfile:', error);
      return null;
    }
  }
}
