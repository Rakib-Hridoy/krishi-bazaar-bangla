
import { useState, useEffect } from 'react';
import { Product } from '@/types';
import { toast } from '@/components/ui/use-toast';
import { getProducts, addProduct, deleteProduct, getProductById, getProductsByUserId, getRelatedProducts } from '@/backend/services/productService';

export function useProducts(categoryFilter: string = 'all', searchQuery: string = '') {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        const productsData = await getProducts(categoryFilter, searchQuery);
        setProducts(productsData);
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

  const addNewProduct = async (productData: Omit<Product, 'id' | 'sellerId' | 'sellerName' | 'createdAt'> & { sellerId: string }) => {
    try {
      const newProduct = await addProduct(productData);
      toast({
        title: "পণ্য যোগ করা হয়েছে",
        description: "আপনার পণ্য সফলভাবে যোগ করা হয়েছে।"
      });
      return newProduct;
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

  return { products, isLoading, error, addProduct: addNewProduct };
}

export { deleteProduct, getProductById, getProductsByUserId, getRelatedProducts };
