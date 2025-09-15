
export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  quantity: number;
  unit: string;
  location: string;
  images: string[];
  videoUrl?: string;
  sellerId: string;
  sellerName: string;
  createdAt: string;
  category: string;
  biddingStartTime?: string;
  biddingDeadline?: string;
}

export interface Bid {
  id: string;
  productId: string;
  buyerId: string;
  buyerName: string;
  amount: number;
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn';
  createdAt: string;
  withdrawnAt?: string;
}

export interface Review {
  id: string;
  fromUserId: string;
  fromUserName: string;
  toUserId: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'buyer' | 'seller' | 'admin';
  phone?: string;
  address?: string;
  avatar?: string;
  rating?: number;
  reviewCount?: number;
}

export interface Penalty {
  id: string;
  userId: string;
  bidId: string;
  productId: string;
  penaltyType: 'deal_refusal' | 'fake_listing' | 'quality_issue';
  penaltyAmount: number;
  description: string;
  status: 'active' | 'paid' | 'waived';
  appliedBy: string;
  appliedAt: string;
  resolvedAt?: string;
}

export interface UserAnalytics {
  userId: string;
  totalProductsListed: number;
  totalProductsSold: number;
  totalRevenue: number;
  averageProductPrice: number;
  totalBidsPlaced: number;
  totalPurchases: number;
  totalSpent: number;
  averagePurchasePrice: number;
  successRate: number;
  rating: number;
  totalReviews: number;
}

export interface ProductAnalytics {
  productId: string;
  totalBids: number;
  highestBid: number;
  lowestBid: number;
  averageBid: number;
  finalPrice?: number;
  viewsCount: number;
  interestScore: number;
}