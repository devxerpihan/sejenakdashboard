import { NextRequest, NextResponse } from "next/server";
import sgMail from "@sendgrid/mail";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const { 
      subject, 
      content, 
      targetType, 
      targetValue,
      apiKey: providedApiKey,
      senderEmail: providedSenderEmail, // Allow sender override
      type // "promo", "treatment_update", "booking_reminder"
    } = await req.json();

    if (!subject || !content || !targetType) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();

    // 1. Get API Key & Sender Email
    let apiKey = providedApiKey;
    let senderEmail = providedSenderEmail;

    // Fetch from DB if not provided or to confirm defaults
    if (!apiKey || !senderEmail) {
        const { data: settings, error: settingsError } = await supabase
            .from("app_settings")
            .select("key, value")
            .in("key", ["sendgrid_api_key", "sendgrid_sender_email"]);
        
        if (!settingsError && settings) {
            const keySetting = settings.find(s => s.key === "sendgrid_api_key");
            const emailSetting = settings.find(s => s.key === "sendgrid_sender_email");

            if (!apiKey && keySetting?.value) {
                apiKey = typeof keySetting.value === 'string' ? keySetting.value : JSON.stringify(keySetting.value).replace(/^"|"$/g, '');
            }
            if (!senderEmail && emailSetting?.value) {
                senderEmail = typeof emailSetting.value === 'string' ? emailSetting.value : JSON.stringify(emailSetting.value).replace(/^"|"$/g, '');
            }
        }
    }

    if (!apiKey || apiKey === "YOUR_SENDGRID_API_KEY") {
        return NextResponse.json({ error: "Invalid SendGrid API Key configuration" }, { status: 500 });
    }

    // Default sender if still missing
    if (!senderEmail) senderEmail = "noreply@sejenak.com";

    // Set the API key
    sgMail.setApiKey(apiKey);

    // 2. Fetch Recipients
    let profiles;
    let error;

    // We fetch BOTH preferences and notification_settings to be robust
    if (targetType === "tier") {
      const result = await supabase
        .from("profiles")
        .select("email, role, preferences, notification_settings, member_points!inner(tier)")
        .eq("member_points.tier", targetValue)
        .not("email", "is", null);
      
      profiles = result.data;
      error = result.error;
    } else {
      let query = supabase
        .from("profiles")
        .select("email, role, preferences, notification_settings")
        .not("email", "is", null);

      if (targetType === "role") {
        query = query.eq("role", targetValue);
      } else if (targetType === "user") {
        query = query.eq("id", targetValue);
      }

      const result = await query;
      profiles = result.data;
      error = result.error;
    }

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

    const validProfiles = profiles?.filter((p: any) => {
        if (!p.email || !p.email.includes("@")) return false;
        
        // Merge preferences: notification_settings takes precedence over preferences
        const mergedPrefs = { 
            ...(p.preferences || {}), 
            ...(p.notification_settings || {}) 
        };
        const val = mergedPrefs[prefKey];

        // If preference is explicitly set to false, skip.
        if (val === false || val === "false") return false;
        
        return true;
    }) || [];

    if (validProfiles.length === 0) {
      return NextResponse.json({ message: "No recipients found with valid emails", count: 0 });
    }

    // 3. Prepare Email Template
    // Determine header color based on type
    let headerColor = "#C1A7A3"; // Default (Promo)
    let headerTitle = "SEJENAK";
    
    if (type === "treatment_update") {
        headerColor = "#7C8B95"; // Slate blueish
        headerTitle = "TREATMENT UPDATE";
    } else if (type === "booking_reminder") {
        headerColor = "#8BA88E"; // Sage green
        headerTitle = "APPOINTMENT REMINDER";
    }

    const htmlContent = `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #F9FAFB; padding: 40px 20px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
          <!-- Header -->
          <div style="background-color: ${headerColor}; padding: 30px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 300; letter-spacing: 1px;">${headerTitle}</h1>
          </div>
          
          <!-- Content -->
          <div style="padding: 40px; color: #191919; line-height: 1.6;">
            <h2 style="color: ${headerColor}; font-size: 20px; margin-top: 0; margin-bottom: 20px; font-weight: 400;">${subject}</h2>
            
            <div style="color: #4B5563;">
              ${content.replace(/\n/g, '<br>')}
            </div>
          </div>
          
          <!-- Footer -->
          <div style="background-color: #F3F4F6; padding: 20px; text-align: center; color: #9CA3AF; font-size: 12px;">
            <p style="margin: 0 0 10px;">&copy; ${new Date().getFullYear()} Sejenak. All rights reserved.</p>
            <p style="margin: 0;">You received this email because you are a valued member of Sejenak.</p>
          </div>
        </div>
      </div>
    `;

    // 4. Send Emails (Bulk with Personalizations)
    const personalizations = validProfiles.map((p: any) => ({
      to: [{ email: p.email }]
    }));
    
    // Construct the message
    const msg = {
      from: senderEmail, // Use configured sender
      subject: subject,
      html: htmlContent,
    };

    const batchSize = 1000;
    for (let i = 0; i < personalizations.length; i += batchSize) {
      const batch = personalizations.slice(i, i + batchSize);
      await sgMail.send({
        ...msg,
        personalizations: batch
      });
    }

    return NextResponse.json({
      success: true,
      count: validProfiles.length
    });

  } catch (err: any) {
    console.error("Error sending email:", err);
    return NextResponse.json(
      { error: err.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
