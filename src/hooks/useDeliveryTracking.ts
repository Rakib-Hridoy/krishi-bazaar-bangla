import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface DeliveryTrackingData {
  id: string;
  order_id: string;
  current_status: 'pending' | 'picked_up' | 'in_transit' | 'delivered' | 'cancelled';
  current_location?: string;
  estimated_delivery?: string;
  delivery_partner_id?: string;
  pickup_point_id?: string;
  created_at: string;
  updated_at: string;
  delivery_partner?: {
    name: string;
    vehicle_type: string;
    rating?: number;
  };
  pickup_point?: {
    name: string;
    address: string;
    phone: string;
  };
}

export const useDeliveryTracking = () => {
  const [trackingData, setTrackingData] = useState<DeliveryTrackingData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchTrackingData = async (orderId?: string) => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      let query = supabase
        .from('delivery_tracking')
        .select(`
          *,
          delivery_partner:delivery_partners_public(name, vehicle_type, rating),
          pickup_point:pickup_points(name, address, phone)
        `);

      if (orderId) {
        query = query.eq('order_id', orderId);
      }

      const { data, error } = await query.order('updated_at', { ascending: false });

      if (error) throw error;
      
      // Map database fields to interface structure
      const mappedData: DeliveryTrackingData[] = (data || []).map((item: any) => ({
        ...item,
        current_status: item.status // Map database 'status' to interface 'current_status'
      }));
      
      setTrackingData(mappedData);
    } catch (error) {
      console.error('Error fetching tracking data:', error);
      toast({
        title: "ত্রুটি",
        description: "ডেলিভারি ট্র্যাকিং ডেটা লোড করতে সমস্যা হয়েছে।",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateTrackingStatus = async (
    trackingId: string,
    status: DeliveryTrackingData['current_status'],
    location?: string
  ) => {
    try {
      const { error } = await supabase
        .from('delivery_tracking')
        .update({
          status: status, // Map interface 'current_status' to database 'status'
          current_location: location,
          updated_at: new Date().toISOString()
        })
        .eq('id', trackingId);

      if (error) throw error;

      toast({
        title: "সফল",
        description: "ডেলিভারি স্ট্যাটাস আপডেট করা হয়েছে।"
      });
    } catch (error) {
      console.error('Error updating tracking status:', error);
      toast({
        title: "ত্রুটি",
        description: "স্ট্যাটাস আপডেট করতে সমস্যা হয়েছে।",
        variant: "destructive"
      });
    }
  };

  // Set up realtime subscription
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('delivery_tracking')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'delivery_tracking'
        },
        (payload) => {
          fetchTrackingData(); // Refresh data on any change
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return {
    trackingData,
    isLoading,
    fetchTrackingData,
    updateTrackingStatus
  };
};