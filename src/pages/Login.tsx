
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await login(email, password);
      toast({
        title: "সফলভাবে লগইন হয়েছে",
        description: "আপনার অ্যাকাউন্টে প্রবেশ করা হচ্ছে...",
      });
      navigate('/dashboard');
    } catch (error) {
      console.error(error);
      toast({
        title: "লগইন ব্যর্থ হয়েছে",
        description: "সঠিক ইমেইল ও পাসওয়ার্ড দিয়ে আবার চেষ্টা করুন।",
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
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold">লগইন করুন</CardTitle>
            <p className="text-sm text-muted-foreground">
              আপনার ইমেইল এবং পাসওয়ার্ড দিয়ে লগইন করুন
            </p>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
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
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">পাসওয়ার্ড</Label>
                  <Link to="/forgot-password" className="text-sm text-agriculture-green-dark hover:underline">
                    পাসওয়ার্ড ভুলে গেছেন?
                  </Link>
                </div>
                <Input 
                  id="password"
                  type="password"
                  placeholder="আপনার পাসওয়ার্ড দিন"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {/* Demo account information */}
              <div className="bg-agriculture-cream p-3 rounded-md">
                <p className="text-sm font-medium">ডেমো একাউন্ট (যেকোন একটি ব্যবহার করুন):</p>
                <p className="text-xs mt-1">অ্যাডমিন: admin@example.com, পাসওয়ার্ড: password</p>
                <p className="text-xs">কৃষক: seller@example.com, পাসওয়ার্ড: password</p>
                <p className="text-xs">ক্রেতা: buyer@example.com, পাসওয়ার্ড: password</p>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col">
              <Button 
                type="submit" 
                className="w-full bg-agriculture-green-dark hover:bg-agriculture-green-light"
                disabled={isLoading}
              >
                {isLoading ? "প্রসেসিং..." : "লগইন করুন"}
              </Button>
              
              <p className="mt-4 text-center text-sm">
                অ্যাকাউন্ট নেই? {" "}
                <Link to="/register" className="text-agriculture-green-dark hover:underline font-medium">
                  রেজিস্টার করুন
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

export default Login;
