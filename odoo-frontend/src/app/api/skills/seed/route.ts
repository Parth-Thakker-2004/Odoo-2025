import { NextRequest, NextResponse } from "next/server";
import { seedSkills } from "@/lib/seed-skills";
import { verifyJWT } from "@/lib/jwt";

export async function POST(request: NextRequest) {
  try {
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

    const result = await seedSkills();

    return NextResponse.json({
      success: true,
      message: "Skills seeded successfully",
      data: result
    });

  } catch (error: any) {
    console.error("Seed skills error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: "An error occurred while seeding skills"
      },
      { status: 500 }
    );
  }
}
