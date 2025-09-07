
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Bid } from '@/types';
import { toast } from '@/components/ui/use-toast';

export function useProductBids(productId?: string) {
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
        
        // Fetch the bids for the specific product
        const { data: bidsData, error: bidsError } = await supabase
          .from('bids')
          .select(`
            id,
            product_id,
            buyer_id,
            amount,
            status,
            created_at
          `)
          .eq('product_id', productId)
          .order('created_at', { ascending: false });

        if (bidsError) {
          throw bidsError;
        }
        
        // Get buyer names from profiles table
        const buyerIds = bidsData.map(bid => bid.buyer_id);
        const { data: buyersData, error: buyersError } = await supabase
          .from('profiles')
          .select('id, name')
          .in('id', buyerIds);
          
        if (buyersError) {
          throw buyersError;
        }
        
        // Create a map of buyer IDs to names
        const buyerMap = new Map();
        buyersData?.forEach(buyer => {
          buyerMap.set(buyer.id, buyer.name);
        });

        const formattedBids: Bid[] = bidsData.map(item => ({
          id: item.id,
          productId: item.product_id,
          buyerId: item.buyer_id,
          buyerName: buyerMap.get(item.buyer_id) || 'অজানা ব্যবহারকারী',
          amount: Number(item.amount),
          status: item.status as 'pending' | 'accepted' | 'rejected',
          createdAt: item.created_at
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
        title: "দর প্রস্তাব যোগ করা হয়েছে",
        description: "আপনার দর প্রস্তাব সফলভাবে যোগ করা হয়েছে।"
      });

      // Add new bid to local state if it's for the current product
      if (bidData.productId === productId && data[0]) {
        const newBid = data[0];
        setBids(prev => [{
          id: newBid.id,
          productId: newBid.product_id,
          buyerId: newBid.buyer_id,
          buyerName: 'আপনি', // This will be replaced on next fetch
          amount: Number(newBid.amount),
          status: newBid.status as 'pending' | 'accepted' | 'rejected',
          createdAt: newBid.created_at
        }, ...prev]);
      }

      return data?.[0];
    } catch (error: any) {
      console.error('Error adding bid:', error);
      toast({
        title: "দর প্রস্তাব যোগ করতে সমস্যা",
        description: error.message || "দর প্রস্তাব যোগ করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।",
        variant: "destructive"
      });
      throw error;
    }
  };

  const updateBidStatus = async (bidId: string, status: 'accepted' | 'rejected') => {
    try {
      const { data, error } = await supabase
        .from('bids')
        .update({ status })
        .eq('id', bidId)
        .select();

      if (error) {
        throw error;
      }

      toast({
        title: status === 'accepted' ? "দর প্রস্তাব গৃহীত হয়েছে" : "দর প্রস্তাব প্রত্যাখ্যান করা হয়েছে",
        description: status === 'accepted' ? "দর প্রস্তাব সফলভাবে গৃহীত হয়েছে।" : "দর প্রস্তাব সফলভাবে প্রত্যাখ্যান করা হয়েছে।" 
      });

      // Update bid status in local state
      setBids(prev => prev.map(bid => 
        bid.id === bidId ? { ...bid, status } : bid
      ));

      return data?.[0];
    } catch (error: any) {
      console.error('Error updating bid status:', error);
      toast({
        title: "দর প্রস্তাব আপডেট করতে সমস্যা",
        description: error.message || "দর প্রস্তাব আপডেট করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।",
        variant: "destructive"
      });
      throw error;
    }
  };

  return { bids, isLoading, error, addBid, updateBidStatus };
}

export async function getUserBids(userId: string): Promise<Bid[]> {
  try {
    // Fetch bids made by the user
    const { data: bidsData, error: bidsError } = await supabase
      .from('bids')
      .select(`
        id,
        product_id,
        buyer_id,
        amount,
        status,
        created_at
      `)
      .eq('buyer_id', userId)
      .order('created_at', { ascending: false });

    if (bidsError) {
      throw bidsError;
    }
    
    // Get product details
    const productIds = bidsData.map(bid => bid.product_id);
    const { data: productsData, error: productsError } = await supabase
      .from('products')
      .select('id, title')
      .in('id', productIds);
      
    if (productsError) {
      throw productsError;
    }
    
    // Create a map of product IDs to titles
    const productMap = new Map();
    productsData?.forEach(product => {
      productMap.set(product.id, product.title);
    });

    const formattedBids: (Bid & {productTitle: string})[] = bidsData.map(item => ({
      id: item.id,
      productId: item.product_id,
      buyerId: item.buyer_id,
      buyerName: 'আপনি',
      amount: Number(item.amount),
      status: item.status as 'pending' | 'accepted' | 'rejected',
      createdAt: item.created_at,
      productTitle: productMap.get(item.product_id) || 'অজানা পণ্য'
    }));

    return formattedBids as Bid[];
  } catch (error) {
    console.error('Error fetching user bids:', error);
    return [];
  }
}

export async function getSellerReceivedBids(sellerId: string): Promise<Bid[]> {
  try {
    // First get the seller's products
    const { data: productsData, error: productsError } = await supabase
      .from('products')
      .select('id, title')
      .eq('seller_id', sellerId);
      
    if (productsError) {
      throw productsError;
    }
    
    if (!productsData || productsData.length === 0) {
      return [];
    }
    
    const productIds = productsData.map(product => product.id);
    
    // Create a map of product IDs to titles
    const productMap = new Map();
    productsData.forEach(product => {
      productMap.set(product.id, product.title);
    });
    
    // Get all bids for seller's products
    const { data: bidsData, error: bidsError } = await supabase
      .from('bids')
      .select(`
        id,
        product_id,
        buyer_id,
        amount,
        status,
        created_at
      `)
      .in('product_id', productIds)
      .order('created_at', { ascending: false });
      
    if (bidsError) {
      throw bidsError;
    }
    
    // Get buyer names
    const buyerIds = bidsData.map(bid => bid.buyer_id);
    const { data: buyersData, error: buyersError } = await supabase
      .from('profiles')
      .select('id, name')
      .in('id', buyerIds);
      
    if (buyersError) {
      throw buyersError;
    }
    
    // Create a map of buyer IDs to names
    const buyerMap = new Map();
    buyersData?.forEach(buyer => {
      buyerMap.set(buyer.id, buyer.name);
    });

    const formattedBids = bidsData.map(item => ({
      id: item.id,
      productId: item.product_id,
      productTitle: productMap.get(item.product_id) || 'অজানা পণ্য',
      buyerId: item.buyer_id,
      buyerName: buyerMap.get(item.buyer_id) || 'অজানা ব্যবহারকারী',
      amount: Number(item.amount),
      status: item.status as 'pending' | 'accepted' | 'rejected',
      createdAt: item.created_at
    }));

    return formattedBids as Bid[];
  } catch (error) {
    console.error('Error fetching seller bids:', error);
    return [];
  }
}
