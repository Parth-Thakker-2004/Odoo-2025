import { NextResponse } from 'next/server';
import Feedback from '@/models/Feedback';
import dbConnect from '@/lib/dbconnect';

// Connect to the database
await dbConnect();

// GET: Fetch all feedbacks
export async function GET() {
  try {
    const feedbacks = await Feedback.find().populate('from to', 'name email');
    return NextResponse.json({ success: true, data: feedbacks });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}

// POST: Add new feedback
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { swapId, from, to, rating, comment } = body;

    if (!swapId || !from || !to || !rating) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    const feedback = await Feedback.create({ swapId, from, to, rating, comment });
    return NextResponse.json({ success: true, data: feedback }, { status: 201 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
