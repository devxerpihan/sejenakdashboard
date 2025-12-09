import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { Expo, ExpoPushMessage } from "expo-server-sdk";

// This route is called by Vercel Cron
export async function GET(req: NextRequest) {
  // Verify Cron secret if needed (Vercel automatically protects these if configured)
  // if (req.headers.get('Authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
  //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  // }

  const supabase = getSupabaseAdmin();
  const expo = new Expo();
  
  try {
    const now = new Date();
    
    // We want to find bookings that are happening:
    // 1. Tomorrow (24 hours from now approx) for "1 Day Before"
    // 2. In 1 hour for "1 Hour Before"
    
    // Define windows (e.g., +/- 10 minutes tolerance)
    const toleranceMinutes = 15; // Run cron every 30 mins or 1 hour, check range
    
    // Fetch active templates
    const { data: templates, error: templateError } = await supabase
      .from("notification_templates")
      .select("*")
      .eq("is_active", true)
      .eq("type", "booking_reminder");
      
    if (templateError) throw templateError;
    if (!templates?.length) return NextResponse.json({ message: "No active templates" });

    let sentCount = 0;
    
    for (const template of templates) {
      if (!template.trigger_timing) continue;
      
      // Calculate target time range based on trigger_timing
      // e.g. "-1 day" means we look for bookings where (booking_time - 1 day) is NOW
      // So booking_time = NOW + 1 day
      
      let targetStart = new Date(now.getTime());
      let targetEnd = new Date(now.getTime());
      
      if (template.trigger_timing === "-1 day") {
        targetStart.setDate(targetStart.getDate() + 1);
        targetEnd.setDate(targetEnd.getDate() + 1);
      } else if (template.trigger_timing === "-1 hour") {
        targetStart.setHours(targetStart.getHours() + 1);
        targetEnd.setHours(targetEnd.getHours() + 1);
      } else if (template.trigger_timing === "+1 hour") {
        // Post appointment: booking_time = NOW - 1 hour (approx end time logic needed?)
        // Assuming booking_time is start time. 
        // If we want post-appointment, we need start_time + duration + 1 hour? 
        // For simplicity let's stick to start time triggers for now.
        targetStart.setHours(targetStart.getHours() - 1);
        targetEnd.setHours(targetEnd.getHours() - 1);
      } else {
        continue;
      }
      
      // Add tolerance window
      targetStart.setMinutes(targetStart.getMinutes() - toleranceMinutes);
      targetEnd.setMinutes(targetEnd.getMinutes() + toleranceMinutes);
      
      // Convert to ISO strings for query (Postgres)
      // Note: "bookings" table has separate date and time columns, which makes range queries tricky.
      // We need to construct a timestamp or query date + time separately.
      
      // Let's assume we query bookings on targetStart DATE
      const targetDateStr = targetStart.toISOString().split('T')[0];
      
      // Fetch bookings for that date
      // We need to join with profiles to get tokens and preferences
      const { data: bookings, error: bookingError } = await supabase
        .from("bookings")
        .select(`
          id,
          booking_date,
          booking_time,
          user_id,
          profiles:user_id (
            id,
            full_name,
            fcm_token,
            preferences
          )
        `)
        .eq("booking_date", targetDateStr)
        .eq("status", "confirmed"); // Only confirmed bookings
        
      if (bookingError) {
        console.error("Error fetching bookings:", bookingError);
        continue;
      }
      
      if (!bookings?.length) continue;
      
      const messages: ExpoPushMessage[] = [];
      const notificationRecords = [];
      
      for (const booking of bookings) {
        const profile = booking.profiles as any; // Cast for now
        if (!profile || !profile.fcm_token) continue;
        
        // Filter by preferences
        const prefs = profile.preferences || {};
        if (prefs["bookingReminders"] === false) continue;
        
        // Check exact time match within tolerance
        // booking_time is "HH:MM:SS" string
        const [bHours, bMinutes] = booking.booking_time.split(':').map(Number);
        const bookingDateTime = new Date(booking.booking_date);
        bookingDateTime.setHours(bHours, bMinutes, 0);
        
        // Check if bookingDateTime is within [targetStart, targetEnd]
        // Note: targetStart/End already adjusted for the offset (e.g. +1 day)
        // So we compare booking time to the "Expected Booking Time Window"
        
        // Actually simpler: 
        // If trigger is "-1 hour", we want bookings happening in (Now + 1h).
        // targetStart/End represents the TIME WINDOW of bookings we want to target.
        
        if (bookingDateTime >= targetStart && bookingDateTime <= targetEnd) {
          // Match!
          
          // Replace placeholders
          let body = template.content
            .replace("{{customer_name}}", profile.full_name || "Customer")
            .replace("{{booking_time}}", booking.booking_time.substring(0, 5)); // HH:MM
            
          messages.push({
            to: profile.fcm_token,
            sound: "default",
            title: template.title || "Appointment Reminder",
            body: body,
            data: { 
              bookingId: booking.id,
              type: "booking_reminder",
              click_action: "FLUTTER_NOTIFICATION_CLICK"
            },
          });
          
          notificationRecords.push({
            recipient_id: profile.id,
            title: template.title || "Appointment Reminder",
            message: body,
            type: "booking_reminder",
            created_at: new Date().toISOString(),
            is_read: false
          });
          
          sentCount++;
        }
      }
      
      // Send Batch
      if (messages.length > 0) {
        const chunks = expo.chunkPushNotifications(messages);
        for (const chunk of chunks) {
            try {
                await expo.sendPushNotificationsAsync(chunk);
            } catch (e) { console.error(e); }
        }
        
        // Save to DB
        if (notificationRecords.length > 0) {
           await supabase.from("notifications").insert(notificationRecords);
        }
      }
    }

    return NextResponse.json({ success: true, sent: sentCount });

  } catch (err: any) {
    console.error("Cron Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

