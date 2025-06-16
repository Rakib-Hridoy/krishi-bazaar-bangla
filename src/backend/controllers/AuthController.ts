
import { supabase } from '../supabase/client';
import { UserModel } from '../models/User';
import { User } from '@/types';

export class AuthController {
  // Login function - now supports email or phone
  static async login(emailOrPhone: string, password: string) {
    // Check if input is email or phone
    const isEmail = emailOrPhone.includes('@');
    
    if (isEmail) {
      // Login with email
      const { data, error } = await supabase.auth.signInWithPassword({
        email: emailOrPhone,
        password
      });
      
      if (error) throw error;
      return data;
    } else {
      // Login with phone - first find user by phone
      const user = await UserModel.findByPhone(emailOrPhone);
      
      if (!user || !user.email) {
        throw new Error('ফোন নাম্বার খুঁজে পাওয়া যায়নি');
      }
      
      // Login with the associated email
      const { data, error } = await supabase.auth.signInWithPassword({
        email: user.email,
        password
      });
      
      if (error) throw error;
      return data;
    }
  }

  // Register function - now requires phone
  static async register(name: string, email: string, phone: string, password: string, role: 'buyer' | 'seller') {
    // Check if phone is already registered
    const existingUserByPhone = await UserModel.findByPhone(phone);
    
    if (existingUserByPhone) {
      throw new Error('এই ফোন নাম্বারটি ইতিমধ্যে ব্যবহৃত হয়েছে');
    }
    
    // Register with mock auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          phone,
          role,
        }
      }
    });
    
    if (error) throw error;
    return data;
  }

  // Logout function
  static async logout() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }

  // Get current session
  static async getCurrentSession() {
    const { data } = await supabase.auth.getSession();
    return data.session;
  }

  // Get user profile
  static async getUserProfile(userId: string): Promise<User | null> {
    return UserModel.findById(userId);
  }

  // Update user profile
  static async updateUserProfile(userId: string, profileData: Partial<User>): Promise<User | null> {
    return UserModel.updateProfile(userId, profileData);
  }
}
