
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
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { supabase } from '@/integrations/supabase/client';
import { User, Product } from '@/types';

const AdminDashboard = () => {
  const { user, profile, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [users, setUsers] = useState<User[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{id: string, type: 'user' | 'product'} | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  
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
    
    if (!isLoading && isAuthenticated && profile?.role !== 'admin') {
      toast({
        title: "অ্যাডমিন সংরক্ষিত",
        description: "এই পেইজ শুধুমাত্র অ্যাডমিনদের জন্য।",
        variant: "destructive",
      });
      navigate('/dashboard');
    }

    const fetchData = async () => {
      setLoadingData(true);
      
      try {
        // Fetch users
        const { data: userData, error: userError } = await supabase
          .from('profiles')
          .select('*');
          
        if (userError) throw userError;
        
        if (userData) {
          const formattedUsers: User[] = userData.map(u => ({
            id: u.id,
            name: u.name,
            email: u.email,
            role: u.role,
            phone: u.phone || undefined,
            address: u.address || undefined
          }));
          
          setUsers(formattedUsers);
        }
        
        // Fetch products
        const { data: productData, error: productError } = await supabase
          .from('products')
          .select(`
            id,
            title,
            description,
            price,
            quantity,
            unit,
            location,
            images,
            category,
            created_at,
            seller_id,
            profiles:seller_id (name)
          `);
          
        if (productError) throw productError;
        
        if (productData) {
          const formattedProducts: Product[] = productData.map(item => ({
            id: item.id,
            title: item.title,
            description: item.description || '',
            price: Number(item.price),
            quantity: Number(item.quantity),
            unit: item.unit,
            location: item.location,
            images: item.images || [],
            sellerId: item.seller_id,
            sellerName: item.profiles?.name || 'অজানা বিক্রেতা',
            createdAt: item.created_at,
            category: item.category
          }));
          
          setProducts(formattedProducts);
        }
      } catch (error) {
        console.error('Error fetching admin data:', error);
        toast({
          title: "ডাটা লোড করতে সমস্যা",
          description: "ডাটা লোড করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।",
          variant: "destructive",
        });
      } finally {
        setLoadingData(false);
      }
    };
    
    if (isAuthenticated && profile?.role === 'admin') {
      fetchData();
    }
  }, [user, profile, isAuthenticated, isLoading, navigate, toast]);

  const filteredUsers = users.filter(user => 
    user.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.role?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const filteredProducts = products.filter(product =>
    product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.location.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const handleDeleteUser = async () => {
    if (!itemToDelete || itemToDelete.type !== 'user') return;
    
    try {
      // Only delete user from auth if they don't exist yet
      await supabase.auth.admin.deleteUser(itemToDelete.id);
      
      setUsers(users.filter(u => u.id !== itemToDelete.id));
      
      toast({
        title: "ইউজার ডিলিট করা হয়েছে",
        description: "ইউজার সফলভাবে ডিলিট করা হয়েছে।",
      });
    } catch (error: any) {
      console.error('Error deleting user:', error);
      toast({
        title: "ইউজার ডিলিট করতে সমস্যা",
        description: error.message || "ইউজার ডিলিট করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।",
        variant: "destructive",
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setItemToDelete(null);
    }
  };
  
  const handleDeleteProduct = async () => {
    if (!itemToDelete || itemToDelete.type !== 'product') return;
    
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', itemToDelete.id);
        
      if (error) throw error;
      
      setProducts(products.filter(p => p.id !== itemToDelete.id));
      
      toast({
        title: "পণ্য ডিলিট করা হয়েছে",
        description: "পণ্য সফলভাবে ডিলিট করা হয়েছে।",
      });
    } catch (error: any) {
      console.error('Error deleting product:', error);
      toast({
        title: "পণ্য ডিলিট করতে সমস্যা",
        description: error.message || "পণ্য ডিলিট করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।",
        variant: "destructive",
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setItemToDelete(null);
    }
  };
  
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
          <h1 className="text-3xl font-bold mb-8">অ্যাডমিন প্যানেল</h1>
          
          <div className="mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">মোট ইউজার</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{users.length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">মোট পণ্য</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{products.length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">সক্রিয় বিড</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0</div>
                </CardContent>
              </Card>
            </div>
          </div>
          
          <div className="mb-6">
            <Input
              placeholder="ইউজার, পণ্য বা বিড খুঁজুন..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-xl"
            />
          </div>
          
          <Tabs defaultValue="users">
            <TabsList className="mb-6">
              <TabsTrigger value="users">ইউজারস</TabsTrigger>
              <TabsTrigger value="products">পণ্যসমূহ</TabsTrigger>
              <TabsTrigger value="reports">রিপোর্টস</TabsTrigger>
            </TabsList>
            
            <TabsContent value="users">
              <Card>
                <CardHeader>
                  <CardTitle>ইউজারস</CardTitle>
                </CardHeader>
                <CardContent>
                  {filteredUsers.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="bg-muted">
                            <th className="p-2 text-left">নাম</th>
                            <th className="p-2 text-left">ইমেইল</th>
                            <th className="p-2 text-left">রোল</th>
                            <th className="p-2 text-left">অ্যাকশন</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredUsers.map(user => (
                            <tr key={user.id} className="border-b">
                              <td className="p-2">
                                <div className="font-medium">{user.name}</div>
                                <div className="text-sm text-muted-foreground">ID: {user.id}</div>
                              </td>
                              <td className="p-2">{user.email}</td>
                              <td className="p-2">
                                <div className={`
                                  inline-block px-2 py-1 rounded text-xs
                                  ${user.role === 'admin' ? 'bg-blue-100 text-blue-800' : ''}
                                  ${user.role === 'seller' ? 'bg-green-100 text-green-800' : ''}
                                  ${user.role === 'buyer' ? 'bg-agriculture-cream text-amber-800' : ''}
                                `}>
                                  {user.role === 'admin' && 'এডমিন'}
                                  {user.role === 'seller' && 'কৃষক'}
                                  {user.role === 'buyer' && 'ক্রেতা'}
                                </div>
                              </td>
                              <td className="p-2">
                                <div className="flex gap-2">
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => navigate(`/profile/${user.id}`)}
                                  >
                                    দেখুন
                                  </Button>
                                  <Button 
                                    variant="destructive" 
                                    size="sm"
                                    onClick={() => {
                                      setItemToDelete({id: user.id, type: 'user'});
                                      setIsDeleteDialogOpen(true);
                                    }}
                                    disabled={user.role === 'admin'}
                                  >
                                    ডিলিট
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">কোন ইউজার পাওয়া যায়নি।</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="products">
              <Card>
                <CardHeader>
                  <CardTitle>পণ্যসমূহ</CardTitle>
                </CardHeader>
                <CardContent>
                  {filteredProducts.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="bg-muted">
                            <th className="p-2 text-left">পণ্য</th>
                            <th className="p-2 text-left">দাম</th>
                            <th className="p-2 text-left">পরিমান</th>
                            <th className="p-2 text-left">অবস্থান</th>
                            <th className="p-2 text-left">বিক্রেতা</th>
                            <th className="p-2 text-left">অ্যাকশন</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredProducts.map(product => (
                            <tr key={product.id} className="border-b">
                              <td className="p-2">
                                <div className="flex items-center gap-3">
                                  <div className="w-12 h-12 rounded overflow-hidden">
                                    <img 
                                      src={product.images[0]} 
                                      alt={product.title}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                  <div>
                                    <div className="font-medium">{product.title}</div>
                                    <div className="text-xs text-muted-foreground">ID: {product.id}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="p-2">৳{product.price}/{product.unit}</td>
                              <td className="p-2">{product.quantity} {product.unit}</td>
                              <td className="p-2">{product.location}</td>
                              <td className="p-2">{product.sellerName}</td>
                              <td className="p-2">
                                <div className="flex gap-2">
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => navigate(`/product/${product.id}`)}
                                  >
                                    দেখুন
                                  </Button>
                                  <Button 
                                    variant="destructive" 
                                    size="sm"
                                    onClick={() => {
                                      setItemToDelete({id: product.id, type: 'product'});
                                      setIsDeleteDialogOpen(true);
                                    }}
                                  >
                                    ডিলিট
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">কোন পণ্য পাওয়া যায়নি।</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="reports">
              <Card>
                <CardHeader>
                  <CardTitle>রিপোর্টস</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">কোন রিপোর্ট পাওয়া যায়নি।</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {itemToDelete?.type === 'user' ? 'ইউজার ডিলিট নিশ্চিত করুন' : 'পণ্য ডিলিট নিশ্চিত করুন'}
            </DialogTitle>
            <DialogDescription>
              আপনি কি নিশ্চিত যে আপনি এই {itemToDelete?.type === 'user' ? 'ইউজারকে' : 'পণ্যকে'} ডিলিট করতে চান? এই অ্যাকশন বাতিল করা যাবে না।
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              বাতিল করুন
            </Button>
            <Button
              variant="destructive"
              onClick={itemToDelete?.type === 'user' ? handleDeleteUser : handleDeleteProduct}
            >
              ডিলিট করুন
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Footer />
    </div>
  );
};

export default AdminDashboard;
