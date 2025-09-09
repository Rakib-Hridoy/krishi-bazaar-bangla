import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
        <AdminBidMonitoring />
      </main>
      
      <Footer />
    </div>
  );
};

export default AdminDashboard;

const ProductReview = () => {
  return (
    <div>
      পণ্য পর্যালোচনার কাজ চলছে...
    </div>
  );
};

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
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
          avatar: user.avatar_url || undefined
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
        description: `ব্যবহারকারীর ভূমিকা ${newRole} তে পরিবর্তন করা হয়েছে।`
      });
    } catch (error) {
      console.error('Error updating user role:', error);
      toast({
        title: "ব্যবহারকারীর ভূমিকা পরিবর্তন করতে সমস্যা",
        variant: "destructive"
      });
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      // First delete from auth.users using RPC function (if exists) 
      // or delete from profiles table which should cascade
      const { error } = await supabase.auth.admin.deleteUser(userId);
      
      if (error) {
        // If admin delete fails, try profiles table delete
        const { error: profileError } = await supabase
          .from('profiles')
          .delete()
          .eq('id', userId);
        
        if (profileError) throw profileError;
      }
      
      setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
      
      toast({
        title: "ব্যবহারকারী মুছে ফেলা হয়েছে",
        description: "ব্যবহারকারী সফলভাবে মুছে ফেলা হয়েছে।"
      });
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: "ব্যবহারকারী মুছতে সমস্যা",
        description: "এডমিন ড্যাশবোর্ড থেকে ইউজার ডিলিট করার জন্য সুপারএডমিন অ্যাক্সেস প্রয়োজন।",
        variant: "destructive"
      });
    }
  };

  return (
    <div>
      {isLoading ? (
        <p>ব্যবহারকারী লোড হচ্ছে...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  নাম
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ইমেইল
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ভূমিকা
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  কার্যকলাপ
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {user.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      value={user.role}
                      onChange={(e) => updateUserRole(user.id, e.target.value as 'buyer' | 'seller' | 'admin')}
                    >
                      <option value="buyer">ক্রেতা</option>
                      <option value="seller">বিক্রেতা</option>
                      <option value="admin">এডমিন</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <Button 
                      variant="destructive"
                      onClick={() => deleteUser(user.id)}
                    >
                      মুছে ফেলুন
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
