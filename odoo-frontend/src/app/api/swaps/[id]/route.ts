import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Swap from '@/models/Swaps';

async function connectDB() {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_URI as string);
  }
}

// PATCH: Update swap status
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const { id } = params;
    const data = await req.json();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid swap ID' }, { status: 400 });
    }

    const swap = await Swap.findByIdAndUpdate(
      id,
      { ...data, updatedAt: new Date() },
      { new: true }
    );

    if (!swap) {
      return NextResponse.json({ error: 'Swap not found' }, { status: 404 });
    }

    return NextResponse.json(swap);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update swap' }, { status: 500 });
  }
}

// DELETE: Delete swap request
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const { id } = params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid swap ID' }, { status: 400 });
    }

    const swap = await Swap.findByIdAndDelete(id);

    if (!swap) {
      return NextResponse.json({ error: 'Swap not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Swap deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete swap' }, { status: 500 });
  }
}
