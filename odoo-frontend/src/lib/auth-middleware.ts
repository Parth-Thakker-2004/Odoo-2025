import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbconnect";
import User from "@/models/User";
import { verifyJWT, JWTPayload, generateJWT } from "@/lib/jwt";

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: string;
  name: string;
  location: string;
  profilePhoto: string;
  skillsOffered: string[];
  skillsWanted: string[];
  availability: string[];
  isPublic: boolean;
}

export interface TokenPayload extends JWTPayload {
  // Additional fields can be added here if needed
}

/**
 * Middleware to authenticate JWT tokens
 */
export async function authenticateToken(request: NextRequest): Promise<{
  user?: AuthenticatedUser;
  error?: string;
  status?: number;
}> {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return { 
        error: "Access token is required",
        status: 401
      };
    }

    // Verify the JWT token
    const decoded = verifyJWT(token);
    
    await dbConnect();
    
    // Find the user in the database
    const user = await User.findById(decoded.userId).select('-passwordHash');
    
    if (!user) {
      return { 
        error: "User not found",
        status: 401
      };
    }

    // Check if user is banned
    if (user.isBanned) {
      return { 
        error: "Account banned",
        status: 401
      };
    }

    return {
      user: {
        id: decoded.userId,
        email: decoded.email,
        role: decoded.role,
        name: user.name,
        location: user.location,
        profilePhoto: user.profilePhoto,
        skillsOffered: user.skillsOffered,
        skillsWanted: user.skillsWanted,
        availability: user.availability,
        isPublic: user.isPublic
      }
    };

  } catch (error: any) {
    if (error.name === 'JsonWebTokenError') {
      return { 
        error: "Invalid token",
        status: 401
      };
    } else if (error.name === 'TokenExpiredError') {
      return { 
        error: "Token expired",
        status: 401
      };
    } else {
      console.error('Authentication error:', error);
      return { 
        error: "Authentication failed",
        status: 500
      };
    }
  }
}

/**
 * Middleware to authorize users based on roles
 */
export function authorizeRoles(user: AuthenticatedUser, requiredRoles: string[]): boolean {
  return requiredRoles.includes(user.role);
}

/**
 * Middleware to check if user owns the resource or is admin
 */
export function authorizeOwnerOrAdmin(user: AuthenticatedUser, resourceUserId: string): boolean {
  return user.role === 'admin' || user.id === resourceUserId;
}

/**
 * Validate email format
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate password strength
 */
export function validatePassword(password: string): { isValid: boolean; message?: string } {
  if (password.length < 8) {
    return {
      isValid: false,
      message: "Password must be at least 8 characters long"
    };
  }

  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]/;
  if (!passwordRegex.test(password)) {
    return {
      isValid: false,
      message: "Password must contain at least one letter and one number"
    };
  }

  return { isValid: true };
}

/**
 * Generate JWT token
 */
export function generateToken(payload: { userId: string; email: string; role: string }): string {
  return generateJWT(payload);
}

/**
 * Create error response
 */
export function createErrorResponse(error: string, message: string, status: number = 500) {
  return NextResponse.json(
    { error, message },
    { status }
  );
}

/**
 * Create success response
 */
export function createSuccessResponse(data: any, status: number = 200) {
  return NextResponse.json(data, { status });
}
