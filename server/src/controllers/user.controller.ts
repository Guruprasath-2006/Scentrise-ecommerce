import { Response } from 'express';
import { z } from 'zod';
import { User } from '../models/User';
import { AuthRequest } from '../middleware/auth';

// Validation schemas
const addressSchema = z.object({
  label: z.string().min(1, 'Address label is required').max(50, 'Label must be less than 50 characters'),
  line1: z.string().min(1, 'Address line 1 is required').max(100, 'Address line 1 must be less than 100 characters'),
  line2: z.string().max(100, 'Address line 2 must be less than 100 characters').optional(),
  city: z.string().min(1, 'City is required').max(50, 'City must be less than 50 characters'),
  state: z.string().min(1, 'State is required').max(50, 'State must be less than 50 characters'),
  pincode: z.string().min(6, 'Pincode must be 6 digits').max(6, 'Pincode must be 6 digits'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits').max(15, 'Phone number must be less than 15 digits'),
});

const updateProfileSchema = z.object({
  name: z.string().min(1, 'Name is required').max(50, 'Name must be less than 50 characters').optional(),
  email: z.string().email('Invalid email format').optional(),
});

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
export const getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    res.json({
      success: true,
      data: { user },
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const updateData = updateProfileSchema.parse(req.body);

    // Check if email is being updated and if it already exists
    if (updateData.email) {
      const existingUser = await User.findOne({ 
        email: updateData.email, 
        _id: { $ne: req.user._id } 
      });
      
      if (existingUser) {
        res.status(400).json({
          success: false,
          message: 'Email already exists',
        });
        return;
      }
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    res.json({
      success: true,
      data: { user },
      message: 'Profile updated successfully',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors,
      });
      return;
    }

    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// @desc    Add new address
// @route   POST /api/users/addresses
// @access  Private
export const addAddress = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const addressData = addressSchema.parse(req.body);

    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    // Check if user already has 5 addresses (reasonable limit)
    if (user.addresses.length >= 5) {
      res.status(400).json({
        success: false,
        message: 'Maximum 5 addresses allowed per user',
      });
      return;
    }

    user.addresses.push(addressData as any);
    await user.save();

    const updatedUser = await User.findById(req.user._id).select('-password');

    res.status(201).json({
      success: true,
      data: { user: updatedUser },
      message: 'Address added successfully',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors,
      });
      return;
    }

    console.error('Add address error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// @desc    Update address
// @route   PUT /api/users/addresses/:addressId
// @access  Private
export const updateAddress = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { addressId } = req.params;
    const addressData = addressSchema.parse(req.body);

    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    const addressIndex = user.addresses.findIndex(
      (addr: any) => addr._id.toString() === addressId
    );

    if (addressIndex === -1) {
      res.status(404).json({
        success: false,
        message: 'Address not found',
      });
      return;
    }

    // Update the address
    user.addresses[addressIndex] = { ...user.addresses[addressIndex], ...addressData } as any;
    await user.save();

    const updatedUser = await User.findById(req.user._id).select('-password');

    res.json({
      success: true,
      data: { user: updatedUser },
      message: 'Address updated successfully',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors,
      });
      return;
    }

    console.error('Update address error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// @desc    Delete address
// @route   DELETE /api/users/addresses/:addressId
// @access  Private
export const deleteAddress = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { addressId } = req.params;

    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    const addressIndex = user.addresses.findIndex(
      (addr: any) => addr._id.toString() === addressId
    );

    if (addressIndex === -1) {
      res.status(404).json({
        success: false,
        message: 'Address not found',
      });
      return;
    }

    // Remove the address
    user.addresses.splice(addressIndex, 1);
    await user.save();

    const updatedUser = await User.findById(req.user._id).select('-password');

    res.json({
      success: true,
      data: { user: updatedUser },
      message: 'Address deleted successfully',
    });
  } catch (error) {
    console.error('Delete address error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// @desc    Get all addresses
// @route   GET /api/users/addresses
// @access  Private
export const getAddresses = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user._id).select('addresses');
    
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    res.json({
      success: true,
      data: { addresses: user.addresses },
    });
  } catch (error) {
    console.error('Get addresses error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};
