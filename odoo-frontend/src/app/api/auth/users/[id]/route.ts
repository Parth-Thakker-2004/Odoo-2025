import { NextRequest, NextResponse } from "next/server";
import { authenticateToken, authorizeOwnerOrAdmin, authorizeRoles, createErrorResponse, createSuccessResponse } from "@/lib/auth-middleware";
import dbConnect from "@/lib/dbconnect";
import User from "@/models/User";
import Skill from "@/models/Skill";
import { validateUserSkills, updateSkillUsageCountsUtil } from "@/lib/skill-utils";

// Helper function to process custom skills for user updates
async function processCustomSkillsUpdate(
  customSkillsOffered: Array<{name: string, category: string, description?: string}> = [],
  customSkillsWanted: Array<{name: string, category: string, description?: string}> = [],
  userId: string
) {
  const allCustomSkills = [...customSkillsOffered, ...customSkillsWanted];
  const createdSkills: any[] = [];
  const customSkillsOfferedNames: string[] = [];
  const customSkillsWantedNames: string[] = [];

  try {
    for (const customSkill of allCustomSkills) {
      if (!customSkill.name || !customSkill.category) {
        continue;
      }

      const existingSkill = await Skill.findOne({
        name: { $regex: new RegExp(`^${customSkill.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
        isActive: true
      });

      let skillName = customSkill.name;

      if (existingSkill) {
        skillName = existingSkill.name;
      } else {
        const newSkill = new Skill({
          name: customSkill.name,
          category: customSkill.category,
          description: customSkill.description || '',
          isVerified: false,
          isActive: true,
          submittedBy: userId,
          usageCount: 0
        });

        const savedSkill = await newSkill.save();
        createdSkills.push(savedSkill);
        skillName = savedSkill.name;
      }

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

interface RouteParams {
  params: {
    id: string;
  };
}

// GET - Get user by ID (Owner or Admin only)
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    await dbConnect();
    
    const { user, error, status } = await authenticateToken(request);
    
    if (error) {
      return createErrorResponse("Authentication required", error, status);
    }

    // Check if user is owner or admin
    if (!authorizeOwnerOrAdmin(user!, params.id)) {
      return createErrorResponse(
        "Insufficient permissions",
        "You can only access your own profile",
        403
      );
    }

    // Find user by ID
    const targetUser = await User.findById(params.id).select('-passwordHash');
    
    if (!targetUser) {
      return createErrorResponse(
        "User not found",
        "User not found",
        404
      );
    }

    return createSuccessResponse({
      success: true,
      user: targetUser
    });

  } catch (error: any) {
    console.error("User fetch error:", error);
    return createErrorResponse(
      "Internal server error",
      "An error occurred while fetching user",
      500
    );
  }
}

// PUT - Update user (Owner or Admin only)
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    await dbConnect();
    
    const { user, error, status } = await authenticateToken(request);
    
    if (error) {
      return createErrorResponse("Authentication required", error, status);
    }

    // Check if user is owner or admin
    if (!authorizeOwnerOrAdmin(user!, params.id)) {
      return createErrorResponse(
        "Insufficient permissions",
        "You can only update your own profile",
        403
      );
    }

    const updateData = await request.json();
    
    // Get current user data for skill comparison
    const currentUser = await User.findById(params.id);
    if (!currentUser) {
      return createErrorResponse(
        "User not found",
        "User not found",
        404
      );
    }

    // Process custom skills if provided
    let customSkillResults: {
      customSkillsOfferedNames: string[];
      customSkillsWantedNames: string[];
      createdSkills: any[];
    } = { customSkillsOfferedNames: [], customSkillsWantedNames: [], createdSkills: [] };
    
    if (updateData.customSkillsOffered || updateData.customSkillsWanted) {
      customSkillResults = await processCustomSkillsUpdate(
        updateData.customSkillsOffered || [],
        updateData.customSkillsWanted || [],
        params.id
      );
    }

    // Validate skills if they are being updated
    let finalSkillsOffered = updateData.skillsOffered || currentUser.skillsOffered;
    let finalSkillsWanted = updateData.skillsWanted || currentUser.skillsWanted;

    if (updateData.skillsOffered || updateData.skillsWanted || updateData.customSkillsOffered || updateData.customSkillsWanted) {
      // Combine verified skills with custom skills
      if (updateData.skillsOffered || updateData.customSkillsOffered) {
        finalSkillsOffered = [
          ...(updateData.skillsOffered || []),
          ...customSkillResults.customSkillsOfferedNames
        ];
      }
      
      if (updateData.skillsWanted || updateData.customSkillsWanted) {
        finalSkillsWanted = [
          ...(updateData.skillsWanted || []),
          ...customSkillResults.customSkillsWantedNames
        ];
      }

      // Validate only the non-custom skills
      const skillsToValidateOffered = updateData.skillsOffered || [];
      const skillsToValidateWanted = updateData.skillsWanted || [];
      
      if (skillsToValidateOffered.length > 0 || skillsToValidateWanted.length > 0) {
        const validationResult = await validateUserSkills(
          skillsToValidateOffered,
          skillsToValidateWanted
        );
        
        if (!validationResult.valid) {
          return createErrorResponse(
            "Invalid skills",
            validationResult.message || "Invalid skills provided",
            400
          );
        }
        
        // Use validated skills combined with custom skills
        finalSkillsOffered = [
          ...(validationResult.validatedSkillsOffered || []),
          ...customSkillResults.customSkillsOfferedNames
        ];
        
        finalSkillsWanted = [
          ...(validationResult.validatedSkillsWanted || []),
          ...customSkillResults.customSkillsWantedNames
        ];
      }
    }

    // Update the updateData with final skills
    if (updateData.skillsOffered || updateData.customSkillsOffered) {
      updateData.skillsOffered = finalSkillsOffered;
    }
    if (updateData.skillsWanted || updateData.customSkillsWanted) {
      updateData.skillsWanted = finalSkillsWanted;
    }
    
    // Define allowed fields that can be updated
    const allowedUpdates = ['name', 'location', 'profilePhoto', 'skillsOffered', 'skillsWanted', 'availability', 'isPublic'];
    const updates: any = {};

    // Only allow specific fields to be updated
    allowedUpdates.forEach(field => {
      if (updateData[field] !== undefined) {
        updates[field] = updateData[field];
      }
    });

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      params.id,
      updates,
      { new: true, runValidators: true }
    ).select('-passwordHash');

    if (!updatedUser) {
      return createErrorResponse(
        "User not found",
        "User not found",
        404
      );
    }

    // Update skill usage counts if skills were changed
    if (updateData.skillsOffered || updateData.skillsWanted) {
      const oldAllSkills = [...(currentUser.skillsOffered || []), ...(currentUser.skillsWanted || [])];
      const newAllSkills = [...(updatedUser.skillsOffered || []), ...(updatedUser.skillsWanted || [])];
      await updateSkillUsageCountsUtil(oldAllSkills, newAllSkills);
    }

    return createSuccessResponse({
      success: true,
      message: "User updated successfully",
      user: updatedUser,
      customSkillsInfo: customSkillResults.createdSkills.length > 0 ? {
        submittedForVerification: customSkillResults.createdSkills.length,
        customSkills: customSkillResults.createdSkills.map(skill => ({
          name: skill.name,
          category: skill.category,
          status: 'pending_verification'
        }))
      } : undefined
    });

  } catch (error: any) {
    console.error("User update error:", error);
    
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err: any) => err.message);
      return createErrorResponse(
        "Validation failed",
        errors.join(", "),
        400
      );
    }

    return createErrorResponse(
      "Internal server error",
      "An error occurred while updating user",
      500
    );
  }
}

// DELETE - Deactivate user (Admin only)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    await dbConnect();
    
    const { user, error, status } = await authenticateToken(request);
    
    if (error) {
      return createErrorResponse("Authentication required", error, status);
    }

    // Check if user has admin role
    if (!authorizeRoles(user!, ['admin'])) {
      return createErrorResponse(
        "Insufficient permissions",
        "Admin access required",
        403
      );
    }

    // Deactivate user (set isBanned to true)
    const deactivatedUser = await User.findByIdAndUpdate(
      params.id,
      { isBanned: true },
      { new: true }
    ).select('-passwordHash');

    if (!deactivatedUser) {
      return createErrorResponse(
        "User not found",
        "User not found",
        404
      );
    }

    return createSuccessResponse({
      success: true,
      message: "User deactivated successfully",
      user: deactivatedUser
    });

  } catch (error: any) {
    console.error("User deactivation error:", error);
    return createErrorResponse(
      "Internal server error",
      "An error occurred while deactivating user",
      500
    );
  }
}
