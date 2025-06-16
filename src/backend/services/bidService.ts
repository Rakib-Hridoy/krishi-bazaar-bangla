
import { collections } from '../mongodb/client';
import { Bid } from '@/types';

// Get bids for a specific product
export async function getProductBids(productId: string): Promise<Bid[]> {
  try {
    // Fetch the bids for the specific product
    const bidsData = await collections.bids
      .find({ product_id: productId })
      .toArray();
    
    // Get buyer names from profiles collection
    const buyerIds = bidsData.map(bid => bid.buyer_id);
    const buyersData = await collections.profiles
      .find({ _id: { $in: buyerIds } })
      .toArray();
    
    // Create a map of buyer IDs to names
    const buyerMap = new Map();
    buyersData?.forEach(buyer => {
      buyerMap.set(buyer._id, buyer.name);
    });

    return bidsData.map(item => ({
      id: item._id,
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
    const result = await collections.bids.insertOne({
      product_id: bidData.productId,
      buyer_id: bidData.buyerId,
      amount: bidData.amount,
      status: 'pending',
      created_at: new Date().toISOString()
    });

    return { id: result.insertedId, ...bidData, status: 'pending', created_at: new Date().toISOString() };
  } catch (error) {
    console.error('Error adding bid:', error);
    throw error;
  }
}

// Update bid status
export async function updateBidStatus(bidId: string, status: 'accepted' | 'rejected') {
  try {
    const result = await collections.bids.findOneAndUpdate(
      { _id: bidId },
      { $set: { status } },
      { returnDocument: 'after' }
    );

    return result;
  } catch (error) {
    console.error('Error updating bid status:', error);
    throw error;
  }
}

// Get bids made by a specific user
export async function getUserBids(userId: string): Promise<Bid[]> {
  try {
    // Fetch bids made by the user
    const bidsData = await collections.bids
      .find({ buyer_id: userId })
      .toArray();
    
    // Get product details
    const productIds = bidsData.map(bid => bid.product_id);
    const productsData = await collections.products
      .find({ _id: { $in: productIds } })
      .toArray();
    
    // Create a map of product IDs to titles
    const productMap = new Map();
    productsData?.forEach(product => {
      productMap.set(product._id, product.title);
    });

    return bidsData.map(item => ({
      id: item._id,
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
    const productsData = await collections.products
      .find({ seller_id: sellerId })
      .toArray();
    
    if (!productsData || productsData.length === 0) {
      return [];
    }
    
    const productIds = productsData.map(product => product._id);
    
    // Create a map of product IDs to titles
    const productMap = new Map();
    productsData.forEach(product => {
      productMap.set(product._id, product.title);
    });
    
    // Get all bids for seller's products
    const bidsData = await collections.bids
      .find({ product_id: { $in: productIds } })
      .toArray();
    
    // Get buyer names
    const buyerIds = bidsData.map(bid => bid.buyer_id);
    const buyersData = await collections.profiles
      .find({ _id: { $in: buyerIds } })
      .toArray();
    
    // Create a map of buyer IDs to names
    const buyerMap = new Map();
    buyersData?.forEach(buyer => {
      buyerMap.set(buyer._id, buyer.name);
    });

    return bidsData.map(item => ({
      id: item._id,
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
