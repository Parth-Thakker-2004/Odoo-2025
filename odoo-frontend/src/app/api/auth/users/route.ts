import { NextRequest, NextResponse } from "next/server";
import { authenticateToken, authorizeRoles, createErrorResponse, createSuccessResponse } from "@/lib/auth-middleware";
import dbConnect from "@/lib/dbconnect";
// We'll import the User model once you provide the schema

// GET - Get all users (Admin only)
export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const { user, error, status } = await authenticateToken(request);
    
    if (error) {
      return createErrorResponse("Authentication required", error, status);
    }

    // Check if user has admin role
    if (!authorizeRoles(user!, ['admin'])) {
      return createErrorResponse(
        "Insufficient permissions",
        "Admin access required",
        403
      );
    }

    // Get pagination parameters
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // TODO: Fetch users from database (will implement after schema is provided)
    // const users = await User.find({ isActive: true })
    //   .select('-password')
    //   .sort({ createdAt: -1 })
    //   .skip(skip)
    //   .limit(limit);

    // const totalUsers = await User.countDocuments({ isActive: true });

    // TODO: Return actual user data once schema is implemented
    return createSuccessResponse({
      success: true,
      users: [
        // ...users
      ],
      pagination: {
        currentPage: page,
        totalPages: 1, // Math.ceil(totalUsers / limit),
        totalUsers: 0, // totalUsers,
        limit
      }
    });

  } catch (error: any) {
    console.error("Users fetch error:", error);
    return createErrorResponse(
      "Internal server error",
      "An error occurred while fetching users",
      500
    );
  }
}

// PUT - Update user role (Admin only)
export async function PUT(request: NextRequest) {
  try {
    await dbConnect();
    
    const { user, error, status } = await authenticateToken(request);
    
    if (error) {
      return createErrorResponse("Authentication required", error, status);
    }

    // Check if user has admin role
    if (!authorizeRoles(user!, ['admin'])) {
      return createErrorResponse(
        "Insufficient permissions",
        "Admin access required",
        403
      );
    }

    const { userId, role } = await request.json();
    const validRoles = ['user', 'admin', 'moderator'];

    if (!validRoles.includes(role)) {
      return createErrorResponse(
        "Invalid role",
        `Role must be one of: ${validRoles.join(', ')}`,
        400
      );
    }

    // TODO: Update user role (will implement after schema is provided)
    // const updatedUser = await User.findByIdAndUpdate(
    //   userId,
    //   { role },
    //   { new: true, runValidators: true }
    // ).select('-password');

    // if (!updatedUser) {
    //   return createErrorResponse(
    //     "User not found",
    //     "User not found",
    //     404
    //   );
    // }

    // TODO: Return actual user data once schema is implemented
    return createSuccessResponse({
      success: true,
      message: "User role updated successfully",
      user: {
        // ...updatedUser.toObject()
      }
    });

  } catch (error: any) {
    console.error("Role update error:", error);
    return createErrorResponse(
      "Internal server error",
      "An error occurred while updating user role",
      500
    );
  }
}
