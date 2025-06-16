
// Mock MongoDB client for browser environment
// In a real application, this would be replaced with API calls to a backend server

export interface MockDocument {
  _id: string;
  [key: string]: any;
}

export interface MockCollection {
  find: (query?: any) => MockQuery;
  findOne: (query?: any) => Promise<MockDocument | null>;
  insertOne: (doc: any) => Promise<{ insertedId: string }>;
  findOneAndUpdate: (filter: any, update: any, options?: any) => Promise<MockDocument | null>;
  deleteOne: (filter: any) => Promise<{ deletedCount: number }>;
}

export interface MockQuery {
  sort: (sort: any) => MockQuery;
  limit: (limit: number) => MockQuery;
  project: (projection: any) => MockQuery;
  toArray: () => Promise<MockDocument[]>;
}

// Mock data storage
const mockData: { [collection: string]: MockDocument[] } = {
  products: [],
  profiles: [
    {
      _id: '123',
      name: 'Test User',
      email: 'user@example.com',
      role: 'buyer',
      phone: '+8801234567890'
    }
  ],
  bids: [],
  reviews: []
};

// Mock collection implementation
class MockMongoCollection implements MockCollection {
  constructor(private collectionName: string) {}

  find(query: any = {}): MockQuery {
    const data = mockData[this.collectionName] || [];
    let filteredData = data;

    // Simple query filtering
    if (Object.keys(query).length > 0) {
      filteredData = data.filter(doc => {
        return Object.entries(query).every(([key, value]) => {
          if (key === '_id' && typeof value === 'object' && value.$ne) {
            return doc._id !== value.$ne;
          }
          if (key === '_id' && typeof value === 'object' && value.$in) {
            return value.$in.some((id: any) => id.toString() === doc._id);
          }
          if (typeof value === 'object' && value.$regex) {
            return new RegExp(value.$regex, value.$options || '').test(doc[key]);
          }
          if (key === '$or') {
            return value.some((condition: any) => {
              return Object.entries(condition).some(([condKey, condValue]) => {
                if (typeof condValue === 'object' && condValue.$regex) {
                  return new RegExp(condValue.$regex, condValue.$options || '').test(doc[condKey]);
                }
                return doc[condKey] === condValue;
              });
            });
          }
          return doc[key] === value;
        });
      });
    }

    return {
      sort: (sortOptions: any) => ({
        sort: () => this.find(query),
        limit: (limitValue: number) => ({
          sort: () => this.find(query),
          limit: () => this.find(query),
          project: () => this.find(query),
          toArray: () => Promise.resolve(filteredData.slice(0, limitValue))
        }),
        project: (projection: any) => ({
          sort: () => this.find(query),
          limit: () => this.find(query),
          project: () => this.find(query),
          toArray: () => Promise.resolve(filteredData.map(doc => {
            const projected: any = {};
            Object.keys(projection).forEach(key => {
              if (projection[key] === 1) {
                projected[key] = doc[key];
              }
            });
            return projected;
          }))
        }),
        toArray: () => Promise.resolve(filteredData)
      }),
      limit: (limitValue: number) => ({
        sort: () => this.find(query),
        limit: () => this.find(query),
        project: () => this.find(query),
        toArray: () => Promise.resolve(filteredData.slice(0, limitValue))
      }),
      project: (projection: any) => ({
        sort: () => this.find(query),
        limit: () => this.find(query),
        project: () => this.find(query),
        toArray: () => Promise.resolve(filteredData.map(doc => {
          const projected: any = {};
          Object.keys(projection).forEach(key => {
            if (projection[key] === 1) {
              projected[key] = doc[key];
            }
          });
          return projected;
        }))
      }),
      toArray: () => Promise.resolve(filteredData)
    };
  }

  async findOne(query: any = {}): Promise<MockDocument | null> {
    const data = mockData[this.collectionName] || [];
    
    if (Object.keys(query).length === 0) {
      return data[0] || null;
    }

    const result = data.find(doc => {
      return Object.entries(query).every(([key, value]) => {
        if (key === '_id') {
          return doc._id === (typeof value === 'object' && value.toString ? value.toString() : value);
        }
        return doc[key] === value;
      });
    });

    return result || null;
  }

  async insertOne(document: any): Promise<{ insertedId: string }> {
    const id = Math.random().toString(36).substr(2, 9);
    const newDoc = { ...document, _id: id };
    
    if (!mockData[this.collectionName]) {
      mockData[this.collectionName] = [];
    }
    
    mockData[this.collectionName].push(newDoc);
    return { insertedId: id };
  }

  async findOneAndUpdate(filter: any, update: any, options: any = {}): Promise<MockDocument | null> {
    const data = mockData[this.collectionName] || [];
    const docIndex = data.findIndex(doc => {
      return Object.entries(filter).every(([key, value]) => {
        if (key === '_id') {
          return doc._id === (typeof value === 'object' && value.toString ? value.toString() : value);
        }
        return doc[key] === value;
      });
    });

    if (docIndex === -1) return null;

    const updatedDoc = { ...data[docIndex] };
    if (update.$set) {
      Object.assign(updatedDoc, update.$set);
    }

    data[docIndex] = updatedDoc;
    return options.returnDocument === 'after' ? updatedDoc : data[docIndex];
  }

  async deleteOne(filter: any): Promise<{ deletedCount: number }> {
    const data = mockData[this.collectionName] || [];
    const initialLength = data.length;
    
    const newData = data.filter(doc => {
      return !Object.entries(filter).every(([key, value]) => {
        if (key === '_id') {
          return doc._id === (typeof value === 'object' && value.toString ? value.toString() : value);
        }
        return doc[key] === value;
      });
    });

    mockData[this.collectionName] = newData;
    return { deletedCount: initialLength - newData.length };
  }
}

// Mock MongoDB connection functions
export async function connectToMongoDB() {
  console.log("Using mock MongoDB connection for browser environment");
  return Promise.resolve();
}

export function getMongoClient() {
  return {};
}

// Mock database and collections
export const db = {};
export const collections = {
  products: new MockMongoCollection('products'),
  profiles: new MockMongoCollection('profiles'),
  bids: new MockMongoCollection('bids'),
  reviews: new MockMongoCollection('reviews')
};

// Initialize mock connection
connectToMongoDB().catch(console.error);
