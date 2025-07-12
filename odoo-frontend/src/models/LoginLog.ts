import mongoose, { Document, Schema, Model } from 'mongoose';

export interface ILoginLog extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  email: string;
  ipAddress: string;
  userAgent: string;
  success: boolean;
  failureReason?: string;
  loginTime: Date;
  location?: {
    country?: string;
    city?: string;
    timezone?: string;
  };
  deviceInfo?: {
    browser?: string;
    os?: string;
    device?: string;
  };
}

export interface ILoginLogModel extends Model<ILoginLog> {
  findByUserId(userId: string): Promise<ILoginLog[]>;
  findRecentLogins(hours?: number): Promise<ILoginLog[]>;
  findFailedAttempts(email: string, hours?: number): Promise<ILoginLog[]>;
}

const loginLogSchema = new Schema<ILoginLog>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: function() {
      return this.success; // Only required for successful logins
    }
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  ipAddress: {
    type: String,
    required: true
  },
  userAgent: {
    type: String,
    required: true
  },
  success: {
    type: Boolean,
    required: true,
    default: false
  },
  failureReason: {
    type: String,
    required: function() {
      return !this.success;
    }
  },
  loginTime: {
    type: Date,
    default: Date.now,
    required: true
  },
  location: {
    country: { type: String },
    city: { type: String },
    timezone: { type: String }
  },
  deviceInfo: {
    browser: { type: String },
    os: { type: String },
    device: { type: String }
  }
}, {
  timestamps: true,
  collection: 'loginlogs'
});

// Indexes for better query performance
loginLogSchema.index({ userId: 1, loginTime: -1 });
loginLogSchema.index({ email: 1, loginTime: -1 });
loginLogSchema.index({ success: 1, loginTime: -1 });
loginLogSchema.index({ loginTime: -1 });

// Static methods
loginLogSchema.statics.findByUserId = function(userId: string) {
  return this.find({ userId, success: true })
    .sort({ loginTime: -1 })
    .limit(50);
};

loginLogSchema.statics.findRecentLogins = function(hours: number = 24) {
  const since = new Date(Date.now() - hours * 60 * 60 * 1000);
  return this.find({ 
    success: true,
    loginTime: { $gte: since }
  }).sort({ loginTime: -1 });
};

loginLogSchema.statics.findFailedAttempts = function(email: string, hours: number = 1) {
  const since = new Date(Date.now() - hours * 60 * 60 * 1000);
  return this.find({
    email: email.toLowerCase(),
    success: false,
    loginTime: { $gte: since }
  }).sort({ loginTime: -1 });
};

const LoginLog = (mongoose.models.LoginLog || 
  mongoose.model<ILoginLog, ILoginLogModel>('LoginLog', loginLogSchema)) as ILoginLogModel;

export default LoginLog;
