
// Mock Supabase client for applications that were migrated away from Supabase
// This provides a compatible interface to prevent import errors

import { collections } from '../mongodb/client';

interface MockAuthResponse {
  data: {
    user: any;
    session: any;
  };
  error: Error | null;
}

interface MockUser {
  id: string;
  email: string;
  user_metadata?: any;
}

interface MockSession {
  user: MockUser;
  access_token: string;
}

// Mock auth functions
const mockAuth = {
  signInWithPassword: async ({ email, password }: { email: string; password: string }): Promise<MockAuthResponse> => {
    // Mock authentication - in a real app this would validate credentials
    const user = await collections.profiles.findOne({ email });
    if (!user) {
      return {
        data: { user: null, session: null },
        error: new Error('Invalid credentials')
      };
    }
    
    const mockUser = {
      id: user._id,
      email: user.email,
      user_metadata: {
        name: user.name,
        role: user.role
      }
    };
    
    const mockSession = {
      user: mockUser,
      access_token: 'mock-token'
    };
    
    return {
      data: { user: mockUser, session: mockSession },
      error: null
    };
  },

  signUp: async ({ email, password, options }: { email: string; password: string; options?: any }): Promise<MockAuthResponse> => {
    // Mock registration
    const existingUser = await collections.profiles.findOne({ email });
    if (existingUser) {
      return {
        data: { user: null, session: null },
        error: new Error('User already exists')
      };
    }
    
    const userData = options?.data || {};
    const newUser = await collections.profiles.insertOne({
      email,
      name: userData.name || 'User',
      role: userData.role || 'buyer',
      phone: userData.phone || null
    });
    
    const mockUser = {
      id: newUser.insertedId,
      email,
      user_metadata: userData
    };
    
    const mockSession = {
      user: mockUser,
      access_token: 'mock-token'
    };
    
    return {
      data: { user: mockUser, session: mockSession },
      error: null
    };
  },

  signOut: async () => {
    return { error: null };
  },

  getSession: async () => {
    return { data: { session: null } };
  }
};

// Mock query builder
class MockQueryBuilder {
  private tableName: string;
  private selectFields: string = '*';
  private filters: any = {};
  private orderBy: any = null;
  private limitValue: number | null = null;

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  select(fields: string) {
    this.selectFields = fields;
    return this;
  }

  eq(column: string, value: any) {
    this.filters[column] = value;
    return this;
  }

  in(column: string, values: any[]) {
    this.filters[column] = { $in: values };
    return this;
  }

  order(column: string, options?: { ascending: boolean }) {
    this.orderBy = { [column]: options?.ascending ? 1 : -1 };
    return this;
  }

  limit(count: number) {
    this.limitValue = count;
    return this;
  }

  async then(resolve: Function, reject?: Function) {
    try {
      const collection = collections[this.tableName as keyof typeof collections];
      if (!collection) {
        throw new Error(`Collection ${this.tableName} not found`);
      }

      let query = collection.find(this.filters);
      
      if (this.orderBy) {
        query = query.sort(this.orderBy);
      }
      
      if (this.limitValue) {
        query = query.limit(this.limitValue);
      }
      
      const data = await query.toArray();
      resolve({ data, error: null });
    } catch (error) {
      if (reject) {
        reject({ data: null, error });
      } else {
        resolve({ data: null, error });
      }
    }
  }
}

// Mock from function
function from(tableName: string) {
  return new MockQueryBuilder(tableName);
}

// Mock Supabase client
export const supabase = {
  auth: mockAuth,
  from
};
