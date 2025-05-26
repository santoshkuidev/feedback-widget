import mongoose, { Document, Schema } from 'mongoose';

export interface IFeedback extends Document {
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

const FeedbackSchema: Schema = new Schema(
  {
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: false,
    },
    email: {
      type: String,
      required: false,
    },
    metadata: {
      url: {
        type: String,
        required: true,
      },
      userAgent: {
        type: String,
        required: true,
      },
      timestamp: {
        type: Number,
        required: true,
      },
      referrer: {
        type: String,
        required: false,
      },
      sessionId: {
        type: String,
        required: true,
      },
      clientId: {
        type: String,
        required: true,
      },
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IFeedback>('Feedback', FeedbackSchema);
