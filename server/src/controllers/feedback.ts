import { Request, Response } from 'express';
import Feedback from '../models/Feedback';

// Submit new feedback
export const submitFeedback = async (req: Request, res: Response) => {
  try {
    const { rating, comment, email, metadata } = req.body;

    // Validate required fields
    if (!rating || !metadata) {
      return res.status(400).json({ message: 'Rating and metadata are required' });
    }

    // Create new feedback
    const feedback = new Feedback({
      rating,
      comment,
      email,
      metadata,
    });

    // Save to database
    await feedback.save();

    return res.status(201).json({ 
      message: 'Feedback submitted successfully',
      id: feedback._id 
    });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Get all feedback (admin only)
export const getAllFeedback = async (req: Request, res: Response) => {
  try {
    // Support pagination
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    // Support filtering
    const filter: any = {};
    
    if (req.query.minRating) {
      filter.rating = { $gte: parseInt(req.query.minRating as string) };
    }
    
    if (req.query.maxRating) {
      filter.rating = { ...filter.rating, $lte: parseInt(req.query.maxRating as string) };
    }
    
    if (req.query.startDate && req.query.endDate) {
      filter.createdAt = {
        $gte: new Date(req.query.startDate as string),
        $lte: new Date(req.query.endDate as string),
      };
    }

    // Get feedback with pagination
    const feedback = await Feedback.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const total = await Feedback.countDocuments(filter);

    return res.status(200).json({
      feedback,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error getting feedback:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Get feedback by ID (admin only)
export const getFeedbackById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const feedback = await Feedback.findById(id);

    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }

    return res.status(200).json(feedback);
  } catch (error) {
    console.error('Error getting feedback by ID:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Delete feedback (admin only)
export const deleteFeedback = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const feedback = await Feedback.findByIdAndDelete(id);

    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }

    return res.status(200).json({ message: 'Feedback deleted successfully' });
  } catch (error) {
    console.error('Error deleting feedback:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Get feedback statistics (admin only)
export const getFeedbackStats = async (req: Request, res: Response) => {
  try {
    // Get average rating
    const averageRating = await Feedback.aggregate([
      {
        $group: {
          _id: null,
          average: { $avg: '$rating' },
          count: { $sum: 1 },
        },
      },
    ]);

    // Get rating distribution
    const ratingDistribution = await Feedback.aggregate([
      {
        $group: {
          _id: '$rating',
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    // Get feedback over time (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const feedbackOverTime = await Feedback.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
          averageRating: { $avg: '$rating' },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    return res.status(200).json({
      averageRating: averageRating[0] || { average: 0, count: 0 },
      ratingDistribution,
      feedbackOverTime,
    });
  } catch (error) {
    console.error('Error getting feedback stats:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Export feedback as CSV (admin only)
export const exportFeedbackCsv = async (req: Request, res: Response) => {
  try {
    // Get all feedback
    const feedback = await Feedback.find().sort({ createdAt: -1 });

    // Create CSV header
    let csv = 'ID,Rating,Comment,Email,URL,UserAgent,Timestamp,Referrer,SessionID,ClientID,CreatedAt\n';

    // Add feedback data to CSV
    feedback.forEach((item) => {
      const row = [
        item._id,
        item.rating,
        `"${item.comment?.replace(/"/g, '""') || ''}"`,
        item.email || '',
        item.metadata.url,
        `"${item.metadata.userAgent.replace(/"/g, '""')}"`,
        item.metadata.timestamp,
        item.metadata.referrer || '',
        item.metadata.sessionId,
        item.metadata.clientId,
        item.createdAt,
      ].join(',');

      csv += row + '\n';
    });

    // Set response headers for CSV download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=feedback-export.csv');

    return res.status(200).send(csv);
  } catch (error) {
    console.error('Error exporting feedback as CSV:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};
