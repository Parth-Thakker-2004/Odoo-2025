import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import User from '@/models/User';

if (mongoose.connection.readyState === 0) {
  await mongoose.connect(process.env.MONGODB_URI as string);
}

export async function GET(req: NextRequest) {
  // Optionally, add query params for filtering
  const users = await User.find({ isBanned: false }).lean();
  return NextResponse.json(users);
}