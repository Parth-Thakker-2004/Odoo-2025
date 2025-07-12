import dbConnect from "@/lib/dbconnect";
import Skill from "@/models/Skill";

const initialSkills = [
  // Programming Languages
  { name: "JavaScript", category: "Programming Languages", description: "Popular programming language for web development", aliases: ["JS"], tags: ["frontend", "backend", "web"], level: "intermediate" },
  { name: "Python", category: "Programming Languages", description: "Versatile programming language for data science, web development, and automation", aliases: ["Python3"], tags: ["data-science", "backend", "automation"], level: "intermediate" },
  { name: "Java", category: "Programming Languages", description: "Object-oriented programming language for enterprise applications", aliases: [], tags: ["enterprise", "backend"], level: "intermediate" },
  { name: "TypeScript", category: "Programming Languages", description: "Typed superset of JavaScript", aliases: ["TS"], tags: ["frontend", "backend", "web"], level: "intermediate" },
  { name: "C++", category: "Programming Languages", description: "High-performance programming language", aliases: ["CPP"], tags: ["systems", "performance"], level: "advanced" },
  { name: "C#", category: "Programming Languages", description: "Microsoft's object-oriented programming language", aliases: ["CSharp"], tags: ["microsoft", "backend"], level: "intermediate" },
  { name: "Go", category: "Programming Languages", description: "Modern programming language developed by Google", aliases: ["Golang"], tags: ["backend", "google"], level: "intermediate" },
  { name: "Rust", category: "Programming Languages", description: "Systems programming language focused on safety and performance", aliases: [], tags: ["systems", "performance", "safety"], level: "advanced" },
  { name: "PHP", category: "Programming Languages", description: "Server-side scripting language for web development", aliases: [], tags: ["backend", "web"], level: "intermediate" },
  { name: "Ruby", category: "Programming Languages", description: "Dynamic programming language with elegant syntax", aliases: [], tags: ["backend", "web"], level: "intermediate" },

  // Web Development
  { name: "React", category: "Web Development", description: "JavaScript library for building user interfaces", aliases: ["React.js", "ReactJS"], tags: ["frontend", "javascript", "spa"], level: "intermediate" },
  { name: "Vue.js", category: "Web Development", description: "Progressive JavaScript framework", aliases: ["Vue", "VueJS"], tags: ["frontend", "javascript", "spa"], level: "intermediate" },
  { name: "Angular", category: "Web Development", description: "TypeScript-based web application framework", aliases: ["AngularJS"], tags: ["frontend", "typescript", "spa"], level: "intermediate" },
  { name: "Node.js", category: "Web Development", description: "JavaScript runtime for server-side development", aliases: ["Node", "NodeJS"], tags: ["backend", "javascript"], level: "intermediate" },
  { name: "Express.js", category: "Web Development", description: "Web framework for Node.js", aliases: ["Express"], tags: ["backend", "nodejs", "api"], level: "intermediate" },
  { name: "Next.js", category: "Web Development", description: "React framework for production", aliases: ["NextJS"], tags: ["frontend", "react", "ssr"], level: "intermediate" },
  { name: "HTML", category: "Web Development", description: "Markup language for creating web pages", aliases: ["HTML5"], tags: ["frontend", "markup"], level: "beginner" },
  { name: "CSS", category: "Web Development", description: "Stylesheet language for describing presentation", aliases: ["CSS3"], tags: ["frontend", "styling"], level: "beginner" },
  { name: "Sass", category: "Web Development", description: "CSS extension language", aliases: ["SCSS"], tags: ["frontend", "css", "preprocessing"], level: "intermediate" },
  { name: "Tailwind CSS", category: "Web Development", description: "Utility-first CSS framework", aliases: ["Tailwind"], tags: ["frontend", "css", "framework"], level: "intermediate" },

  // Mobile Development
  { name: "React Native", category: "Mobile Development", description: "Framework for building native mobile apps using React", aliases: ["RN"], tags: ["mobile", "react", "cross-platform"], level: "intermediate" },
  { name: "Flutter", category: "Mobile Development", description: "Google's UI toolkit for building mobile apps", aliases: [], tags: ["mobile", "dart", "cross-platform"], level: "intermediate" },
  { name: "Swift", category: "Mobile Development", description: "Programming language for iOS development", aliases: [], tags: ["ios", "apple"], level: "intermediate" },
  { name: "Kotlin", category: "Mobile Development", description: "Modern programming language for Android development", aliases: [], tags: ["android", "google"], level: "intermediate" },
  { name: "Xamarin", category: "Mobile Development", description: "Microsoft's cross-platform mobile development framework", aliases: [], tags: ["mobile", "microsoft", "cross-platform"], level: "intermediate" },

  // Data Science
  { name: "Pandas", category: "Data Science", description: "Python library for data manipulation and analysis", aliases: [], tags: ["python", "data-analysis"], level: "intermediate" },
  { name: "NumPy", category: "Data Science", description: "Python library for numerical computing", aliases: [], tags: ["python", "numerical"], level: "intermediate" },
  { name: "Matplotlib", category: "Data Science", description: "Python plotting library", aliases: [], tags: ["python", "visualization"], level: "intermediate" },
  { name: "R", category: "Data Science", description: "Programming language for statistical computing", aliases: [], tags: ["statistics", "analysis"], level: "intermediate" },
  { name: "SQL", category: "Database", description: "Language for managing relational databases", aliases: [], tags: ["database", "query"], level: "intermediate" },

  // Machine Learning
  { name: "TensorFlow", category: "Machine Learning", description: "Open-source machine learning framework", aliases: [], tags: ["ml", "google"], level: "advanced" },
  { name: "PyTorch", category: "Machine Learning", description: "Machine learning library for Python", aliases: [], tags: ["ml", "python"], level: "advanced" },
  { name: "Scikit-learn", category: "Machine Learning", description: "Machine learning library for Python", aliases: ["sklearn"], tags: ["ml", "python"], level: "intermediate" },

  // DevOps
  { name: "Docker", category: "DevOps", description: "Platform for containerizing applications", aliases: [], tags: ["containers", "deployment"], level: "intermediate" },
  { name: "Kubernetes", category: "DevOps", description: "Container orchestration platform", aliases: ["K8s"], tags: ["containers", "orchestration"], level: "advanced" },
  { name: "Jenkins", category: "DevOps", description: "Automation server for CI/CD", aliases: [], tags: ["ci-cd", "automation"], level: "intermediate" },
  { name: "Terraform", category: "DevOps", description: "Infrastructure as code tool", aliases: [], tags: ["iac", "infrastructure"], level: "intermediate" },

  // Cloud Computing
  { name: "AWS", category: "Cloud Computing", description: "Amazon Web Services cloud platform", aliases: ["Amazon Web Services"], tags: ["cloud", "amazon"], level: "intermediate" },
  { name: "Azure", category: "Cloud Computing", description: "Microsoft's cloud computing service", aliases: ["Microsoft Azure"], tags: ["cloud", "microsoft"], level: "intermediate" },
  { name: "Google Cloud", category: "Cloud Computing", description: "Google's cloud computing platform", aliases: ["GCP", "Google Cloud Platform"], tags: ["cloud", "google"], level: "intermediate" },

  // Database
  { name: "MongoDB", category: "Database", description: "NoSQL document database", aliases: ["Mongo"], tags: ["nosql", "document"], level: "intermediate" },
  { name: "PostgreSQL", category: "Database", description: "Advanced open-source relational database", aliases: ["Postgres"], tags: ["sql", "relational"], level: "intermediate" },
  { name: "MySQL", category: "Database", description: "Popular open-source relational database", aliases: [], tags: ["sql", "relational"], level: "intermediate" },
  { name: "Redis", category: "Database", description: "In-memory data structure store", aliases: [], tags: ["cache", "in-memory"], level: "intermediate" },

  // UI/UX Design
  { name: "Figma", category: "UI/UX Design", description: "Collaborative interface design tool", aliases: [], tags: ["design", "prototyping"], level: "intermediate" },
  { name: "Adobe Photoshop", category: "Graphics Design", description: "Image editing software", aliases: ["Photoshop"], tags: ["design", "editing"], level: "intermediate" },
  { name: "Sketch", category: "UI/UX Design", description: "Digital design toolkit", aliases: [], tags: ["design", "mac"], level: "intermediate" },

  // Other Popular Skills
  { name: "Git", category: "DevOps", description: "Distributed version control system", aliases: [], tags: ["version-control"], level: "intermediate" },
  { name: "GraphQL", category: "Web Development", description: "Query language for APIs", aliases: [], tags: ["api", "query"], level: "intermediate" },
  { name: "REST API", category: "Web Development", description: "Architectural style for web services", aliases: ["RESTful API"], tags: ["api", "web-services"], level: "intermediate" },
];

