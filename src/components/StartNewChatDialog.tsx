import { useState, useEffect } from 'react';
import { Search, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import ChatWindow from '@/components/ChatWindow';

interface User {
  id: string;
  name: string;
  avatar_url?: string;
  role: string;
}

interface StartNewChatDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const StartNewChatDialog = ({ isOpen, onClose }: StartNewChatDialogProps) => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const { user: currentUser } = useAuth();

  useEffect(() => {
    if (isOpen) {
      loadUsers();
    }
  }, [isOpen]);

  const loadUsers = async () => {
    if (!currentUser) return;
    
    setIsLoading(true);
    try {
      // Get public profiles using the security definer function
      const { data, error } = await (supabase as any).rpc('get_public_profile', {
        profile_user_id: null // This will need to be modified to get all users
      });

      // For now, let's get users from products table as that's publicly accessible
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('seller_id')
        .neq('seller_id', currentUser.id);

      if (productsError) throw productsError;

      // Get unique seller IDs
      const sellerIds = [...new Set(productsData?.map(p => p.seller_id) || [])];
      
      // Get profiles for these sellers
      const profilePromises = sellerIds.map(async (sellerId) => {
        try {
          const { data: profileData } = await (supabase as any).rpc('get_public_profile', {
            profile_user_id: sellerId
          });
          return profileData;
        } catch (error) {
          console.error('Error fetching profile:', error);
          return null;
        }
      });

      const profiles = await Promise.all(profilePromises);
      const validProfiles = profiles.filter(p => p !== null);
      
      setUsers(validProfiles || []);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (selectedUser) {
    return (
      <ChatWindow
        receiverId={selectedUser.id}
        receiverName={selectedUser.name}
        receiverAvatar={selectedUser.avatar_url}
        onClose={() => {
          setSelectedUser(null);
          onClose();
        }}
      />
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            নতুন চ্যাট শুরু করুন
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="ব্যবহারকারী খুঁজুন..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Users List */}
          <ScrollArea className="h-60">
            {isLoading ? (
              <div className="flex items-center justify-center h-20">
                <p className="text-muted-foreground">লোড হচ্ছে...</p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="flex items-center justify-center h-20">
                <p className="text-muted-foreground">কোন ব্যবহারকারী পাওয়া যায়নি</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredUsers.map((user) => (
                  <div
                    key={user.id}
                    onClick={() => setSelectedUser(user)}
                    className="flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-muted transition-colors"
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.avatar_url} />
                      <AvatarFallback>{user.name[0]}</AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium truncate">{user.name}</h4>
                      <p className="text-xs text-muted-foreground">
                        {user.role === 'seller' ? 'কৃষক' : 'ক্রেতা'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StartNewChatDialog;