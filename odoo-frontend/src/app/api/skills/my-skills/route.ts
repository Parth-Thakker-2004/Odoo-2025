import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbconnect";
import Skill from "@/models/Skill";
import { verifyJWT } from "@/lib/jwt";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    // Get token from Authorization header
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Unauthorized", message: "No valid token provided" },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const decoded = verifyJWT(token);

    if (!decoded) {
      return NextResponse.json(
        { error: "Unauthorized", message: "Invalid token" },
        { status: 401 }
      );
    }

    // Get user's pending skills
    const pendingSkills = await Skill.find({
      submittedBy: decoded.userId,
      isVerified: false,
      isActive: true
    })
    .select('name category description createdAt')
    .sort({ createdAt: -1 });

    // Get user's verified skills that they submitted
    const verifiedSkills = await Skill.find({
      submittedBy: decoded.userId,
      isVerified: true,
      isActive: true
    })
    .select('name category description verifiedAt')
    .sort({ verifiedAt: -1 });

    return NextResponse.json({
      success: true,
      data: {
        pendingSkills: pendingSkills.map(skill => ({
          id: skill._id,
          name: skill.name,
          category: skill.category,
          description: skill.description,
          status: 'pending_verification',
          submittedAt: skill.createdAt
        })),
        verifiedSkills: verifiedSkills.map(skill => ({
          id: skill._id,
          name: skill.name,
          category: skill.category,
          description: skill.description,
          status: 'verified',
          verifiedAt: skill.verifiedAt
        })),
        summary: {
          totalPending: pendingSkills.length,
          totalVerified: verifiedSkills.length
        }
      }
    });

  } catch (error: any) {
    console.error("Get user skills error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: "An error occurred while fetching user skills"
      },
      { status: 500 }
    );
  }
}
