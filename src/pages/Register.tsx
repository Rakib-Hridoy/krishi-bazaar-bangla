
import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
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
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const Register = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const defaultRole = queryParams.get('role') === 'seller' ? 'seller' : 'buyer';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'buyer' | 'seller'>(defaultRole as 'buyer' | 'seller');
  const [formError, setFormError] = useState('');
  
  const { register, isAuthenticated, isLoading } = useAuth();
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

    if (!name || !email || !password || !confirmPassword) {
      setFormError('সকল ফিল্ড পূরণ করুন');
      return;
    }

    if (password !== confirmPassword) {
      setFormError('পাসওয়ার্ড মিলছে না');
      return;
    }

    if (password.length < 6) {
      setFormError('পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে');
      return;
    }

    try {
      await register(name, email, password, role);
    } catch (error) {
      // Error is already handled in the register function
      console.error('Registration submission error:', error);
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
              <CardTitle className="text-2xl text-center">রেজিস্ট্রেশন</CardTitle>
              <CardDescription className="text-center">
                নতুন অ্যাকাউন্ট তৈরি করতে নিচের ফর্ম পূরণ করুন
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">নাম</Label>
                  <Input 
                    id="name"
                    placeholder="আপনার নাম"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                
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
                  <Label htmlFor="password">পাসওয়ার্ড</Label>
                  <Input 
                    id="password"
                    type="password"
                    placeholder="নতুন পাসওয়ার্ড"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">পাসওয়ার্ড নিশ্চিত করুন</Label>
                  <Input 
                    id="confirm-password"
                    type="password"
                    placeholder="পাসওয়ার্ড আবার লিখুন"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="role">আপনি হিসাবে রেজিস্টার করছেন</Label>
                  <Select value={role} onValueChange={(value) => setRole(value as 'buyer' | 'seller')}>
                    <SelectTrigger id="role">
                      <SelectValue placeholder="আপনার রোল নির্বাচন করুন" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="buyer">ক্রেতা</SelectItem>
                      <SelectItem value="seller">কৃষক / বিক্রেতা</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {formError && (
                  <div className="text-red-500 text-sm">{formError}</div>
                )}
                
                <Button 
                  type="submit" 
                  className="w-full bg-agriculture-green-dark hover:bg-agriculture-green-light"
                >
                  রেজিস্টার করুন
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
                  ইতিমধ্যে অ্যাকাউন্ট আছে? {" "}
                  <Link 
                    to="/login"
                    className="text-agriculture-green-dark hover:underline font-medium"
                  >
                    লগইন করুন
                  </Link>
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-center">
              <p className="text-xs text-center text-muted-foreground">
                রেজিস্টার করার মাধ্যমে আপনি আমাদের{" "}
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

export default Register;
