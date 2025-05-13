
import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'buyer' | 'seller' | 'admin';
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role: 'buyer' | 'seller') => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Check if user is stored in localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  // Login function - mockup for frontend only
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // For demo, we'll simulate a successful login with mock data
      // In a real app, this would be an API call to authenticate
      if (email && password) {
        const mockUser: User = {
          id: '1',
          name: email === 'admin@example.com' ? 'অ্যাডমিন' : 
                email === 'seller@example.com' ? 'কৃষক রহিম' : 'ক্রেতা করিম',
          email,
          role: email === 'admin@example.com' ? 'admin' : 
                email === 'seller@example.com' ? 'seller' : 'buyer',
        };
        
        localStorage.setItem('user', JSON.stringify(mockUser));
        setUser(mockUser);
      } else {
        throw new Error('ইমেইল এবং পাসওয়ার্ড প্রয়োজন');
      }
    } catch (error) {
      console.error('লগইন ব্যর্থ হয়েছে', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Register function - mockup for frontend only
  const register = async (name: string, email: string, password: string, role: 'buyer' | 'seller') => {
    setIsLoading(true);
    try {
      // For demo, we'll simulate a successful registration
      // In a real app, this would be an API call to register
      if (name && email && password && role) {
        const mockUser: User = {
          id: Math.random().toString(36).substr(2, 9),
          name,
          email,
          role,
        };
        
        localStorage.setItem('user', JSON.stringify(mockUser));
        setUser(mockUser);
      } else {
        throw new Error('সকল তথ্য প্রদান করা আবশ্যক');
      }
    } catch (error) {
      console.error('রেজিস্ট্রেশন ব্যর্থ হয়েছে', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      register,
      logout,
      isAuthenticated: !!user,
      isLoading,
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
