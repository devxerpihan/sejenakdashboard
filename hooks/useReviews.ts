"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export interface Review {
  id: string;
  booking_id: string | null;
  user_id: string | null;
  therapist_id: string | null;
  treatment_id: string | null;
  rating: number;
  comment: string | null;
  cleanliness_rating: number | null;
  ambiance_rating: number | null;
  is_anonymous: boolean;
  is_approved: boolean;
  created_at: string;
  // Joined data
  user_name?: string;
  therapist_name?: string;
  treatment_name?: string;
  booking_date?: string;
}

export function useReviews(
  startDate?: Date,
  endDate?: Date,
  branchId?: string | null
): {
  reviews: Review[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
} {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      setError(null);

      // Build query
      let query = supabase
        .from("reviews")
        .select(`
          id,
          booking_id,
          user_id,
          therapist_id,
          treatment_id,
          rating,
          comment,
          cleanliness_rating,
          ambiance_rating,
          is_anonymous,
          is_approved,
          created_at
        `)
        .eq("is_approved", true)
        .order("created_at", { ascending: false });

      // Apply date filter if provided
      if (startDate) {
        const startDateStr = startDate.toISOString().split("T")[0];
        query = query.gte("created_at", startDateStr);
      }
      if (endDate) {
        const endDateStr = new Date(endDate);
        endDateStr.setHours(23, 59, 59, 999);
        query = query.lte("created_at", endDateStr.toISOString());
      }

      const { data: reviewsData, error: reviewsError } = await query;

      if (reviewsError) throw reviewsError;

      if (!reviewsData || reviewsData.length === 0) {
        setReviews([]);
        setLoading(false);
        return;
      }

      // Fetch related data
      const userIds = [...new Set((reviewsData || []).map((r: any) => r.user_id).filter(Boolean))];
      const therapistIds = [...new Set((reviewsData || []).map((r: any) => r.therapist_id).filter(Boolean))];
      const treatmentIds = [...new Set((reviewsData || []).map((r: any) => r.treatment_id).filter(Boolean))];
      const bookingIds = [...new Set((reviewsData || []).map((r: any) => r.booking_id).filter(Boolean))];

      // Fetch users
      let users: any[] = [];
      if (userIds.length > 0) {
        const { data: usersData } = await supabase
          .from("profiles")
          .select("id, full_name")
          .in("id", userIds);
        users = usersData || [];
      }

      // Fetch therapists
      let therapists: any[] = [];
      if (therapistIds.length > 0) {
        const { data: therapistsData } = await supabase
          .from("therapists")
          .select("id, profile_id")
          .in("id", therapistIds);

        if (therapistsData) {
          const therapistProfileIds = therapistsData.map((t: any) => t.profile_id).filter(Boolean);
          if (therapistProfileIds.length > 0) {
            const { data: therapistProfiles } = await supabase
              .from("profiles")
              .select("id, full_name")
              .in("id", therapistProfileIds);

            // Map therapist_id to therapist name
            therapists = therapistsData.map((t: any) => {
              const profile = therapistProfiles?.find((p: any) => p.id === t.profile_id);
              return {
                id: t.id,
                name: profile?.full_name || "Unknown Therapist",
              };
            });
          }
        }
      }

      // Fetch treatments
      let treatments: any[] = [];
      if (treatmentIds.length > 0) {
        const { data: treatmentsData } = await supabase
          .from("treatments")
          .select("id, name")
          .in("id", treatmentIds);
        treatments = treatmentsData || [];
      }

      // Fetch bookings for dates
      let bookings: any[] = [];
      if (bookingIds.length > 0) {
        const { data: bookingsData } = await supabase
          .from("bookings")
          .select("id, booking_date")
          .in("id", bookingIds);
        bookings = bookingsData || [];
      }

      // Create maps for quick lookup
      const userMap = new Map(users.map((u: any) => [u.id, u.full_name]));
      const therapistMap = new Map(therapists.map((t: any) => [t.id, t.name]));
      const treatmentMap = new Map(treatments.map((t: any) => [t.id, t.name]));
      const bookingMap = new Map(bookings.map((b: any) => [b.id, b.booking_date]));

      // Map reviews with joined data
      const mappedReviews: Review[] = (reviewsData || []).map((review: any) => ({
        id: review.id,
        booking_id: review.booking_id,
        user_id: review.user_id,
        therapist_id: review.therapist_id,
        treatment_id: review.treatment_id,
        rating: review.rating,
        comment: review.comment,
        cleanliness_rating: review.cleanliness_rating,
        ambiance_rating: review.ambiance_rating,
        is_anonymous: review.is_anonymous || false,
        is_approved: review.is_approved !== false,
        created_at: review.created_at,
        user_name: review.is_anonymous ? "Anonymous" : (userMap.get(review.user_id) || "Unknown User"),
        therapist_name: therapistMap.get(review.therapist_id) || "Unknown Therapist",
        treatment_name: treatmentMap.get(review.treatment_id) || "Unknown Treatment",
        booking_date: review.booking_id ? bookingMap.get(review.booking_id) : null,
      }));

      setReviews(mappedReviews);
    } catch (err: any) {
      console.error("Error fetching reviews:", err);
      setError(err.message || "Failed to fetch reviews");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [startDate, endDate, branchId]);

  return { reviews, loading, error, refetch: fetchReviews };
}



