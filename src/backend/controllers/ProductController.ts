
import { ProductModel } from '../models/Product';
import { Product } from '@/types';
import { collections } from '../mongodb/client';

export class ProductController {
  // Get all products
  static async getProducts(categoryFilter: string = 'all', searchQuery: string = '') {
    return ProductModel.findAll(categoryFilter, searchQuery);
  }
  
  // Get product by ID
  static async getProductById(id: string) {
    return ProductModel.findById(id);
  }
  
  // Get products by seller ID
  static async getProductsByUserId(userId: string): Promise<Product[]> {
    return ProductModel.findByUserId(userId);
  }
  
  // Add new product
  static async addProduct(productData: Omit<Product, 'id' | 'sellerId' | 'sellerName' | 'createdAt'> & { sellerId: string }) {
    return ProductModel.add(productData);
  }
  
  // Delete product
  static async deleteProduct(productId: string): Promise<void> {
    return ProductModel.delete(productId);
  }
  
  // Get related products
  static async getRelatedProducts(productId: string, category: string, limit: number = 4): Promise<Product[]> {
    return ProductModel.findRelated(productId, category, limit);
  }
}
