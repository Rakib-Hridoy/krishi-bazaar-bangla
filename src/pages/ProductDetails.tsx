
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Separator } from "@/components/ui/separator";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { getProductById, getRelatedProducts } from '@/hooks/useProducts';
import { useProductBids } from '@/hooks/useBids';
import { useBidStats } from '@/hooks/useBidStats';
import { hasAcceptedBid } from '@/backend/services/bidService';
import { Product } from '@/types';
import ProductCard from '@/components/ProductCard';
import BiddingStatus from '@/components/BiddingStatus';
import ChatWindow from '@/components/ChatWindow';
import { supabase } from '@/integrations/supabase/client';

const ProductDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, profile, isAuthenticated } = useAuth();
  const { toast } = useToast();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loadingProduct, setLoadingProduct] = useState(true);
  const [bidAmount, setBidAmount] = useState('');
  const [bidDialogOpen, setBidDialogOpen] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loadingRelated, setLoadingRelated] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [canMessage, setCanMessage] = useState(false);
  const [isBiddingExpired, setIsBiddingExpired] = useState(false);
  
  const { bids, isLoading: loadingBids, addBid, updateBidStatus } = useProductBids(id);
  const { stats: bidStats, isLoading: loadingStats } = useBidStats(id);
  
  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      
      try {
        setLoadingProduct(true);
        const productData = await getProductById(id);
        setProduct(productData);
        
        if (productData && productData.category) {
          setLoadingRelated(true);
          const related = await getRelatedProducts(id, productData.category);
          setRelatedProducts(related);
          setLoadingRelated(false);
          
          // Check bidding expiry and messaging permission
          if (productData.biddingDeadline) {
            const deadline = new Date(productData.biddingDeadline);
            const now = new Date();
            setIsBiddingExpired(now > deadline);
          }
          
          if (user && user.id !== productData.sellerId) {
            const hasAccepted = await hasAcceptedBid(user.id, productData.id);
            setCanMessage(hasAccepted);
          }
        }
      } catch (error) {
        console.error('Error fetching product:', error);
        toast({
          title: "পণ্য লোড করতে সমস্যা",
          description: "পণ্যের তথ্য লোড করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।",
          variant: "destructive"
        });
      } finally {
        setLoadingProduct(false);
      }
    };
    
    fetchProduct();
  }, [id, toast, user]);

  // Realtime: when this buyer's bid gets accepted, enable messaging instantly
  useEffect(() => {
    if (!user || !id) return;

    const channel = supabase
      .channel(`pd-bids-status-${id}-${user.id}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'bids', filter: `product_id=eq.${id}` },
        (payload) => {
          const newRow = payload.new as { buyer_id: string; status: string };
          if (newRow && newRow.buyer_id === user.id && newRow.status === 'accepted') {
            setCanMessage(true);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, id]);

  const handleBidSubmit = async () => {
    if (!isAuthenticated) {
      toast({
        title: "লগইন প্রয়োজন",
        description: "বিড করতে আপনাকে লগইন করতে হবে।",
        variant: "destructive"
      });
      navigate('/login');
      return;
    }
    
    if (!user || !profile || !product) return;
    
    if (profile.role !== 'buyer') {
      toast({
        title: "ক্রেতা হিসাবে বিড করুন",
        description: "শুধুমাত্র ক্রেতারা বিড করতে পারেন।",
        variant: "destructive"
      });
      return;
    }
    
    if (user.id === product.sellerId) {
      toast({
        title: "নিজের পণ্যে বিড করা যাবে না",
        description: "আপনি নিজের পণ্যে বিড করতে পারবেন না।",
        variant: "destructive"
      });
      return;
    }
    
    if (isBiddingExpired) {
      toast({
        title: "বিডিং সময় শেষ",
        description: "এই পণ্যের বিডিং সময় শেষ হয়ে গেছে।",
        variant: "destructive"
      });
      return;
    }
    
    const amount = parseFloat(bidAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "অবৈধ বিড এমাউন্ট",
        description: "একটি বৈধ বিড এমাউন্ট দিন।",
        variant: "destructive"
      });
      return;
    }
    
    try {
      await addBid({
        productId: product.id,
        buyerId: user.id,
        amount
      });
      
      setBidAmount('');
      setBidDialogOpen(false);
    } catch (error) {
      console.error('Error submitting bid:', error);
    }
  };

  const handleAcceptBid = async (bidId: string) => {
    if (!isAuthenticated || !product || user?.id !== product.sellerId) return;
    
    try {
      await updateBidStatus(bidId, 'accepted');
      
      // Check if user can now message by refreshing the bid check
      if (user) {
        const hasAccepted = await hasAcceptedBid(user.id, product.id);
        setCanMessage(hasAccepted);
      }
    } catch (error) {
      console.error('Error accepting bid:', error);
    }
  };

  const handleRejectBid = async (bidId: string) => {
    if (!isAuthenticated || !product || user?.id !== product.sellerId) return;
    
    try {
      await updateBidStatus(bidId, 'rejected');
    } catch (error) {
      console.error('Error rejecting bid:', error);
    }
  };

  const handleMessageClick = () => {
    setShowChat(true);
  };
  
  if (loadingProduct) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-xl">পণ্য লোড হচ্ছে...</p>
        </div>
        <Footer />
      </div>
    );
  }
  
  if (!product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-xl">পণ্য খুঁজে পাওয়া যায়নি...</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Product Images */}
            <div>
              {product.images && product.images.length > 0 ? (
                <Carousel className="w-full">
                  <CarouselContent>
                    {product.images.map((image, index) => (
                      <CarouselItem key={index}>
                        <div className="aspect-square w-full overflow-hidden rounded-md">
                          <img
                            src={image}
                            alt={`${product.title} - ছবি ${index + 1}`}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious />
                  <CarouselNext />
                </Carousel>
              ) : (
                <div className="aspect-square w-full overflow-hidden rounded-md bg-gray-100 flex items-center justify-center">
                  <p className="text-gray-500">কোন ছবি নেই</p>
                </div>
              )}
            </div>
            
            {/* Product Info */}
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between">
                  <h1 className="text-3xl font-bold">{product.title}</h1>
                  <BiddingStatus deadline={product.biddingDeadline} />
                </div>
                <p className="text-muted-foreground mt-1">{product.category} • {product.location}</p>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-agriculture-green-dark">
                    ৳{product.price} / {product.unit}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    মোট পরিমাণ: {product.quantity} {product.unit}
                  </p>
                </div>
                
                {/* Average Bid Display */}
                {!loadingStats && bidStats.totalBids > 0 && (
                  <div className="bg-blue-50 p-4 rounded-md">
                    <h3 className="text-sm font-medium text-blue-900 mb-2">বিড পরিসংখ্যান</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-blue-700">গড় বিড</p>
                        <p className="font-bold text-blue-900">৳{bidStats.averageAmount}</p>
                      </div>
                      <div>
                        <p className="text-blue-700">মোট বিড</p>
                        <p className="font-bold text-blue-900">{bidStats.totalBids}টি</p>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="flex flex-wrap gap-2">
                  {isAuthenticated && profile?.role === 'buyer' && user?.id !== product.sellerId && !isBiddingExpired && (
                    <Dialog open={bidDialogOpen} onOpenChange={setBidDialogOpen}>
                      <DialogTrigger asChild>
                        <Button className="bg-agriculture-amber hover:bg-amber-600">
                          বিড করুন
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>বিড করুন</DialogTitle>
                          <DialogDescription>
                            "{product.title}" পণ্যটির জন্য আপনার দাম প্রস্তাব দিন। বর্তমান দামঃ ৳{product.price}/{product.unit}
                            {bidStats.totalBids > 0 && (
                              <span className="block mt-2 text-blue-600">
                                গড় বিডঃ ৳{bidStats.averageAmount} ({bidStats.totalBids}টি বিড থেকে)
                              </span>
                            )}
                          </DialogDescription>
                        </DialogHeader>
                        
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <label htmlFor="bid-amount" className="text-sm font-medium">বিড এমাউন্ট (৳)</label>
                            <Input
                              id="bid-amount"
                              type="number"
                              min="1"
                              placeholder="আপনার দাম প্রস্তাব"
                              value={bidAmount}
                              onChange={(e) => setBidAmount(e.target.value)}
                            />
                          </div>
                        </div>
                        
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setBidDialogOpen(false)}>
                            বাতিল করুন
                          </Button>
                          <Button 
                            className="bg-agriculture-green-dark hover:bg-agriculture-green-light"
                            onClick={handleBidSubmit}
                          >
                            বিড জমা দিন
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  )}
                  
                  {isAuthenticated && user?.id !== product.sellerId && canMessage && (
                    <Button
                      onClick={handleMessageClick}
                      variant="outline"
                      className="hover:bg-primary hover:text-primary-foreground"
                    >
                      <MessageCircle className="h-4 w-4 mr-1" />
                      মেসেজ করুন
                    </Button>
                  )}
                  
                  {isAuthenticated && user?.id !== product.sellerId && !canMessage && !isBiddingExpired && (
                    <Button
                      variant="outline"
                      disabled
                      className="opacity-50 cursor-not-allowed"
                    >
                      <MessageCircle className="h-4 w-4 mr-1" />
                      বিড এক্সেপ্ট প্রয়োজন
                    </Button>
                  )}
                  
                  {isBiddingExpired && (
                    <Button
                      variant="secondary"
                      disabled
                      className="opacity-60"
                    >
                      বিডিং সময় শেষ
                    </Button>
                  )}
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h2 className="text-xl font-semibold mb-2">বিবরণ</h2>
                <p className="whitespace-pre-wrap">{product.description}</p>
              </div>
              
              <Separator />
              
              <div>
                <h2 className="text-xl font-semibold mb-3">বিক্রেতা</h2>
                <Link to={`/profile/${product.sellerId}`}>
                  <div className="flex items-center space-x-3 bg-gray-50 p-4 rounded-md hover:bg-gray-100 transition-colors">
                    <Avatar>
                      <AvatarFallback className="bg-agriculture-green-dark text-white">
                        {product.sellerName?.charAt(0) || 'ব'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{product.sellerName}</p>
                      <p className="text-sm text-muted-foreground">
                        পণ্য পোস্ট করা হয়েছে: {new Date(product.createdAt).toLocaleDateString('bn-BD')}
                      </p>
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          </div>
          
          {/* Bids Section (Only visible to the seller) */}
          {isAuthenticated && user?.id === product.sellerId && (
            <div className="mt-12">
              <h2 className="text-2xl font-bold mb-6">বিডসমূহ</h2>
              
              {loadingBids ? (
                <p className="text-center py-4">বিড লোড হচ্ছে...</p>
              ) : bids.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {bids.map(bid => (
                    <Card key={bid.id}>
                      <CardContent className="p-6">
                        <div className="flex justify-between items-center mb-4">
                          <div>
                            <Link to={`/profile/${bid.buyerId}`} className="font-medium hover:underline">
                              {bid.buyerName}
                            </Link>
                            <p className="text-sm text-muted-foreground">
                              {new Date(bid.createdAt).toLocaleDateString('bn-BD')}
                            </p>
                          </div>
                          <p className="text-lg font-bold text-agriculture-green-dark">
                            ৳{bid.amount}
                          </p>
                        </div>
                        
                        {bid.status === 'pending' ? (
                          <div className="flex space-x-2">
                            <Button 
                              className="flex-1 bg-agriculture-green-dark hover:bg-agriculture-green-light" 
                              size="sm"
                              onClick={() => handleAcceptBid(bid.id)}
                            >
                              গ্রহণ করুন
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="flex-1"
                              onClick={() => handleRejectBid(bid.id)}
                            >
                              প্রত্যাখ্যান করুন
                            </Button>
                          </div>
                        ) : bid.status === 'accepted' ? (
                          <div className="bg-green-100 text-green-800 py-2 px-3 rounded text-center">
                            গৃহীত
                          </div>
                        ) : (
                          <div className="bg-red-100 text-red-800 py-2 px-3 rounded text-center">
                            প্রত্যাখ্যাত
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-6 text-center">
                    <p className="text-muted-foreground">এখনো কোন বিড করা হয়নি।</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
          
          {/* Related Products */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6">এই ধরনের আরো পণ্য</h2>
            
            {loadingRelated ? (
              <p className="text-center py-4">সম্পর্কিত পণ্য লোড হচ্ছে...</p>
            ) : relatedProducts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {relatedProducts.map(relatedProduct => (
                  <ProductCard key={relatedProduct.id} product={relatedProduct} />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-muted-foreground">কোন সম্পর্কিত পণ্য পাওয়া যায়নি।</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
      
      {showChat && user && product && (
        <ChatWindow
          receiverId={product.sellerId}
          receiverName={product.sellerName}
          productId={product.id}
          onClose={() => setShowChat(false)}
        />
      )}
      
      <Footer />
    </div>
  );
};

export default ProductDetails;
