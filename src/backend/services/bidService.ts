
import { supabase } from '../supabase/client';
import { Bid } from '@/types';

// Get bids for a specific product
export async function getProductBids(productId: string): Promise<Bid[]> {
  try {
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

    return bidsData.map(item => ({
      id: item.id,
      productId: item.product_id,
      buyerId: item.buyer_id,
      buyerName: buyerMap.get(item.buyer_id) || 'অজানা ব্যবহারকারী',
      amount: Number(item.amount),
      status: item.status as 'pending' | 'accepted' | 'rejected',
      createdAt: item.created_at
    }));
  } catch (error) {
    console.error('Error fetching bids:', error);
    throw error;
  }
}

// Add a new bid
export async function addBid(bidData: { productId: string, buyerId: string, amount: number }) {
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

    return data?.[0];
  } catch (error) {
    console.error('Error adding bid:', error);
    throw error;
  }
}

// Update bid status
export async function updateBidStatus(bidId: string, status: 'accepted' | 'rejected') {
  try {
    const { data, error } = await supabase
      .from('bids')
      .update({ status })
      .eq('id', bidId)
      .select();

    if (error) {
      throw error;
    }

    return data?.[0];
  } catch (error) {
    console.error('Error updating bid status:', error);
    throw error;
  }
}

// Get bids made by a specific user
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

    return bidsData.map(item => ({
      id: item.id,
      productId: item.product_id,
      buyerId: item.buyer_id,
      buyerName: 'আপনি',
      amount: Number(item.amount),
      status: item.status as 'pending' | 'accepted' | 'rejected',
      createdAt: item.created_at,
      productTitle: productMap.get(item.product_id) || 'অজানা পণ্য'
    })) as Bid[];
  } catch (error) {
    console.error('Error fetching user bids:', error);
    return [];
  }
}

// Get bids received by a seller (bids on their products)
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

    return bidsData.map(item => ({
      id: item.id,
      productId: item.product_id,
      productTitle: productMap.get(item.product_id) || 'অজানা পণ্য',
      buyerId: item.buyer_id,
      buyerName: buyerMap.get(item.buyer_id) || 'অজানা ব্যবহারকারী',
      amount: Number(item.amount),
      status: item.status as 'pending' | 'accepted' | 'rejected',
      createdAt: item.created_at
    })) as Bid[];
  } catch (error) {
    console.error('Error fetching seller bids:', error);
    return [];
  }
}
