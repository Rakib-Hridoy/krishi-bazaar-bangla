
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import RatingStars from '@/components/RatingStars';
import ProductCard from '@/components/ProductCard';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { mockUsers, mockProducts, mockReviews } from '@/data/mockData';
import { User } from '@/types';

const UserProfile = () => {
  const { id } = useParams<{ id: string }>();
  const { user: currentUser } = useAuth();
  
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [userProducts, setUserProducts] = useState<any[]>([]);
  
  useEffect(() => {
    // Find user by ID
    const foundUser = mockUsers.find(u => u.id === id);
    if (foundUser) {
      setUserProfile(foundUser);
      
      // If user is a seller, get their products
      if (foundUser.role === 'seller') {
        const sellerProducts = mockProducts.filter(p => p.sellerId === foundUser.id);
        setUserProducts(sellerProducts);
      }
    }
  }, [id]);
  
  if (!userProfile) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-xl">ইউজার খুঁজে পাওয়া যায়নি...</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 py-12 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* User Info */}
            <div>
              <Card className="mb-6">
                <CardContent className="p-6">
                  <div className="flex flex-col items-center text-center">
                    <div className="bg-agriculture-green-light rounded-full w-24 h-24 flex items-center justify-center text-white text-4xl mb-4">
                      {userProfile.name.charAt(0)}
                    </div>
                    <h1 className="text-2xl font-bold mb-1">{userProfile.name}</h1>
                    <p className="text-muted-foreground mb-3">
                      {userProfile.role === 'seller' ? 'কৃষক / বিক্রেতা' : 'ক্রেতা'}
                    </p>
                    
                    {userProfile.rating && (
                      <div className="mb-4">
                        <RatingStars rating={userProfile.rating} />
                        <p className="text-sm text-muted-foreground mt-1">
                          {userProfile.reviewCount} রিভিউ
                        </p>
                      </div>
                    )}
                    
                    {currentUser?.id !== userProfile.id && (
                      <Button className="bg-agriculture-green-dark hover:bg-agriculture-green-light">
                        যোগাযোগ করুন
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-lg font-semibold mb-4">যোগাযোগের তথ্য</h2>
                  
                  {currentUser?.id === userProfile.id || currentUser?.role === 'admin' ? (
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-muted-foreground">ইমেইল</p>
                        <p>{userProfile.email}</p>
                      </div>
                      {userProfile.phone && (
                        <div>
                          <p className="text-sm text-muted-foreground">ফোন</p>
                          <p>{userProfile.phone}</p>
                        </div>
                      )}
                      {userProfile.address && (
                        <div>
                          <p className="text-sm text-muted-foreground">ঠিকানা</p>
                          <p>{userProfile.address}</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      যোগাযোগের তথ্য দেখার জন্য বিড করুন বা "যোগাযোগ করুন" বাটনে ক্লিক করুন।
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
            
            {/* Content Area */}
            <div className="md:col-span-2">
              <Tabs defaultValue={userProfile.role === 'seller' ? "products" : "reviews"}>
                <TabsList className="mb-6">
                  {userProfile.role === 'seller' && (
                    <TabsTrigger value="products">পণ্যসমূহ</TabsTrigger>
                  )}
                  <TabsTrigger value="reviews">রিভিউ</TabsTrigger>
                  {currentUser?.id === userProfile.id && (
                    <TabsTrigger value="settings">সেটিংস</TabsTrigger>
                  )}
                </TabsList>
                
                {userProfile.role === 'seller' && (
                  <TabsContent value="products">
                    <h2 className="text-xl font-bold mb-6">{userProfile.name} এর পণ্যসমূহ</h2>
                    
                    {userProducts.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {userProducts.map(product => (
                          <ProductCard key={product.id} product={product} />
                        ))}
                      </div>
                    ) : (
                      <Card>
                        <CardContent className="p-6 text-center">
                          <p className="text-muted-foreground">কোন পণ্য পাওয়া যায়নি।</p>
                        </CardContent>
                      </Card>
                    )}
                  </TabsContent>
                )}
                
                <TabsContent value="reviews">
                  <h2 className="text-xl font-bold mb-6">রিভিউ</h2>
                  
                  {mockReviews.filter(r => r.toUserId === userProfile.id).length > 0 ? (
                    <div className="space-y-4">
                      {mockReviews
                        .filter(r => r.toUserId === userProfile.id)
                        .map(review => (
                          <Card key={review.id}>
                            <CardContent className="p-6">
                              <div className="flex justify-between mb-2">
                                <div className="flex items-center">
                                  <div className="mr-2">
                                    <RatingStars rating={review.rating} />
                                  </div>
                                  <p className="font-medium">{review.fromUserName}</p>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  {new Date(review.createdAt).toLocaleDateString('bn-BD')}
                                </p>
                              </div>
                              <p>{review.comment}</p>
                            </CardContent>
                          </Card>
                        ))}
                    </div>
                  ) : (
                    <Card>
                      <CardContent className="p-6 text-center">
                        <p className="text-muted-foreground">কোন রিভিউ পাওয়া যায়নি।</p>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
                
                {currentUser?.id === userProfile.id && (
                  <TabsContent value="settings">
                    <h2 className="text-xl font-bold mb-6">প্রোফাইল সেটিংস</h2>
                    <Card>
                      <CardContent className="p-6">
                        <p className="text-muted-foreground mb-4">এখানে আপনি আপনার প্রোফাইল তথ্য আপডেট করতে পারেন।</p>
                        <Button className="bg-agriculture-green-dark hover:bg-agriculture-green-light">
                          প্রোফাইল আপডেট করুন
                        </Button>
                      </CardContent>
                    </Card>
                  </TabsContent>
                )}
              </Tabs>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default UserProfile;
