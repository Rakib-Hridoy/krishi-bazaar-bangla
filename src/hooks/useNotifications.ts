import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface AppNotification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'bid' | 'message' | 'order' | 'delivery';
  is_read: boolean;
  created_at: string;
  metadata?: any;
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchNotifications = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // Use simple query without RPC until types are regenerated
      const { data: fallbackData, error: fallbackError } = await supabase
        .from('messages')
        .select('id, sender_id, content, created_at, is_read')
        .eq('receiver_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (!fallbackError && fallbackData) {
        const formattedNotifications: AppNotification[] = fallbackData.map(msg => ({
          id: msg.id,
          user_id: msg.sender_id,
          title: 'নতুন মেসেজ',
          message: msg.content,
          type: 'message' as const,
          is_read: msg.is_read,
          created_at: msg.created_at,
          metadata: null
        }));
        setNotifications(formattedNotifications);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast({
        title: "ত্রুটি",
        description: "নোটিফিকেশন লোড করতে সমস্যা হয়েছে।",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      // Try to update notifications table first
      const { error: notifError } = await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (!notifError) {
        setNotifications(prev => 
          prev.map(notif => 
            notif.id === notificationId ? { ...notif, is_read: true } : notif
          )
        );
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('receiver_id', user.id)
        .eq('is_read', false);

      if (!error) {
        setNotifications(prev => 
          prev.map(notif => ({ ...notif, is_read: true }))
        );
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const createNotification = async (
    userId: string,
    title: string,
    message: string,
    type: 'bid' | 'message' | 'order' | 'delivery',
    metadata?: any
  ) => {
    // For now, we'll create these as messages until the notifications table is available
    console.log('Creating notification:', { userId, title, message, type, metadata });
  };

  // Set up realtime subscription for messages (temporary until notifications table is available)
  useEffect(() => {
    if (!user) return;

    fetchNotifications();

    const channel = supabase
      .channel('message_notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${user.id}`
        },
        (payload) => {
          const newMessage = payload.new as any;
          const newNotification: AppNotification = {
            id: newMessage.id,
            user_id: newMessage.sender_id,
            title: 'নতুন মেসেজ',
            message: newMessage.content,
            type: 'message',
            is_read: false,
            created_at: newMessage.created_at,
            metadata: null
          };
          
          setNotifications(prev => [newNotification, ...prev]);
          
          // Show browser notification if permission granted
          if (Notification.permission === 'granted') {
            new Notification(newNotification.title, {
              body: newNotification.message,
              icon: '/icon-192.png'
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return {
    notifications,
    isLoading,
    unreadCount,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    createNotification
  };
};