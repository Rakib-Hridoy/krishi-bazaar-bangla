
import { Product } from '@/types';
import { collections } from '../mongodb/client';

// Mock ObjectId class for browser environment
class MockObjectId {
  private id: string;
  
  constructor(id?: string) {
    this.id = id || Math.random().toString(36).substr(2, 9);
  }
  
  toString(): string {
    return this.id;
  }
  
  static isValid(id: string): boolean {
    return typeof id === 'string' && id.length > 0;
  }
}

export class ProductModel {
  // Get all products with optional filtering
  static async findAll(categoryFilter: string = 'all', searchQuery: string = ''): Promise<Product[]> {
    try {
      let query: any = {};
      
      if (categoryFilter && categoryFilter !== 'all') {
        query.category = categoryFilter;
      }
      
      if (searchQuery) {
        query.$or = [
          { title: { $regex: searchQuery, $options: 'i' } },
          { description: { $regex: searchQuery, $options: 'i' } },
          { location: { $regex: searchQuery, $options: 'i' } }
        ];
      }
      
      // Get products based on query
      const productsData = await collections.products.find(query).sort({ createdAt: -1 }).toArray();
      
      // Get seller ids to fetch seller info
      const sellerIds = productsData.map(product => product.sellerId);
      
      // Get seller profiles in a single query
      const sellers = await collections.profiles
        .find({ _id: { $in: sellerIds } })
        .project({ _id: 1, name: 1 })
        .toArray();
      
      // Create a map of seller IDs to names for quick lookup
      const sellerMap = new Map();
      sellers.forEach(seller => {
        sellerMap.set(seller._id.toString(), seller.name);
      });

      // Format products for response
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
      console.error('Error fetching products:', error);
      throw error;
    }
  }

  // Get product by ID
  static async findById(id: string): Promise<Product | null> {
    try {
      if (!MockObjectId.isValid(id)) {
        return null;
      }

      const productData = await collections.products.findOne({ _id: id });

      if (!productData) return null;
      
      // Get seller profile
      const seller = await collections.profiles.findOne({ _id: productData.sellerId });
      
      return {
        id: productData._id.toString(),
        title: productData.title,
        description: productData.description || '',
        price: Number(productData.price),
        quantity: Number(productData.quantity),
        unit: productData.unit,
        location: productData.location,
        images: productData.images || [],
        sellerId: productData.sellerId.toString(),
        sellerName: seller?.name || 'অজানা বিক্রেতা',
        createdAt: productData.createdAt,
        category: productData.category
      };
    } catch (error) {
      console.error('Error fetching product by ID:', error);
      return null;
    }
  }

  // Get products by seller ID
  static async findByUserId(userId: string): Promise<Product[]> {
    try {
      // Check if userId is valid
      if (!MockObjectId.isValid(userId)) {
        return [];
      }

      const sellerId = userId;
      
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
  static async add(productData: Omit<Product, 'id' | 'sellerId' | 'sellerName' | 'createdAt'> & { sellerId: string }) {
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
        sellerId: productData.sellerId,
        createdAt: new Date().toISOString()
      };

      const result = await collections.products.insertOne(newProduct);
      
      const seller = await collections.profiles.findOne({ _id: productData.sellerId });
      
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
  static async delete(productId: string): Promise<void> {
    try {
      if (!MockObjectId.isValid(productId)) {
        throw new Error('Invalid product ID');
      }
      
      const result = await collections.products.deleteOne({ _id: productId });
      
      if (result.deletedCount === 0) {
        throw new Error('Product not found');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  }
  
  // Get related products
  static async findRelated(productId: string, category: string, limit: number = 4): Promise<Product[]> {
    try {
      const query = { 
        category,
        _id: { $ne: productId }
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
