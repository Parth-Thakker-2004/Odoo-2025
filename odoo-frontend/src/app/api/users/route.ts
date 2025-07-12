import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbconnect";
import User from "@/models/User";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "20");
    const page = parseInt(searchParams.get("page") || "1");
    const search = searchParams.get("search");
    const skill = searchParams.get("skill");
    const location = searchParams.get("location");

    let query: any = { 
      isPublic: true, 
      isBanned: { $ne: true } 
    };

    // Add search filters
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } }
      ];
    }

    if (skill) {
      query.$or = [
        { skillsOffered: { $in: [skill] } },
        { skillsWanted: { $in: [skill] } }
      ];
    }

    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }

    const skip = (page - 1) * limit;

    // Get users with pagination
    const [users, total] = await Promise.all([
      User.find(query)
        .select('-passwordHash -email -isBanned -role')
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip),
      User.countDocuments(query)
    ]);

    // Transform users to include proper ID and profile visibility
    const transformedUsers = users.map(user => ({
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
      createdAt: user.createdAt
    }));

    return NextResponse.json(
      {
        success: true,
        data: {
          users: transformedUsers,
          pagination: {
            current: page,
            total: Math.ceil(total / limit),
            count: users.length,
            totalRecords: total
          }
        }
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error("Get users error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: "An error occurred while fetching users"
      },
      { status: 500 }
    );
  }
}
