import mongoose, { Document, Schema, Model } from 'mongoose';

export interface ISkill extends Document {
  _id: mongoose.Types.ObjectId;
  name: string; // must be unique
  description: string;
  createdBy: mongoose.Types.ObjectId; // ref: User
  isApproved: boolean;
  createdAt: Date;
}

export interface ISkillModel extends Model<ISkill> {}

const skillSchema = new Schema<ISkill>(
  {
    name: {
      type: String,
      required: [true, 'Skill name is required'],
      unique: true,
      trim: true,
      maxlength: [100, 'Skill name cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      immutable: true,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

skillSchema.index({ name: 1 }, { unique: true });

const Skill =
  (mongoose.models.Skill as ISkillModel) ||
  mongoose.model<ISkill, ISkillModel>('Skill', skillSchema);

export default Skill;