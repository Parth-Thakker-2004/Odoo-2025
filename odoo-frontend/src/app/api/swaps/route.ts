import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Swap from '@/models/Swaps';

async function connectDB() {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_URI as string);
  }
}

// GET: List all swaps
export async function GET() {
  try {
    await connectDB();
    const swaps = await Swap.find().sort({ createdAt: -1 });
    return NextResponse.json(swaps);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch swaps' }, { status: 500 });
  }
}

// POST: Create a new swap
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const data = await req.json();
    data.requester = new mongoose.Types.ObjectId(data.requester);
    data.recipient = new mongoose.Types.ObjectId(data.recipient);
    // Basic validation
    if (!data.requester || !data.recipient || !data.skillOffered || !data.skillRequested) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const swap = await Swap.create(data);
    return NextResponse.json(swap, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create swap' }, { status: 500 });
  }
}