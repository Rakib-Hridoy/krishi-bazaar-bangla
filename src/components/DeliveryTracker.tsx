import { useState, useEffect } from 'react';
import { Truck, MapPin, Clock, CheckCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface DeliveryTracking {
  id: string;
  order_id: string;
  product_id: string;
  status: string;
  current_location?: string;
  estimated_delivery?: string;
  actual_delivery?: string;
  tracking_number?: string;
  notes?: string;
  created_at: string;
}

interface DeliveryTrackingProps {
  orderId: string;
}

const DeliveryTracker = ({ orderId }: DeliveryTrackingProps) => {
  const [tracking, setTracking] = useState<DeliveryTracking | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchTracking();
  }, [orderId]);

  const fetchTracking = async () => {
    try {
      const { data, error } = await supabase
        .from('delivery_tracking')
        .select('*')
        .eq('order_id', orderId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setTracking(data);
    } catch (error) {
      console.error('Error fetching tracking:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'অপেক্ষমান';
      case 'confirmed': return 'নিশ্চিত';
      case 'picked_up': return 'সংগ্রহ করা হয়েছে';
      case 'in_transit': return 'পথে রয়েছে';
      case 'delivered': return 'পৌঁছে গেছে';
      case 'cancelled': return 'বাতিল';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'secondary';
      case 'confirmed': return 'default';
      case 'picked_up': return 'default';
      case 'in_transit': return 'default';
      case 'delivered': return 'default';
      case 'cancelled': return 'destructive';
      default: return 'secondary';
    }
  };

  const statusSteps = [
    { key: 'confirmed', label: 'অর্ডার নিশ্চিত', icon: CheckCircle },
    { key: 'picked_up', label: 'পণ্য সংগ্রহ', icon: Truck },
    { key: 'in_transit', label: 'পথে রয়েছে', icon: MapPin },
    { key: 'delivered', label: 'পৌঁছে গেছে', icon: CheckCircle }
  ];

  if (isLoading) {
    return <div className="animate-pulse h-32 bg-muted rounded-lg"></div>;
  }

  if (!tracking) {
    return (
      <Card className="p-4">
        <p className="text-muted-foreground text-center">এই অর্ডারের জন্য ডেলিভারি ট্র্যাকিং তথ্য পাওয়া যায়নি।</p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">ডেলিভারি ট্র্যাকিং</h3>
          <Badge variant={getStatusColor(tracking.status)}>
            {getStatusText(tracking.status)}
          </Badge>
        </div>

        {tracking.tracking_number && (
          <div className="text-sm text-muted-foreground">
            ট্র্যাকিং নম্বর: <span className="font-mono">{tracking.tracking_number}</span>
          </div>
        )}

        {/* Progress Steps */}
        <div className="space-y-3">
          {statusSteps.map((step, index) => {
            const isCompleted = statusSteps.findIndex(s => s.key === tracking.status) >= index;
            const isCurrent = step.key === tracking.status;
            const Icon = step.icon;

            return (
              <div key={step.key} className="flex items-center gap-3">
                <div className={`
                  flex items-center justify-center w-8 h-8 rounded-full border-2
                  ${isCompleted 
                    ? 'border-primary bg-primary text-primary-foreground' 
                    : 'border-muted-foreground bg-background'
                  }
                `}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <p className={`
                    text-sm font-medium
                    ${isCompleted ? 'text-foreground' : 'text-muted-foreground'}
                  `}>
                    {step.label}
                  </p>
                  {isCurrent && tracking.current_location && (
                    <p className="text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3 inline mr-1" />
                      {tracking.current_location}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {tracking.estimated_delivery && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>
              আনুমানিক পৌঁছানোর সময়: {' '}
              {new Date(tracking.estimated_delivery).toLocaleDateString('bn-BD')}
            </span>
          </div>
        )}

        {tracking.notes && (
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-sm font-medium mb-1">বিশেষ নোট:</p>
            <p className="text-sm text-muted-foreground">{tracking.notes}</p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default DeliveryTracker;