
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { User, Phone, MapPin, Image } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserProfile } from '@/hooks/useUserProfile';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { supabase } from '@/integrations/supabase/client';

const EditProfile = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { profile, updateProfile } = useUserProfile(user?.id);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
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

    if (profile) {
      setName(profile.name || '');
      setPhone(profile.phone || '');
      setAddress(profile.address || '');
      setAvatarUrl(profile.avatar || '');
    }
  }, [isLoading, isAuthenticated, profile, navigate, toast]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // First upload avatar if selected
      let avatar = avatarUrl;
      if (selectedFile) {
        setUploading(true);
        
        const fileExt = selectedFile.name.split('.').pop();
        const fileName = `${user?.id}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `avatars/${fileName}`;
        
        const { error: uploadError } = await supabase.storage
          .from('profiles')
          .upload(filePath, selectedFile);
          
        if (uploadError) {
          throw uploadError;
        }
        
        // Get public URL
        const { data: publicUrlData } = supabase.storage
          .from('profiles')
          .getPublicUrl(filePath);
          
        avatar = publicUrlData.publicUrl;
        setUploading(false);
      }
      
      // Update profile
      await updateProfile({ 
        name,
        phone,
        address,
        avatar
      });
      
      toast({
        title: "প্রোফাইল আপডেট করা হয়েছে",
        description: "আপনার প্রোফাইল সফলভাবে আপডেট করা হয়েছে।",
      });
      
      navigate(`/profile/${user?.id}`);
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        title: "প্রোফাইল আপডেট করতে সমস্যা",
        description: error.message || "প্রোফাইল আপডেট করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।",
        variant: "destructive"
      });
      setUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 2 * 1024 * 1024) {
        toast({
          title: "ফাইল সাইজ বড়",
          description: "ফাইল সাইজ ২MB এর কম হতে হবে।",
          variant: "destructive"
        });
        return;
      }
      setSelectedFile(file);
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
        <div className="container mx-auto max-w-2xl">
          <h1 className="text-3xl font-bold mb-8 text-center">প্রোফাইল সম্পাদনা করুন</h1>
          
          <Card>
            <CardHeader>
              <CardTitle>আপনার প্রোফাইল তথ্য</CardTitle>
            </CardHeader>
            
            <form onSubmit={handleProfileUpdate}>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="avatar">প্রোফাইল ছবি</Label>
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0">
                      {avatarUrl ? (
                        <img 
                          src={avatarUrl} 
                          alt="প্রোফাইল ছবি" 
                          className="w-20 h-20 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-full bg-agriculture-green-light flex items-center justify-center text-white text-2xl">
                          {name?.charAt(0) || user?.email?.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div className="flex-grow">
                      <Label htmlFor="avatar-upload" className="cursor-pointer">
                        <div className="flex items-center gap-2 text-agriculture-green-dark hover:text-agriculture-green-light transition-colors">
                          <Image className="w-5 h-5" />
                          <span>ছবি আপলোড করুন</span>
                        </div>
                        <input
                          id="avatar-upload"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleFileChange}
                          disabled={uploading}
                        />
                      </Label>
                      {selectedFile && (
                        <p className="text-sm mt-1">
                          নির্বাচিত: {selectedFile.name}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="name" className="flex items-center gap-2">
                    <User className="w-4 h-4" /> নাম
                  </Label>
                  <Input
                    id="name"
                    placeholder="আপনার নাম"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone" className="flex items-center gap-2">
                    <Phone className="w-4 h-4" /> ফোন নাম্বার
                  </Label>
                  <Input
                    id="phone"
                    placeholder="আপনার ফোন নাম্বার"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="address" className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" /> ঠিকানা
                  </Label>
                  <Textarea
                    id="address"
                    placeholder="আপনার ঠিকানা"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="min-h-[100px]"
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
                  disabled={uploading}
                >
                  {uploading ? 'আপলোড হচ্ছে...' : 'প্রোফাইল আপডেট করুন'}
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

export default EditProfile;
