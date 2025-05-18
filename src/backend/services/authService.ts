
import { AuthController } from '../controllers/AuthController';

// Login function - supports both email and phone
export async function login(emailOrPhone: string, password: string) {
  return AuthController.login(emailOrPhone, password);
}

// Register function
export async function register(name: string, email: string, phone: string, password: string, role: 'buyer' | 'seller') {
  return AuthController.register(name, email, phone, password, role);
}

// Logout function
export async function logout() {
  return AuthController.logout();
}

// Get current session
export async function getCurrentSession() {
  return AuthController.getCurrentSession();
}

// Get user profile
export async function getUserProfile(userId: string) {
  return AuthController.getUserProfile(userId);
}

// Update user profile
export async function updateUserProfile(userId: string, profileData: any) {
  return AuthController.updateUserProfile(userId, profileData);
}
