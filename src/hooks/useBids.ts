
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Bid } from '@/types';
import { toast } from '@/components/ui/use-toast';

export function useBids(productId?: string) {
  const [bids, setBids] = useState<Bid[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchBids = async () => {
      if (!productId) {
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        
        const { data, error } = await supabase
          .from('bids')
          .select(`
            id,
            product_id,
            buyer_id,
            profiles:buyer_id (name),
            amount,
            status,
            created_at
          `)
          .eq('product_id', productId)
          .order('created_at', { ascending: false });

        if (error) {
          throw error;
        }

        const formattedBids: Bid[] = data.map(item => ({
          id: item.id,
          productId: item.product_id,
          buyerId: item.buyer_id,
          buyerName: item.profiles?.name || 'অজানা ক্রেতা',
          amount: Number(item.amount),
          status: item.status,
          createdAt: item.created_at,
        }));

        setBids(formattedBids);
      } catch (err: any) {
        console.error('Error fetching bids:', err);
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBids();
  }, [productId]);

  const addBid = async (bidData: { productId: string, buyerId: string, amount: number }) => {
    try {
      const { data, error } = await supabase
        .from('bids')
        .insert({
          product_id: bidData.productId,
          buyer_id: bidData.buyerId,
          amount: bidData.amount,
          status: 'pending'
        })
        .select();

      if (error) {
        throw error;
      }

      toast({
        title: "বিড যোগ করা হয়েছে",
        description: "আপনার বিড সফলভাবে যোগ করা হয়েছে।"
      });

      // Refresh bids list
      const newBid = data[0];
      setBids(prev => [{
        id: newBid.id,
        productId: newBid.product_id,
        buyerId: newBid.buyer_id,
        buyerName: 'আপনি', // This will be replaced on next fetch
        amount: Number(newBid.amount),
        status: newBid.status,
        createdAt: newBid.created_at,
      }, ...prev]);

      return data[0];
    } catch (error: any) {
      console.error('Error adding bid:', error);
      toast({
        title: "বিড যোগ করতে সমস্যা",
        description: error.message || "বিড যোগ করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।",
        variant: "destructive"
      });
      throw error;
    }
  };

  const updateBidStatus = async (bidId: string, status: 'accepted' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('bids')
        .update({ status })
        .eq('id', bidId);

      if (error) {
        throw error;
      }

      toast({
        title: status === 'accepted' ? "বিড গৃহীত হয়েছে" : "বিড প্রত্যাখ্যান করা হয়েছে",
        description: status === 'accepted' ? "বিড সফলভাবে গৃহীত হয়েছে।" : "বিড প্রত্যাখ্যান করা হয়েছে।"
      });

      // Update local state
      setBids(prev => prev.map(bid => 
        bid.id === bidId ? { ...bid, status } : bid
      ));

      return true;
    } catch (error: any) {
      console.error('Error updating bid status:', error);
      toast({
        title: "বিড আপডেট করতে সমস্যা",
        description: error.message || "বিড আপডেট করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।",
        variant: "destructive"
      });
      return false;
    }
  };

  return { bids, isLoading, error, addBid, updateBidStatus };
}

export async function getUserBids(userId: string): Promise<Bid[]> {
  try {
    const { data, error } = await supabase
      .from('bids')
      .select(`
        id,
        product_id,
        products:product_id (title),
        buyer_id,
        amount,
        status,
        created_at
      `)
      .eq('buyer_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return data.map(item => ({
      id: item.id,
      productId: item.product_id,
      buyerId: item.buyer_id,
      buyerName: '', // Not needed for user's own bids
      amount: Number(item.amount),
      status: item.status,
      createdAt: item.created_at,
      productTitle: item.products?.title || 'অজানা পণ্য'
    }));
  } catch (error) {
    console.error('Error fetching user bids:', error);
    return [];
  }
}
