
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import RatingStars from '@/components/RatingStars';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { mockProducts, mockBids, mockUsers } from '@/data/mockData';
import { Product, Bid, User } from '@/types';

const ProductDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [seller, setSeller] = useState<User | null>(null);
  const [bids, setBids] = useState<Bid[]>([]);
  const [bidAmount, setBidAmount] = useState<number | ''>('');
  const [isPlacingBid, setIsPlacingBid] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    // Find product by id
    const foundProduct = mockProducts.find(p => p.id === id);
    if (foundProduct) {
      setProduct(foundProduct);
      
      // Find seller
      const foundSeller = mockUsers.find(u => u.id === foundProduct.sellerId);
      if (foundSeller) {
        setSeller(foundSeller);
      }
      
      // Find bids for this product
      const productBids = mockBids.filter(b => b.productId === foundProduct.id);
      setBids(productBids);
    }
  }, [id]);
  
  const handlePlaceBid = () => {
    if (!isAuthenticated) {
      toast({
        title: "বিড করতে লগইন করুন",
        description: "বিড করার জন্য আপনাকে লগইন করতে হবে।",
      });
      navigate('/login');
      return;
    }
    
    if (user?.role === 'seller') {
      toast({
        title: "বিড করা সম্ভব নয়",
        description: "বিক্রেতারা বিড করতে পারেন না। ক্রেতা হিসেবে লগইন করুন।",
        variant: "destructive",
      });
      return;
    }
    
    if (!bidAmount || bidAmount <= 0) {
      toast({
        title: "ইনভ্যালিড অ্যামাউন্ট",
        description: "অনুগ্রহ করে একটি বৈধ বিড অ্যামাউন্ট দিন।",
        variant: "destructive",
      });
      return;
    }
    
    setIsPlacingBid(true);
    
    // Simulate placing a bid
    setTimeout(() => {
      if (product) {
        // Create new bid
        const newBid: Bid = {
          id: Math.random().toString(36).substr(2, 9),
          productId: product.id,
          buyerId: user?.id || '',
          buyerName: user?.name || '',
          amount: Number(bidAmount),
          status: 'pending',
          createdAt: new Date().toISOString()
        };
        
        // Update bids
        setBids([newBid, ...bids]);
        
        toast({
          title: "বিড সফলভাবে করা হয়েছে",
          description: "বিক্রেতা শীঘ্রই আপনার সাথে যোগাযোগ করবেন।",
        });
        
        setBidAmount('');
        setIsPlacingBid(false);
        setIsDialogOpen(false);
      }
    }, 1000);
  };
  
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
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Product Images */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg overflow-hidden shadow-md">
                <div className="aspect-w-16 aspect-h-9 relative">
                  <img 
                    src={product.images[currentImageIndex]} 
                    alt={product.title}
                    className="w-full h-96 object-cover"
                  />
                </div>
                
                {/* Thumbnails */}
                {product.images.length > 1 && (
                  <div className="flex p-4 space-x-2 overflow-x-auto">
                    {product.images.map((image, index) => (
                      <div 
                        key={index}
                        className={`w-20 h-20 overflow-hidden rounded cursor-pointer ${
                          index === currentImageIndex ? 'ring-2 ring-agriculture-green-dark' : ''
                        }`}
                        onClick={() => setCurrentImageIndex(index)}
                      >
                        <img 
                          src={image} 
                          alt={`${product.title} - ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            {/* Product Details */}
            <div>
              <Card>
                <CardContent className="p-6">
                  <h1 className="text-2xl font-bold mb-2">{product.title}</h1>
                  <p className="text-muted-foreground mb-4">
                    <span className="inline-block mr-2">🌍</span>
                    {product.location}
                  </p>
                  
                  <div className="flex justify-between items-center mb-6">
                    <p className="text-2xl font-bold text-agriculture-green-dark">
                      ৳{product.price}
                      <span className="text-sm font-normal">/{product.unit}</span>
                    </p>
                    <p className="text-agriculture-amber font-medium">
                      পরিমাণ: {product.quantity} {product.unit}
                    </p>
                  </div>
                  
                  <div className="mb-8">
                    <h2 className="text-lg font-semibold mb-2">বিবরণ</h2>
                    <p className="text-gray-600">{product.description}</p>
                  </div>
                  
                  {/* Seller Information */}
                  <div className="mb-8">
                    <h2 className="text-lg font-semibold mb-2">বিক্রেতার তথ্য</h2>
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-agriculture-green-light rounded-full flex items-center justify-center text-white mr-3">
                        {seller?.name?.charAt(0) || 'S'}
                      </div>
                      <div>
                        <p className="font-medium">{seller?.name || product.sellerName}</p>
                        {seller?.rating && (
                          <div className="flex items-center">
                            <RatingStars rating={seller.rating} />
                            <span className="text-sm text-muted-foreground ml-2">
                              ({seller.reviewCount} রিভিউ)
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Action buttons */}
                  <div className="space-y-3">
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                      <DialogTrigger asChild>
                        <Button className="w-full bg-agriculture-amber hover:bg-amber-600">
                          বিড করুন
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>বিড প্রদান করুন</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <p className="font-medium">{product.title}</p>
                            <p className="text-sm">মূল্যঃ ৳{product.price}/{product.unit}</p>
                          </div>
                          <div className="space-y-2">
                            <label htmlFor="bid-amount">আপনার মূল্য প্রদান করুন (৳)</label>
                            <Input 
                              id="bid-amount" 
                              type="number"
                              min="1"
                              placeholder="বিড অ্যামাউন্ট দিন"
                              value={bidAmount}
                              onChange={(e) => setBidAmount(e.target.value ? Number(e.target.value) : '')}
                            />
                          </div>
                          <Button 
                            className="w-full bg-agriculture-green-dark hover:bg-agriculture-green-light"
                            onClick={handlePlaceBid}
                            disabled={isPlacingBid || !bidAmount}
                          >
                            {isPlacingBid ? "প্রসেসিং..." : "বিড জমা দিন"}
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                    
                    <Button variant="outline" className="w-full" onClick={() => {
                      if (isAuthenticated) {
                        // Simulate calling the seller
                        toast({
                          title: "যোগাযোগের তথ্য",
                          description: `বিক্রেতাকে কল করুন: ${seller?.phone || '01XXXXXXXXX'}`,
                        });
                      } else {
                        toast({
                          title: "যোগাযোগ করতে লগইন করুন",
                          description: "বিক্রেতার সাথে যোগাযোগ করতে প্রথমে লগইন করুন।",
                        });
                        navigate('/login');
                      }
                    }}>
                      যোগাযোগ করুন
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
          
          {/* Additional Information Tabs */}
          <div className="mt-8">
            <Tabs defaultValue="bids">
              <TabsList className="grid grid-cols-2 mb-6">
                <TabsTrigger value="bids">বিডস ({bids.length})</TabsTrigger>
                <TabsTrigger value="info">অতিরিক্ত তথ্য</TabsTrigger>
              </TabsList>
              
              <TabsContent value="bids">
                <Card>
                  <CardContent className="p-6">
                    {bids.length > 0 ? (
                      <div className="space-y-4">
                        <h3 className="font-semibold text-lg mb-4">সাম্প্রতিক বিড</h3>
                        <div className="overflow-x-auto">
                          <table className="w-full border-collapse">
                            <thead>
                              <tr className="bg-muted">
                                <th className="p-2 text-left">ক্রেতা</th>
                                <th className="p-2 text-left">মূল্য</th>
                                <th className="p-2 text-left">অবস্থা</th>
                                <th className="p-2 text-left">তারিখ</th>
                              </tr>
                            </thead>
                            <tbody>
                              {bids.map((bid) => (
                                <tr key={bid.id} className="border-b">
                                  <td className="p-2">{bid.buyerName}</td>
                                  <td className="p-2 font-medium">৳{bid.amount}</td>
                                  <td className="p-2">
                                    {bid.status === 'pending' && 
                                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs">অপেক্ষমাণ</span>
                                    }
                                    {bid.status === 'accepted' && 
                                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">গৃহীত</span>
                                    }
                                    {bid.status === 'rejected' && 
                                      <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs">প্রত্যাখ্যাত</span>
                                    }
                                  </td>
                                  <td className="p-2 text-sm text-muted-foreground">
                                    {new Date(bid.createdAt).toLocaleDateString('bn-BD')}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground">এখনো কোন বিড করা হয়নি।</p>
                        <p className="mt-2">প্রথম বিড প্রদানকারী হোন!</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="info">
                <Card>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-semibold text-lg mb-2">পণ্যের শ্রেণী</h3>
                        <p>{product.category}</p>
                      </div>
                      
                      <div>
                        <h3 className="font-semibold text-lg mb-2">পোস্টের তারিখ</h3>
                        <p>{new Date(product.createdAt).toLocaleDateString('bn-BD')}</p>
                      </div>
                      
                      <div>
                        <h3 className="font-semibold text-lg mb-2">পণ্য সম্পর্কে জিজ্ঞাস্য</h3>
                        <p>
                          প্রশ্ন থাকলে সরাসরি যোগাযোগ করুন অথবা বিড করার সময় আপনার প্রশ্ন উল্লেখ করুন।
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
          
          {/* Similar Products */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6">সম্পর্কিত পণ্য</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {mockProducts.filter(p => 
                p.id !== product.id && 
                (p.category === product.category || p.location === product.location)
              ).slice(0, 4).map((similarProduct) => (
                <div 
                  key={similarProduct.id} 
                  className="cursor-pointer"
                  onClick={() => navigate(`/product/${similarProduct.id}`)}
                >
                  <Card className="h-full overflow-hidden transition-all hover:shadow-lg">
                    <div className="aspect-square overflow-hidden">
                      <img 
                        src={similarProduct.images[0]} 
                        alt={similarProduct.title} 
                        className="h-full w-full object-cover transition-transform hover:scale-105"
                      />
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold">{similarProduct.title}</h3>
                      <p className="text-agriculture-green-dark font-bold mt-2">
                        ৳{similarProduct.price}/{similarProduct.unit}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ProductDetails;
