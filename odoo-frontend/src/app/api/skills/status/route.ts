import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbconnect";
import Skill from "@/models/Skill";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    // Get all verified skills with counts
    const skills = await Skill.find({ isVerified: true, isActive: true })
      .select('name category usageCount isVerified')
      .sort({ category: 1, name: 1 })
      .limit(50);

    // Group by category
    const skillsByCategory = skills.reduce((acc: any, skill) => {
      if (!acc[skill.category]) {
        acc[skill.category] = [];
      }
      acc[skill.category].push({
        name: skill.name,
        usageCount: skill.usageCount
      });
      return acc;
    }, {});

    const totalSkills = await Skill.countDocuments({ isVerified: true, isActive: true });
    const totalPending = await Skill.countDocuments({ isVerified: false, isActive: true });

    return NextResponse.json({
      success: true,
      message: "Skills database status",
      data: {
        totalVerifiedSkills: totalSkills,
        totalPendingSkills: totalPending,
        skillsByCategory,
        summary: {
          categories: Object.keys(skillsByCategory).length,
          topSkills: skills.slice(0, 10).map(s => `${s.name} (${s.usageCount} users)`)
        }
      }
    }, { status: 200 });

  } catch (error: any) {
    console.error("Error checking skills status:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: "An error occurred while checking skills status"
      },
      { status: 500 }
    );
  }
}
