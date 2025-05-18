
import { MongoClient, ServerApiVersion } from 'mongodb';

// MongoDB connection string - should be in an environment variable in production
const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://username:password@cluster0.mongodb.net/?retryWrites=true&w=majority";

// Create a MongoClient with options
const client = new MongoClient(MONGODB_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

export async function connectToMongoDB() {
  try {
    await client.connect();
    console.log("Connected to MongoDB");
    return client;
  } catch (error) {
    console.error("Failed to connect to MongoDB", error);
    throw error;
  }
}

export function getMongoClient() {
  return client;
}

// Define database and collections
export const db = client.db("krishi_mart");
export const collections = {
  products: db.collection("products"),
  profiles: db.collection("profiles"),
  bids: db.collection("bids"),
  reviews: db.collection("reviews")
};

// Initialize connection when this file is imported
connectToMongoDB().catch(console.error);
