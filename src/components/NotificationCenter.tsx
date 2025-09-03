import { useState, useEffect } from 'react';
import { Bell, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { useNotifications } from '@/hooks/useNotifications';
import { useNavigate } from 'react-router-dom';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationCenter = ({ isOpen, onClose }: NotificationCenterProps) => {
  const { subscribeToPush, isSupported } = usePushNotifications();
  const { notifications, unreadCount, markAsRead, markAllAsRead, isLoading } = useNotifications();
  const navigate = useNavigate();

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

  const handleNotificationClick = (notification: any) => {
    markAsRead(notification.id);
    
    // Navigate to product if notification has product_id in metadata
    if (notification.metadata?.product_id) {
      navigate(`/product/${notification.metadata.product_id}`);
      onClose(); // Close the notification center
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
          {unreadCount > 0 && (
            <Badge variant="destructive" className="text-xs">
              {unreadCount}
            </Badge>
          )}
        </div>
        {unreadCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={markAllAsRead}
            className="text-xs"
          >
            <Check className="h-3 w-3 mr-1" />
            সব পড়া
          </Button>
        )}
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Notifications */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-4 text-center text-muted-foreground">
            লোড হচ্ছে...
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            কোন নোটিফিকেশন নেই
          </div>
        ) : (
          <div className="space-y-2 p-2">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-3 rounded-lg cursor-pointer transition-colors hover:bg-muted ${
                  !notification.is_read ? 'bg-primary/5 border-l-4 border-l-primary' : ''
                }`}
                onClick={() => handleNotificationClick(notification)}
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
                      {new Date(notification.created_at).toLocaleDateString('bn-BD', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  {!notification.is_read && (
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