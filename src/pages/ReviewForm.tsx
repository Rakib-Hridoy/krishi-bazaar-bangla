
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Star } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useReviews } from '@/hooks/useReviews';
import { useUserProfile } from '@/hooks/useUserProfile';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const ReviewForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const { addReview } = useReviews(id);
  const { profile: userToReview } = useUserProfile(id);
  
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [hoveredRating, setHoveredRating] = useState(0);
  
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "অননুমোদিত অ্যাক্সেস",
        description: "রিভিউ দেওয়ার জন্য আপনাকে লগইন করতে হবে।",
        variant: "destructive",
      });
      navigate('/login');
    }
  }, [isLoading, isAuthenticated, navigate, toast]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated || !user?.id || !id) {
      return;
    }
    
    try {
      await addReview({
        fromUserId: user.id,
        toUserId: id,
        rating,
        comment
      });
      
      navigate(`/profile/${id}`);
    } catch (error: any) {
      console.error('Error submitting review:', error);
    }
  };
  
  if (isLoading || !userToReview) {
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
      
      <main className="flex-1 py-12 px-4">
        <div className="container mx-auto max-w-2xl">
          <h1 className="text-3xl font-bold mb-8 text-center">রিভিউ দিন</h1>
          
          <Card>
            <CardHeader>
              <CardTitle>{userToReview.name} কে রিভিউ দিন</CardTitle>
            </CardHeader>
            
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-6">
                <div>
                  <p className="mb-2">রেটিং</p>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoveredRating(star)}
                        onMouseLeave={() => setHoveredRating(0)}
                        className="focus:outline-none"
                      >
                        <Star
                          fill={(hoveredRating || rating) >= star ? "#FFD700" : "none"}
                          stroke={(hoveredRating || rating) >= star ? "#FFD700" : "#718096"}
                          className="w-8 h-8 transition-colors"
                        />
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="comment">আপনার মতামত</label>
                  <Textarea
                    id="comment"
                    placeholder={`${userToReview.name} সম্পর্কে আপনার অভিজ্ঞতা লিখুন...`}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="min-h-[150px]"
                    required
                  />
                </div>
              </CardContent>
              
              <CardFooter className="flex justify-end gap-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate(-1)}
                >
                  বাতিল করুন
                </Button>
                <Button 
                  type="submit" 
                  className="bg-agriculture-green-dark hover:bg-agriculture-green-light"
                >
                  রিভিউ জমা দিন
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ReviewForm;
