import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbconnect";
import User from "@/models/User";
import bcrypt from "bcryptjs";

const testUsers = [
  {
    name: "Alice Johnson",
    email: "alice@example.com",
    password: "password123",
    location: "San Francisco, CA",
    skillsOffered: ["React", "JavaScript", "TypeScript"],
    skillsWanted: ["Python", "Machine Learning"],
    availability: ["weekends", "evenings"],
    isPublic: true
  },
  {
    name: "Bob Smith",
    email: "bob@example.com", 
    password: "password123",
    location: "New York, NY",
    skillsOffered: ["Python", "Django", "PostgreSQL"],
    skillsWanted: ["React", "Vue.js"],
    availability: ["weekdays", "mornings"],
    isPublic: true
  },
  {
    name: "Carol Davis",
    email: "carol@example.com",
    password: "password123", 
    location: "Austin, TX",
    skillsOffered: ["Node.js", "Express", "MongoDB"],
    skillsWanted: ["GraphQL", "AWS"],
    availability: ["flexible"],
    isPublic: true
  },
  {
    name: "David Wilson",
    email: "david@example.com",
    password: "password123",
    location: "Seattle, WA", 
    skillsOffered: ["Java", "Spring Boot", "MySQL"],
    skillsWanted: ["Docker", "Kubernetes"],
    availability: ["weekends"],
    isPublic: false // Private profile
  }
];

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    console.log("Starting user seeding...");

    // Check if users already exist
    const existingUsersCount = await User.countDocuments();
    
    if (existingUsersCount >= 4) {
      const existingUsers = await User.find().select('name email').limit(5);
      return NextResponse.json({
        success: true,
        message: `Database already has ${existingUsersCount} users`,
        existingUsers: existingUsers.map(u => ({ name: u.name, email: u.email, id: u._id }))
      });
    }

    const userPromises = testUsers.map(async (userData) => {
      const existingUser = await User.findOne({ email: userData.email });
      
      if (!existingUser) {
        // Hash password
        const passwordHash = await bcrypt.hash(userData.password, 12);
        
        const user = new User({
          name: userData.name,
          email: userData.email,
          passwordHash: passwordHash,
          location: userData.location,
          profilePhoto: "", // Default empty
          skillsOffered: userData.skillsOffered,
          skillsWanted: userData.skillsWanted,
          availability: userData.availability,
          isPublic: userData.isPublic,
          isBanned: false,
          role: 'user'
        });
        
        const savedUser = await user.save();
        console.log(`✅ Created user: ${savedUser.name} (${savedUser.email})`);
        return {
          name: savedUser.name,
          email: savedUser.email,
          id: savedUser._id,
          isPublic: savedUser.isPublic
        };
      } else {
        console.log(`⚠️  User "${userData.email}" already exists`);
        return {
          name: existingUser.name,
          email: existingUser.email,
          id: existingUser._id,
          isPublic: existingUser.isPublic
        };
      }
    });

    const results = await Promise.all(userPromises);
    const totalUsers = await User.countDocuments();

    console.log(`✅ Successfully processed test users`);
    console.log(`📊 Total users in database: ${totalUsers}`);
    
    return NextResponse.json({
      success: true,
      message: "Test users processed successfully",
      data: {
        usersProcessed: results.length,
        totalUsers: totalUsers,
        users: results
      }
    });

  } catch (error: any) {
    console.error("❌ Error seeding users:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: "An error occurred while seeding users",
        details: error.message
      },
      { status: 500 }
    );
  }
}
