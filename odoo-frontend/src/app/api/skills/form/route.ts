import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbconnect";
import Skill from "@/models/Skill";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const category = searchParams.get("category");
    const limit = parseInt(searchParams.get("limit") || "100");

    let query: any = {
      isVerified: true,
      isActive: true
    };

    let skillsQuery;

    if (search) {
      // Search for skills
      skillsQuery = Skill.find({
        ...query,
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { aliases: { $regex: search, $options: 'i' } },
          { tags: { $regex: search, $options: 'i' } }
        ]
      });
    } else if (category) {
      // Filter by category
      skillsQuery = Skill.find({ ...query, category });
    } else {
      // Get all verified skills
      skillsQuery = Skill.find(query);
    }

    const skills = await skillsQuery
      .select('name category description level usageCount')
      .sort({ usageCount: -1, name: 1 })
      .limit(limit);

    // Get available categories
    const categories = await Skill.distinct("category", { isVerified: true, isActive: true });

    return NextResponse.json({
      success: true,
      data: {
        skills: skills.map(skill => ({
          id: skill._id,
          name: skill.name,
          category: skill.category,
          description: skill.description,
          level: skill.level,
          usageCount: skill.usageCount
        })),
        categories: categories.sort(),
        total: skills.length
      }
    });

  } catch (error: any) {
    console.error("Get form skills error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: "An error occurred while fetching skills"
      },
      { status: 500 }
    );
  }
}
