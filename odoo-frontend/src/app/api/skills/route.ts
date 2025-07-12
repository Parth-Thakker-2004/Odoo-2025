import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbconnect";
import Skill from "@/models/Skill";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const verified = searchParams.get("verified");
    const popular = searchParams.get("popular");
    const limit = parseInt(searchParams.get("limit") || "50");
    const page = parseInt(searchParams.get("page") || "1");

    let query: any = { isActive: true };

    // Default to verified skills unless explicitly requesting unverified
    if (verified !== "false") {
      query.isVerified = true;
    } else if (verified === "false") {
      query.isVerified = false;
    }

    let skillsQuery;

    if (search) {
      // Search functionality
      skillsQuery = Skill.searchSkills(search);
    } else if (category) {
      // Filter by category
      skillsQuery = Skill.findByCategory(category);
    } else if (popular === "true") {
      // Get popular skills
      skillsQuery = Skill.findPopular(limit);
    } else {
      // Get all skills with pagination
      const skip = (page - 1) * limit;
      skillsQuery = Skill.find(query)
        .sort({ usageCount: -1, name: 1 })
        .limit(limit)
        .skip(skip);
    }

    const [skills, total] = await Promise.all([
      skillsQuery,
      Skill.countDocuments(query)
    ]);

    // Get categories for filtering
    const categories = await Skill.distinct("category", { isVerified: true, isActive: true });

    return NextResponse.json({
      success: true,
      data: {
        skills,
        categories: categories.sort(),
        pagination: {
          current: page,
          total: Math.ceil(total / limit),
          count: skills.length,
          totalRecords: total
        }
      }
    });

  } catch (error: any) {
    console.error("Get skills error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: "An error occurred while fetching skills"
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    // Get token from Authorization header (if user is logged in)
    const authHeader = request.headers.get("authorization");
    let submittedBy = null;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      // You can add JWT verification here if needed
      // For now, we'll allow anonymous skill submissions
    }

    const {
      name,
      category,
      description,
      aliases,
      tags,
      level
    } = await request.json();

    // Validate required fields
    if (!name || !category) {
      return NextResponse.json(
        {
          error: "Missing required fields",
          message: "Name and category are required"
        },
        { status: 400 }
      );
    }

    // Check if skill already exists
    const existingSkill = await Skill.findByName(name);
    if (existingSkill) {
      return NextResponse.json(
        {
          error: "Skill already exists",
          message: "A skill with this name already exists"
        },
        { status: 409 }
      );
    }

    // Create new skill (unverified by default)
    const newSkill = new Skill({
      name,
      category,
      description,
      aliases: aliases || [],
      tags: tags || [],
      level,
      submittedBy,
      isVerified: false, // New skills need verification
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
          aliases: newSkill.aliases,
          tags: newSkill.tags,
          level: newSkill.level,
          isVerified: newSkill.isVerified,
          createdAt: newSkill.createdAt
        }
      },
      { status: 201 }
    );

  } catch (error: any) {
    console.error("Create skill error:", error);

    // Handle duplicate name error
    if (error.code === 11000) {
      return NextResponse.json(
        {
          error: "Skill already exists",
          message: "A skill with this name already exists"
        },
        { status: 409 }
      );
    }

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
        message: "An error occurred while creating skill"
      },
      { status: 500 }
    );
  }
}
