
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
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const CreateListing = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const placeholderImages = [
    'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9',
    'https://images.unsplash.com/photo-1493962853295-0fd70327578a',
    'https://images.unsplash.com/photo-1465379944081-7f47de8d74ac',
    'https://images.unsplash.com/photo-1452378174528-3090a4bba7b2'
  ];
  
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
    
    if (!isLoading && isAuthenticated && user?.role !== 'seller') {
      toast({
        title: "শুধুমাত্র বিক্রেতার জন্য",
        description: "শুধুমাত্র কৃষক/বিক্রেতারা পণ্য যোগ করতে পারেন।",
        variant: "destructive",
      });
      navigate('/dashboard');
    }
  }, [user, isAuthenticated, isLoading, navigate, toast]);

  const handleImageSelect = (imageUrl: string) => {
    if (images.includes(imageUrl)) {
      setImages(images.filter(img => img !== imageUrl));
    } else {
      setImages([...images, imageUrl]);
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !description || price === '' || quantity === '' || !location || !category) {
      toast({
        title: "সব ফিল্ড পূরণ করুন",
        description: "অনুগ্রহ করে সব প্রয়োজনীয় ফিল্ড পূরণ করুন।",
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
    
    // Simulate form submission
    setTimeout(() => {
      toast({
        title: "পণ্য যোগ করা হয়েছে",
        description: "আপনার পণ্য সফলভাবে যোগ করা হয়েছে।",
      });
      navigate('/dashboard');
    }, 1500);
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
                    
                    <div className="grid grid-cols-2 gap-4">
                      {placeholderImages.map((img, index) => (
                        <div 
                          key={index}
                          className={`aspect-square border-2 rounded-md overflow-hidden cursor-pointer ${
                            images.includes(img) ? 'border-agriculture-green-dark' : 'border-transparent'
                          }`}
                          onClick={() => handleImageSelect(img)}
                        >
                          <img 
                            src={img}
                            alt={`Product sample ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                          {images.includes(img) && (
                            <div className="absolute top-2 right-2 bg-agriculture-green-dark text-white w-6 h-6 rounded-full flex items-center justify-center">
                              ✓
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    
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
