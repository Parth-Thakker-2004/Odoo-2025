import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbconnect";
import Skill from "@/models/Skill";
import { verifyJWT } from "@/lib/jwt";

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "pending";
    const limit = parseInt(searchParams.get("limit") || "50");
    const page = parseInt(searchParams.get("page") || "1");

    let query: any = { isActive: true };

    if (status === "pending") {
      query.isVerified = false;
    } else if (status === "verified") {
      query.isVerified = true;
    }

    const skip = (page - 1) * limit;

    const [skills, total] = await Promise.all([
      Skill.find(query)
        .populate("submittedBy", "name email")
        .populate("verifiedBy", "name email")
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip),
      Skill.countDocuments(query)
    ]);

    return NextResponse.json({
      success: true,
      data: {
        skills,
        pagination: {
          current: page,
          total: Math.ceil(total / limit),
          count: skills.length,
          totalRecords: total
        }
      }
    });

  } catch (error: any) {
    console.error("Get pending skills error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: "An error occurred while fetching skills"
      },
      { status: 500 }
    );
  }
}
