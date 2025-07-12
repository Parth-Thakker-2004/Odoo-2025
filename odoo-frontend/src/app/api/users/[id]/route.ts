import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbconnect";
import User from "@/models/User";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();

    const { id } = params;

    if (!id) {
      return NextResponse.json(
        {
          error: "User ID is required",
          message: "Please provide a valid user ID"
        },
        { status: 400 }
      );
    }

    // Find user by ID, excluding sensitive information
    const user = await User.findById(id).select('-passwordHash -email');

    if (!user) {
      return NextResponse.json(
        {
          error: "User not found",
          message: "No user found with the provided ID"
        },
        { status: 404 }
      );
    }

    // Only return public profiles or if the user is viewing their own profile
    // For now, we'll check if the profile is public
    if (!user.isPublic) {
      return NextResponse.json(
        {
          error: "Profile is private",
          message: "This user's profile is set to private"
        },
        { status: 403 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        user: {
          _id: user._id,
          id: user._id.toString(),
          name: user.name,
          location: user.location,
          profilePhoto: user.profilePhoto,
          skillsOffered: user.skillsOffered,
          skillsWanted: user.skillsWanted,
          availability: user.availability,
          isPublic: user.isPublic,
          profileVisibility: user.isPublic ? 'public' : 'private',
          // Don't expose sensitive data for public view
          createdAt: user.createdAt
        }
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error("Get user error:", error);
    
    // Handle invalid ObjectId format
    if (error.name === 'CastError') {
      return NextResponse.json(
        {
          error: "Invalid user ID",
          message: "The provided user ID is not valid"
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: "Internal server error",
        message: "An error occurred while fetching user data"
      },
      { status: 500 }
    );
  }
}
