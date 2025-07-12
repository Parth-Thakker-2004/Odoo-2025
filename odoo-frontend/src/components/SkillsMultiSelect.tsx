import React, { useState, useRef, useEffect } from "react";

interface Skill {
  _id: string;
  name: string;
  category: string;
  description?: string;
  isVerified: boolean;
}

interface CustomSkill {
  name: string;
  category: string;
  isCustom: true;
}

interface SkillsMultiSelectProps {
  selected: string[];
  onChange: (selected: string[], customSkills: CustomSkill[]) => void;
  placeholder?: string;
  label?: string;
}

export const SkillsMultiSelect = ({ 
  selected = [], 
  onChange,
  placeholder = "Select skills...",
  label = "Skills"
}: SkillsMultiSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showOtherInput, setShowOtherInput] = useState(false);
  const [customSkillName, setCustomSkillName] = useState("");
  const [customSkillCategory, setCustomSkillCategory] = useState("");
  const [customSkills, setCustomSkills] = useState<CustomSkill[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  const ref = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Fetch skills and categories from database
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch verified skills
        const skillsResponse = await fetch('/api/skills?isVerified=true&isActive=true');
        if (skillsResponse.ok) {
          const skillsData = await skillsResponse.json();
          console.log('Skills API response:', skillsData);
          const skillsArray = skillsData.data?.skills || [];
          if (Array.isArray(skillsArray)) {
            setSkills(skillsArray);
          } else {
            console.error('Skills data is not an array:', skillsArray);
            setSkills([]);
          }
        } else {
          console.error('Failed to fetch skills:', skillsResponse.status);
          setError('Failed to load skills');
        }
        
        // Fetch categories
        const categoriesResponse = await fetch('/api/skills/categories');
        if (categoriesResponse.ok) {
          const categoriesData = await categoriesResponse.json();
          console.log('Categories API response:', categoriesData);
          const categoriesArray = categoriesData.data?.categories || [];
          if (Array.isArray(categoriesArray)) {
            setCategories(categoriesArray);
          } else {
            console.error('Categories data is not an array:', categoriesArray);
            // Set fallback categories
            setCategories([
              "Programming Languages",
              "Web Development", 
              "Data Science",
              "Mobile Development",
              "DevOps",
              "Design",
              "Other"
            ]);
          }
        } else {
          console.error('Failed to fetch categories:', categoriesResponse.status);
          // Set fallback categories
          setCategories([
            "Programming Languages",
            "Web Development", 
            "Data Science",
            "Mobile Development",
            "DevOps",
            "Design",
            "Other"
          ]);
        }
      } catch (error) {
        console.error('Error fetching skills data:', error);
        setError('Failed to load skills and categories');
        // Set fallback values
        setSkills([]);
        setCategories([
          "Programming Languages",
          "Web Development", 
          "Data Science",
          "Mobile Development",
          "DevOps",
          "Design",
          "Other"
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
        setShowOtherInput(false);
        setSearchTerm("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [ref]);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  const handleToggleSkill = (skillName: string) => {
    const newSelected = selected.includes(skillName)
      ? selected.filter(item => item !== skillName)
      : [...selected, skillName];
    
    onChange(newSelected, customSkills);
  };

  const handleAddCustomSkill = () => {
    if (!customSkillName.trim() || !customSkillCategory.trim()) {
      return;
    }

    const newCustomSkill: CustomSkill = {
      name: customSkillName.trim(),
      category: customSkillCategory.trim(),
      isCustom: true
    };

    const updatedCustomSkills = [...customSkills, newCustomSkill];
    const updatedSelected = [...selected, customSkillName.trim()];
    
    setCustomSkills(updatedCustomSkills);
    onChange(updatedSelected, updatedCustomSkills);
    
    // Reset form
    setCustomSkillName("");
    setCustomSkillCategory("");
    setShowOtherInput(false);
  };

  const handleRemoveSkill = (skillName: string) => {
    const newSelected = selected.filter(item => item !== skillName);
    
    // Check if it's a custom skill and remove from custom skills array
    const updatedCustomSkills = customSkills.filter(skill => skill.name !== skillName);
    setCustomSkills(updatedCustomSkills);
    
    onChange(newSelected, updatedCustomSkills);
  };

  // Filter skills based on search term
  const filteredSkills = Array.isArray(skills) ? skills.filter(skill =>
    skill.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    skill.category.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  // Group skills by category
  const groupedSkills = filteredSkills.reduce((acc, skill) => {
    if (!acc[skill.category]) {
      acc[skill.category] = [];
    }
    acc[skill.category].push(skill);
    return acc;
  }, {} as Record<string, Skill[]>);

  return (
    <div className="relative w-full" ref={ref}>
      <div
        className="flex min-h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex gap-1 flex-wrap">
          {selected.length === 0 ? (
            <span className="text-muted-foreground">{placeholder}</span>
          ) : (
            selected.map((skillName) => {
              const skill = Array.isArray(skills) ? skills.find(s => s.name === skillName) : null;
              const customSkill = customSkills.find(s => s.name === skillName);
              const isCustom = !!customSkill;
              
              return (
                <div
                  key={skillName}
                  className={`px-2 py-1 rounded-md flex items-center text-xs ${
                    isCustom 
                      ? 'bg-orange-100 text-orange-800 border border-orange-200' 
                      : 'bg-primary/10 text-primary'
                  }`}
                >
                  {skillName}
                  {isCustom && (
                    <span className="ml-1 text-xs opacity-60">(pending)</span>
                  )}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveSkill(skillName);
                    }}
                    className="ml-1 hover:opacity-80"
                  >
                    ×
                  </button>
                </div>
              );
            })
          )}
        </div>
        <div className="opacity-70">
          {isOpen ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="m18 15-6-6-6 6"/></svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="m6 9 6 6 6-6"/></svg>
          )}
        </div>
      </div>

      {isOpen && (
        <div className="absolute mt-1 max-h-80 w-full overflow-auto rounded-md bg-white border border-gray-200 z-50 shadow-lg">
          {/* Search input */}
          <div className="p-2 border-b border-gray-100">
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search skills..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-2 py-1 text-sm border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          {loading ? (
            <div className="p-4 text-center text-gray-500">
              Loading skills...
            </div>
          ) : error ? (
            <div className="p-4 text-center text-red-500">
              {error}
              <div className="mt-2 text-sm text-gray-600">
                You can still add custom skills below.
              </div>
            </div>
          ) : (
            <>
              {/* Skills list */}
              <div className="max-h-48 overflow-y-auto">
                {Object.keys(groupedSkills).length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    No skills found matching "{searchTerm}"
                  </div>
                ) : (
                  Object.entries(groupedSkills).map(([category, categorySkills]) => (
                    <div key={category}>
                      <div className="px-3 py-2 text-xs font-semibold text-gray-600 bg-gray-50 border-b border-gray-100">
                        {category}
                      </div>
                      {categorySkills.map((skill) => {
                        const isSelected = selected.includes(skill.name);
                        return (
                          <div
                            key={skill._id}
                            className={`relative flex cursor-pointer select-none items-center px-3 py-2 text-sm transition-colors hover:bg-gray-50 ${
                              isSelected ? "bg-blue-50 text-blue-700" : ""
                            }`}
                            onClick={() => handleToggleSkill(skill.name)}
                          >
                            <div className="flex h-4 w-4 items-center justify-center mr-2">
                              {isSelected && (
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><polyline points="20 6 9 17 4 12"/></svg>
                              )}
                            </div>
                            <div>
                              <div className="font-medium">{skill.name}</div>
                              {skill.description && (
                                <div className="text-xs text-gray-500 mt-0.5">
                                  {skill.description}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ))
                )}
              </div>

              {/* Other option */}
              <div className="border-t border-gray-200">
                {!showOtherInput ? (
                  <div
                    className="px-3 py-3 text-sm cursor-pointer hover:bg-gray-50 text-blue-600 font-medium"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowOtherInput(true);
                    }}
                  >
                    + Add Custom Skill
                  </div>
                ) : (
                  <div className="p-3 border-t border-gray-200 bg-gray-50">
                    <div className="space-y-2">
                      <input
                        type="text"
                        placeholder="Enter skill name..."
                        value={customSkillName}
                        onChange={(e) => setCustomSkillName(e.target.value)}
                        className="w-full px-2 py-1 text-sm border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        onClick={(e) => e.stopPropagation()}
                      />
                      <select
                        value={customSkillCategory}
                        onChange={(e) => setCustomSkillCategory(e.target.value)}
                        className="w-full px-2 py-1 text-sm border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <option value="">Select category...</option>
                        {Array.isArray(categories) && categories.map((category) => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                        <option value="Other">Other</option>
                      </select>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={handleAddCustomSkill}
                          disabled={!customSkillName.trim() || !customSkillCategory.trim()}
                          className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                        >
                          Add
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowOtherInput(false);
                            setCustomSkillName("");
                            setCustomSkillCategory("");
                          }}
                          className="px-3 py-1 text-xs bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                        >
                          Cancel
                        </button>
                      </div>
                      <div className="text-xs text-gray-600">
                        Custom skills will be marked as pending verification by an admin.
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};
