import { Request, Response } from 'express';
import crypto from 'crypto';
import User from '../models/User';

// Register a new user
export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password (in a real app, use bcrypt)
    // For simplicity, we're using a basic hash here
    const hashedPassword = crypto
      .createHash('sha256')
      .update(password)
      .digest('hex');

    // Create new user
    const user = new User({
      email,
      password: hashedPassword,
      name,
      role: 'admin', // First user is admin
    });

    // Generate API key
    user.apiKey = crypto.randomBytes(32).toString('hex');

    // Save user to database
    await user.save();

    return res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Error registering user:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Login user
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const hashedPassword = crypto
      .createHash('sha256')
      .update(password)
      .digest('hex');

    if (user.password !== hashedPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // In a real app, generate JWT token here
    // For simplicity, we're just returning user info
    return res.status(200).json({
      message: 'Login successful',
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        apiKey: user.apiKey,
      },
    });
  } catch (error) {
    console.error('Error logging in:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Generate new API key
export const generateApiKey = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Find user by ID
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate new API key
    const apiKey = crypto.randomBytes(32).toString('hex');
    user.apiKey = apiKey;

    // Save user to database
    await user.save();

    return res.status(200).json({
      message: 'API key generated successfully',
      apiKey,
    });
  } catch (error) {
    console.error('Error generating API key:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Get current user
export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    // In a real app, get user from JWT token
    // For simplicity, we're using API key
    const apiKey = req.headers['x-api-key'];
    if (!apiKey) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Find user by API key
    const user = await User.findOne({ apiKey });
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    return res.status(200).json({
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Error getting current user:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};
