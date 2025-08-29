import { useState, useEffect, useRef } from 'react';
import { Send, X, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useMessages } from '@/hooks/useMessages';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

interface ChatWindowProps {
  receiverId: string;
  receiverName: string;
  receiverAvatar?: string;
  productId?: string;
  onClose: () => void;
}

const ChatWindow = ({ 
  receiverId, 
  receiverName, 
  receiverAvatar, 
  productId,
  onClose 
}: ChatWindowProps) => {
  const [newMessage, setNewMessage] = useState('');
  const [senderProfiles, setSenderProfiles] = useState<{[key: string]: {name: string, avatar_url?: string}}>({});
  const { messages, sendMessage, fetchMessages, markAsRead } = useMessages();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchMessages(receiverId);
    loadSenderProfiles();
  }, [receiverId, fetchMessages]);

  const loadSenderProfiles = async () => {
    if (!messages.length) return;
    
    const senderIds = [...new Set(messages.map(msg => msg.sender_id))];
    const profilePromises = senderIds.map(async (senderId) => {
      if (senderId === user?.id || senderProfiles[senderId]) return null;
      
      const { data } = await supabase
        .from('profiles')
        .select('name, avatar_url')
        .eq('id', senderId)
        .single();
        
      return { id: senderId, profile: data };
    });

    const profiles = await Promise.all(profilePromises);
    const newProfiles: {[key: string]: {name: string, avatar_url?: string}} = {};
    
    profiles.forEach((p) => {
      if (p && p.profile) {
        newProfiles[p.id] = p.profile;
      }
    });

    setSenderProfiles(prev => ({ ...prev, ...newProfiles }));
  };

  useEffect(() => {
    loadSenderProfiles();
  }, [messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    
    await sendMessage(receiverId, newMessage, productId);
    setNewMessage('');
  };

  const filteredMessages = messages.filter(
    msg => 
      (msg.sender_id === user?.id && msg.receiver_id === receiverId) ||
      (msg.sender_id === receiverId && msg.receiver_id === user?.id)
  );

  return (
    <Card className="fixed bottom-4 right-4 w-80 h-96 flex flex-col shadow-lg z-50 bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b">
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={receiverAvatar} />
            <AvatarFallback>{receiverName[0]}</AvatarFallback>
          </Avatar>
          <span className="font-medium text-sm">{receiverName}</span>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-3">
        <div className="space-y-3">
          {filteredMessages.map((message) => {
            const isCurrentUser = message.sender_id === user?.id;
            const senderProfile = isCurrentUser 
              ? { name: profile?.name || 'আপনি', avatar_url: profile?.avatar_url }
              : senderProfiles[message.sender_id] || { name: receiverName };

            return (
              <div
                key={message.id}
                className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-xs ${isCurrentUser ? 'order-2' : 'order-1'}`}>
                  {!isCurrentUser && (
                    <div className="flex items-center gap-2 mb-1">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={senderProfile.avatar_url} />
                        <AvatarFallback className="text-xs">
                          {senderProfile.name?.[0] || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <button
                        onClick={() => navigate(`/profile/${message.sender_id}`)}
                        className="text-xs font-medium text-primary hover:underline"
                      >
                        {senderProfile.name || 'Unknown User'}
                      </button>
                    </div>
                  )}
                  <div
                    className={`p-2 rounded-lg text-sm ${
                      isCurrentUser
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    <p>{message.content}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {format(new Date(message.created_at), 'HH:mm')}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-3 border-t">
        <div className="flex gap-2">
          <Input
            placeholder="মেসেজ লিখুন..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            className="flex-1"
          />
          <Button 
            onClick={handleSendMessage}
            size="sm"
            disabled={!newMessage.trim()}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default ChatWindow;