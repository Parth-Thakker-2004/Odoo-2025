import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbconnect";
import Skill from "@/models/Skill";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    // Get all unique categories from verified skills
    const categories = await Skill.distinct("category", { 
      isVerified: true, 
      isActive: true 
    });

    // Add some additional common categories that might not be in the database yet
    const additionalCategories = [
      "Art & Creative",
      "Business & Finance",
      "Education & Training",
      "Healthcare",
      "Legal",
      "Marketing & Sales",
      "Music & Audio",
      "Sports & Fitness",
      "Writing & Communication"
    ];

    // Combine and sort all categories
    const allCategories = [...new Set([...categories, ...additionalCategories])].sort();

    return NextResponse.json({
      success: true,
      data: {
        categories: allCategories,
        total: allCategories.length
      }
    });

  } catch (error: any) {
    console.error("Get categories error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: "An error occurred while fetching categories"
      },
      { status: 500 }
    );
  }
}
