"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Appointment } from "@/types/appointment";

export interface AppointmentDetail extends Appointment {
  // Extended fields for details page
  price: string;
  bookedBy: string;
  lastUpdatedBy: string;
  consentForm: string;
  consentFormStatus: "submitted" | "not_submitted";
  snapshot: string;
  snapshotStatus: "taken" | "not_taken";
  note: string;
  
  // Customer details
  customerEmail: string;
  customerPhone?: string;
  membershipLevel?: string;
  totalVisits?: number;
  customerAvatar?: string;
  
  // Scalp & Hair Condition (Placeholder for now until schema is confirmed)
  scalpCondition?: {
    before?: string;
    after?: string;
    resultBefore?: string;
    resultAfter?: string;
    note?: string;
  };
  hairTreatment?: {
    before?: string;
    after?: string;
    type?: string;
    note?: string;
  };
  
  // Reviews & Notes
  therapistNote?: {
    therapist: string;
    date: string;
    treatment: string;
    rating: number;
    note: string;
  };
  customerReview?: {
    date: string;
    treatment: string;
    rating: number;
    review: string;
    tip?: string;
  };
  feedback?: {
    customerName: string;
    therapistName: string;
    treatmentName: string;
    cleanliness: string;
  };
}

export function useAppointment(id: string) {
  const [appointment, setAppointment] = useState<AppointmentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    async function fetchAppointment() {
      try {
        setLoading(true);
        setError(null);

        // Fetch booking details
        const { data: booking, error: bookingError } = await supabase
          .from("bookings")
          .select("*")
          .eq("id", id)
          .single();

        if (bookingError) throw bookingError;
        if (!booking) throw new Error("Appointment not found");

        // Fetch related data in parallel
        const [
          { data: treatment },
          { data: room },
          { data: therapist },
          { data: customer },
          { data: review },
          { count: bookingsCount, error: countError } // For total visits
        ] = await Promise.all([
          // Treatment
          booking.treatment_id 
            ? supabase.from("treatments").select("*").eq("id", booking.treatment_id).single()
            : Promise.resolve({ data: null }),
            
          // Room
          booking.room_id
            ? supabase.from("rooms").select("*").eq("id", booking.room_id).single()
            : Promise.resolve({ data: null }),
            
          // Therapist (get profile for name)
          (booking.actual_therapist_id || booking.therapist_id)
            ? supabase.from("therapists").select("*, profiles:profile_id(*)").eq("id", booking.actual_therapist_id || booking.therapist_id).single()
            : Promise.resolve({ data: null }),
            
          // Customer (User)
          booking.user_id
            ? supabase.from("profiles").select("*, member_points(*)").eq("id", booking.user_id).single()
            : Promise.resolve({ data: null }),
            
          // Review
          supabase.from("reviews").select("*").eq("booking_id", id).single(),
          
          // Count customer bookings for total visits
          booking.user_id
             ? supabase.from("bookings").select("id", { count: "exact", head: true }).eq("user_id", booking.user_id)
             : Promise.resolve({ count: null, error: null }),
        ]);

        // Process Data
        
        // Date & Time formatting
        const bookingDate = new Date(booking.booking_date);
        // Ensure proper date display without timezone shifts
        const year = bookingDate.getFullYear();
        const month = bookingDate.toLocaleDateString("en-US", { month: "long" });
        const day = bookingDate.getDate();
        const dateStr = `${day} ${month} ${year}`;
        
        const bookingDateStr = `${year}-${String(bookingDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        
        // Calculate Time
        const [startHour, startMinute] = (booking.booking_time || "00:00").split(":").map(Number);
        const durationMinutes = booking.duration || treatment?.duration || 60;
        const endMinutes = startMinute + durationMinutes;
        const endHour = startHour + Math.floor(endMinutes / 60);
        const finalEndMinute = endMinutes % 60;
        
        const startTime = `${String(startHour).padStart(2, "0")}:${String(startMinute).padStart(2, "0")}`;
        const endTime = `${String(endHour).padStart(2, "0")}:${String(finalEndMinute).padStart(2, "0")}`;

        // Customer Membership
        const memberPoints = customer?.member_points?.[0] || customer?.member_points;
        const membershipLevel = memberPoints?.tier || "Classic";

        // Determine statuses based on available data (mock logic for now as schema fields might vary)
        // In a real scenario, check booking.consent_form_signed or similar
        const hasConsent = false; // Default to false/not submitted if field doesn't exist
        const hasSnapshot = false; // Default to false/not taken if field doesn't exist

        // Construct AppointmentDetail object
        const detail: AppointmentDetail = {
          id: booking.id,
          treatmentName: treatment?.name || "No Treatment",
          patientName: customer?.full_name || "Unknown Customer",
          startTime,
          endTime,
          bookingDate: dateStr, // Display format
          room: room?.name || "No Room",
          roomId: booking.room_id,
          therapistId: booking.actual_therapist_id || booking.therapist_id,
          status: booking.status === "confirmed" ? "pending" : (booking.status || "pending"), // Map status if needed
          color: "#FEF3C7", // Default color
          
          // Details
          price: treatment?.price ? Number(treatment.price).toLocaleString("id-ID") : "0",
          bookedBy: "Customer App", // Placeholder/Default
          lastUpdatedBy: "Receptionist App", // Placeholder/Default
          
          consentForm: hasConsent ? "Submitted" : "Not Submitted",
          consentFormStatus: hasConsent ? "submitted" : "not_submitted",
          
          snapshot: hasSnapshot ? "Taken" : "Not Taken",
          snapshotStatus: hasSnapshot ? "taken" : "not_taken",
          
          note: booking.notes || "-",
          
          // Customer
          customerEmail: customer?.email || "-",
          customerPhone: customer?.phone || "-",
          membershipLevel: membershipLevel,
          totalVisits: bookingsCount || 0,
          customerAvatar: customer?.avatar_url,

          // Review
          customerReview: review ? {
            date: new Date(review.created_at).toLocaleDateString("en-GB", { day: 'numeric', month: 'short', year: 'numeric' }),
            treatment: treatment?.name || "Treatment",
            rating: review.rating,
            review: review.comment || "",
            tip: review.tip_amount ? Number(review.tip_amount).toLocaleString("id-ID") : undefined
          } : undefined,

          // Feedback - mocked for now as I don't see a feedback table
          // If reviews has cleanliness, use it
          feedback: review ? {
            customerName: customer?.full_name || "Customer",
            therapistName: therapist?.profiles?.full_name || "Therapist",
            treatmentName: treatment?.name || "Treatment",
            cleanliness: review.cleanliness_rating ? (review.cleanliness_rating >= 4 ? "Excellent cleanliness" : "Good cleanliness") : "-"
          } : undefined,
          
          // Mocked placeholders for scalp/hair until schema is clear
          scalpCondition: undefined,
          hairTreatment: undefined,
          therapistNote: undefined // Could be same as booking.notes?
        };

        setAppointment(detail);
      } catch (err: any) {
        console.error("Error fetching appointment:", err);
        setError(err.message || "Failed to fetch appointment");
      } finally {
        setLoading(false);
      }
    }

    fetchAppointment();
  }, [id]);

  return { appointment, loading, error };
}
