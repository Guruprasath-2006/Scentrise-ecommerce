import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User } from '../models/User';
import { env } from '../config/env';

const createTestUser = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if test user already exists
    const existingUser = await User.findOne({ email: 'test@scentrise.com' });
    if (existingUser) {
      console.log('Test user already exists!');
      console.log('Email: test@scentrise.com');
      console.log('Password: Test@123');
      process.exit(0);
    }

    // Create test user with addresses
    const hashedPassword = await bcrypt.hash('Test@123', 10);
    const testUser = await User.create({
      name: 'Test User',
      email: 'test@scentrise.com',
      password: hashedPassword,
      role: 'user',
      addresses: [
        {
          _id: new mongoose.Types.ObjectId().toString(),
          label: 'Home',
          line1: '123 Main Street',
          line2: 'Apartment 4B',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400001',
          phone: '+91 9876543210'
        },
        {
          _id: new mongoose.Types.ObjectId().toString(),
          label: 'Office',
          line1: '456 Business Tower',
          line2: 'Floor 12',
          city: 'Mumbai',
          state: 'Maharashtra', 
          pincode: '400070',
          phone: '+91 9876543210'
        }
      ]
    });

    console.log('✅ Test user created successfully!');
    console.log('Email: test@scentrise.com');
    console.log('Password: Test@123');
    console.log('Addresses:', testUser.addresses.length);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating test user:', error);
    process.exit(1);
  }
};

createTestUser();
