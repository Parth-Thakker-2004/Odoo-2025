import Skill from "@/models/Skill";

export interface SkillValidationResult {
  valid: boolean;
  message?: string;
  validatedSkillsOffered: string[];
  validatedSkillsWanted: string[];
  invalidSkills: string[];
  suggestions?: string[];
}

/**
 * Validates skills against the verified skills database
 * Returns validated skills and suggestions for invalid ones
 */
export async function validateUserSkills(
  skillsOffered: string[] = [], 
  skillsWanted: string[] = []
): Promise<SkillValidationResult> {
  try {
    const allSkills = [...new Set([...skillsOffered, ...skillsWanted])];
    
    if (allSkills.length === 0) {
      return {
        valid: true,
        validatedSkillsOffered: [],
        validatedSkillsWanted: [],
        invalidSkills: []
      };
    }

    // Find all verified skills that match the provided skill names (case-insensitive)
    const verifiedSkills = await Skill.find({
      $or: [
        { name: { $in: allSkills.map(skill => new RegExp(`^${skill}$`, 'i')) } },
        { aliases: { $in: allSkills.map(skill => new RegExp(`^${skill}$`, 'i')) } }
      ],
      isVerified: true,
      isActive: true
    }).select('name aliases');

    // Create a map of provided skills to verified skill names
    const skillMap = new Map<string, string>();
    const verifiedSkillNames = new Set<string>();

    verifiedSkills.forEach(skill => {
      verifiedSkillNames.add(skill.name);
      
      // Check direct name match
      allSkills.forEach(providedSkill => {
        if (skill.name.toLowerCase() === providedSkill.toLowerCase()) {
          skillMap.set(providedSkill, skill.name);
        }
        // Check alias match
        skill.aliases.forEach(alias => {
          if (alias.toLowerCase() === providedSkill.toLowerCase()) {
            skillMap.set(providedSkill, skill.name);
          }
        });
      });
    });

    // Identify invalid skills and get suggestions
    const invalidSkills: string[] = [];
    const suggestions: string[] = [];

    for (const skill of allSkills) {
      if (!skillMap.has(skill)) {
        invalidSkills.push(skill);
        
        // Try to find similar skills for suggestions
        const similarSkills = await Skill.find({
          $or: [
            { name: { $regex: skill, $options: 'i' } },
            { aliases: { $regex: skill, $options: 'i' } },
            { tags: { $regex: skill, $options: 'i' } }
          ],
          isVerified: true,
          isActive: true
        }).limit(3).select('name');
        
        suggestions.push(...similarSkills.map(s => s.name));
      }
    }

    // Map skills to verified names
    const validatedSkillsOffered = skillsOffered
      .map(skill => skillMap.get(skill))
      .filter(Boolean) as string[];
      
    const validatedSkillsWanted = skillsWanted
      .map(skill => skillMap.get(skill))
      .filter(Boolean) as string[];

    // Return result
    if (invalidSkills.length > 0) {
      return {
        valid: false,
        message: `The following skills are not verified: ${invalidSkills.join(', ')}. Please choose from verified skills or submit them for verification.`,
        invalidSkills,
        validatedSkillsOffered,
        validatedSkillsWanted,
        suggestions: [...new Set(suggestions)]
      };
    }

    return {
      valid: true,
      validatedSkillsOffered,
      validatedSkillsWanted,
      invalidSkills: []
    };

  } catch (error) {
    console.error("Error validating skills:", error);
    return {
      valid: false,
      message: "Error validating skills. Please try again.",
      invalidSkills: [],
      validatedSkillsOffered: [],
      validatedSkillsWanted: []
    };
  }
}

/**
 * Updates skill usage counts when user skills change
 */
export async function updateSkillUsageCountsUtil(
  oldSkills: string[] = [], 
  newSkills: string[] = []
): Promise<void> {
  try {
    const skillsToDecrement = oldSkills.filter(skill => !newSkills.includes(skill));
    const skillsToIncrement = newSkills.filter(skill => !oldSkills.includes(skill));
    
    // Decrement count for removed skills
    if (skillsToDecrement.length > 0) {
      await Skill.updateMany(
        { 
          name: { $in: skillsToDecrement }, 
          isVerified: true, 
          isActive: true,
          usageCount: { $gt: 0 } // Ensure we don't go below 0
        },
        { $inc: { usageCount: -1 } }
      );
    }
    
    // Increment count for added skills
    if (skillsToIncrement.length > 0) {
      await Skill.updateMany(
        { 
          name: { $in: skillsToIncrement }, 
          isVerified: true, 
          isActive: true 
        },
        { $inc: { usageCount: 1 } }
      );
    }
  } catch (error) {
    console.error("Error updating skill usage counts:", error);
    // Don't throw error as this is not critical
  }
}

/**
 * Gets popular skills for suggestions
 */
export async function getPopularSkills(limit: number = 20): Promise<any[]> {
  try {
    return await Skill.find({
      isVerified: true,
      isActive: true,
      usageCount: { $gt: 0 }
    })
    .select('name category usageCount')
    .sort({ usageCount: -1 })
    .limit(limit);
  } catch (error) {
    console.error("Error getting popular skills:", error);
    return [];
  }
}

/**
 * Search skills with autocomplete suggestions
 */
export async function searchSkillsForAutocomplete(query: string, limit: number = 10): Promise<any[]> {
  try {
    if (!query || query.length < 2) {
      return [];
    }

    return await Skill.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { aliases: { $regex: query, $options: 'i' } }
      ],
      isVerified: true,
      isActive: true
    })
    .select('name category')
    .sort({ usageCount: -1, name: 1 })
    .limit(limit);
  } catch (error) {
    console.error("Error searching skills:", error);
    return [];
  }
}
