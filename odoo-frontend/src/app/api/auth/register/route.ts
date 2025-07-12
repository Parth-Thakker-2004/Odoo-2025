import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/dbconnect";
import User from "@/models/User";
import { generateJWT } from "@/lib/jwt";

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const { name, email, password, location, profilePhoto, skillsOffered, skillsWanted, availability, isPublic, role } = await request.json();

    // Validate required fields
    if (!name || !email || !password || !location) {
      return NextResponse.json(
        { 
          error: "Missing required fields", 
          message: "Name, email, password, and location are required" 
        },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { 
          error: "Invalid email format", 
          message: "Please provide a valid email address" 
        },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        { 
          error: "Weak password", 
          message: "Password must be at least 8 characters long" 
        },
        { status: 400 }
      );
    }

    // Check password complexity
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]/;
    if (!passwordRegex.test(password)) {
      return NextResponse.json(
        { 
          error: "Weak password", 
          message: "Password must contain at least one letter and one number" 
        },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { 
          error: "User already exists", 
          message: "An account with this email already exists" 
        },
        { status: 409 }
      );
    }

    // Hash password
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = new User({
      name,
      email: email.toLowerCase(),
      passwordHash,
      location,
      profilePhoto: profilePhoto || '',
      skillsOffered: skillsOffered || [],
      skillsWanted: skillsWanted || [],
      availability: availability || [],
      isPublic: isPublic !== undefined ? isPublic : true,
      role: role || 'user'
    });

    await newUser.save();

    // Generate JWT token
    const token = generateJWT({
      userId: newUser._id.toString(),
      email: newUser.email,
      role: newUser.role
    });

    // Return user data (excluding password)
    return NextResponse.json(
      {
        success: true,
        message: "User registered successfully",
        token,
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          location: newUser.location,
          profilePhoto: newUser.profilePhoto,
          skillsOffered: newUser.skillsOffered,
          skillsWanted: newUser.skillsWanted,
          availability: newUser.availability,
          isPublic: newUser.isPublic,
          role: newUser.role,
          createdAt: newUser.createdAt
        }
      },
      { status: 201 }
    );

  } catch (error: any) {
    console.error("Registration error:", error);
    
    // Handle duplicate email error
    if (error.code === 11000) {
      return NextResponse.json(
        {
          error: "User already exists",
          message: "An account with this email already exists"
        },
        { status: 409 }
      );
    }

    // Handle validation errors
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
        message: "An error occurred during registration"
      },
      { status: 500 }
    );
  }
}
