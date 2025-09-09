
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/types';
import { toast } from '@/components/ui/use-toast';

export function useProducts(categoryFilter: string = 'all', searchQuery: string = '') {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        
        let query = supabase
          .from('products')
          .select(`
            id,
            title,
            description,
            price,
            quantity,
            unit,
            location,
            images,
            category,
            created_at,
            bidding_deadline,
            seller_id
          `)
          .order('created_at', { ascending: false });

        if (categoryFilter && categoryFilter !== 'all') {
          query = query.eq('category', categoryFilter);
        }

        if (searchQuery) {
          query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,location.ilike.%${searchQuery}%`);
        }

        const { data, error } = await query;
        if (error) {
          throw error;
        }

        const sellerIds = Array.from(new Set((data ?? []).map((d: any) => d.seller_id).filter(Boolean)));
        let sellerMap = new Map<string, string>();
        if (sellerIds.length) {
          const { data: sellers } = await supabase
            .from('safe_public_profiles')
            .select('id, name')
            .in('id', sellerIds as string[]);
          if (sellers) {
            sellerMap = new Map(sellers.map((s: any) => [s.id, s.name || 'অজানা বিক্রেতা']));
          }
        }

        const formattedProducts: Product[] = (data ?? []).map((item: any) => ({
          id: item.id,
          title: item.title,
          description: item.description || '',
          price: Number(item.price),
          quantity: Number(item.quantity),
          unit: item.unit,
          location: item.location,
          images: item.images || [],
          sellerId: item.seller_id,
          sellerName: sellerMap.get(item.seller_id) ?? 'অজানা বিক্রেতা',
          createdAt: item.created_at,
          category: item.category,
          biddingDeadline: item.bidding_deadline
        }));

        setProducts(formattedProducts);
      } catch (err: any) {
        console.error('Error fetching products:', err);
        setError(err);
        toast({
          title: "পণ্য লোড করতে সমস্যা",
          description: err.message || "পণ্যের তথ্য লোড করতে সমস্যা হয়েছে।",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [categoryFilter, searchQuery]);

  const addProduct = async (productData: Omit<Product, 'id' | 'sellerId' | 'sellerName' | 'createdAt'> & { sellerId: string }) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .insert({
          title: productData.title,
          description: productData.description,
          price: productData.price,
          quantity: productData.quantity,
          unit: productData.unit,
          location: productData.location,
          images: productData.images,
          category: productData.category,
          bidding_deadline: productData.biddingDeadline,
          seller_id: productData.sellerId
        })
        .select('*');

      if (error) {
        throw error;
      }

      toast({
        title: "পণ্য যোগ করা হয়েছে",
        description: "আপনার পণ্য সফলভাবে যোগ করা হয়েছে।"
      });

      return data[0];
    } catch (error: any) {
      console.error('Error adding product:', error);
      toast({
        title: "পণ্য যোগ করতে সমস্যা",
        description: error.message || "পণ্য যোগ করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।",
        variant: "destructive"
      });
      throw error;
    }
  };

  return { products, isLoading, error, addProduct };
}

export async function deleteProduct(productId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', productId);

    if (error) {
      throw error;
    }

    return;
  } catch (error: any) {
    console.error('Error deleting product:', error);
    throw error;
  }
}

export async function getRelatedProducts(productId: string, category: string, limit: number = 4): Promise<Product[]> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select(`
        id,
        title,
        description,
        price,
        quantity,
        unit,
        location,
        images,
        category,
        created_at,
        bidding_deadline,
        seller_id
      `)
      .eq('category', category)
      .neq('id', productId) // Exclude current product
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw error;
    }

    // Fetch seller names from safe_public_profiles
    const sellerIds = Array.from(new Set(data.map((d: any) => d.seller_id).filter(Boolean)));
    let sellerMap = new Map<string, string>();
    if (sellerIds.length) {
      const { data: sellers } = await supabase
        .from('safe_public_profiles')
        .select('id, name')
        .in('id', sellerIds as string[]);
      if (sellers) {
        sellerMap = new Map(sellers.map((s: any) => [s.id, s.name || 'অজানা বিক্রেতা']));
      }
    }

    return data.map(item => ({
      id: item.id,
      title: item.title,
      description: item.description || '',
      price: Number(item.price),
      quantity: Number(item.quantity),
      unit: item.unit,
      location: item.location,
      images: item.images || [],
      sellerId: item.seller_id,
      sellerName: sellerMap.get(item.seller_id) ?? 'অজানা বিক্রেতা',
      createdAt: item.created_at,
      category: item.category,
      biddingDeadline: item.bidding_deadline
    }));
  } catch (error) {
    console.error('Error fetching related products:', error);
    return [];
  }
}

export async function getProductById(id: string): Promise<Product | null> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select(`
        id,
        title,
        description,
        price,
        quantity,
        unit,
        location,
        images,
        category,
        created_at,
        bidding_deadline,
        seller_id
      `)
      .eq('id', id)
      .single();

    if (error) {
      throw error;
    }

    if (!data) return null;

    // Fetch seller name from safe_public_profiles
    const { data: seller } = await supabase
      .from('safe_public_profiles')
      .select('name')
      .eq('id', data.seller_id)
      .single();

    return {
      id: data.id,
      title: data.title,
      description: data.description || '',
      price: Number(data.price),
      quantity: Number(data.quantity),
      unit: data.unit,
      location: data.location,
      images: data.images || [],
      sellerId: data.seller_id,
      sellerName: seller?.name || 'অজানা বিক্রেতা',
      createdAt: data.created_at,
      category: data.category,
      biddingDeadline: data.bidding_deadline
    };
  } catch (error) {
    console.error('Error fetching product by ID:', error);
    return null;
  }
}

export async function getProductsByUserId(userId: string): Promise<Product[]> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select(`
        id,
        title,
        description,
        price,
        quantity,
        unit,
        location,
        images,
        category,
        created_at,
        bidding_deadline,
        seller_id
      `)
      .eq('seller_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    // Fetch seller name from safe_public_profiles
    let sellerName = 'অজানা বিক্রেতা';
    if (data && data.length > 0) {
      const { data: seller } = await supabase
        .from('safe_public_profiles')
        .select('name')
        .eq('id', userId)
        .single();
      sellerName = seller?.name || 'অজানা বিক্রেতা';
    }

    return data.map(item => ({
      id: item.id,
      title: item.title,
      description: item.description || '',
      price: Number(item.price),
      quantity: Number(item.quantity),
      unit: item.unit,
      location: item.location,
      images: item.images || [],
      sellerId: item.seller_id,
      sellerName,
      createdAt: item.created_at,
      category: item.category,
      biddingDeadline: item.bidding_deadline
    }));
  } catch (error) {
    console.error('Error fetching products by user ID:', error);
    return [];
  }
}
