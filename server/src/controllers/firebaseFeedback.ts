import { Request, Response } from 'express';
import FeedbackModel from '../models/FirebaseFeedback';

// Submit new feedback
export const submitFeedback = async (req: Request, res: Response) => {
  try {
    const { rating, comment, email, metadata } = req.body;

    // Validate required fields
    if (!rating || !metadata) {
      return res.status(400).json({ message: 'Rating and metadata are required' });
    }

    // Create new feedback
    const feedback = await FeedbackModel.create({
      rating,
      comment,
      email,
      metadata,
    });

    return res.status(201).json({ 
      message: 'Feedback submitted successfully',
      id: feedback.id 
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
    
    // Support filtering
    const filters: any = {};
    
    if (req.query.minRating) {
      filters.minRating = parseInt(req.query.minRating as string);
    }
    
    if (req.query.maxRating) {
      filters.maxRating = parseInt(req.query.maxRating as string);
    }
    
    if (req.query.startDate && req.query.endDate) {
      filters.startDate = new Date(req.query.startDate as string);
      filters.endDate = new Date(req.query.endDate as string);
    }

    // Get feedback with pagination
    const result = await FeedbackModel.findAll({
      page,
      limit,
      ...filters
    });

    return res.status(200).json({
      feedback: result.feedback,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        pages: result.pages,
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
    const feedback = await FeedbackModel.findById(id);

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
    const feedback = await FeedbackModel.findById(id);

    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }

    await FeedbackModel.delete(id);

    return res.status(200).json({ message: 'Feedback deleted successfully' });
  } catch (error) {
    console.error('Error deleting feedback:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Get feedback statistics (admin only)
export const getFeedbackStats = async (req: Request, res: Response) => {
  try {
    const stats = await FeedbackModel.getStats();
    return res.status(200).json(stats);
  } catch (error) {
    console.error('Error getting feedback stats:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Export feedback as CSV (admin only)
export const exportFeedbackCsv = async (req: Request, res: Response) => {
  try {
    // Get all feedback
    const result = await FeedbackModel.findAll({ limit: 1000 }); // Limit to 1000 for CSV export
    const feedback = result.feedback;

    // Create CSV header
    let csv = 'ID,Rating,Comment,Email,URL,UserAgent,Timestamp,Referrer,SessionID,ClientID,CreatedAt\n';

    // Add feedback data to CSV
    feedback.forEach((item) => {
      const row = [
        item.id,
        item.rating,
        `"${item.comment?.replace(/"/g, '""') || ''}"`,
        item.email || '',
        item.metadata.url,
        `"${item.metadata.userAgent.replace(/"/g, '""')}"`,
        item.metadata.timestamp,
        item.metadata.referrer || '',
        item.metadata.sessionId,
        item.metadata.clientId,
        item.createdAt instanceof Date ? item.createdAt.toISOString() : item.createdAt,
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
