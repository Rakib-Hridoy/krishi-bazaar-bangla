import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  product_id?: string;
  content: string;
  message_type: string;
  is_read: boolean;
  created_at: string;
}

export const useMessages = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchMessages = async (userId: string) => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${userId}),and(sender_id.eq.${userId},receiver_id.eq.${user.id})`)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: "ত্রুটি",
        description: "মেসেজ লোড করতে সমস্যা হয়েছে।",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAllConversations = async () => {
    if (!user) return [];
    
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('sender_id, receiver_id, content, created_at, is_read')
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Group messages by conversation partner
      const conversations = new Map();
      data?.forEach(message => {
        const partnerId = message.sender_id === user.id ? message.receiver_id : message.sender_id;
        if (!conversations.has(partnerId)) {
          conversations.set(partnerId, {
            partnerId,
            lastMessage: message.content,
            lastMessageTime: message.created_at,
            unreadCount: 0
          });
        }
        
        // Count unread messages received by current user
        if (message.receiver_id === user.id && !message.is_read) {
          const conv = conversations.get(partnerId);
          conv.unreadCount += 1;
        }
      });

      return Array.from(conversations.values());
    } catch (error) {
      console.error('Error fetching conversations:', error);
      return [];
    }
  };

  const sendMessage = async (receiverId: string, content: string, productId?: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          sender_id: user.id,
          receiver_id: receiverId,
          content,
          product_id: productId,
          message_type: 'text'
        });

      if (error) throw error;
      
      // The message will be added automatically via realtime subscription
      toast({
        title: "সফল",
        description: "মেসেজ পাঠানো হয়েছে।"
      });
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "ত্রুটি",
        description: "মেসেজ পাঠাতে সমস্যা হয়েছে।",
        variant: "destructive"
      });
    }
  };

  const markAsRead = async (messageId: string) => {
    try {
      const { error } = await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('id', messageId);

      if (error) throw error;
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  // Set up realtime subscription
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `or(sender_id.eq.${user.id},receiver_id.eq.${user.id})`
        },
        (payload) => {
          const newMessage = payload.new as Message;
          setMessages(prev => [...prev, newMessage]);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `or(sender_id.eq.${user.id},receiver_id.eq.${user.id})`
        },
        (payload) => {
          const updatedMessage = payload.new as Message;
          setMessages(prev => 
            prev.map(msg => msg.id === updatedMessage.id ? updatedMessage : msg)
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return {
    messages,
    isLoading,
    fetchMessages,
    fetchAllConversations,
    sendMessage,
    markAsRead
  };
};