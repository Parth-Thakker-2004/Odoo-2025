import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

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

// POST - Logout user
export async function POST(request: NextRequest) {
  try {
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

    // In a stateless JWT system, logout is handled client-side by removing the token
    // You could implement a token blacklist here if needed for additional security
    
    // TODO: Optional - Add token to blacklist in database
    // await BlacklistedToken.create({ token: request.headers.get('authorization')?.split(' ')[1] });
    
    return NextResponse.json(
      {
        success: true,
        message: "Logout successful"
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error("Logout error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: "An error occurred during logout"
      },
      { status: 500 }
    );
  }
}
