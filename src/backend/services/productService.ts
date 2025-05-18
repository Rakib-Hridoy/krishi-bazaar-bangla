
import { ProductController } from '../controllers/ProductController';
import { Product } from '@/types';
import { ObjectId } from 'mongodb';

// Get all products with optional filtering
export async function getProducts(categoryFilter: string = 'all', searchQuery: string = ''): Promise<Product[]> {
  return ProductController.getProducts(categoryFilter, searchQuery);
}

// Get product by ID
export async function getProductById(id: string): Promise<Product | null> {
  return ProductController.getProductById(id);
}

// Get products by seller ID
export async function getProductsByUserId(userId: string): Promise<Product[]> {
  return ProductController.getProductsByUserId(userId);
}

// Add new product
export async function addProduct(productData: Omit<Product, 'id' | 'sellerId' | 'sellerName' | 'createdAt'> & { sellerId: string }) {
  return ProductController.addProduct(productData);
}

// Delete product
export async function deleteProduct(productId: string): Promise<void> {
  return ProductController.deleteProduct(productId);
}

// Get related products
export async function getRelatedProducts(productId: string, category: string, limit: number = 4): Promise<Product[]> {
  return ProductController.getRelatedProducts(productId, category, limit);
}
