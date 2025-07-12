import mongoose, { Document, Schema, Model } from 'mongoose';

export interface ISwap extends Document {
  _id: mongoose.Types.ObjectId;
  requester: mongoose.Types.ObjectId;
  recipient: mongoose.Types.ObjectId;
  skillOffered: string;
  skillRequested: string;
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

export interface ISwapModel extends Model<ISwap> {}

const swapSchema = new Schema<ISwap>(
  {
    requester: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    recipient: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    skillOffered: {
      type: String,
      required: true,
      trim: true,
    },
    skillRequested: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'cancelled'],
      default: 'pending',
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

const Swap =
  (mongoose.models.Swap as ISwapModel) ||
  mongoose.model<ISwap, ISwapModel>('Swap', swapSchema);

export default Swap;