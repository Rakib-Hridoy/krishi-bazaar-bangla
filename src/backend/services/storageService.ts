
import { collections } from '../mongodb/client';
import * as fs from 'fs';
import * as path from 'path';
import { ObjectId } from 'mongodb';

// Local storage location for files
const STORAGE_DIR = path.join(process.cwd(), 'storage');

// Ensure storage directory exists
if (!fs.existsSync(STORAGE_DIR)) {
  try {
    fs.mkdirSync(STORAGE_DIR, { recursive: true });
  } catch (error) {
    console.error('Error creating storage directory:', error);
  }
}

// Upload file to storage
export async function uploadFile(bucket: string, filePath: string, file: File) {
  try {
    const bucketDir = path.join(STORAGE_DIR, bucket);
    
    // Ensure bucket directory exists
    if (!fs.existsSync(bucketDir)) {
      fs.mkdirSync(bucketDir, { recursive: true });
    }
    
    const fullPath = path.join(bucketDir, filePath);
    const buffer = await file.arrayBuffer();
    
    // Save file to disk
    fs.writeFileSync(fullPath, Buffer.from(buffer));
    
    return { path: filePath };
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
}

// Get public URL for a file
export function getPublicUrl(bucket: string, filePath: string) {
  return `/storage/${bucket}/${filePath}`;
}

// Delete file from storage
export async function deleteFile(bucket: string, filePath: string) {
  try {
    const fullPath = path.join(STORAGE_DIR, bucket, filePath);
    
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
}

// List files in a bucket
export async function listFiles(bucket: string, prefix: string = '') {
  try {
    const bucketDir = path.join(STORAGE_DIR, bucket);
    
    // Check if bucket directory exists
    if (!fs.existsSync(bucketDir)) {
      return [];
    }
    
    // Read directory contents
    const files = fs.readdirSync(bucketDir);
    
    // Filter by prefix if provided
    const filteredFiles = prefix ? 
      files.filter(file => file.startsWith(prefix)) : 
      files;
    
    return filteredFiles.map(name => ({
      name,
      id: name,
      metadata: {}
    }));
  } catch (error) {
    console.error('Error listing files:', error);
    throw error;
  }
}
