import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "File must be an image" },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size must be less than 10MB" },
        { status: 400 }
      );
    }

    // Get Supabase admin client (bypasses RLS)
    let supabase;
    try {
      supabase = getSupabaseAdmin();
    } catch (error: any) {
      return NextResponse.json(
        { 
          error: "Server configuration error: SUPABASE_SERVICE_ROLE_KEY is not set. Please add it to your environment variables.",
          details: "This key is required to bypass RLS policies for storage uploads."
        },
        { status: 500 }
      );
    }

    // Upload image to Supabase storage
    const fileExt = file.name.split(".").pop();
    const fileName = `avatars/${userId}-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = fileName;

    // Convert File to ArrayBuffer for Supabase
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { error: uploadError } = await supabase.storage
      .from("avatar")
      .upload(filePath, buffer, {
        cacheControl: "3600",
        upsert: true,
        contentType: file.type,
      });

    if (uploadError) {
      console.error("Supabase upload error:", uploadError);
      return NextResponse.json(
        { error: `Failed to upload image: ${uploadError.message}` },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from("avatar")
      .getPublicUrl(filePath);

    return NextResponse.json({ 
      success: true, 
      url: urlData.publicUrl,
      path: filePath
    });
  } catch (error: any) {
    console.error("Error uploading avatar:", error);
    return NextResponse.json(
      { error: "Internal server error", message: error.message },
      { status: 500 }
    );
  }
}

