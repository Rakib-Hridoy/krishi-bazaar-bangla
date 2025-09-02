import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

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

  const fetchNotifications = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // Fetch from notifications table
      const { data: notificationsData, error: notificationsError } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (!notificationsError && notificationsData) {
        const formattedNotifications: AppNotification[] = notificationsData.map(notif => ({
          id: notif.id,
          user_id: notif.user_id,
          title: notif.title,
          message: notif.message,
          type: notif.type as 'bid' | 'message' | 'order' | 'delivery',
          is_read: notif.is_read,
          created_at: notif.created_at,
          metadata: notif.metadata
        }));
        setNotifications(formattedNotifications);
      }

      // Also fetch messages as fallback
      const { data: messagesData, error: messagesError } = await supabase
        .from('messages')
        .select('id, sender_id, content, created_at, is_read')
        .eq('receiver_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (!messagesError && messagesData) {
        const messageNotifications: AppNotification[] = messagesData.map(msg => ({
          id: `msg_${msg.id}`,
          user_id: msg.sender_id,
          title: 'নতুন মেসেজ',
          message: msg.content,
          type: 'message' as const,
          is_read: msg.is_read,
          created_at: msg.created_at,
          metadata: { message_id: msg.id }
        }));
        setNotifications(prev => [...prev, ...messageNotifications]);
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
      // Check if it's a message notification
      if (notificationId.startsWith('msg_')) {
        const messageId = notificationId.replace('msg_', '');
        const { error: msgError } = await supabase
          .from('messages')
          .update({ is_read: true })
          .eq('id', messageId);

        if (!msgError) {
          setNotifications(prev => 
            prev.map(notif => 
              notif.id === notificationId ? { ...notif, is_read: true } : notif
            )
          );
        }
      } else {
        // Regular notification
        const { error: notifError } = await supabase
          .from('notifications')
          .update({ is_read: true })
          .eq('id', notificationId);

        if (!notifError) {
          setNotifications(prev => 
            prev.map(notif => 
              notif.id === notificationId ? { ...notif, is_read: true } : notif
            )
          );
        }
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;

    try {
      // Mark all notifications as read
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false);

      // Mark all messages as read
      await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('receiver_id', user.id)
        .eq('is_read', false);

      setNotifications(prev => 
        prev.map(notif => ({ ...notif, is_read: true }))
      );
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

  // Set up realtime subscriptions
  useEffect(() => {
    if (!user) return;

    fetchNotifications();

    // Subscribe to notifications
    const notificationsChannel = supabase
      .channel('notifications_channel')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          const newNotification = payload.new as any;
          const formattedNotification: AppNotification = {
            id: newNotification.id,
            user_id: newNotification.user_id,
            title: newNotification.title,
            message: newNotification.message,
            type: newNotification.type,
            is_read: false,
            created_at: newNotification.created_at,
            metadata: newNotification.metadata
          };
          
          setNotifications(prev => [formattedNotification, ...prev]);
          
          // Show browser notification if permission granted
          if (Notification.permission === 'granted') {
            new Notification(formattedNotification.title, {
              body: formattedNotification.message,
              icon: '/icon-192.png'
            });
          }
        }
      )
      .subscribe();

    // Subscribe to messages
    const messagesChannel = supabase
      .channel('messages_channel')
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
          const messageNotification: AppNotification = {
            id: `msg_${newMessage.id}`,
            user_id: newMessage.sender_id,
            title: 'নতুন মেসেজ',
            message: newMessage.content,
            type: 'message',
            is_read: false,
            created_at: newMessage.created_at,
            metadata: { message_id: newMessage.id }
          };
          
          setNotifications(prev => [messageNotification, ...prev]);
          
          // Show browser notification if permission granted
          if (Notification.permission === 'granted') {
            new Notification(messageNotification.title, {
              body: messageNotification.message,
              icon: '/icon-192.png'
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(notificationsChannel);
      supabase.removeChannel(messagesChannel);
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