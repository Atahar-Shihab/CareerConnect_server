import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import dotenv from 'dotenv';

dotenv.config();

let mongod: MongoMemoryServer | null = null;

export const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/careerconnect';
    // Try connecting to provided URI with a 2-second timeout
    await mongoose.connect(mongoURI, { serverSelectionTimeoutMS: 2000 });
    console.log('MongoDB connected successfully via native URI');
  } catch (error) {
    console.warn('Local MongoDB connection failed. Launching in-memory MongoDB fallback...');
    try {
      mongod = await MongoMemoryServer.create();
      const uri = mongod.getUri();
      await mongoose.connect(uri);
      console.log('MongoDB connected successfully using in-memory server');
    } catch (memError) {
      console.error('In-memory MongoDB startup failed:', memError);
      process.exit(1);
    }
  }
};
