import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { imageUrl } = await request.json();

    if (!imageUrl) {
      return NextResponse.json(
        { error: "Image URL is required" },
        { status: 400 }
      );
    }

    // Update Clerk user profile image using Clerk's Management API
    // Note: This requires CLERK_SECRET_KEY to be set in environment variables
    const clerkSecretKey = process.env.CLERK_SECRET_KEY;
    
    if (!clerkSecretKey) {
      return NextResponse.json(
        { error: "Clerk secret key not configured" },
        { status: 500 }
      );
    }

    const response = await fetch(`https://api.clerk.com/v1/users/${userId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${clerkSecretKey}`,
      },
      body: JSON.stringify({
        image_url: imageUrl,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: "Failed to update Clerk profile image", details: errorData },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error("Error updating Clerk avatar:", error);
    return NextResponse.json(
      { error: "Internal server error", message: error.message },
      { status: 500 }
    );
  }
}

