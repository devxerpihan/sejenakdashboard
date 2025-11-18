"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Appointment } from "@/types/appointment";

export function useAppointments(
  branchId: string | null,
  startDate: Date,
  endDate: Date
): {
  appointments: Appointment[];
  loading: boolean;
  error: string | null;
} {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAppointments() {
      try {
        setLoading(true);
        setError(null);

        // Format dates properly for PostgreSQL date comparison
        const startDateStr = startDate.toISOString().split("T")[0];
        const endDateStr = endDate.toISOString().split("T")[0];

        // Fetch all bookings with pagination
        let allBookings: any[] = [];
        let page = 0;
        const pageSize = 1000;
        let hasMore = true;

        while (hasMore) {
          let bookingsQuery = supabase
            .from("bookings")
            .select(`
              id,
              booking_date,
              booking_time,
              duration,
              status,
              therapist_id,
              actual_therapist_id,
              room_id,
              treatment_id,
              user_id,
              branch_id
            `)
            .gte("booking_date", startDateStr)
            .lte("booking_date", endDateStr)
            .order("booking_date", { ascending: true })
            .order("booking_time", { ascending: true })
            .range(page * pageSize, (page + 1) * pageSize - 1);

          if (branchId) {
            bookingsQuery = bookingsQuery.eq("branch_id", branchId);
          }

          const { data: bookings, error: bookingsError } = await bookingsQuery;

          if (bookingsError) throw bookingsError;

          if (bookings && bookings.length > 0) {
            allBookings = allBookings.concat(bookings);
            hasMore = bookings.length === pageSize;
            page++;
          } else {
            hasMore = false;
          }
        }

        // If branchId was provided, also fetch bookings with null branch_id (old data) and combine
        if (branchId) {
          let allNullBranchBookings: any[] = [];
          let nullPage = 0;
          let hasMoreNull = true;

          while (hasMoreNull) {
            const nullBookingsQuery = supabase
              .from("bookings")
              .select(`
                id,
                booking_date,
                booking_time,
                duration,
                status,
                therapist_id,
                actual_therapist_id,
                room_id,
                treatment_id,
                user_id,
                branch_id
              `)
              .gte("booking_date", startDateStr)
              .lte("booking_date", endDateStr)
              .is("branch_id", null)
              .order("booking_date", { ascending: true })
              .order("booking_time", { ascending: true })
              .range(nullPage * pageSize, (nullPage + 1) * pageSize - 1);

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

        if (allBookings.length === 0) {
          setAppointments([]);
          setLoading(false);
          return;
        }

        // Fetch related data - include bookings with null values
        const therapistIds = [
          ...new Set(
            allBookings
              .map((b) => b.actual_therapist_id || b.therapist_id)
              .filter((id) => id !== null && id !== undefined)
          ),
        ];
        const roomIds = [
          ...new Set(
            allBookings
              .map((b) => b.room_id)
              .filter((id) => id !== null && id !== undefined)
          ),
        ];
        const treatmentIds = [
          ...new Set(
            allBookings
              .map((b) => b.treatment_id)
              .filter((id) => id !== null && id !== undefined)
          ),
        ];
        const userIds = [
          ...new Set(
            allBookings
              .map((b) => b.user_id)
              .filter((id) => id !== null && id !== undefined)
          ),
        ];

        // Fetch therapists with profiles
        let therapists: any[] = [];
        if (therapistIds.length > 0) {
          const { data: therapistsData } = await supabase
            .from("therapists")
            .select("id, profile_id")
            .in("id", therapistIds);

          if (therapistsData) {
            const profileIds = therapistsData
              .map((t) => t.profile_id)
              .filter(Boolean);
            if (profileIds.length > 0) {
              const { data: profiles } = await supabase
                .from("profiles")
                .select("id, full_name, avatar_url")
                .in("id", profileIds);

              // Map therapists with profiles
              therapists = therapistsData.map((t) => {
                const profile = profiles?.find((p) => p.id === t.profile_id);
                return {
                  ...t,
                  name: profile?.full_name || "Unknown Therapist",
                  avatar: profile?.avatar_url || undefined,
                };
              });
            }
          }
        }

        // Fetch rooms
        const { data: rooms } =
          roomIds.length > 0
            ? await supabase
                .from("rooms")
                .select("id, name")
                .in("id", roomIds)
            : { data: [] };

        // Fetch treatments
        const { data: treatments } =
          treatmentIds.length > 0
            ? await supabase
                .from("treatments")
                .select("id, name")
                .in("id", treatmentIds)
            : { data: [] };

        // Fetch customer profiles
        let customers: any[] = [];
        if (userIds.length > 0) {
          const chunkSize = 50;
          for (let i = 0; i < userIds.length; i += chunkSize) {
            const chunk = userIds.slice(i, i + chunkSize);
            const { data: chunkData } = await supabase
              .from("profiles")
              .select("id, full_name")
              .in("id", chunk);
            if (chunkData) {
              customers = customers.concat(chunkData);
            }
          }
        }

        // Create lookup maps
        const therapistMap = new Map(
          therapists.map((t) => [t.id, t])
        );
        const roomMap = new Map((rooms || []).map((r: any) => [r.id, r]));
        const treatmentMap = new Map(
          (treatments || []).map((t: any) => [t.id, t])
        );
        const customerMap = new Map(
          customers.map((c: any) => [c.id, c])
        );

        // Color palette for appointments
        const colors = [
          "#FED7AA", // Light orange
          "#E9D5FF", // Light purple
          "#D1FAE5", // Light green
          "#FEE2E2", // Light red
          "#DBEAFE", // Light blue
          "#FEF3C7", // Light yellow
        ];

        // Transform bookings to appointments
        const transformedAppointments: Appointment[] = allBookings.map(
          (booking: any, index: number) => {
            // Calculate end time from start time + duration
            const [startHour, startMinute] = booking.booking_time
              .split(":")
              .map(Number);
            const durationMinutes = booking.duration || 60; // Default to 60 minutes
            const endMinutes = startMinute + durationMinutes;
            const endHour = startHour + Math.floor(endMinutes / 60);
            const finalEndMinute = endMinutes % 60;

            const startTime = `${String(startHour).padStart(2, "0")}:${String(
              startMinute
            ).padStart(2, "0")}`;
            const endTime = `${String(endHour).padStart(2, "0")}:${String(
              finalEndMinute
            ).padStart(2, "0")}`;

            // Get therapist (prefer actual_therapist_id, fallback to therapist_id)
            // Handle null values - old data may not have therapist
            const therapistId =
              booking.actual_therapist_id || booking.therapist_id || null;
            const therapist = therapistId
              ? therapistMap.get(therapistId)
              : null;

            // Get room - handle null values
            const room = booking.room_id
              ? roomMap.get(booking.room_id)
              : null;

            // Get treatment - handle null values
            const treatment = booking.treatment_id
              ? treatmentMap.get(booking.treatment_id)
              : null;

            // Get customer - handle null values
            const customer = booking.user_id
              ? customerMap.get(booking.user_id)
              : null;

            // Map status
            let status: Appointment["status"] = "pending";
            const bookingStatus = String(booking.status || "").toLowerCase();
            if (bookingStatus === "completed") status = "completed";
            else if (bookingStatus === "check-in" || bookingStatus === "check_in")
              status = "check-in";
            else if (bookingStatus === "cancelled") status = "cancelled";
            else status = "pending";

            // Assign color based on index
            const color = colors[index % colors.length];

            // Format booking_date to ensure it's in YYYY-MM-DD format
            // PostgreSQL date fields return as strings in YYYY-MM-DD format
            let bookingDateStr = "";
            if (booking.booking_date) {
              // If it's already a string in YYYY-MM-DD format, use it directly
              if (typeof booking.booking_date === "string") {
                bookingDateStr = booking.booking_date.split("T")[0]; // Remove time part if present
              } else {
                // If it's a Date object, format it
                const date = new Date(booking.booking_date);
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, "0");
                const day = String(date.getDate()).padStart(2, "0");
                bookingDateStr = `${year}-${month}-${day}`;
              }
            }

            return {
              id: booking.id,
              treatmentName: treatment?.name || "No Treatment",
              patientName: customer?.full_name || "Unknown Customer",
              startTime,
              endTime,
              bookingDate: bookingDateStr,
              room: room?.name || "No Room",
              roomId: booking.room_id || undefined,
              therapistId: therapistId || "", // Empty string for null therapist
              status,
              color,
            };
          }
        );

        setAppointments(transformedAppointments);
      } catch (err: any) {
        console.error("Error fetching appointments:", err);
        setError(err.message || "Failed to fetch appointments");
      } finally {
        setLoading(false);
      }
    }

    fetchAppointments();
  }, [branchId, startDate, endDate]);

  return { appointments, loading, error };
}

