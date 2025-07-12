import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbconnect";
import Skill from "@/models/Skill";

const initialSkills = [
  // Programming Languages
  { name: "JavaScript", category: "Programming Languages", description: "Popular programming language for web development", aliases: ["JS"], tags: ["frontend", "backend", "web"] },
  { name: "Python", category: "Programming Languages", description: "Versatile programming language for data science, web development, and automation", aliases: ["Python3"], tags: ["data-science", "backend", "automation"] },
  { name: "Java", category: "Programming Languages", description: "Object-oriented programming language for enterprise applications", aliases: [], tags: ["enterprise", "backend"] },
  { name: "TypeScript", category: "Programming Languages", description: "Typed superset of JavaScript", aliases: ["TS"], tags: ["frontend", "backend", "web"] },
  { name: "C++", category: "Programming Languages", description: "High-performance programming language", aliases: ["CPP"], tags: ["systems", "performance"] },
  { name: "C#", category: "Programming Languages", description: "Microsoft's object-oriented programming language", aliases: ["CSharp"], tags: ["microsoft", "backend"] },
  { name: "Go", category: "Programming Languages", description: "Modern programming language developed by Google", aliases: ["Golang"], tags: ["backend", "google"] },
  { name: "Rust", category: "Programming Languages", description: "Systems programming language focused on safety and performance", aliases: [], tags: ["systems", "performance", "safety"] },
  { name: "PHP", category: "Programming Languages", description: "Server-side scripting language for web development", aliases: [], tags: ["backend", "web"] },
  { name: "Ruby", category: "Programming Languages", description: "Dynamic programming language with elegant syntax", aliases: [], tags: ["backend", "web"] },

  // Web Development
  { name: "React", category: "Web Development", description: "JavaScript library for building user interfaces", aliases: ["React.js", "ReactJS"], tags: ["frontend", "javascript", "spa"] },
  { name: "Vue.js", category: "Web Development", description: "Progressive JavaScript framework", aliases: ["Vue", "VueJS"], tags: ["frontend", "javascript", "spa"] },
  { name: "Angular", category: "Web Development", description: "TypeScript-based web application framework", aliases: ["AngularJS"], tags: ["frontend", "typescript", "spa"] },
  { name: "Node.js", category: "Web Development", description: "JavaScript runtime for server-side development", aliases: ["Node", "NodeJS"], tags: ["backend", "javascript"] },
  { name: "Express.js", category: "Web Development", description: "Web framework for Node.js", aliases: ["Express"], tags: ["backend", "nodejs", "api"] },
  { name: "Next.js", category: "Web Development", description: "React framework for production", aliases: ["NextJS"], tags: ["frontend", "react", "ssr"] },
  { name: "HTML", category: "Web Development", description: "Markup language for creating web pages", aliases: ["HTML5"], tags: ["frontend", "markup"] },
  { name: "CSS", category: "Web Development", description: "Stylesheet language for describing presentation", aliases: ["CSS3"], tags: ["frontend", "styling"] },
  { name: "Sass", category: "Web Development", description: "CSS extension language", aliases: ["SCSS"], tags: ["frontend", "css", "preprocessing"] },
  { name: "Tailwind CSS", category: "Web Development", description: "Utility-first CSS framework", aliases: ["Tailwind"], tags: ["frontend", "css", "framework"] },

  // Mobile Development
  { name: "React Native", category: "Mobile Development", description: "Framework for building native mobile apps using React", aliases: ["RN"], tags: ["mobile", "react", "cross-platform"] },
  { name: "Flutter", category: "Mobile Development", description: "Google's UI toolkit for building mobile apps", aliases: [], tags: ["mobile", "dart", "cross-platform"] },
  { name: "Swift", category: "Mobile Development", description: "Programming language for iOS development", aliases: [], tags: ["ios", "apple"] },
  { name: "Kotlin", category: "Mobile Development", description: "Modern programming language for Android development", aliases: [], tags: ["android", "google"] },

  // Data Science & ML
  { name: "Pandas", category: "Data Science", description: "Python library for data manipulation and analysis", aliases: [], tags: ["python", "data-analysis"] },
  { name: "NumPy", category: "Data Science", description: "Python library for numerical computing", aliases: [], tags: ["python", "numerical"] },
  { name: "TensorFlow", category: "Machine Learning", description: "Open-source machine learning framework", aliases: [], tags: ["ml", "google"] },
  { name: "PyTorch", category: "Machine Learning", description: "Machine learning library for Python", aliases: [], tags: ["ml", "python"] },

  // DevOps & Cloud
  { name: "Docker", category: "DevOps", description: "Platform for containerizing applications", aliases: [], tags: ["containers", "deployment"] },
  { name: "Kubernetes", category: "DevOps", description: "Container orchestration platform", aliases: ["K8s"], tags: ["containers", "orchestration"] },
  { name: "AWS", category: "Cloud Computing", description: "Amazon Web Services cloud platform", aliases: ["Amazon Web Services"], tags: ["cloud", "amazon"] },
  { name: "Azure", category: "Cloud Computing", description: "Microsoft's cloud computing service", aliases: ["Microsoft Azure"], tags: ["cloud", "microsoft"] },
  { name: "Google Cloud", category: "Cloud Computing", description: "Google's cloud computing platform", aliases: ["GCP", "Google Cloud Platform"], tags: ["cloud", "google"] },

  // Database
  { name: "MongoDB", category: "Database", description: "NoSQL document database", aliases: ["Mongo"], tags: ["nosql", "document"] },
  { name: "PostgreSQL", category: "Database", description: "Advanced open-source relational database", aliases: ["Postgres"], tags: ["sql", "relational"] },
  { name: "MySQL", category: "Database", description: "Popular open-source relational database", aliases: [], tags: ["sql", "relational"] },
  { name: "SQL", category: "Database", description: "Language for managing relational databases", aliases: [], tags: ["database", "query"] },

  // Design & Other
  { name: "Figma", category: "UI/UX Design", description: "Collaborative interface design tool", aliases: [], tags: ["design", "prototyping"] },
  { name: "Git", category: "DevOps", description: "Distributed version control system", aliases: [], tags: ["version-control"] },
  { name: "GraphQL", category: "Web Development", description: "Query language for APIs", aliases: [], tags: ["api", "query"] },
  { name: "REST API", category: "Web Development", description: "Architectural style for web services", aliases: ["RESTful API"], tags: ["api", "web-services"] }
];

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    console.log("Starting skills seeding...");

    // Check if skills already exist
    const existingSkillsCount = await Skill.countDocuments({ isVerified: true });
    
    if (existingSkillsCount > 0) {
      return NextResponse.json({
        success: true,
        message: `Database already has ${existingSkillsCount} verified skills`,
        existingCount: existingSkillsCount
      });
    }

    const skillPromises = initialSkills.map(async (skillData) => {
      const existingSkill = await Skill.findOne({
        name: { $regex: new RegExp(`^${skillData.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }
      });
      
      if (!existingSkill) {
        const skill = new Skill({
          ...skillData,
          isVerified: true, // These are pre-verified skills
          isActive: true,
          usageCount: 0
        });
        
        const savedSkill = await skill.save();
        console.log(`✅ Created skill: ${savedSkill.name}`);
        return savedSkill;
      } else {
        console.log(`⚠️  Skill "${skillData.name}" already exists`);
        return existingSkill;
      }
    });

    const results = await Promise.all(skillPromises);
    const newSkills = results.filter((result, index) => 
      !initialSkills.some(initial => initial.name === result.name && result.createdAt < new Date(Date.now() - 1000))
    );

    const totalSkills = await Skill.countDocuments({ isVerified: true, isActive: true });

    console.log(`✅ Successfully seeded skills`);
    console.log(`📊 New skills created: ${newSkills.length}`);
    console.log(`📊 Total verified skills: ${totalSkills}`);
    
    return NextResponse.json({
      success: true,
      message: "Skills seeded successfully",
      data: {
        newSkillsCreated: newSkills.length,
        totalVerifiedSkills: totalSkills,
        sampleSkills: results.slice(0, 5).map(skill => ({
          name: skill.name,
          category: skill.category,
          isVerified: skill.isVerified
        }))
      }
    });

  } catch (error: any) {
    console.error("❌ Error seeding skills:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: "An error occurred while seeding skills",
        details: error.message
      },
      { status: 500 }
    );
  }
}
