
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';

interface User {
  id: string;
  email: string;
}

interface Profile {
  id: string;
  name: string;
  email: string;
  role: 'buyer' | 'seller' | 'admin';
  phone?: string;
  address?: string;
  avatar_url?: string;
  rating?: number;
  reviewCount?: number;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: any | null;
  login: (emailOrPhone: string, password: string) => Promise<void>;
  register: (name: string, email: string, phone: string, password: string, role: 'buyer' | 'seller') => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock authentication for development
const mockAuth = {
  login: async (emailOrPhone: string, password: string) => {
    // In a real app, this would be an API call
    if (password === 'password') {
      const user = {
        id: '123',
        email: emailOrPhone.includes('@') ? emailOrPhone : 'user@example.com',
      };
      
      localStorage.setItem('user', JSON.stringify(user));
      return user;
    }
    throw new Error('Invalid credentials');
  },
  register: async (name: string, email: string, phone: string, password: string, role: 'buyer' | 'seller') => {
    // In a real app, this would be an API call
    const user = {
      id: '123',
      email,
      name,
      phone,
      role,
    };
    
    localStorage.setItem('user', JSON.stringify(user));
    return user;
  },
  logout: async () => {
    localStorage.removeItem('user');
  },
  getSession: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch user profile
  const fetchUserProfile = async (userId: string) => {
    try {
      // In a real app, this would be an API call to fetch profile data
      // For now, we'll just mock it
      const mockProfile = {
        id: userId,
        name: 'Test User',
        email: user?.email || '',
        role: 'buyer' as const,
        rating: 4.5,
        reviewCount: 10
      };
      
      return mockProfile;
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
      return null;
    }
  };

  // Refresh user profile
  const refreshProfile = async () => {
    if (user) {
      const userProfile = await fetchUserProfile(user.id);
      if (userProfile) {
        setProfile(userProfile);
      }
    }
  };

  useEffect(() => {
    const setupAuth = async () => {
      // Check for existing session
      const savedUser = mockAuth.getSession();
      setUser(savedUser);
      
      if (savedUser) {
        const userProfile = await fetchUserProfile(savedUser.id);
        setProfile(userProfile);
      }

      setIsLoading(false);
    };

    setupAuth();
  }, []);

  // Login function
  const login = async (emailOrPhone: string, password: string) => {
    try {
      setIsLoading(true);
      
      const loggedInUser = await mockAuth.login(emailOrPhone, password);
      setUser(loggedInUser);
      
      const userProfile = await fetchUserProfile(loggedInUser.id);
      setProfile(userProfile);
      
      toast({
        title: "লগইন সফল",
        description: `স্বাগতম, ${userProfile?.name || loggedInUser.email}!`,
      });

      navigate('/dashboard');
    } catch (error: any) {
      console.error('Login error:', error);
      toast({
        title: "লগইন ব্যর্থ",
        description: error.message || "লগইন করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Register function
  const register = async (name: string, email: string, phone: string, password: string, role: 'buyer' | 'seller') => {
    try {
      setIsLoading(true);
      
      const registeredUser = await mockAuth.register(name, email, phone, password, role);
      setUser(registeredUser);
      
      const userProfile = await fetchUserProfile(registeredUser.id);
      setProfile(userProfile);
      
      toast({
        title: "রেজিস্ট্রেশন সফল",
        description: "আপনার অ্যাকাউন্ট সফলভাবে তৈরি করা হয়েছে।",
      });
      
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Registration error:', error);
      toast({
        title: "রেজিস্ট্রেশন ব্যর্থ",
        description: error.message || "রেজিস্ট্রেশন করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await mockAuth.logout();
      setUser(null);
      setProfile(null);
      navigate('/');
      
      toast({
        title: "লগআউট সফল",
        description: "আপনি সফলভাবে লগআউট করেছেন।",
      });
    } catch (error: any) {
      console.error('Logout error:', error);
      toast({
        title: "লগআউট ব্যর্থ",
        description: error.message || "লগআউট করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।",
        variant: "destructive"
      });
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      session,
      login,
      register,
      logout,
      isAuthenticated: !!user,
      isLoading,
      refreshProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
