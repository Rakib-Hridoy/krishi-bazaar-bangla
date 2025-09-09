
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toZonedTime, fromZonedTime } from 'date-fns-tz';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const CreateListing = () => {
  const { user, profile, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<number | ''>('');
  const [quantity, setQuantity] = useState<number | ''>('');
  const [unit, setUnit] = useState('কেজি');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [biddingStartTime, setBiddingStartTime] = useState('');
  const [biddingDeadline, setBiddingDeadline] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  
  
  const categories = [
    { id: 'শস্য', name: 'শস্য' },
    { id: 'সবজি', name: 'সবজি' },
    { id: 'ফল', name: 'ফল' },
    { id: 'দুগ্ধজাত', name: 'দুগ্ধজাত' },
    { id: 'মাংস', name: 'মাংস' },
    { id: 'অন্যান্য', name: 'অন্যান্য' },
  ];
  
  const units = [
    'কেজি', 'গ্রাম', 'লিটার', 'পিস', 'প্যাকেট', 'বস্তা', 'টন'
  ];
  
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
    
    if (!isLoading && isAuthenticated && profile?.role !== 'seller') {
      toast({
        title: "শুধুমাত্র বিক্রেতার জন্য",
        description: "শুধুমাত্র কৃষক/বিক্রেতারা পণ্য যোগ করতে পারেন।",
        variant: "destructive",
      });
      navigate('/dashboard');
    }
  }, [user, profile, isAuthenticated, isLoading, navigate, toast]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    try {
      setUploadingImages(true);
      const uploadedImageUrls: string[] = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
        const filePath = `${user!.id}/${fileName}`;
        
        const { data, error } = await supabase.storage
          .from('product-images')
          .upload(filePath, file);
          
        if (error) {
          throw error;
        }
        
        const { data: urlData } = supabase.storage
          .from('product-images')
          .getPublicUrl(filePath);
          
        uploadedImageUrls.push(urlData.publicUrl);
      }
      
      setImages([...images, ...uploadedImageUrls]);
      toast({
        title: "ছবি আপলোড সফল",
        description: `${uploadedImageUrls.length}টি ছবি সফলভাবে আপলোড করা হয়েছে।`,
      });
    } catch (error: any) {
      console.error('Image upload error:', error);
      toast({
        title: "ছবি আপলোড ব্যর্থ",
        description: error.message || "ছবি আপলোড করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।",
        variant: "destructive",
      });
    } finally {
      setUploadingImages(false);
    }
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check file size (limit to 50MB)
    if (file.size > 50 * 1024 * 1024) {
      toast({
        title: "ভিডিও ফাইল খুব বড়",
        description: "ভিডিও ফাইলের সাইজ ৫০এমবি এর কম হতে হবে।",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setUploadingVideo(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `${user!.id}/${fileName}`;
      
      const { data, error } = await supabase.storage
        .from('product-videos')
        .upload(filePath, file);
        
      if (error) {
        throw error;
      }
      
      const { data: urlData } = supabase.storage
        .from('product-videos')
        .getPublicUrl(filePath);
        
      setVideoUrl(urlData.publicUrl);
      toast({
        title: "ভিডিও আপলোড সফল",
        description: "ভিডিও সফলভাবে আপলোড করা হয়েছে।",
      });
    } catch (error: any) {
      console.error('Video upload error:', error);
      toast({
        title: "ভিডিও আপলোড ব্যর্থ",
        description: error.message || "ভিডিও আপলোড করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।",
        variant: "destructive",
      });
    } finally {
      setUploadingVideo(false);
    }
  };

  const removeVideo = () => {
    setVideoUrl('');
    toast({
      title: "ভিডিও সরানো হয়েছে",
      description: "ভিডিও সফলভাবে সরানো হয়েছে।",
    });
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.id) {
      toast({
        title: "লগইন প্রয়োজন",
        description: "পণ্য যোগ করতে আপনাকে লগইন করতে হবে।",
        variant: "destructive",
      });
      return;
    }
    
    if (!title || !description || price === '' || quantity === '' || !location || !category || !biddingStartTime || !biddingDeadline) {
      toast({
        title: "সব ফিল্ড পূরণ করুন",
        description: "অনুগ্রহ করে সব প্রয়োজনীয় ফিল্ড পূরণ করুন।",
        variant: "destructive",
      });
      return;
    }
    
    // Validate bidding start time is in the future
    const startDate = new Date(biddingStartTime);
    const now = new Date();
    if (startDate <= now) {
      toast({
        title: "ভুল বিডিং শুরুর সময়",
        description: "বিডিং শুরুর সময় ভবিষ্যতের সময় হতে হবে।",
        variant: "destructive",
      });
      return;
    }
    
    // Validate bidding deadline is after start time
    const deadlineDate = new Date(biddingDeadline);
    if (deadlineDate <= startDate) {
      toast({
        title: "ভুল সময়সীমা",
        description: "বিডিং শেষের সময় অবশ্যই শুরুর সময়ের পরে হতে হবে।",
        variant: "destructive",
      });
      return;
    }
    
    if (images.length === 0) {
      toast({
        title: "ছবি প্রয়োজন",
        description: "অন্তত একটি ছবি নির্বাচন করুন।",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const { data, error } = await supabase
        .from('products')
        .insert({
          title,
          description,
          price,
          quantity,
          unit,
          location,
          images,
          video_url: videoUrl || null,
          category,
          bidding_start_time: fromZonedTime(new Date(biddingStartTime), 'Asia/Dhaka').toISOString(),
          bidding_deadline: fromZonedTime(new Date(biddingDeadline), 'Asia/Dhaka').toISOString(),
          seller_id: user.id
        })
        .select();
        
      if (error) throw error;
      
      toast({
        title: "পণ্য যোগ করা হয়েছে",
        description: "আপনার পণ্য সফলভাবে যোগ করা হয়েছে।",
      });
      
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Error creating product:', error);
      toast({
        title: "পণ্য যোগ করতে সমস্যা",
        description: error.message || "পণ্য যোগ করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
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
      
      <main className="flex-1 py-12 px-4">
        <div className="container mx-auto max-w-4xl">
          <h1 className="text-3xl font-bold mb-8">নতুন পণ্য তালিকাভুক্ত করুন</h1>
          
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Product Info */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>পণ্যের তথ্য</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">পণ্যের নাম</Label>
                      <Input 
                        id="title" 
                        placeholder="উদাহরণঃ তাজা ধান" 
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="description">বিবরণ</Label>
                      <Textarea 
                        id="description" 
                        placeholder="পণ্যের বিস্তারিত বিবরণ দিন" 
                        className="min-h-[120px]" 
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="category">ক্যাটাগরি</Label>
                      <Select
                        value={category}
                        onValueChange={setCategory}
                      >
                        <SelectTrigger id="category" className="w-full">
                          <SelectValue placeholder="ক্যাটাগরি নির্বাচন করুন" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map(cat => (
                            <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="price">দাম</Label>
                        <Input 
                          id="price" 
                          type="number" 
                          min="1" 
                          placeholder="0" 
                          value={price}
                          onChange={(e) => setPrice(e.target.value ? Number(e.target.value) : '')}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="unit">একক</Label>
                        <Select
                          value={unit}
                          onValueChange={setUnit}
                        >
                          <SelectTrigger id="unit" className="w-full">
                            <SelectValue placeholder="একক নির্বাচন করুন" />
                          </SelectTrigger>
                          <SelectContent>
                            {units.map(u => (
                              <SelectItem key={u} value={u}>{u}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="quantity">পরিমাণ</Label>
                      <Input 
                        id="quantity" 
                        type="number" 
                        min="1" 
                        placeholder="0" 
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value ? Number(e.target.value) : '')}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="location">অবস্থান</Label>
                      <Input 
                        id="location" 
                        placeholder="উদাহরণঃ দিনাজপুর" 
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="bidding-start">বিডিং শুরুর সময়</Label>
                      <Input 
                        id="bidding-start"
                        type="datetime-local" 
                        value={biddingStartTime}
                        onChange={(e) => setBiddingStartTime(e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="bidding-deadline">বিডিং শেষের সময়</Label>
                      <Input 
                        id="bidding-deadline"
                        type="datetime-local" 
                        value={biddingDeadline}
                        onChange={(e) => setBiddingDeadline(e.target.value)}
                        required
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Images Selection */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>পণ্যের ছবি</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground mb-2">
                      পণ্যের ছবি নির্বাচন করুন (অন্তত একটি)
                    </p>
                    
                    <div className="mb-4">
                      <Label htmlFor="image-upload" className="block mb-2">নিজের ছবি আপলোড করুন</Label>
                      <Input
                        id="image-upload"
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                        disabled={uploadingImages}
                      />
                    </div>
                    
                    {images.length > 0 && (
                      <div className="mt-4">
                        <p className="text-sm font-medium mb-2">আপলোড করা ছবি ({images.length})</p>
                        <div className="grid grid-cols-4 gap-2">
                          {images.map((img, index) => (
                            <div key={index} className="relative aspect-square rounded-md overflow-hidden">
                              <img 
                                src={img} 
                                alt={`Uploaded ${index}`} 
                                className="w-full h-full object-cover"
                              />
                              <button
                                type="button"
                                className="absolute top-1 right-1 bg-red-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setImages(images.filter(i => i !== img));
                                }}
                              >
                                ✕
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <p className="text-sm text-muted-foreground mt-2">
                      নির্বাচিত ছবি: {images.length}
                    </p>

                    <div className="pt-4">
                      <Button 
                        type="submit" 
                        className="w-full bg-agriculture-green-dark hover:bg-agriculture-green-light"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? "প্রসেসিং..." : "পণ্য যোগ করুন"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Video Upload Section */}
                <Card>
                  <CardHeader>
                    <CardTitle>পণ্যের ভিডিও (ঐচ্ছিক)</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      পণ্যের ভিডিও যোগ করুন যাতে ক্রেতারা আরো ভালোভাবে পণ্য দেখতে পারে (সর্বোচ্চ ৫০এমবি)
                    </p>
                    
                    {!videoUrl ? (
                      <div>
                        <Label htmlFor="video-upload" className="block mb-2">ভিডিও আপলোড করুন</Label>
                        <Input
                          id="video-upload"
                          type="file"
                          accept="video/*"
                          onChange={handleVideoUpload}
                          disabled={uploadingVideo}
                        />
                        {uploadingVideo && (
                          <p className="text-sm mt-2 text-blue-600">ভিডিও আপলোড হচ্ছে...</p>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <p className="text-sm font-medium text-green-600">✓ ভিডিও আপলোড সম্পন্ন</p>
                        <video 
                          controls 
                          className="w-full max-h-48 rounded-md"
                          src={videoUrl}
                        >
                          আপনার ব্রাউজার ভিডিও প্লেব্যাক সাপোর্ট করে না।
                        </video>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={removeVideo}
                          className="text-red-600 hover:text-red-700"
                        >
                          ভিডিও সরান
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>টিপস</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc pl-5 space-y-2 text-sm">
                      <li>ভালো মানের ছবি ব্যবহার করুন যাতে আপনার পণ্য স্পষ্টভাবে দেখা যায়।</li>
                      <li>পণ্যের সঠিক বর্ণনা দিন যাতে ক্রেতারা সহজেই বুঝতে পারে।</li>
                      <li>যথাসম্ভব সঠিক মূল্য নির্ধারণ করুন।</li>
                      <li>আপনার অবস্থানের সঠিক তথ্য দিন।</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          </form>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default CreateListing;
