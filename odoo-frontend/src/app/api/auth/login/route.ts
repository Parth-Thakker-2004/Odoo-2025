import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/dbconnect";
import User from "@/models/User";
import LoginLog from "@/models/LoginLog";
import { generateJWT } from "@/lib/jwt";
import { extractRequestInfo } from "@/lib/request-utils";

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const { email, password } = await request.json();
    const requestInfo = extractRequestInfo(request);

    // Validate required fields
    if (!email || !password) {
      // Log failed attempt
      await LoginLog.create({
        email: email || 'unknown',
        ipAddress: requestInfo.ipAddress,
        userAgent: requestInfo.userAgent,
        deviceInfo: requestInfo.deviceInfo,
        success: false,
        failureReason: 'Missing credentials'
      });

      return NextResponse.json(
        { 
          error: "Missing credentials", 
          message: "Email and password are required" 
        },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      // Log failed attempt
      await LoginLog.create({
        email,
        ipAddress: requestInfo.ipAddress,
        userAgent: requestInfo.userAgent,
        deviceInfo: requestInfo.deviceInfo,
        success: false,
        failureReason: 'Invalid email format'
      });

      return NextResponse.json(
        { 
          error: "Invalid email format", 
          message: "Please provide a valid email address" 
        },
        { status: 400 }
      );
    }

    // Find user by email and include password
    const user = await User.findOne({ email: email.toLowerCase() }).select('+passwordHash');
    
    if (!user) {
      // Log failed attempt
      await LoginLog.create({
        email,
        ipAddress: requestInfo.ipAddress,
        userAgent: requestInfo.userAgent,
        deviceInfo: requestInfo.deviceInfo,
        success: false,
        failureReason: 'User not found'
      });

      return NextResponse.json(
        { 
          error: "Invalid credentials", 
          message: "Email or password is incorrect" 
        },
        { status: 401 }
      );
    }

    // Check if user is banned
    if (user.isBanned) {
      // Log failed attempt
      await LoginLog.create({
        userId: user._id,
        email,
        ipAddress: requestInfo.ipAddress,
        userAgent: requestInfo.userAgent,
        deviceInfo: requestInfo.deviceInfo,
        success: false,
        failureReason: 'Account banned'
      });

      return NextResponse.json(
        { 
          error: "Account banned", 
          message: "Your account has been banned. Please contact support." 
        },
        { status: 401 }
      );
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    
    if (!isPasswordValid) {
      // Log failed attempt
      await LoginLog.create({
        userId: user._id,
        email,
        ipAddress: requestInfo.ipAddress,
        userAgent: requestInfo.userAgent,
        deviceInfo: requestInfo.deviceInfo,
        success: false,
        failureReason: 'Invalid password'
      });

      return NextResponse.json(
        { 
          error: "Invalid credentials", 
          message: "Email or password is incorrect" 
        },
        { status: 401 }
      );
    }

    // Generate JWT token
    const token = generateJWT({
      userId: user._id.toString(),
      email: user.email,
      role: user.role
    });

    // Log successful login
    await LoginLog.create({
      userId: user._id,
      email,
      ipAddress: requestInfo.ipAddress,
      userAgent: requestInfo.userAgent,
      deviceInfo: requestInfo.deviceInfo,
      success: true
    });

    // Return user data (excluding password)
    return NextResponse.json(
      {
        success: true,
        message: "Login successful",
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          location: user.location,
          profilePhoto: user.profilePhoto,
          skillsOffered: user.skillsOffered,
          skillsWanted: user.skillsWanted,
          availability: user.availability,
          isPublic: user.isPublic,
          role: user.role,
          createdAt: user.createdAt
        }
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error("Login error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: "An error occurred during login"
      },
      { status: 500 }
    );
  }
}