export async function seedSkills() {
  try {
    await dbConnect();

    console.log("Starting skills seeding...");

    // Clear existing skills (optional - remove if you want to keep existing skills)
    // await Skill.deleteMany({});

    const skillPromises = initialSkills.map(async (skillData) => {
      const existingSkill = await Skill.findByName(skillData.name);
      
      if (!existingSkill) {
        const skill = new Skill({
          ...skillData,
          isVerified: true, // These are pre-verified skills
          isActive: true,
          usageCount: 0
        });
        
        return await skill.save();
      } else {
        console.log(`Skill "${skillData.name}" already exists, skipping...`);
        return existingSkill;
      }
    });

    const results = await Promise.all(skillPromises);
    const newSkills = results.filter(result => result.isNew);

    console.log(`✅ Successfully seeded ${newSkills.length} new skills`);
    console.log(`📊 Total skills in database: ${results.length}`);
    
    return {
      success: true,
      newSkillsCount: newSkills.length,
      totalSkillsCount: results.length
    };

  } catch (error) {
    console.error("❌ Error seeding skills:", error);
    throw error;
  }
}

// Run this function if the file is executed directly
if (require.main === module) {
  seedSkills()
    .then(() => {
      console.log("✅ Skills seeding completed successfully");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Skills seeding failed:", error);
      process.exit(1);
    });
}
