import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbconnect";
import Skill from "@/models/Skill";
import { verifyJWT } from "@/lib/jwt";

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const { skillName, category, description } = await request.json();

    // Validate required fields
    if (!skillName || !category) {
      return NextResponse.json(
        {
          error: "Missing required fields",
          message: "Skill name and category are required"
        },
        { status: 400 }
      );
    }

    // Get user info if authenticated
    let submittedBy = null;
    const authHeader = request.headers.get("authorization");
    
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      const decoded = verifyJWT(token);
      if (decoded) {
        submittedBy = decoded.userId;
      }
    }

    // Check if skill already exists (verified or pending)
    const existingSkill = await Skill.findOne({
      name: { $regex: new RegExp(`^${skillName}$`, 'i') },
      isActive: true
    });

    if (existingSkill) {
      if (existingSkill.isVerified) {
        return NextResponse.json(
          {
            error: "Skill already exists",
            message: "This skill is already verified and available",
            skill: {
              id: existingSkill._id,
              name: existingSkill.name,
              category: existingSkill.category,
              isVerified: existingSkill.isVerified
            }
          },
          { status: 409 }
        );
      } else {
        return NextResponse.json(
          {
            error: "Skill pending verification",
            message: "This skill has already been submitted and is pending verification",
            skill: {
              id: existingSkill._id,
              name: existingSkill.name,
              category: existingSkill.category,
              isVerified: existingSkill.isVerified
            }
          },
          { status: 409 }
        );
      }
    }

    // Create new skill for verification
    const newSkill = new Skill({
      name: skillName,
      category,
      description: description || '',
      isVerified: false,
      isActive: true,
      submittedBy,
      usageCount: 0
    });

    await newSkill.save();

    return NextResponse.json(
      {
        success: true,
        message: "Skill submitted successfully and is pending verification",
        skill: {
          id: newSkill._id,
          name: newSkill.name,
          category: newSkill.category,
          description: newSkill.description,
          isVerified: newSkill.isVerified,
          createdAt: newSkill.createdAt
        }
      },
      { status: 201 }
    );

  } catch (error: any) {
    console.error("Suggest skill error:", error);

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
        message: "An error occurred while submitting skill suggestion"
      },
      { status: 500 }
    );
  }
}
