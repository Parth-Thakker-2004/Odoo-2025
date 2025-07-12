import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbconnect";
import LoginLog from "@/models/LoginLog";
import { verifyJWT } from "@/lib/jwt";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    // Get token from Authorization header
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Unauthorized", message: "No valid token provided" },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const decoded = verifyJWT(token);

    if (!decoded) {
      return NextResponse.json(
        { error: "Unauthorized", message: "Invalid token" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const limit = parseInt(searchParams.get("limit") || "50");
    const page = parseInt(searchParams.get("page") || "1");
    const success = searchParams.get("success");

    // Build query
    let query: any = {};
    
    if (userId) {
      query.userId = userId;
    }
    
    if (success !== null && success !== undefined) {
      query.success = success === "true";
    }

    // For regular users, only allow them to see their own logs
    if (decoded.role !== "admin" && userId !== decoded.userId) {
      query.userId = decoded.userId;
    }

    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      LoginLog.find(query)
        .sort({ loginTime: -1 })
        .limit(limit)
        .skip(skip)
        .populate("userId", "name email")
        .exec(),
      LoginLog.countDocuments(query)
    ]);

    return NextResponse.json({
      success: true,
      data: {
        logs,
        pagination: {
          current: page,
          total: Math.ceil(total / limit),
          count: logs.length,
          totalRecords: total
        }
      }
    });

  } catch (error: any) {
    console.error("Get login logs error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: "An error occurred while fetching login logs"
      },
      { status: 500 }
    );
  }
}
