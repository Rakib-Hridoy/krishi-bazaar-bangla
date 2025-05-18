
import { ProductModel } from '../models/Product';
import { Product } from '@/types';
import { ObjectId } from 'mongodb';
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
    try {
      // Check if userId is valid ObjectId
      if (!ObjectId.isValid(userId)) {
        return [];
      }

      const sellerId = new ObjectId(userId);
      
      // Find products by seller ID
      const productsData = await collections.products
        .find({ sellerId })
        .sort({ createdAt: -1 })
        .toArray();
      
      // Get seller name
      const seller = await collections.profiles.findOne({ _id: sellerId });
      const sellerName = seller?.name || 'অজানা বিক্রেতা';

      return productsData.map(item => {
        return {
          id: item._id.toString(),
          title: item.title,
          description: item.description || '',
          price: Number(item.price),
          quantity: Number(item.quantity),
          unit: item.unit,
          location: item.location,
          images: item.images || [],
          sellerId: userId,
          sellerName,
          createdAt: item.createdAt,
          category: item.category
        };
      });
    } catch (error) {
      console.error('Error fetching products by user ID:', error);
      return [];
    }
  }
  
  // Add new product
  static async addProduct(productData: Omit<Product, 'id' | 'sellerId' | 'sellerName' | 'createdAt'> & { sellerId: string }) {
    try {
      const newProduct = {
        title: productData.title,
        description: productData.description,
        price: productData.price,
        quantity: productData.quantity,
        unit: productData.unit,
        location: productData.location,
        images: productData.images,
        category: productData.category,
        sellerId: new ObjectId(productData.sellerId),
        createdAt: new Date().toISOString()
      };

      const result = await collections.products.insertOne(newProduct);
      
      const seller = await collections.profiles.findOne({ _id: new ObjectId(productData.sellerId) });
      
      return {
        id: result.insertedId.toString(),
        ...newProduct,
        sellerId: productData.sellerId,
        sellerName: seller?.name || 'অজানা বিক্রেতা',
        createdAt: newProduct.createdAt
      };
    } catch (error) {
      console.error('Error adding product:', error);
      throw error;
    }
  }
  
  // Delete product
  static async deleteProduct(productId: string): Promise<void> {
    try {
      if (!ObjectId.isValid(productId)) {
        throw new Error('Invalid product ID');
      }
      
      const result = await collections.products.deleteOne({ _id: new ObjectId(productId) });
      
      if (result.deletedCount === 0) {
        throw new Error('Product not found');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  }
  
  // Get related products
  static async getRelatedProducts(productId: string, category: string, limit: number = 4): Promise<Product[]> {
    try {
      const query = { 
        category,
        _id: { $ne: new ObjectId(productId) }
      };
      
      const productsData = await collections.products
        .find(query)
        .sort({ createdAt: -1 })
        .limit(limit)
        .toArray();
      
      // Get seller ids
      const sellerIds = productsData.map(product => product.sellerId);
      
      // Get seller names
      const sellers = await collections.profiles
        .find({ _id: { $in: sellerIds } })
        .project({ _id: 1, name: 1 })
        .toArray();
      
      // Create a map of seller IDs to names for quick lookup
      const sellerMap = new Map();
      sellers.forEach(seller => {
        sellerMap.set(seller._id.toString(), seller.name);
      });
      
      return productsData.map(item => {
        const sellerId = item.sellerId.toString();
        return {
          id: item._id.toString(),
          title: item.title,
          description: item.description || '',
          price: Number(item.price),
          quantity: Number(item.quantity),
          unit: item.unit,
          location: item.location,
          images: item.images || [],
          sellerId: sellerId,
          sellerName: sellerMap.get(sellerId) || 'অজানা বিক্রেতা',
          createdAt: item.createdAt,
          category: item.category
        };
      });
    } catch (error) {
      console.error('Error fetching related products:', error);
      return [];
    }
  }
}
