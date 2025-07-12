import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Swap from '@/models/Swaps';
import User from '@/models/User';

async function connectDB() {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_URI as string);
  }
}

// Helper function to get user names
async function getUserNames(requesterId: string, recipientId: string) {
  try {
    const [requester, recipient] = await Promise.all([
      User.findById(requesterId).select('name'),
      User.findById(recipientId).select('name')
    ]);
    
    return {
      requesterName: requester?.name || 'Unknown User',
      recipientName: recipient?.name || 'Unknown User'
    };
  } catch (error) {
    console.error('Error fetching user names:', error);
    return {
      requesterName: 'Unknown User',
      recipientName: 'Unknown User'
    };
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
    
    console.log('Received swap data:', data);
    
    data.requester = new mongoose.Types.ObjectId(data.requester);
    data.recipient = new mongoose.Types.ObjectId(data.recipient);
    
    // Basic validation for core fields
    if (!data.requester || !data.recipient || !data.skillOffered || !data.skillRequested) {
      console.log('Validation failed. Missing core fields:', {
        requester: !!data.requester,
        recipient: !!data.recipient,
        skillOffered: !!data.skillOffered,
        skillRequested: !!data.skillRequested
      });
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Set fallback values for missing fields
    data.requesterId = data.requesterId || data.requester.toString();
    data.recipientId = data.recipientId || data.recipient.toString();
    
    // If names are missing, fetch them from the database
    if (!data.requesterName || !data.recipientName) {
      const userNames = await getUserNames(data.requesterId, data.recipientId);
      data.requesterName = data.requesterName || userNames.requesterName;
      data.recipientName = data.recipientName || userNames.recipientName;
    }
    
    console.log('Processing swap with data:', {
      requester: data.requester,
      recipient: data.recipient,
      requesterId: data.requesterId,
      recipientId: data.recipientId,
      requesterName: data.requesterName,
      recipientName: data.recipientName,
      skillOffered: data.skillOffered,
      skillRequested: data.skillRequested
    });

    const swap = await Swap.create(data);
    console.log('Created swap:', swap);
    return NextResponse.json(swap, { status: 201 });
  } catch (error) {
    console.error('Error creating swap:', error);
    return NextResponse.json({ error: 'Failed to create swap' }, { status: 500 });
  }
}