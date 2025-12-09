import { NextRequest, NextResponse } from "next/server";
import { Expo, ExpoPushMessage } from "expo-server-sdk";
import { getSupabaseAdmin } from "@/lib/supabase";

const expo = new Expo();

export async function POST(req: NextRequest) {
  try {
    const { title, message, targetType, targetValue, type } = await req.json();

    if (!title || !message || !targetType) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();

    // 1. Fetch Tokens based on target
    let query: any = supabase
      .from("profiles")
      .select("id, fcm_token, role, preferences")
      .not("fcm_token", "is", null);

    if (targetType === "role") {
      query = query.eq("role", targetValue);
    } else if (targetType === "user") {
      query = query.eq("id", targetValue);
    } else if (targetType === "tier") {
      // Join member_points to filter by tier
      query = supabase
        .from("profiles")
        .select("id, fcm_token, role, preferences, member_points!inner(tier)")
        .eq("member_points.tier", targetValue)
        .not("fcm_token", "is", null);
    }
    // if targetType === 'all', no filter needed (fetch all with tokens)

    const { data: profiles, error } = await query;

    if (error) {
      console.error("Error fetching profiles:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Filter by preferences
    // Type mapping: 
    // "booking_reminder" -> "bookingReminders"
    // "treatment_update" -> "treatmentUpdates"
    // "promo" -> "promotionalOffers"
    
    let prefKey = "promotionalOffers"; // default
    if (type === "booking_reminder") prefKey = "bookingReminders";
    if (type === "treatment_update") prefKey = "treatmentUpdates";

    // Filter valid profiles:
    // 1. Must have token
    // 2. Preferences must NOT be explicitly false (default true if undefined)
    const validProfiles = profiles?.filter((p: any) => {
        if (!Expo.isExpoPushToken(p.fcm_token)) return false;
        
        // Check preferences
        const prefs = p.preferences || {};
        // If preference is explicitly set to false, skip. undefined/null implies true/opt-in by default
        if (prefs[prefKey] === false) return false;
        
        return true;
    }) || [];
    
    // 2. Prepare Expo Messages
    const messages: ExpoPushMessage[] = [];
    const tickets = [];

    if (validProfiles.length > 0) {
      for (const profile of validProfiles) {
        messages.push({
          to: profile.fcm_token!,
          sound: "default",
          title: title,
          body: message,
          data: { 
            targetType, 
            targetValue,
            type: type || "promo", // Default to promo if not specified
            click_action: "FLUTTER_NOTIFICATION_CLICK"
          },
        });
      }

      // 3. Send Notifications via Expo (Chunking)
      const chunks = expo.chunkPushNotifications(messages);
      
      for (const chunk of chunks) {
        try {
          const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
          tickets.push(...ticketChunk);
        } catch (error) {
          console.error("Error sending chunk:", error);
        }
      }
    }

    // 4. Save Notification to Database (for in-app history)
    // We only save for people we actually sent to (validProfiles)
    // Actually, for broadcast logs, we might want to log who received it.
    // The previous implementation bulk inserted based on targetType logic blindly.
    // Now that we filter by preferences, we should ideally only insert for validProfiles.
    
    // HOWEVER, "notifications" table is usually "in-app notification center".
    // If a user disables PUSH, do they also want to disable IN-APP?
    // Usually NO. Push preference controls the phone popup. In-app usually receives all unless specific setting.
    // The prompt says "gated by the user preferences", usually referring to the intrusive channels (push/email).
    // Let's assume for now this gates BOTH to be safe and respect "I don't want promo" fully.
    
    const notificationRecords = validProfiles.map((p: any) => ({
        recipient_id: p.id,
        recipient_role: null, // We link to specific ID now since we filtered list
        title,
        message,
        type: type || "broadcast",
        created_at: new Date().toISOString(),
        is_read: false
    }));

    if (notificationRecords.length > 0) {
      // Batch insert in chunks of 1000 to avoid limits
      const batchSize = 1000;
      for (let i = 0; i < notificationRecords.length; i += batchSize) {
        const batch = notificationRecords.slice(i, i + batchSize);
        const { error: insertError } = await supabase
          .from("notifications")
          .insert(batch);

        if (insertError) {
          console.error("Error saving notification batch to DB:", insertError);
        }
      }
    }

    return NextResponse.json({
      success: true,
      count: validProfiles.length,
      ticketsCount: tickets.length
    });

  } catch (err: any) {
    console.error("Error in send-notification:", err);
    return NextResponse.json(
      { error: err.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
