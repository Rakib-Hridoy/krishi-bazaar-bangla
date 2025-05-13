
import { Product, Bid, Review, User } from '../types';

export const mockProducts: Product[] = [
  {
    id: '1',
    title: 'তাজা ধান',
    description: 'উচ্চ মানের মিনিকেট ধান। সদ্য কাটা।',
    price: 1200,
    quantity: 500,
    unit: 'কেজি',
    location: 'দিনাজপুর',
    images: [
      'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9',
      'https://images.unsplash.com/photo-1465379944081-7f47de8d74ac'
    ],
    sellerId: '1',
    sellerName: 'রহিম মিয়া',
    createdAt: '2023-01-15T08:30:00Z',
    category: 'শস্য'
  },
  {
    id: '2',
    title: 'গরুর দুধ',
    description: 'খাঁটি দেশি গরুর দুধ। কোন ভেজাল নেই।',
    price: 80,
    quantity: 100,
    unit: 'লিটার',
    location: 'ময়মনসিংহ',
    images: [
      'https://images.unsplash.com/photo-1452378174528-3090a4bba7b2'
    ],
    sellerId: '2',
    sellerName: 'করিম খান',
    createdAt: '2023-01-18T10:15:00Z',
    category: 'দুগ্ধজাত'
  },
  {
    id: '3',
    title: 'টমেটো',
    description: 'ভিটামিন সমৃদ্ধ টমেটো। রাসায়নিক মুক্ত।',
    price: 50,
    quantity: 200,
    unit: 'কেজি',
    location: 'রংপুর',
    images: [
      'https://images.unsplash.com/photo-1493962853295-0fd70327578a'
    ],
    sellerId: '3',
    sellerName: 'ফরিদ হোসেন',
    createdAt: '2023-01-20T09:45:00Z',
    category: 'সবজি'
  },
];

export const mockBids: Bid[] = [
  {
    id: '1',
    productId: '1',
    buyerId: '101',
    buyerName: 'সাইফুল ইসলাম',
    amount: 1150,
    status: 'pending',
    createdAt: '2023-01-16T12:30:00Z'
  },
  {
    id: '2',
    productId: '1',
    buyerId: '102',
    buyerName: 'আব্দুল্লাহ',
    amount: 1180,
    status: 'pending',
    createdAt: '2023-01-16T14:45:00Z'
  },
  {
    id: '3',
    productId: '2',
    buyerId: '103',
    buyerName: 'মারুফ হাসান',
    amount: 78,
    status: 'accepted',
    createdAt: '2023-01-19T08:20:00Z'
  }
];

export const mockReviews: Review[] = [
  {
    id: '1',
    fromUserId: '101',
    fromUserName: 'সাইফুল ইসলাম',
    toUserId: '1',
    rating: 4.5,
    comment: 'খুব ভালো মানের ধান। ওজনেও কোন কমতি ছিল না।',
    createdAt: '2023-01-18T16:30:00Z'
  },
  {
    id: '2',
    fromUserId: '1',
    fromUserName: 'রহিম মিয়া',
    toUserId: '101',
    rating: 5,
    comment: 'সময়মত পেমেন্ট করেছেন। খুব ভালো ব্যবহার।',
    createdAt: '2023-01-18T17:00:00Z'
  }
];

export const mockUsers: User[] = [
  {
    id: '1',
    name: 'রহিম মিয়া',
    email: 'rahim@example.com',
    role: 'seller',
    phone: '01712345678',
    address: 'দিনাজপুর, রংপুর',
    rating: 4.8,
    reviewCount: 12
  },
  {
    id: '2',
    name: 'করিম খান',
    email: 'karim@example.com',
    role: 'seller',
    phone: '01812345678',
    address: 'ময়মনসিংহ',
    rating: 4.5,
    reviewCount: 8
  },
  {
    id: '101',
    name: 'সাইফুল ইসলাম',
    email: 'saiful@example.com',
    role: 'buyer',
    phone: '01912345678',
    address: 'ঢাকা',
    rating: 4.9,
    reviewCount: 5
  },
  {
    id: 'admin1',
    name: 'অ্যাডমিন',
    email: 'admin@example.com',
    role: 'admin'
  }
];
