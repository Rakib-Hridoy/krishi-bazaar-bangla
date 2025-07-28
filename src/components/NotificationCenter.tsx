import { useState, useEffect } from 'react';
import { Bell, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { usePushNotifications } from '@/hooks/usePushNotifications';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'bid' | 'message' | 'order' | 'delivery';
  isRead: boolean;
  createdAt: Date;
}

const NotificationCenter = ({ isOpen, onClose }: NotificationCenterProps) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { subscribeToPush, isSupported } = usePushNotifications();

  useEffect(() => {
    // Mock notifications for demo
    setNotifications([
      {
        id: '1',
        title: 'নতুন বিড',
        message: 'আপনার আলু পণ্যের উপর একটি নতুন বিড এসেছে',
        type: 'bid',
        isRead: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 30) // 30 minutes ago
      },
      {
        id: '2',
        title: 'নতুন মেসেজ',
        message: 'রহিম সাহেব আপনাকে একটি মেসেজ পাঠিয়েছেন',
        type: 'message',
        isRead: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 60) // 1 hour ago
      },
      {
        id: '3',
        title: 'অর্ডার আপডেট',
        message: 'আপনার অর্ডার #1234 পথে রয়েছে',
        type: 'delivery',
        isRead: true,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2) // 2 hours ago
      }
    ]);
  }, []);

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, isRead: true } : notif
      )
    );
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'bid': return 'default';
      case 'message': return 'secondary';
      case 'order': return 'default';
      case 'delivery': return 'default';
      default: return 'secondary';
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'bid': return 'বিড';
      case 'message': return 'মেসেজ';
      case 'order': return 'অর্ডার';
      case 'delivery': return 'ডেলিভারি';
      default: return type;
    }
  };

  if (!isOpen) return null;

  return (
    <Card className="fixed top-16 right-4 w-80 max-h-96 flex flex-col shadow-lg z-50 bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          <h3 className="font-semibold">নোটিফিকেশন</h3>
          {notifications.filter(n => !n.isRead).length > 0 && (
            <Badge variant="destructive" className="text-xs">
              {notifications.filter(n => !n.isRead).length}
            </Badge>
          )}
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Notifications */}
      <div className="flex-1 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            কোন নোটিফিকেশন নেই
          </div>
        ) : (
          <div className="space-y-2 p-2">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-3 rounded-lg cursor-pointer transition-colors hover:bg-muted ${
                  !notification.isRead ? 'bg-primary/5 border-l-4 border-l-primary' : ''
                }`}
                onClick={() => markAsRead(notification.id)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-sm font-medium">{notification.title}</h4>
                      <Badge variant={getTypeColor(notification.type)} className="text-xs">
                        {getTypeText(notification.type)}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{notification.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {notification.createdAt.toLocaleDateString('bn-BD', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  {!notification.isRead && (
                    <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-1"></div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {isSupported && (
        <div className="p-3 border-t">
          <Button 
            onClick={subscribeToPush}
            variant="outline" 
            size="sm" 
            className="w-full"
          >
            পুশ নোটিফিকেশন চালু করুন
          </Button>
        </div>
      )}
    </Card>
  );
};

export default NotificationCenter;