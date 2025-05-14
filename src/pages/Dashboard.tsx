
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { getProductsByUserId } from '@/hooks/useProducts';
import { getUserBids } from '@/hooks/useBids';
import { getUserReviews } from '@/hooks/useReviews';
import { Product, Bid, Review } from '@/types';

const Dashboard = () => {
  const { user, profile, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [userProducts, setUserProducts] = useState<Product[]>([]);
  const [userBids, setUserBids] = useState<Bid[]>([]);
  const [userReviews, setUserReviews] = useState<Review[]>([]);
  const [activeTab, setActiveTab] = useState("overview");
  const [loadingData, setLoadingData] = useState(false);
  
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "অননুমোদিত অ্যাক্সেস",
        description: "এই পেইজ দেখার জন্য আপনাকে লগইন করতে হবে।",
        variant: "destructive",
      });
      navigate('/login');
      return;
    }
    
    // Load user specific data
    if (user?.id) {
      setLoadingData(true);
      
      const fetchUserData = async () => {
        try {
          // For seller, fetch their products
          if (profile?.role === 'seller') {
            const products = await getProductsByUserId(user.id);
            setUserProducts(products);
          }
          
          // For buyer, fetch their bids
          if (profile?.role === 'buyer') {
            const bids = await getUserBids(user.id);
            setUserBids(bids);
          }
          
          // Fetch reviews
          const reviews = await getUserReviews(user.id);
          setUserReviews(reviews);
        } catch (error) {
          console.error('Error fetching user data:', error);
        } finally {
          setLoadingData(false);
        }
      };
      
      fetchUserData();
    }
  }, [user, profile, isAuthenticated, isLoading, navigate, toast]);

  if (isLoading || loadingData) {
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
        <div className="container mx-auto">
          <h1 className="text-3xl font-bold mb-8">ড্যাশবোর্ড</h1>
          
          <div className="grid gap-8">
            {/* User Profile Summary */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                  <div className="bg-agriculture-green-light rounded-full w-24 h-24 flex items-center justify-center text-white text-4xl">
                    {profile?.name?.charAt(0) || user?.email?.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">{profile?.name || 'ব্যবহারকারী'}</h2>
                    <p className="text-muted-foreground">{profile?.email || user?.email}</p>
                    <p className="mt-2">
                      {profile?.role === 'seller' ? 'কৃষক / বিক্রেতা' : 'ক্রেতা'}
                    </p>
                    <div className="mt-4 flex gap-3">
                      <Button variant="outline" asChild>
                        <a href={`/profile/${user?.id}`}>প্রোফাইল দেখুন</a>
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => {
                          navigate('/create-listing');
                        }}
                        className={profile?.role !== 'seller' ? 'hidden' : ''}
                      >
                        নতুন পণ্য যোগ করুন
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Dashboard Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-3 md:w-[400px] mb-8">
                <TabsTrigger value="overview">ওভারভিউ</TabsTrigger>
                {profile?.role === 'seller' ? (
                  <TabsTrigger value="products">আমার পণ্য</TabsTrigger>
                ) : (
                  <TabsTrigger value="bids">আমার বিড</TabsTrigger>
                )}
                <TabsTrigger value="reviews">রিভিউ</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">
                        {profile?.role === 'seller' ? 'মোট পণ্য' : 'মোট বিড'}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {profile?.role === 'seller' ? userProducts.length : userBids.length}
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">
                        {profile?.role === 'seller' ? 'একটিভ বিড' : 'গৃহীত বিড'}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {profile?.role === 'seller' 
                          ? '0' // To be calculated from real data later
                          : userBids.filter(bid => bid.status === 'accepted').length
                        }
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">রিভিউ</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{userReviews.length}</div>
                    </CardContent>
                  </Card>
                </div>
                
                <Card>
                  <CardHeader>
                    <CardTitle>সাম্প্রতিক অ্যাকটিভিটি</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8 text-muted-foreground">
                      কোন সাম্প্রতিক অ্যাকটিভিটি নেই।
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="products" className="space-y-4">
                {profile?.role === 'seller' && (
                  <>
                    <div className="flex justify-between items-center">
                      <h3 className="text-xl font-semibold">আমার পণ্যসমূহ</h3>
                      <Button 
                        onClick={() => navigate('/create-listing')}
                        className="bg-agriculture-green-dark hover:bg-agriculture-green-light"
                      >
                        নতুন পণ্য যোগ করুন
                      </Button>
                    </div>
                    
                    {userProducts.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {userProducts.map((product) => (
                          <ProductCard key={product.id} product={product} />
                        ))}
                      </div>
                    ) : (
                      <Card>
                        <CardContent className="text-center py-12">
                          <p className="mb-4">আপনার কোন পণ্য নেই।</p>
                          <Button 
                            onClick={() => navigate('/create-listing')}
                            className="bg-agriculture-green-dark hover:bg-agriculture-green-light"
                          >
                            প্রথম পণ্য যোগ করুন
                          </Button>
                        </CardContent>
                      </Card>
                    )}
                  </>
                )}
              </TabsContent>
              
              <TabsContent value="bids" className="space-y-4">
                {profile?.role === 'buyer' && (
                  <>
                    <h3 className="text-xl font-semibold">আমার বিড</h3>
                    
                    {userBids.length > 0 ? (
                      <div className="overflow-auto">
                        <table className="w-full border-collapse">
                          <thead>
                            <tr className="bg-muted">
                              <th className="p-2 text-left">পণ্য</th>
                              <th className="p-2 text-left">বিড অ্যামাউন্ট</th>
                              <th className="p-2 text-left">স্ট্যাটাস</th>
                              <th className="p-2 text-left">তারিখ</th>
                              <th className="p-2 text-left">একশন</th>
                            </tr>
                          </thead>
                          <tbody>
                            {userBids.map((bid) => (
                              <tr key={bid.id} className="border-b">
                                <td className="p-2">
                                  {bid.productTitle || 'অজানা পণ্য'}
                                </td>
                                <td className="p-2">৳{bid.amount}</td>
                                <td className="p-2">
                                  {bid.status === 'pending' && 
                                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded">অপেক্ষমাণ</span>
                                  }
                                  {bid.status === 'accepted' && 
                                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded">গৃহীত</span>
                                  }
                                  {bid.status === 'rejected' && 
                                    <span className="px-2 py-1 bg-red-100 text-red-800 rounded">প্রত্যাখ্যাত</span>
                                  }
                                </td>
                                <td className="p-2">
                                  {new Date(bid.createdAt).toLocaleDateString('bn-BD')}
                                </td>
                                <td className="p-2">
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={() => {
                                      navigate(`/product/${bid.productId}`);
                                    }}
                                  >
                                    বিস্তারিত
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <Card>
                        <CardContent className="text-center py-12">
                          <p className="mb-4">আপনি এখনো কোন বিড করেননি।</p>
                          <Button 
                            onClick={() => navigate('/')}
                            className="bg-agriculture-green-dark hover:bg-agriculture-green-light"
                          >
                            পণ্য ব্রাউজ করুন
                          </Button>
                        </CardContent>
                      </Card>
                    )}
                  </>
                )}
              </TabsContent>
              
              <TabsContent value="reviews" className="space-y-4">
                <h3 className="text-xl font-semibold">আমার রিভিউ</h3>
                {userReviews.length > 0 ? (
                  <div className="space-y-4">
                    {userReviews.map(review => (
                      <Card key={review.id}>
                        <CardContent className="p-6">
                          <div className="flex justify-between mb-2">
                            <div className="flex items-center">
                              <p className="font-medium">যার জন্য রিভিউ দিয়েছেন: {review.fromUserName}</p>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {new Date(review.createdAt).toLocaleDateString('bn-BD')}
                            </p>
                          </div>
                          <div className="flex items-center mb-2">
                            <p className="mr-2">রেটিং: {review.rating}/5</p>
                          </div>
                          <p>{review.comment}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="text-center py-12">
                      <p>আপনার কোন রিভিউ নেই।</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Dashboard;
