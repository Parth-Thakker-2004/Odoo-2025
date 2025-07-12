import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Swap from '@/models/Swaps';

// Ensure Mongoose is connected (add your connection logic if needed)
if (mongoose.connection.readyState === 0) {
  mongoose.connect(process.env.MONGODB_URI as string);
}

// GET: List all swaps
export async function GET() {
  const swaps = await Swap.find().sort({ createdAt: -1 });
  return NextResponse.json(swaps);
}

// POST: Create a new swap
export async function POST(req: NextRequest) {
  const data = await req.json();
  const swap = await Swap.create(data);
  return NextResponse.json(swap, { status: 201 });
}