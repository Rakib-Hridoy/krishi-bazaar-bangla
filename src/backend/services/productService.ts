
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
        category,
        created_at,
        seller_id,
        profiles:seller_id (name)
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
      sellerName: item.profiles?.name || 'অজানা বিক্রেতা',
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
        category,
        created_at,
        seller_id,
        profiles:seller_id (name, email, phone, address, avatar_url)
      `)
      .eq('id', id)
      .single();

    if (error) {
      throw error;
    }

    if (!data) return null;

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
      sellerName: data.profiles?.name || 'অজানা বিক্রেতা',
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
        category,
        created_at,
        seller_id,
        profiles:seller_id (name)
      `)
      .eq('seller_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
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
      sellerName: item.profiles?.name || 'অজানা বিক্রেতা',
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
        category,
        created_at,
        seller_id,
        profiles:seller_id (name)
      `)
      .eq('category', category)
      .neq('id', productId) // Exclude current product
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw error;
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
      sellerName: item.profiles?.name || 'অজানা বিক্রেতা',
      createdAt: item.created_at,
      category: item.category
    }));
  } catch (error) {
    console.error('Error fetching related products:', error);
    return [];
  }
}
