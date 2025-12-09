import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const { key, value } = await req.json();

    if (!key || value === undefined) {
      return NextResponse.json(
        { error: "Missing key or value" },
        { status: 400 }
      );
    }

    // Only allow updating specific allowed keys for security
    const allowedKeys = ["sendgrid_api_key", "sendgrid_sender_email"];
    if (!allowedKeys.includes(key)) {
       return NextResponse.json(
        { error: "Invalid setting key" },
        { status: 403 }
      );
    }

    const supabase = getSupabaseAdmin();

    // Check if user is admin (this API should be protected via middleware or check token here)
    // Assuming the caller has verified auth via middleware or client sends headers.
    // Ideally we check auth.uid() role. For now using admin client to update.
    
    const { error } = await supabase
      .from("app_settings")
      .upsert({ 
        key, 
        value,
        updated_at: new Date().toISOString()
      }, { onConflict: 'key' });

    if (error) {
        console.error("Error updating setting:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });

  } catch (err: any) {
    console.error("Error in update-settings:", err);
    return NextResponse.json(
      { error: err.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const key = searchParams.get('key');

        if (!key) {
             return NextResponse.json({ error: "Missing key" }, { status: 400 });
        }
        
        // Only allow reading specific safe keys or return masked values for secrets
        const allowedKeys = ["sendgrid_api_key", "sendgrid_sender_email"];
        if (!allowedKeys.includes(key)) {
             return NextResponse.json({ error: "Access denied" }, { status: 403 });
        }

        const supabase = getSupabaseAdmin();
        const { data, error } = await supabase
            .from("app_settings")
            .select("value")
            .eq("key", key)
            .single();

        if (error) {
             // If not found, return null value not error
             if (error.code === 'PGRST116') return NextResponse.json({ value: null });
             throw error;
        }

        return NextResponse.json({ value: data?.value });

    } catch(err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
