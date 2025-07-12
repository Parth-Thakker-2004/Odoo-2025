import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  passwordHash: string;
  location: string;
  profilePhoto: string;
  skillsOffered: string[];
  skillsWanted: string[];
  availability: string[];
  isPublic: boolean;
  isBanned: boolean;
  role: 'user' | 'admin';
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserModel extends Model<IUser> {
  findByEmail(email: string): Promise<IUser | null>;
  findActiveUsers(): Promise<IUser[]>;
  findPublicUsers(): Promise<IUser[]>;
  findByRole(role: string): Promise<IUser[]>;
  findBySkill(skill: string): Promise<IUser[]>;
  findByLocation(location: string): Promise<IUser[]>;
}

const userSchema = new Schema<IUser>({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email address']
  },
  passwordHash: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters long'],
    select: false // Don't include password in query results by default
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true,
    maxlength: [200, 'Location cannot exceed 200 characters']
  },
  profilePhoto: {
    type: String,
    default: '',
    trim: true
  },
  skillsOffered: {
    type: [String],
    default: [],
    validate: {
      validator: function(skills: string[]) {
        return skills.length <= 20; // Max 20 skills
      },
      message: 'Cannot offer more than 20 skills'
    }
  },
  skillsWanted: {
    type: [String],
    default: [],
    validate: {
      validator: function(skills: string[]) {
        return skills.length <= 20; // Max 20 skills
      },
      message: 'Cannot want more than 20 skills'
    }
  },
  availability: {
    type: [String],
    default: [],
    enum: {
      values: ['weekdays', 'weekends', 'mornings', 'afternoons', 'evenings', 'nights', 'flexible'],
      message: 'Invalid availability option'
    }
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  isBanned: {
    type: Boolean,
    default: false
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  }
}, {
  timestamps: true, // Automatically add createdAt and updatedAt
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for better query performance
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ isBanned: 1 });
userSchema.index({ isPublic: 1 });
userSchema.index({ location: 1 });
userSchema.index({ skillsOffered: 1 });
userSchema.index({ skillsWanted: 1 });
userSchema.index({ createdAt: -1 });

// Virtual for getting active users (not banned)
userSchema.virtual('isActive').get(function() {
  return !this.isBanned;
});

// Static method to find user by email
userSchema.statics.findByEmail = function(email: string) {
  return this.findOne({ email: email.toLowerCase() });
};

// Static method to find active users (not banned)
userSchema.statics.findActiveUsers = function() {
  return this.find({ isBanned: false });
};

// Static method to find public users
userSchema.statics.findPublicUsers = function() {
  return this.find({ isPublic: true, isBanned: false });
};

// Static method to find users by role
userSchema.statics.findByRole = function(role: string) {
  return this.find({ role: role });
};

// Static method to find users by skill
userSchema.statics.findBySkill = function(skill: string) {
  return this.find({ 
    $or: [
      { skillsOffered: { $in: [skill] } },
      { skillsWanted: { $in: [skill] } }
    ],
    isBanned: false
  });
};

// Static method to find users by location
userSchema.statics.findByLocation = function(location: string) {
  return this.find({ 
    location: { $regex: location, $options: 'i' },
    isBanned: false 
  });
};

// Pre-save middleware to ensure skills are unique and trimmed
userSchema.pre('save', function(next) {
  if (this.isModified('skillsOffered')) {
    this.skillsOffered = [...new Set(this.skillsOffered.map(skill => skill.trim()).filter(skill => skill))];
  }
  if (this.isModified('skillsWanted')) {
    this.skillsWanted = [...new Set(this.skillsWanted.map(skill => skill.trim()).filter(skill => skill))];
  }
  next();
});

const User = (mongoose.models.User as IUserModel) || mongoose.model<IUser, IUserModel>('User', userSchema);

export default User;
