import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbconnect";
import { searchSkillsForAutocomplete, getPopularSkills } from "@/lib/skill-utils";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");
    const limit = parseInt(searchParams.get("limit") || "10");

    let skills;

    if (query && query.length >= 2) {
      // Search for skills
      skills = await searchSkillsForAutocomplete(query, limit);
    } else {
      // Return popular skills if no query
      skills = await getPopularSkills(limit);
    }

    return NextResponse.json({
      success: true,
      data: {
        skills: skills.map(skill => ({
          id: skill._id,
          name: skill.name,
          category: skill.category,
          usageCount: skill.usageCount || 0
        })),
        query: query || '',
        total: skills.length
      }
    });

  } catch (error: any) {
    console.error("Autocomplete skills error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: "An error occurred while searching skills"
      },
      { status: 500 }
    );
  }
}
