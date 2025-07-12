import mongoose, { Document, Schema, Model } from 'mongoose';

export interface ISkill extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  category: string;
  description?: string;
  aliases: string[]; // Alternative names for the skill
  isVerified: boolean;
  isActive: boolean;
  submittedBy?: mongoose.Types.ObjectId; // User who submitted this skill
  verifiedBy?: mongoose.Types.ObjectId; // Admin who verified this skill
  usageCount: number; // How many users have this skill
  tags: string[];
  level?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  relatedSkills: mongoose.Types.ObjectId[]; // References to other skills
  createdAt: Date;
  updatedAt: Date;
  verifiedAt?: Date;
}

export interface ISkillModel extends Model<ISkill> {
  findVerified(): Promise<ISkill[]>;
  findByCategory(category: string): Promise<ISkill[]>;
  findPending(): Promise<ISkill[]>;
  searchSkills(query: string): Promise<ISkill[]>;
  findPopular(limit?: number): Promise<ISkill[]>;
  findByName(name: string): Promise<ISkill | null>;
}

const skillSchema = new Schema<ISkill>({
  name: {
    type: String,
    required: [true, 'Skill name is required'],
    trim: true,
    unique: true,
    maxlength: [100, 'Skill name cannot exceed 100 characters'],
    index: true
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: [
      'Programming Languages',
      'Web Development',
      'Mobile Development',
      'Data Science',
      'Machine Learning',
      'DevOps',
      'Database',
      'Cloud Computing',
      'Cybersecurity',
      'UI/UX Design',
      'Digital Marketing',
      'Project Management',
      'Business Analysis',
      'Quality Assurance',
      'Networking',
      'System Administration',
      'Game Development',
      'Blockchain',
      'AI/Robotics',
      'Graphics Design',
      'Content Writing',
      'Photography',
      'Video Editing',
      'Music Production',
      'Teaching',
      'Language Skills',
      'Consulting',
      'Sales',
      'Finance',
      'Legal',
      'Healthcare',
      'Engineering',
      'Research',
      'Other'
    ],
    index: true
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters'],
    trim: true
  },
  aliases: [{
    type: String,
    trim: true,
    maxlength: [100, 'Alias cannot exceed 100 characters']
  }],
  isVerified: {
    type: Boolean,
    default: false,
    index: true
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  submittedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  verifiedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  usageCount: {
    type: Number,
    default: 0,
    min: 0
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [50, 'Tag cannot exceed 50 characters']
  }],
  level: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced', 'expert']
  },
  relatedSkills: [{
    type: Schema.Types.ObjectId,
    ref: 'Skill'
  }],
  verifiedAt: {
    type: Date
  }
}, {
  timestamps: true,
  collection: 'skills'
});

// Compound indexes for better query performance
skillSchema.index({ name: 'text', description: 'text', aliases: 'text' });
skillSchema.index({ category: 1, isVerified: 1, isActive: 1 });
skillSchema.index({ usageCount: -1, isVerified: 1 });
skillSchema.index({ createdAt: -1 });

// Static methods
skillSchema.statics.findVerified = function() {
  return this.find({ isVerified: true, isActive: true })
    .sort({ usageCount: -1, name: 1 });
};

skillSchema.statics.findByCategory = function(category: string) {
  return this.find({ 
    category, 
    isVerified: true, 
    isActive: true 
  }).sort({ usageCount: -1, name: 1 });
};

skillSchema.statics.findPending = function() {
  return this.find({ isVerified: false, isActive: true })
    .populate('submittedBy', 'name email')
    .sort({ createdAt: -1 });
};

skillSchema.statics.searchSkills = function(query: string) {
  return this.find({
    $and: [
      { isVerified: true, isActive: true },
      {
        $or: [
          { name: { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } },
          { aliases: { $regex: query, $options: 'i' } },
          { tags: { $regex: query, $options: 'i' } }
        ]
      }
    ]
  }).sort({ usageCount: -1, name: 1 });
};

skillSchema.statics.findPopular = function(limit: number = 20) {
  return this.find({ isVerified: true, isActive: true })
    .sort({ usageCount: -1 })
    .limit(limit);
};

skillSchema.statics.findByName = function(name: string) {
  return this.findOne({ 
    name: { $regex: new RegExp(`^${name}$`, 'i') },
    isActive: true 
  });
};

// Pre-save middleware to normalize skill name
skillSchema.pre('save', function(next) {
  if (this.isModified('name')) {
    // Capitalize first letter of each word
    this.name = this.name
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
  next();
});

// Pre-save middleware to set verifiedAt when verified
skillSchema.pre('save', function(next) {
  if (this.isModified('isVerified') && this.isVerified && !this.verifiedAt) {
    this.verifiedAt = new Date();
  }
  next();
});

const Skill = (mongoose.models.Skill || 
  mongoose.model<ISkill, ISkillModel>('Skill', skillSchema)) as ISkillModel;

export default Skill;
