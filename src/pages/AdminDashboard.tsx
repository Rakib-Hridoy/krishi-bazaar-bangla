import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';  
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@/types';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { AdminBidMonitoring } from '@/components/AdminBidMonitoring';

const AdminDashboard = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto py-12 px-4">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">এডমিন ড্যাশবোর্ড</h1>
            <p className="text-muted-foreground">সিস্টেম পরিচালনা ও পর্যবেক্ষণ</p>
          </div>
          
          <Tabs defaultValue="monitoring" className="space-y-6">
            <TabsList>
              <TabsTrigger value="monitoring">বিড মনিটরিং</TabsTrigger>
              <TabsTrigger value="users">ব্যবহারকারী ব্যবস্থাপনা</TabsTrigger>
              <TabsTrigger value="products">পণ্য পর্যালোচনা</TabsTrigger>
            </TabsList>
            
            <TabsContent value="monitoring">
              <AdminBidMonitoring />
            </TabsContent>
            
            <TabsContent value="users">
              <UserManagement />
            </TabsContent>
            
            <TabsContent value="products">
              <ProductReview />
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default AdminDashboard;

const ProductReview = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          id,
          title,
          price,
          quantity,
          category,
          created_at,
          seller_id,
          profiles:seller_id (name)
        `)
        .order('created_at', { ascending: false })
        .limit(20);
      
      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({
        title: "পণ্য তথ্য লোড করতে সমস্যা",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>সাম্প্রতিক পণ্যসমূহ</CardTitle>
        <CardDescription>সিস্টেমে যোগ করা সাম্প্রতিক পণ্যসমূহ</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">পণ্য লোড হচ্ছে...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {products.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">কোনো পণ্য পাওয়া যায়নি</p>
            ) : (
              products.map((product: any) => (
                <div key={product.id} className="border rounded p-4 space-y-2">
                  <div className="flex justify-between items-start">
                    <h4 className="font-medium">{product.title}</h4>
                    <span className="text-sm text-muted-foreground">
                      {new Date(product.created_at).toLocaleDateString('bn-BD')}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <p><span className="font-medium">বিক্রেতা:</span> {product.profiles?.name || 'অজানা'}</p>
                    <p><span className="font-medium">দাম:</span> ৳{product.price.toLocaleString()}</p>
                    <p><span className="font-medium">পরিমাণ:</span> {product.quantity}</p>
                    <p><span className="font-medium">ক্যাটেগরি:</span> {product.category}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          name,
          email,
          role,
          phone,
          address,
          avatar_url,
          bid_abandonment_count,
          last_abandonment_at,
          bid_suspension_until,
          created_at
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      if (data) {
        const formattedUsers: User[] = data.map(user => ({
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role as 'buyer' | 'seller' | 'admin',
          phone: user.phone || undefined,
          address: user.address || undefined,
          avatar: user.avatar_url || undefined,
          bidAbandonmentCount: user.bid_abandonment_count || 0,
          lastAbandonmentAt: user.last_abandonment_at || undefined,
          bidSuspensionUntil: user.bid_suspension_until || undefined
        }));
        setUsers(formattedUsers);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "ব্যবহারকারী তথ্য লোড করতে সমস্যা",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: 'buyer' | 'seller' | 'admin') => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);
      
      if (error) throw error;
      
      setUsers(prevUsers =>
        prevUsers.map(user =>
          user.id === userId ? { ...user, role: newRole } : user
        )
      );
      
      toast({
        title: "ব্যবহারকারীর ভূমিকা পরিবর্তন করা হয়েছে",
        description: `ব্যবহারকারীর ভূমিকা ${getRoleName(newRole)} তে পরিবর্তন করা হয়েছে।`
      });
    } catch (error) {
      console.error('Error updating user role:', error);
      toast({
        title: "ব্যবহারকারীর ভূমিকা পরিবর্তন করতে সমস্যা",
        variant: "destructive"
      });
    }
  };

  const removeSuspension = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          bid_suspension_until: null,
          bid_abandonment_count: 0 
        })
        .eq('id', userId);
      
      if (error) throw error;
      
      setUsers(prevUsers =>
        prevUsers.map(user =>
          user.id === userId 
            ? { ...user, bidSuspensionUntil: undefined, bidAbandonmentCount: 0 } 
            : user
        )
      );
      
      toast({
        title: "সাসপেনশন উঠানো হয়েছে",
        description: "ব্যবহারকারীর বিডিং সাসপেনশন উঠানো হয়েছে।"
      });
    } catch (error) {
      console.error('Error removing suspension:', error);
      toast({
        title: "সাসপেনশন উঠাতে সমস্যা",
        variant: "destructive"
      });
    }
  };

  const getRoleName = (role: string) => {
    switch (role) {
      case 'buyer': return 'ক্রেতা';
      case 'seller': return 'বিক্রেতা';
      case 'admin': return 'এডমিন';
      default: return role;
    }
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const suspendedUsers = users.filter(user => 
    user.bidSuspensionUntil && new Date(user.bidSuspensionUntil) > new Date()
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>ব্যবহারকারী ব্যবস্থাপনা</CardTitle>
          <CardDescription>
            মোট ব্যবহারকারী: {users.length} | সাসপেন্ডেড: {suspendedUsers.length}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Input
              placeholder="নাম বা ইমেইল দিয়ে খুঁজুন..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>

          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-muted-foreground">ব্যবহারকারী লোড হচ্ছে...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ব্যবহারকারী
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ভূমিকা
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      বিড সংক্রান্ত
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      কার্যকলাপ
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map((user) => {
                    const isSuspended = user.bidSuspensionUntil && new Date(user.bidSuspensionUntil) > new Date();
                    
                    return (
                      <tr key={user.id} className={isSuspended ? 'bg-red-50' : ''}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="font-medium">{user.name}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                            {user.phone && (
                              <div className="text-sm text-gray-500">{user.phone}</div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <select
                            className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                            value={user.role}
                            onChange={(e) => updateUserRole(user.id, e.target.value as 'buyer' | 'seller' | 'admin')}
                          >
                            <option value="buyer">ক্রেতা</option>
                            <option value="seller">বিক্রেতা</option>
                            <option value="admin">এডমিন</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div>
                            <p>পরিত্যাগ: {user.bidAbandonmentCount || 0}</p>
                            {isSuspended && (
                              <p className="text-red-600 font-medium">
                                সাসপেন্ডেড: {new Date(user.bidSuspensionUntil!).toLocaleDateString('bn-BD')} পর্যন্ত
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                          {isSuspended && (
                            <Button 
                              onClick={() => removeSuspension(user.id)}
                              variant="outline"
                              size="sm"
                            >
                              সাসপেনশন উঠান
                            </Button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              
              {filteredUsers.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">কোনো ব্যবহারকারী পাওয়া যায়নি</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Suspended Users Summary */}
      {suspendedUsers.length > 0 && (
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-red-700">সাসপেন্ডেড ব্যবহারকারী</CardTitle>
            <CardDescription>
              {suspendedUsers.length}জন ব্যবহারকারী বর্তমানে বিডিং থেকে সাসপেন্ডেড
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {suspendedUsers.map(user => (
                <div key={user.id} className="flex justify-between items-center p-3 bg-red-50 rounded">
                  <div>
                    <p className="font-medium">{user.name}</p>
                    <p className="text-sm text-gray-600">
                      সাসপেনশন শেষ: {new Date(user.bidSuspensionUntil!).toLocaleDateString('bn-BD')}
                    </p>
                  </div>
                  <Button 
                    onClick={() => removeSuspension(user.id)}
                    variant="outline"
                    size="sm"
                  >
                    সাসপেনশন উঠান
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
