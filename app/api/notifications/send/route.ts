import { NextRequest, NextResponse } from "next/server";
import { Expo, ExpoPushMessage } from "expo-server-sdk";
import { getSupabaseAdmin } from "@/lib/supabase";

const expo = new Expo();

export async function POST(req: NextRequest) {
  try {
    const { title, message, targetType, targetValue, type } = await req.json();

    console.log(`Sending notification: Type=${type}, Target=${targetType}`);

    if (!title || !message || !targetType) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();

    // 1. Fetch Tokens based on target
    // We fetch BOTH preferences and notification_settings to be robust
    let query: any = supabase
      .from("profiles")
      .select("id, fcm_token, role, preferences, notification_settings")
      .not("fcm_token", "is", null);

    if (targetType === "role") {
      query = query.eq("role", targetValue);
    } else if (targetType === "user") {
      query = query.eq("id", targetValue);
    } else if (targetType === "tier") {
      // Join member_points to filter by tier
      query = supabase
        .from("profiles")
        .select("id, fcm_token, role, preferences, notification_settings, member_points!inner(tier)")
        .eq("member_points.tier", targetValue)
        .not("fcm_token", "is", null);
    }

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

    console.log(`Filter Key: ${prefKey}`);

    // Filter valid profiles:
    // 1. Must have token
    // 2. Preferences must NOT be explicitly false
    const validProfiles = profiles?.filter((p: any) => {
        if (!Expo.isExpoPushToken(p.fcm_token)) return false;
        
        // Merge preferences: notification_settings takes precedence over preferences
        const mergedPrefs = { 
            ...(p.preferences || {}), 
            ...(p.notification_settings || {}) 
        };
        
        const val = mergedPrefs[prefKey];

        // Debug logging to verify values
        console.log(`User ${p.id} merged prefs:`, JSON.stringify(mergedPrefs));
        console.log(`Checking key '${prefKey}': value is ${val} (type: ${typeof val})`);

        // If preference is explicitly set to false (boolean or string), skip. 
        if (val === false || val === "false") {
            console.log(`User ${p.id} filtered out due to preferences.`);
            return false;
        }
        
        return true;
    }) || [];
    
    console.log(`Profiles found: ${profiles?.length || 0}, Valid after filter: ${validProfiles.length}`);

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
    const notificationRecords = validProfiles.map((p: any) => ({
        recipient_id: p.id,
        recipient_role: null,
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
