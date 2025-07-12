import { NextRequest, NextResponse } from "next/server";
import { authenticateToken, authorizeOwnerOrAdmin, authorizeRoles, createErrorResponse, createSuccessResponse } from "@/lib/auth-middleware";
import dbConnect from "@/lib/dbconnect";
// We'll import the User model once you provide the schema

interface RouteParams {
  params: {
    id: string;
  };
}

// GET - Get user by ID (Owner or Admin only)
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    await dbConnect();
    
    const { user, error, status } = await authenticateToken(request);
    
    if (error) {
      return createErrorResponse("Authentication required", error, status);
    }

    // Check if user is owner or admin
    if (!authorizeOwnerOrAdmin(user!, params.id)) {
      return createErrorResponse(
        "Insufficient permissions",
        "You can only access your own profile",
        403
      );
    }

    // TODO: Find user by ID (will implement after schema is provided)
    // const targetUser = await User.findById(params.id).select('-password');
    
    // if (!targetUser) {
    //   return createErrorResponse(
    //     "User not found",
    //     "User not found",
    //     404
    //   );
    // }

    // TODO: Return actual user data once schema is implemented
    return createSuccessResponse({
      success: true,
      user: {
        // ...targetUser.toObject()
      }
    });

  } catch (error: any) {
    console.error("User fetch error:", error);
    return createErrorResponse(
      "Internal server error",
      "An error occurred while fetching user",
      500
    );
  }
}

// PUT - Update user (Owner or Admin only)
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    await dbConnect();
    
    const { user, error, status } = await authenticateToken(request);
    
    if (error) {
      return createErrorResponse("Authentication required", error, status);
    }

    // Check if user is owner or admin
    if (!authorizeOwnerOrAdmin(user!, params.id)) {
      return createErrorResponse(
        "Insufficient permissions",
        "You can only update your own profile",
        403
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
    // const updatedUser = await User.findByIdAndUpdate(
    //   params.id,
    //   updates,
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
      message: "User updated successfully",
      user: {
        // ...updatedUser.toObject()
      }
    });

  } catch (error: any) {
    console.error("User update error:", error);
    
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err: any) => err.message);
      return createErrorResponse(
        "Validation failed",
        errors.join(", "),
        400
      );
    }

    return createErrorResponse(
      "Internal server error",
      "An error occurred while updating user",
      500
    );
  }
}

// DELETE - Deactivate user (Admin only)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
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

    // TODO: Deactivate user (will implement after schema is provided)
    // const deactivatedUser = await User.findByIdAndUpdate(
    //   params.id,
    //   { isActive: false },
    //   { new: true }
    // ).select('-password');

    // if (!deactivatedUser) {
    //   return createErrorResponse(
    //     "User not found",
    //     "User not found",
    //     404
    //   );
    // }

    // TODO: Return actual user data once schema is implemented
    return createSuccessResponse({
      success: true,
      message: "User deactivated successfully",
      user: {
        // ...deactivatedUser.toObject()
      }
    });

  } catch (error: any) {
    console.error("User deactivation error:", error);
    return createErrorResponse(
      "Internal server error",
      "An error occurred while deactivating user",
      500
    );
  }
}
