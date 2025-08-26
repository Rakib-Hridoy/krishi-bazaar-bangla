import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const usePushNotifications = () => {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    setIsSupported('serviceWorker' in navigator && 'PushManager' in window);
  }, []);

  const requestPermission = async (): Promise<boolean> => {
    if (!isSupported) return false;

    try {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  };

  const subscribeToPush = async () => {
    if (!isSupported) {
      toast({
        title: "সাপোর্ট নেই",
        description: "আপনার ব্রাউজার পুশ নোটিফিকেশন সাপোর্ট করে না।",
        variant: "destructive"
      });
      return;
    }

    try {
      const hasPermission = await requestPermission();
      if (!hasPermission) {
        toast({
          title: "অনুমতি প্রয়োজন",
          description: "নোটিফিকেশনের জন্য অনুমতি দিন।",
          variant: "destructive"
        });
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: 'your-vapid-public-key' // You'll need to configure this
      });

      // Save subscription to database
      if (user) {
        await supabase
          .from('notification_subscriptions')
          .upsert({
            user_id: user.id,
            endpoint: subscription.endpoint,
            keys: subscription.toJSON() as any,
            is_active: true
          });
      }

      setIsSubscribed(true);
      
      toast({
        title: "সফল!",
        description: "পুশ নোটিফিকেশন চালু করা হয়েছে।"
      });
    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
      toast({
        title: "ত্রুটি",
        description: "পুশ নোটিফিকেশন চালু করতে সমস্যা হয়েছে।",
        variant: "destructive"
      });
    }
  };

  const sendNotification = (title: string, body: string, data?: any) => {
    if (!isSupported || !isSubscribed) return;

    if (Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        data
      });
    }
  };

  return {
    isSupported,
    isSubscribed,
    subscribeToPush,
    sendNotification
  };
};