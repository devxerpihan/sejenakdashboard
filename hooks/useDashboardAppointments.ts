"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { DashboardAppointment } from "@/components/dashboard/AllAppointmentsTable";

export function useDashboardAppointments(
  branchId: string | null,
  limit: number = 5,
  startDate?: Date,
  endDate?: Date
): {
  appointments: DashboardAppointment[];
  loading: boolean;
  error: string | null;
} {
  const [appointments, setAppointments] = useState<DashboardAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAppointments() {
      try {
        setLoading(true);
        setError(null);

        // Format dates properly for PostgreSQL date comparison
        const startDateStr = startDate ? startDate.toISOString().split("T")[0] : undefined;
        const endDateStr = endDate ? endDate.toISOString().split("T")[0] : undefined;

        // Fetch all bookings with pagination, then limit in memory
        let allBookings: any[] = [];
        let page = 0;
        const pageSize = 1000;
        let hasMore = true;

        while (hasMore && allBookings.length < limit) {
          let query = supabase
            .from("bookings")
            .select("id, booking_date, booking_time, status, user_id, therapist_id, actual_therapist_id, treatment_id")
            .order("booking_date", { ascending: false })
            .order("booking_time", { ascending: false })
            .range(page * pageSize, (page + 1) * pageSize - 1);

          if (startDateStr) {
            query = query.gte("booking_date", startDateStr);
          }
          if (endDateStr) {
            query = query.lte("booking_date", endDateStr);
          }
          if (branchId) {
            query = query.eq("branch_id", branchId);
          }

          const { data: bookings, error: fetchError } = await query;

          if (fetchError) throw fetchError;

          if (bookings && bookings.length > 0) {
            allBookings = allBookings.concat(bookings);
            hasMore = bookings.length === pageSize && allBookings.length < limit;
            page++;
          } else {
            hasMore = false;
          }
        }

        // If branchId was provided, also fetch bookings with null branch_id (old data) and combine
        if (branchId && allBookings.length < limit) {
          let allNullBranchBookings: any[] = [];
          let nullPage = 0;
          let hasMoreNull = true;

          while (hasMoreNull && allBookings.length + allNullBranchBookings.length < limit) {
            let nullBookingsQuery = supabase
              .from("bookings")
              .select("id, booking_date, booking_time, status, user_id, therapist_id, actual_therapist_id, treatment_id")
              .is("branch_id", null)
              .order("booking_date", { ascending: false })
              .order("booking_time", { ascending: false })
              .range(nullPage * pageSize, (nullPage + 1) * pageSize - 1);

            if (startDateStr) {
              nullBookingsQuery = nullBookingsQuery.gte("booking_date", startDateStr);
            }
            if (endDateStr) {
              nullBookingsQuery = nullBookingsQuery.lte("booking_date", endDateStr);
            }

            const { data: nullBookings, error: nullError } = await nullBookingsQuery;

            if (nullError) throw nullError;

            if (nullBookings && nullBookings.length > 0) {
              allNullBranchBookings = allNullBranchBookings.concat(nullBookings);
              hasMoreNull = nullBookings.length === pageSize;
              nullPage++;
            } else {
              hasMoreNull = false;
            }
          }

          // Combine bookings with branch_id and null branch_id
          allBookings = [...allBookings, ...allNullBranchBookings];
        }

        // Apply limit after combining all data
        const bookings = allBookings.slice(0, limit);

        if (!bookings || bookings.length === 0) {
          setAppointments([]);
          setLoading(false);
          return;
        }

        // Fetch related data - handle null values for old data
        const userIds = [...new Set(bookings.map((b: any) => b.user_id).filter((id: any) => id !== null && id !== undefined))];
        const therapistIds = [...new Set(bookings.map((b: any) => b.actual_therapist_id || b.therapist_id).filter((id: any) => id !== null && id !== undefined))];
        const treatmentIds = [...new Set(bookings.map((b: any) => b.treatment_id).filter((id: any) => id !== null && id !== undefined))];

        // Fetch users - batch in chunks if too many (Supabase .in() has limits)
        let users: any[] = [];
        if (userIds.length > 0) {
          // Supabase .in() can handle up to 100 items, but let's batch in chunks of 50 to be safe
          const chunkSize = 50;
          for (let i = 0; i < userIds.length; i += chunkSize) {
            const chunk = userIds.slice(i, i + chunkSize);
            const { data: chunkData, error: chunkError } = await supabase
              .from("profiles")
              .select("id, full_name, avatar_url")
              .in("id", chunk);
            
            if (chunkError) {
              console.error("Error fetching profiles chunk:", chunkError);
            } else {
              users = users.concat(chunkData || []);
            }
          }
        }

        // Fetch therapists and treatments
        const [therapistsResult, treatmentsResult] = await Promise.all([
          therapistIds.length > 0
            ? supabase.from("therapists").select("id, profile_id").in("id", therapistIds)
            : Promise.resolve({ data: [], error: null }),
          treatmentIds.length > 0
            ? supabase.from("treatments").select("id, name").in("id", treatmentIds)
            : Promise.resolve({ data: [], error: null }),
        ]);

        const therapists = therapistsResult.data || [];
        const treatments = treatmentsResult.data || [];
        
        // If some users weren't found, try fetching them individually (in case of RLS issues or data issues)
        const foundUserIds = new Set(users.map((u: any) => u.id));
        const missingUserIds = userIds.filter((id: string) => !foundUserIds.has(id));
        
        if (missingUserIds.length > 0) {
          // Try fetching missing users in batches
          const batchSize = 20;
          for (let i = 0; i < Math.min(missingUserIds.length, 100); i += batchSize) {
            const batch = missingUserIds.slice(i, i + batchSize);
            const batchPromises = batch.map((userId: string) =>
              supabase.from("profiles").select("id, full_name, avatar_url").eq("id", userId).maybeSingle()
            );
            
            const batchResults = await Promise.all(batchPromises);
            batchResults.forEach((result) => {
              if (result.data && !result.error) {
                users.push(result.data);
              } else if (result.error) {
                console.error("Error fetching user:", result.error, "for userId:", batch[batchResults.indexOf(result)]);
              }
            });
          }
        }
        

        // Fetch therapist profiles
        const therapistProfileIds = therapists.map((t: any) => t.profile_id).filter(Boolean);
        const therapistProfilesResult =
          therapistProfileIds.length > 0
            ? await supabase.from("profiles").select("id, full_name, avatar_url").in("id", therapistProfileIds)
            : { data: [], error: null };
        const therapistProfiles = therapistProfilesResult.data || [];

        // Create lookup maps
        const userMap = new Map(users.map((u: any) => [u.id, u]));
        const therapistMap = new Map(therapists.map((t: any) => [t.id, t]));
        const therapistProfileMap = new Map(therapistProfiles.map((p: any) => [p.id, p]));
        const treatmentMap = new Map(treatments.map((t: any) => [t.id, t]));

        // Transform data to match component interface
        const transformedAppointments: DashboardAppointment[] = bookings.map((booking: any) => {
          const bookingDate = new Date(booking.booking_date);
          const bookingTime = booking.booking_time || "00:00";
          
          // Format date: "28 May 2025 - 11:15 AM"
          const dateStr = bookingDate.toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric",
          });
          
          // Format time: convert "11:15:00" to "11:15 AM"
          const [hours, minutes] = bookingTime.split(":");
          const hour = parseInt(hours);
          const ampm = hour >= 12 ? "PM" : "AM";
          const hour12 = hour % 12 || 12;
          const timeStr = `${hour12}:${minutes} ${ampm}`;

          const customer = userMap.get(booking.user_id);
          const therapistId = booking.actual_therapist_id || booking.therapist_id;
          const therapist = therapistId ? therapistMap.get(therapistId) : null;
          const therapistProfile = therapist ? therapistProfileMap.get(therapist.profile_id) : null;
          const treatment = treatmentMap.get(booking.treatment_id);

          // Map status
          let status: DashboardAppointment["status"] = "pending";
          if (booking.status === "completed") status = "completed";
          else if (booking.status === "cancelled") status = "cancelled";
          else if (booking.status === "confirmed") status = "confirmed";
          else if (booking.status === "scheduled") status = "schedule";
          else status = "pending";

          // Handle null user_id for old data
          let customerName = "Unknown Customer";
          let customerAvatar: string | undefined = undefined;
          
          if (booking.user_id) {
            if (customer) {
              customerName = customer.full_name || "Unknown Customer";
              customerAvatar = customer.avatar_url || undefined;
            } else {
              // User ID exists but profile not found - show as Unknown Customer
              customerName = "Unknown Customer";
            }
          } else {
            // No user_id - old data
            customerName = "Unknown Customer";
          }

          return {
            id: booking.id,
            customerName,
            customerAvatar,
            therapistName: therapistProfile?.full_name || (therapistId ? "Unknown Therapist" : "No Therapist"),
            therapistAvatar: therapistProfile?.avatar_url || undefined,
            date: `${dateStr} - ${timeStr}`,
            treatment: treatment?.name || (booking.treatment_id ? "Unknown Treatment" : "No Treatment"),
            status,
          };
        });

        setAppointments(transformedAppointments);
      } catch (err: any) {
        console.error("Error fetching appointments:", err);
        setError(err.message || "Failed to fetch appointments");
      } finally {
        setLoading(false);
      }
    }

    fetchAppointments();
  }, [branchId, limit, startDate, endDate]);

  return { appointments, loading, error };
}

