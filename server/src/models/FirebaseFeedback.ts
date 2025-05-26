import { db } from '../config/firebase';

export interface IFeedback {
  id?: string;
  rating: number;
  comment: string;
  email?: string;
  metadata: {
    url: string;
    userAgent: string;
    timestamp: number;
    referrer: string;
    sessionId: string;
    clientId: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

class FeedbackModel {
  private collection = db.collection('feedback');

  // Create new feedback
  async create(data: Omit<IFeedback, 'id' | 'createdAt' | 'updatedAt'>): Promise<IFeedback> {
    const now = new Date();
    const feedbackData = {
      ...data,
      createdAt: now,
      updatedAt: now
    };
    
    const docRef = await this.collection.add(feedbackData);
    const doc = await docRef.get();
    
    return {
      id: docRef.id,
      ...doc.data()
    } as IFeedback;
  }

  // Get feedback by ID
  async findById(id: string): Promise<IFeedback | null> {
    const doc = await this.collection.doc(id).get();
    
    if (!doc.exists) {
      return null;
    }
    
    return {
      id: doc.id,
      ...doc.data()
    } as IFeedback;
  }

  // Get all feedback with pagination and filters
  async findAll(options: {
    page?: number;
    limit?: number;
    minRating?: number;
    maxRating?: number;
    startDate?: Date;
    endDate?: Date;
  } = {}): Promise<{ feedback: IFeedback[]; total: number; page: number; limit: number; pages: number }> {
    const {
      page = 1,
      limit = 10,
      minRating,
      maxRating,
      startDate,
      endDate
    } = options;
    
    let query: FirebaseFirestore.Query = this.collection.orderBy('createdAt', 'desc');
    
    // Apply filters
    if (minRating !== undefined) {
      query = query.where('rating', '>=', minRating);
    }
    
    if (maxRating !== undefined) {
      query = query.where('rating', '<=', maxRating);
    }
    
    if (startDate && endDate) {
      query = query.where('createdAt', '>=', startDate)
                   .where('createdAt', '<=', endDate);
    }
    
    // Get total count (this is inefficient in Firestore but necessary for pagination)
    const countSnapshot = await query.get();
    const total = countSnapshot.size;
    
    // Apply pagination
    const skip = (page - 1) * limit;
    query = query.limit(limit).offset(skip);
    
    // Execute query
    const snapshot = await query.get();
    const feedback = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as IFeedback[];
    
    return {
      feedback,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit)
    };
  }

  // Delete feedback
  async delete(id: string): Promise<boolean> {
    await this.collection.doc(id).delete();
    return true;
  }

  // Get feedback statistics
  async getStats(): Promise<{
    averageRating: { average: number; count: number };
    ratingDistribution: { _id: number; count: number }[];
    feedbackOverTime: { _id: string; count: number; averageRating: number }[];
  }> {
    // Get all feedback (for a production app, you'd want to optimize this)
    const snapshot = await this.collection.get();
    const feedback = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as IFeedback[];
    
    // Calculate average rating
    const totalRating = feedback.reduce((sum, item) => sum + item.rating, 0);
    const count = feedback.length;
    const average = count > 0 ? totalRating / count : 0;
    
    // Calculate rating distribution
    const ratingCounts: Record<number, number> = {};
    feedback.forEach(item => {
      ratingCounts[item.rating] = (ratingCounts[item.rating] || 0) + 1;
    });
    
    const ratingDistribution = Object.entries(ratingCounts).map(([rating, count]) => ({
      _id: parseInt(rating),
      count
    }));
    
    // Calculate feedback over time (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const feedbackByDay: Record<string, { count: number; totalRating: number }> = {};
    
    feedback.forEach(item => {
      const createdAt = item.createdAt instanceof Date 
        ? item.createdAt 
        : new Date(item.createdAt);
      
      if (createdAt >= thirtyDaysAgo) {
        const dateStr = createdAt.toISOString().split('T')[0]; // YYYY-MM-DD
        
        if (!feedbackByDay[dateStr]) {
          feedbackByDay[dateStr] = { count: 0, totalRating: 0 };
        }
        
        feedbackByDay[dateStr].count += 1;
        feedbackByDay[dateStr].totalRating += item.rating;
      }
    });
    
    const feedbackOverTime = Object.entries(feedbackByDay).map(([date, data]) => ({
      _id: date,
      count: data.count,
      averageRating: data.count > 0 ? data.totalRating / data.count : 0
    }));
    
    return {
      averageRating: { average, count },
      ratingDistribution,
      feedbackOverTime
    };
  }
}

export default new FeedbackModel();
