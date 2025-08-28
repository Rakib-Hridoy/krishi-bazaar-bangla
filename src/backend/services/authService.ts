
import { supabase } from '../supabase/client';
import { User } from '@/types';

// Login function
export async function login(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  
  if (error) throw error;
  return data;
}

// Register function
export async function register(name: string, email: string, password: string, role: 'buyer' | 'seller') {
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
  
  if (error) throw error;
  return data;
}

// Logout function
export async function logout() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

// Get current session
export async function getCurrentSession() {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

// Get user profile
export async function getUserProfile(userId: string) {
  try {
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
        
      if (error) throw error;
      
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
        return {
          id: data.id,
          name: data.name,
          email: data.email,
          role: data.role as 'buyer' | 'seller' | 'admin',
          phone: data.phone || undefined,
          address: data.address || undefined,
          avatar: data.avatar_url || undefined,
          rating: avgRating,
          reviewCount: reviewCount
        } as User;
      }
    } else {
      // For other users, get only public information
      const { data, error } = await (supabase as any)
        .rpc('get_public_profile', { profile_user_id: userId });
        
      if (error) throw error;
      
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

      if (data && data.length > 0) {
        const profile = data[0];
        return {
          id: profile.id,
          name: profile.name,
          email: '', // Not exposed for other users
          role: profile.role as 'buyer' | 'seller' | 'admin',
          phone: undefined, // Not exposed for other users
          address: undefined, // Not exposed for other users
          avatar: profile.avatar_url || undefined,
          rating: avgRating,
          reviewCount: reviewCount
        } as User;
      }
    }

    return null;
  } catch (error) {
    console.error('Error in getUserProfile:', error);
    throw error;
  }
}

// Update user profile
export async function updateUserProfile(userId: string, profileData: Partial<User>) {
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

  if (error) throw error;
  return data?.[0];
}
