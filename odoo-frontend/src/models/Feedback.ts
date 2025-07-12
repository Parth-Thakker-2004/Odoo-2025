import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IFeedback extends Document {
  swapId: mongoose.Types.ObjectId;
  from: mongoose.Types.ObjectId;
  to: mongoose.Types.ObjectId;
  rating: number; // 1-5
  comment: string;
  createdAt: Date;
}

const feedbackSchema = new Schema<IFeedback>(
  {
    swapId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Swap',
    },
    from: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    to: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      trim: true,
      maxlength: 500,
    },
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt
  }
);

const Feedback =
  (mongoose.models.Feedback as Model<IFeedback>) ||
  mongoose.model<IFeedback>('Feedback', feedbackSchema);

export default Feedback;
