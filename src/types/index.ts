
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
  biddingDeadline?: string;
}

export interface Bid {
  id: string;
  productId: string;
  buyerId: string;
  buyerName: string;
  amount: number;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
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
