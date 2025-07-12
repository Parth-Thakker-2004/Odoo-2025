import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbconnect";
import Skill from "@/models/Skill";
import { verifyJWT } from "@/lib/jwt";

interface RouteParams {
  params: {
    id: string;
  };
}

// GET - Get skill by ID
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    await dbConnect();

    const skill = await Skill.findById(params.id)
      .populate("submittedBy", "name email")
      .populate("verifiedBy", "name email")
      .populate("relatedSkills", "name category");

    if (!skill) {
      return NextResponse.json(
        { error: "Skill not found", message: "Skill not found" },
        { status: 404 }
      );
    }

    // Only return verified skills to non-admin users
    const authHeader = request.headers.get("authorization");
    let isAdmin = false;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      const decoded = verifyJWT(token);
      isAdmin = decoded && decoded.role === "admin";
    }

    if (!skill.isVerified && !isAdmin) {
      return NextResponse.json(
        { error: "Skill not found", message: "Skill not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      skill
    });

  } catch (error: any) {
    console.error("Get skill error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: "An error occurred while fetching skill"
      },
      { status: 500 }
    );
  }
}

// PUT - Update/Verify skill (Admin only)
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    await dbConnect();

    // Verify admin token
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Unauthorized", message: "No valid token provided" },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const decoded = verifyJWT(token);

    if (!decoded || decoded.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized", message: "Admin access required" },
        { status: 401 }
      );
    }

    const updateData = await request.json();

    // Find the skill
    const skill = await Skill.findById(params.id);
    if (!skill) {
      return NextResponse.json(
        { error: "Skill not found", message: "Skill not found" },
        { status: 404 }
      );
    }

    // Update skill with allowed fields
    const allowedUpdates = [
      'name',
      'category', 
      'description',
      'aliases',
      'tags',
      'level',
      'isVerified',
      'isActive',
      'relatedSkills'
    ];

    const updates: any = {};
    allowedUpdates.forEach(field => {
      if (updateData[field] !== undefined) {
        updates[field] = updateData[field];
      }
    });

    // If verifying, set verifiedBy
    if (updateData.isVerified === true && !skill.isVerified) {
      updates.verifiedBy = decoded.userId;
      updates.verifiedAt = new Date();
    }

    const updatedSkill = await Skill.findByIdAndUpdate(
      params.id,
      updates,
      { new: true, runValidators: true }
    ).populate("submittedBy", "name email")
     .populate("verifiedBy", "name email");

    return NextResponse.json({
      success: true,
      message: "Skill updated successfully",
      skill: updatedSkill
    });

  } catch (error: any) {
    console.error("Update skill error:", error);

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
        message: "An error occurred while updating skill"
      },
      { status: 500 }
    );
  }
}

// DELETE - Deactivate skill (Admin only)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    await dbConnect();

    // Verify admin token
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Unauthorized", message: "No valid token provided" },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const decoded = verifyJWT(token);

    if (!decoded || decoded.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized", message: "Admin access required" },
        { status: 401 }
      );
    }

    const skill = await Skill.findByIdAndUpdate(
      params.id,
      { isActive: false },
      { new: true }
    );

    if (!skill) {
      return NextResponse.json(
        { error: "Skill not found", message: "Skill not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Skill deactivated successfully",
      skill
    });

  } catch (error: any) {
    console.error("Delete skill error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: "An error occurred while deactivating skill"
      },
      { status: 500 }
    );
  }
}
