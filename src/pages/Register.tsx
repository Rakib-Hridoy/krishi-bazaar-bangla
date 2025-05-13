
import { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<'buyer' | 'seller'>('buyer');
  const [isLoading, setIsLoading] = useState(false);
  
  const { register } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Set the role from URL parameter if available
  useEffect(() => {
    const roleParam = searchParams.get('role');
    if (roleParam === 'buyer' || roleParam === 'seller') {
      setRole(roleParam);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({
        title: "পাসওয়ার্ড মিলছে না",
        description: "দুটি পাসওয়ার্ড একই হতে হবে।",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      await register(name, email, password, role);
      toast({
        title: "রেজিস্ট্রেশন সফল হয়েছে",
        description: `আপনি ${role === 'seller' ? 'কৃষক' : 'ক্রেতা'} হিসেবে রেজিস্টার করেছেন।`,
      });
      navigate('/dashboard');
    } catch (error) {
      console.error(error);
      toast({
        title: "রেজিস্ট্রেশন ব্যর্থ হয়েছে",
        description: "অনুগ্রহ করে আবার চেষ্টা করুন।",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <Card className="w-full max-w-lg">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold">অ্যাকাউন্ট তৈরি করুন</CardTitle>
            <CardDescription>
              নিচের ফর্ম পূরণ করে অ্যাকাউন্ট তৈরি করুন।
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">পূর্ণ নাম</Label>
                <Input 
                  id="name" 
                  placeholder="আপনার নাম দিন" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">ইমেইল</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="আপনার ইমেইল দিন" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">মোবাইল নাম্বার</Label>
                <Input 
                  id="phone" 
                  placeholder="আপনার মোবাইল নাম্বার দিন" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">পাসওয়ার্ড</Label>
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="কমপক্ষে ৬ অক্ষরের পাসওয়ার্ড দিন" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">পাসওয়ার্ড নিশ্চিত করুন</Label>
                <Input 
                  id="confirmPassword" 
                  type="password" 
                  placeholder="আবার পাসওয়ার্ড দিন" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label>অ্যাকাউন্টের ধরণ</Label>
                <RadioGroup value={role} onValueChange={(val) => setRole(val as 'buyer' | 'seller')} className="flex justify-center space-x-8">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="buyer" id="buyer" />
                    <Label htmlFor="buyer">ক্রেতা</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="seller" id="seller" />
                    <Label htmlFor="seller">কৃষক / বিক্রেতা</Label>
                  </div>
                </RadioGroup>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col">
              <Button 
                type="submit" 
                className="w-full bg-agriculture-green-dark hover:bg-agriculture-green-light"
                disabled={isLoading}
              >
                {isLoading ? "প্রসেসিং..." : "রেজিস্টার করুন"}
              </Button>
              
              <p className="mt-4 text-center text-sm">
                ইতিমধ্যে অ্যাকাউন্ট আছে? {" "}
                <Link to="/login" className="text-agriculture-green-dark hover:underline font-medium">
                  লগইন করুন
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </main>
      
      <Footer />
    </div>
  );
};

export default Register;
