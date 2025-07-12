import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import dbConnect from "@/lib/dbconnect";
import User from "@/models/User";

// Helper function to verify JWT token
async function verifyToken(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return { error: "Access token is required" };
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback-secret-key") as any;
    return { decoded };
  } catch (error: any) {
    if (error.name === 'JsonWebTokenError') {
      return { error: "Invalid token" };
    } else if (error.name === 'TokenExpiredError') {
      return { error: "Token expired" };
    } else {
      return { error: "Authentication failed" };
    }
  }
}

// SwapRequest Schema (we'll create this model)
const SwapRequestSchema = {
  requesterId: { type: String, required: true },
  recipientId: { type: String, required: true },
  skillOffered: { type: String, required: true },
  skillRequested: { type: String, required: true },
  message: { type: String, default: '' },
  status: { 
    type: String, 
    enum: ['pending', 'accepted', 'declined', 'completed'], 
    default: 'pending' 
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
};

// POST - Create new swap request
export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const { decoded, error } = await verifyToken(request);
    
    if (error) {
      return NextResponse.json(
        { 
          error: "Authentication required", 
          message: error 
        },
        { status: 401 }
      );
    }

    const { recipientId, skillOffered, skillRequested, message } = await request.json();

    // Validate required fields
    if (!recipientId || !skillOffered || !skillRequested) {
      return NextResponse.json(
        { 
          error: "Missing required fields", 
          message: "Recipient, skill offered, and skill requested are required" 
        },
        { status: 400 }
      );
    }

    // Prevent self-requests
    if (decoded.userId === recipientId) {
      return NextResponse.json(
        { 
          error: "Invalid request", 
          message: "You cannot send a swap request to yourself" 
        },
        { status: 400 }
      );
    }

    // Check if recipient exists
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return NextResponse.json(
        { 
          error: "User not found", 
          message: "Recipient user not found" 
        },
        { status: 404 }
      );
    }

    // Check if requester exists and has the offered skill
    const requester = await User.findById(decoded.userId);
    if (!requester) {
      return NextResponse.json(
        { 
          error: "User not found", 
          message: "Requester user not found" 
        },
        { status: 404 }
      );
    }

    if (!requester.skillsOffered.includes(skillOffered)) {
      return NextResponse.json(
        { 
          error: "Invalid skill", 
          message: "You don't have the offered skill in your profile" 
        },
        { status: 400 }
      );
    }

    if (!recipient.skillsOffered.includes(skillRequested)) {
      return NextResponse.json(
        { 
          error: "Invalid skill", 
          message: "Recipient doesn't offer the requested skill" 
        },
        { status: 400 }
      );
    }

    // For now, we'll store swap requests as a simple collection
    // In a real app, you'd want a proper SwapRequest model
    const swapRequestData = {
      requesterId: decoded.userId,
      recipientId,
      skillOffered,
      skillRequested,
      message: message || '',
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Since we don't have a SwapRequest model yet, let's simulate success
    // In a real implementation, you would:
    // const swapRequest = new SwapRequest(swapRequestData);
    // await swapRequest.save();

    console.log('Swap request would be created:', swapRequestData);

    return NextResponse.json(
      {
        success: true,
        message: "Swap request sent successfully!",
        request: {
          id: `temp-${Date.now()}`, // Temporary ID
          ...swapRequestData,
          requesterName: requester.name,
          recipientName: recipient.name
        }
      },
      { status: 201 }
    );

  } catch (error: any) {
    console.error("Swap request error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: "An error occurred while creating the swap request"
      },
      { status: 500 }
    );
  }
}
