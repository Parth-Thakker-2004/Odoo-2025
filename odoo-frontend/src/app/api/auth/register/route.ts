import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/dbconnect";
import User from "@/models/User";
import Skill from "@/models/Skill";
import { generateJWT } from "@/lib/jwt";
import { validateUserSkills, updateSkillUsageCountsUtil } from "@/lib/skill-utils";

// Helper function to process custom skills
async function processCustomSkills(
  customSkillsOffered: Array<{name: string, category: string, description?: string}> = [],
  customSkillsWanted: Array<{name: string, category: string, description?: string}> = [],
  userId: string | null = null
) {
  const allCustomSkills = [...customSkillsOffered, ...customSkillsWanted];
  const createdSkills: any[] = [];
  const customSkillsOfferedNames: string[] = [];
  const customSkillsWantedNames: string[] = [];

  try {
    // Process each custom skill
    for (const customSkill of allCustomSkills) {
      if (!customSkill.name || !customSkill.category) {
        continue; // Skip invalid skills
      }

      // Check if skill already exists (verified or unverified)
      const existingSkill = await Skill.findOne({
        name: { $regex: new RegExp(`^${customSkill.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
        isActive: true
      });

      let skillName = customSkill.name;

      if (existingSkill) {
        // Use existing skill name (normalized)
        skillName = existingSkill.name;
      } else {
        // Create new unverified skill
        const newSkill = new Skill({
          name: customSkill.name,
          category: customSkill.category,
          description: customSkill.description || '',
          isVerified: false, // Custom skills are unverified
          isActive: true,
          submittedBy: userId, // Will be updated after user creation
          usageCount: 0
        });

        const savedSkill = await newSkill.save();
        createdSkills.push(savedSkill);
        skillName = savedSkill.name;
      }

      // Add to appropriate array
      if (customSkillsOffered.some(skill => skill.name === customSkill.name)) {
        customSkillsOfferedNames.push(skillName);
      }
      if (customSkillsWanted.some(skill => skill.name === customSkill.name)) {
        customSkillsWantedNames.push(skillName);
      }
    }

    return {
      customSkillsOfferedNames,
      customSkillsWantedNames,
      createdSkills
    };

  } catch (error) {
    console.error("Error processing custom skills:", error);
    return {
      customSkillsOfferedNames: [],
      customSkillsWantedNames: [],
      createdSkills: []
    };
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const { 
      name, 
      email, 
      password, 
      location, 
      profilePhoto, 
      skillsOffered, 
      skillsWanted, 
      customSkillsOffered,
      customSkillsWanted,
      availability, 
      isPublic, 
      role 
    } = await request.json();

    // Validate required fields
    if (!name || !email || !password || !location) {
      return NextResponse.json(
        { 
          error: "Missing required fields", 
          message: "Name, email, password, and location are required" 
        },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { 
          error: "Invalid email format", 
          message: "Please provide a valid email address" 
        },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        { 
          error: "Weak password", 
          message: "Password must be at least 8 characters long" 
        },
        { status: 400 }
      );
    }

    // Check password complexity
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]/;
    if (!passwordRegex.test(password)) {
      return NextResponse.json(
        { 
          error: "Weak password", 
          message: "Password must contain at least one letter and one number" 
        },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { 
          error: "User already exists", 
          message: "An account with this email already exists" 
        },
        { status: 409 }
      );
    }

    // Validate skills against database
    const validationResult = await validateUserSkills(skillsOffered, skillsWanted);
    if (!validationResult.valid) {
      return NextResponse.json(
        { 
          error: "Invalid skills", 
          message: validationResult.message,
          invalidSkills: validationResult.invalidSkills,
          suggestions: validationResult.suggestions
        },
        { status: 400 }
      );
    }

    // Process custom skills and create unverified skill entries
    const customSkillResults = await processCustomSkills(
      customSkillsOffered || [], 
      customSkillsWanted || [],
      null // userId will be set after user creation
    );

    // Combine verified skills with custom skill names
    const finalSkillsOffered = [
      ...(validationResult.validatedSkillsOffered || []),
      ...customSkillResults.customSkillsOfferedNames
    ];
    
    const finalSkillsWanted = [
      ...(validationResult.validatedSkillsWanted || []),
      ...customSkillResults.customSkillsWantedNames
    ];

    // Hash password
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = new User({
      name,
      email: email.toLowerCase(),
      passwordHash,
      location,
      profilePhoto: profilePhoto || '',
      skillsOffered: finalSkillsOffered || [],
      skillsWanted: finalSkillsWanted || [],
      availability: availability || [],
      isPublic: isPublic !== undefined ? isPublic : true,
      role: role || 'user'
    });

    await newUser.save();

    // Update submittedBy field for custom skills
    if (customSkillResults.createdSkills.length > 0) {
      await Skill.updateMany(
        { _id: { $in: customSkillResults.createdSkills.map(skill => skill._id) } },
        { submittedBy: newUser._id }
      );
    }

    // Update skill usage counts (only for verified skills)
    const verifiedSkills = [...(validationResult.validatedSkillsOffered), ...(validationResult.validatedSkillsWanted)];
    await updateSkillUsageCountsUtil([], verifiedSkills);

    // Generate JWT token
    const token = generateJWT({
      userId: newUser._id.toString(),
      email: newUser.email,
      role: newUser.role
    });

    // Return user data (excluding password)
    return NextResponse.json(
      {
        success: true,
        message: "User registered successfully",
        token,
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          location: newUser.location,
          profilePhoto: newUser.profilePhoto,
          skillsOffered: newUser.skillsOffered,
          skillsWanted: newUser.skillsWanted,
          availability: newUser.availability,
          isPublic: newUser.isPublic,
          role: newUser.role,
          createdAt: newUser.createdAt
        },
        customSkillsInfo: {
          submittedForVerification: customSkillResults.createdSkills.length,
          customSkills: customSkillResults.createdSkills.map(skill => ({
            name: skill.name,
            category: skill.category,
            status: 'pending_verification'
          }))
        }
      },
      { status: 201 }
    );

  } catch (error: any) {
    console.error("Registration error:", error);
    
    // Handle duplicate email error
    if (error.code === 11000) {
      return NextResponse.json(
        {
          error: "User already exists",
          message: "An account with this email already exists"
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
        message: "An error occurred during registration"
      },
      { status: 500 }
    );
  }
}
