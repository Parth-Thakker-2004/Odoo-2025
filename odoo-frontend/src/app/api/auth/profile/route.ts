import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import dbConnect from "@/lib/dbconnect";
import User from "@/models/User";
import Skill from "@/models/Skill";
import { validateUserSkills } from "@/lib/skill-utils";

// Helper function to verify JWT token
async function verifyToken(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return { error: "Access token is required" };
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback-secret-key") as any;
    return { decoded };
  } catch (error: any) {
    if (error.name === 'JsonWebTokenError') {
      return { error: "Invalid token" };
    } else if (error.name === 'TokenExpiredError') {
      return { error: "Token expired" };
    } else {
      return { error: "Authentication failed" };
    }
  }
}

// Helper function to process custom skills
async function processCustomSkills(customSkills: Array<{name: string, category: string, isCustom: true}>) {
  const createdSkills = [];
  
  for (const customSkill of customSkills) {
    try {
      // Check if skill already exists
      const existingSkill = await Skill.findOne({
        name: { $regex: new RegExp(`^${customSkill.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }
      });
      
      if (!existingSkill) {
        // Create new unverified skill
        const newSkill = new Skill({
          name: customSkill.name,
          category: customSkill.category,
          description: `Custom skill submitted by user`,
          isVerified: false,
          isActive: true,
          usageCount: 1,
          aliases: [],
          tags: []
        });
        
        const savedSkill = await newSkill.save();
        createdSkills.push(savedSkill);
        console.log(`✅ Created custom skill: ${savedSkill.name}`);
      }
    } catch (error) {
      console.error(`❌ Error creating custom skill ${customSkill.name}:`, error);
    }
  }
  
  return createdSkills;
}

// GET - Get current user profile
export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const { decoded, error } = await verifyToken(request);
    
    if (error) {
      return NextResponse.json(
        { 
          error: "Authentication required", 
          message: error 
        },
        { status: 401 }
      );
    }

    const user = await User.findById(decoded.userId).select('-passwordHash');
    
    if (!user) {
      return NextResponse.json(
        { 
          error: "User not found", 
          message: "User profile not found" 
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        user: user.toObject()
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error("Profile fetch error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: "An error occurred while fetching profile"
      },
      { status: 500 }
    );
  }
}

// PUT - Update current user profile
export async function PUT(request: NextRequest) {
  try {
    await dbConnect();
    
    const { decoded, error } = await verifyToken(request);
    
    if (error) {
      return NextResponse.json(
        { 
          error: "Authentication required", 
          message: error 
        },
        { status: 401 }
      );
    }

    const updateData = await request.json();
    
    // Define allowed fields that can be updated
    const allowedUpdates = [
      'name', 
      'location', 
      'profilePhoto', 
      'skillsOffered', 
      'skillsWanted', 
      'availability', 
      'isPublic'
    ];
    const updates: any = {};

    // Only allow specific fields to be updated
    allowedUpdates.forEach(field => {
      if (updateData[field] !== undefined) {
        updates[field] = updateData[field];
      }
    });

    // Validate skills if provided
    if (updates.skillsOffered || updates.skillsWanted) {
      try {
        const validationResult = await validateUserSkills(
          updates.skillsOffered || [], 
          updates.skillsWanted || []
        );
        if (!validationResult.valid) {
          return NextResponse.json(
            {
              error: "Skill validation failed",
              message: validationResult.message,
              invalidSkills: validationResult.invalidSkills
            },
            { status: 400 }
          );
        }
        
        // Use validated skills
        updates.skillsOffered = validationResult.validatedSkillsOffered;
        updates.skillsWanted = validationResult.validatedSkillsWanted;
      } catch (skillError) {
        console.warn("Skill validation error:", skillError);
        // Continue with update even if skill validation fails
      }
    }

    // Process custom skills if provided
    let customSkillsMessage = "";
    if (updateData.customSkillsOffered || updateData.customSkillsWanted) {
      const allCustomSkills = [
        ...(updateData.customSkillsOffered || []),
        ...(updateData.customSkillsWanted || [])
      ];
      
      if (allCustomSkills.length > 0) {
        const createdSkills = await processCustomSkills(allCustomSkills);
        customSkillsMessage = ` ${createdSkills.length} custom skill${createdSkills.length !== 1 ? 's' : ''} submitted for verification.`;
        
        // Add custom skill names to the appropriate arrays
        if (updateData.customSkillsOffered) {
          updates.skillsOffered = [
            ...(updates.skillsOffered || []),
            ...updateData.customSkillsOffered.map((skill: any) => skill.name)
          ];
        }
        if (updateData.customSkillsWanted) {
          updates.skillsWanted = [
            ...(updates.skillsWanted || []),
            ...updateData.customSkillsWanted.map((skill: any) => skill.name)
          ];
        }
      }
    }

    // Update user
    const user = await User.findByIdAndUpdate(
      decoded.userId,
      updates,
      { new: true, runValidators: true }
    ).select('-passwordHash');

    if (!user) {
      return NextResponse.json(
        { 
          error: "User not found", 
          message: "User profile not found" 
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Profile updated successfully." + customSkillsMessage,
        user: user.toObject()
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error("Profile update error:", error);
    
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
        message: "An error occurred while updating profile"
      },
      { status: 500 }
    );
  }
}
