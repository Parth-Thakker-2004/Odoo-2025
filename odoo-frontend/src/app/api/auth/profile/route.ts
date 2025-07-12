import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import dbConnect from "@/lib/dbconnect";
// We'll import the User model once you provide the schema

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

// GET - Get current user profile
export async function GET(request: NextRequest) {
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

    // TODO: Find user by ID (will implement after schema is provided)
    // const user = await User.findById(decoded.userId).select('-password');
    
    // if (!user) {
    //   return NextResponse.json(
    //     { 
    //       error: "User not found", 
    //       message: "User profile not found" 
    //     },
    //     { status: 404 }
    //   );
    // }

    // TODO: Return actual user data once schema is implemented
    return NextResponse.json(
      {
        success: true,
        user: {
          // ...user.toObject()
        }
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error("Profile fetch error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: "An error occurred while fetching profile"
      },
      { status: 500 }
    );
  }
}

// PUT - Update current user profile
export async function PUT(request: NextRequest) {
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

    const updateData = await request.json();
    
    // Define allowed fields that can be updated
    const allowedUpdates = ['firstName', 'lastName', 'phoneNumber', 'dateOfBirth', 'address', 'preferences'];
    const updates: any = {};

    // Only allow specific fields to be updated
    allowedUpdates.forEach(field => {
      if (updateData[field] !== undefined) {
        updates[field] = updateData[field];
      }
    });

    // TODO: Update user (will implement after schema is provided)
    // const user = await User.findByIdAndUpdate(
    //   decoded.userId,
    //   updates,
    //   { new: true, runValidators: true }
    // ).select('-password');

    // if (!user) {
    //   return NextResponse.json(
    //     { 
    //       error: "User not found", 
    //       message: "User profile not found" 
    //     },
    //     { status: 404 }
    //   );
    // }

    // TODO: Return actual user data once schema is implemented
    return NextResponse.json(
      {
        success: true,
        message: "Profile updated successfully",
        user: {
          // ...user.toObject()
        }
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error("Profile update error:", error);
    
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err: any) => err.message);
      return NextResponse.json(
        {
          error: "Validation failed",
          message: errors.join(", ")
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: "Internal server error",
        message: "An error occurred while updating profile"
      },
      { status: 500 }
    );
  }
}
