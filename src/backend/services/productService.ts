
import { supabase } from '../supabase/client';
import { Product } from '@/types';

// Get all products with optional filtering
export async function getProducts(categoryFilter: string = 'all', searchQuery: string = ''): Promise<Product[]> {
  try {
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
        video_url,
        category,
        created_at,
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
    if (error) throw error;

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

    return (data ?? []).map((item: any) => ({
      id: item.id,
      title: item.title,
      description: item.description || '',
      price: Number(item.price),
      quantity: Number(item.quantity),
      unit: item.unit,
      location: item.location,
      images: item.images || [],
      videoUrl: item.video_url || undefined,
      sellerId: item.seller_id,
      sellerName: sellerMap.get(item.seller_id) ?? 'অজানা বিক্রেতা',
      createdAt: item.created_at,
      category: item.category
    }));
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
}

// Get product by ID
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
        video_url,
        category,
        created_at,
        seller_id
      `)
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;

    const { data: seller } = await supabase
      .from('safe_public_profiles')
      .select('name')
      .eq('id', data.seller_id)
      .maybeSingle();

    const sellerName = seller?.name || 'অজানা বিক্রেতা';

    return {
      id: data.id,
      title: data.title,
      description: data.description || '',
      price: Number(data.price),
      quantity: Number(data.quantity),
      unit: data.unit,
      location: data.location,
      images: data.images || [],
      videoUrl: data.video_url || undefined,
      sellerId: data.seller_id,
      sellerName,
      createdAt: data.created_at,
      category: data.category
    };
  } catch (error) {
    console.error('Error fetching product by ID:', error);
    return null;
  }
}

// Get products by seller ID
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
        video_url,
        category,
        created_at,
        seller_id
      `)
      .eq('seller_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    let sellerName = 'অজানা বিক্রেতা';
    if (data && data.length) {
      const sellerId = data[0].seller_id;
      const { data: seller } = await supabase
        .from('safe_public_profiles')
        .select('name')
        .eq('id', sellerId)
        .maybeSingle();
      sellerName = seller?.name || 'অজানা বিক্রেতা';
    }

    return (data ?? []).map((item: any) => ({
      id: item.id,
      title: item.title,
      description: item.description || '',
      price: Number(item.price),
      quantity: Number(item.quantity),
      unit: item.unit,
      location: item.location,
      images: item.images || [],
      videoUrl: item.video_url || undefined,
      sellerId: item.seller_id,
      sellerName,
      createdAt: item.created_at,
      category: item.category
    }));
  } catch (error) {
    console.error('Error fetching products by user ID:', error);
    return [];
  }
}

// Add new product
export async function addProduct(productData: Omit<Product, 'id' | 'sellerId' | 'sellerName' | 'createdAt'> & { sellerId: string }) {
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
        video_url: productData.videoUrl,
        category: productData.category,
        seller_id: productData.sellerId
      })
      .select('*');

    if (error) {
      throw error;
    }

    return data[0];
  } catch (error) {
    console.error('Error adding product:', error);
    throw error;
  }
}

// Delete product
export async function deleteProduct(productId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', productId);

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
}

// Get related products
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
        video_url,
        category,
        created_at,
        seller_id
      `)
      .eq('category', category)
      .neq('id', productId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

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

    return (data ?? []).map((item: any) => ({
      id: item.id,
      title: item.title,
      description: item.description || '',
      price: Number(item.price),
      quantity: Number(item.quantity),
      unit: item.unit,
      location: item.location,
      images: item.images || [],
      videoUrl: item.video_url || undefined,
      sellerId: item.seller_id,
      sellerName: sellerMap.get(item.seller_id) ?? 'অজানা বিক্রেতা',
      createdAt: item.created_at,
      category: item.category
    }));
  } catch (error) {
    console.error('Error fetching related products:', error);
    return [];
  }
}
