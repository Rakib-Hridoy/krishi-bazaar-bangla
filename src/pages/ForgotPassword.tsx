
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      toast({
        title: "পাসওয়ার্ড রিসেট লিংক পাঠানো হয়েছে",
        description: "আপনার ইমেইল চেক করুন।",
      });
    }, 1500);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold">পাসওয়ার্ড পুনরুদ্ধার</CardTitle>
            <CardDescription>
              পাসওয়ার্ড রিসেট করার জন্য আপনার ইমেইল দিন।
            </CardDescription>
          </CardHeader>
          
          {!isSubmitted ? (
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
              </CardContent>
              <CardFooter className="flex flex-col">
                <Button 
                  type="submit" 
                  className="w-full bg-agriculture-green-dark hover:bg-agriculture-green-light"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "পাঠানো হচ্ছে..." : "পাসওয়ার্ড রিসেট লিংক পাঠান"}
                </Button>
                
                <div className="mt-4 text-center">
                  <Link to="/login" className="text-agriculture-green-dark hover:underline font-medium">
                    লগইন পেইজে ফিরে যান
                  </Link>
                </div>
              </CardFooter>
            </form>
          ) : (
            <CardContent className="space-y-4 text-center">
              <div className="bg-green-50 p-4 rounded-md border border-green-200 mb-4">
                <p className="text-green-800">
                  আপনার ইমেইলে ({email}) একটি পাসওয়ার্ড রিসেট লিংক পাঠানো হয়েছে। অনুগ্রহ করে আপনার ইনবক্স এবং স্প্যাম ফোল্ডার চেক করুন।
                </p>
              </div>

              <div className="flex justify-center mt-4">
                <Link to="/login">
                  <Button variant="outline">
                    লগইন পেইজে ফিরে যান
                  </Button>
                </Link>
              </div>
            </CardContent>
          )}
        </Card>
      </main>
      
      <Footer />
    </div>
  );
};

export default ForgotPassword;
