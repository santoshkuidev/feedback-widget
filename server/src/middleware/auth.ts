import { Request, Response, NextFunction } from 'express';
import User from '../models/User';

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get API key from headers
    const apiKey = req.headers['x-api-key'] as string;
    
    if (!apiKey) {
      return res.status(401).json({ message: 'Unauthorized - API key required' });
    }

    // Find user by API key
    const user = await User.findOne({ apiKey });
    
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized - Invalid API key' });
    }

    // Check if user is admin
    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden - Admin access required' });
    }

    // Add user to request object
    (req as any).user = {
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
    };

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};
