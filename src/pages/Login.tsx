
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');
  const { login, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!email || !password) {
      setFormError('সকল ফিল্ড পূরণ করুন');
      return;
    }

    try {
      await login(email, password);
    } catch (error) {
      // Error is already handled in the login function
      console.error('Login submission error:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-xl">লোড হচ্ছে...</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card>
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl text-center">লগইন</CardTitle>
              <CardDescription className="text-center">
                আপনার অ্যাকাউন্টে লগইন করতে আপনার ইমেইল এবং পাসওয়ার্ড দিন
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">ইমেইল</Label>
                  <Input 
                    id="email"
                    type="email"
                    placeholder="আপনার ইমেইল"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">পাসওয়ার্ড</Label>
                    <Link 
                      to="/forgot-password"
                      className="text-sm text-agriculture-green-dark hover:underline"
                    >
                      পাসওয়ার্ড ভুলে গেছেন?
                    </Link>
                  </div>
                  <Input 
                    id="password"
                    type="password"
                    placeholder="আপনার পাসওয়ার্ড"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                
                {formError && (
                  <div className="text-red-500 text-sm">{formError}</div>
                )}
                
                <Button 
                  type="submit" 
                  className="w-full bg-agriculture-green-dark hover:bg-agriculture-green-light"
                >
                  লগইন
                </Button>
              </form>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-muted-foreground">অথবা</span>
                </div>
              </div>
              
              <div className="text-center text-sm">
                <p>
                  অ্যাকাউন্ট নেই? {" "}
                  <Link 
                    to="/register"
                    className="text-agriculture-green-dark hover:underline font-medium"
                  >
                    রেজিস্টার করুন
                  </Link>
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-center">
              <p className="text-xs text-center text-muted-foreground">
                লগইন করার মাধ্যমে আপনি আমাদের{" "}
                <a href="#" className="text-agriculture-green-dark hover:underline">
                  শর্তাবলী
                </a>{" "}
                এবং{" "}
                <a href="#" className="text-agriculture-green-dark hover:underline">
                  গোপনীয়তা নীতি
                </a>{" "}
                মেনে নিচ্ছেন।
              </p>
            </CardFooter>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Login;
