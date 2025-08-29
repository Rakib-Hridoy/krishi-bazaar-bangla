import { useState, useEffect } from 'react';
import { MessageCircle, X, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { useMessages } from '@/hooks/useMessages';
import { supabase } from '@/integrations/supabase/client';
import ChatWindow from '@/components/ChatWindow';
import StartNewChatDialog from '@/components/StartNewChatDialog';

interface ChatContact {
  id: string;
  name: string;
  avatar?: string;
  lastMessage?: string;
  unreadCount?: number;
}

const ChatFloatingButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedChat, setSelectedChat] = useState<ChatContact | null>(null);
  const [contacts, setContacts] = useState<ChatContact[]>([]);
  const [showNewChatDialog, setShowNewChatDialog] = useState(false);
  const { user } = useAuth();
  const { fetchAllConversations } = useMessages();

  useEffect(() => {
    if (user && isOpen) {
      loadContacts();
    }
  }, [user, isOpen]);

  const loadContacts = async () => {
    const conversations = await fetchAllConversations();
    
    // Fetch partner details for each conversation
    const contactsPromises = conversations.map(async (conv) => {
      // This is a simplified version - you might want to create a hook for this
      const { data: userData } = await supabase
        .from('profiles')
        .select('name, avatar_url')
        .eq('id', conv.partnerId)
        .single();

      return {
        id: conv.partnerId,
        name: userData?.name || 'Unknown User',
        avatar: userData?.avatar_url,
        lastMessage: conv.lastMessage,
        unreadCount: conv.unreadCount
      };
    });

    const resolvedContacts = await Promise.all(contactsPromises);
    setContacts(resolvedContacts);
  };

  if (!user) return null;

  if (selectedChat) {
    return (
      <ChatWindow
        receiverId={selectedChat.id}
        receiverName={selectedChat.name}
        receiverAvatar={selectedChat.avatar}
        onClose={() => setSelectedChat(null)}
      />
    );
  }

  return (
    <>
      {/* Floating Chat Button */}
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-shadow z-40"
        size="sm"
      >
        <MessageCircle className="h-6 w-6" />
        {contacts.reduce((total, contact) => total + (contact.unreadCount || 0), 0) > 0 && (
          <span className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground text-xs rounded-full h-6 w-6 flex items-center justify-center">
            {contacts.reduce((total, contact) => total + (contact.unreadCount || 0), 0)}
          </span>
        )}
      </Button>

      {/* Contacts List */}
      {isOpen && (
        <Card className="fixed bottom-24 right-6 w-80 max-h-96 flex flex-col shadow-lg z-50 bg-background">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="font-semibold">চ্যাট</h3>
            <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Contacts */}
          <div className="flex-1 overflow-y-auto">
            {contacts.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                <p className="mb-3">কোন চ্যাট নেই</p>
                <Button
                  onClick={() => {
                    setShowNewChatDialog(true);
                    setIsOpen(false);
                  }}
                  size="sm"
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  নতুন চ্যাট শুরু করুন
                </Button>
              </div>
            ) : (
              <div className="space-y-1 p-2">
                {/* New Chat Button */}
                <div className="p-2 border-b">
                  <Button
                    onClick={() => {
                      setShowNewChatDialog(true);
                      setIsOpen(false);
                    }}
                    size="sm"
                    variant="outline"
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    নতুন চ্যাট
                  </Button>
                </div>

                {contacts.map((contact) => (
                  <div
                    key={contact.id}
                    onClick={() => {
                      setSelectedChat(contact);
                      setIsOpen(false);
                    }}
                    className="flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-muted transition-colors"
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={contact.avatar} />
                      <AvatarFallback>{contact.name[0]}</AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium truncate">{contact.name}</h4>
                        {contact.unreadCount > 0 && (
                          <span className="bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                            {contact.unreadCount}
                          </span>
                        )}
                      </div>
                      {contact.lastMessage && (
                        <p className="text-sm text-muted-foreground truncate">
                          {contact.lastMessage}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      )}

      {/* New Chat Dialog */}
      <StartNewChatDialog
        isOpen={showNewChatDialog}
        onClose={() => setShowNewChatDialog(false)}
      />
    </>
  );
};

export default ChatFloatingButton;