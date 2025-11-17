"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Therapist } from "@/types/appointment";

export function useAppointmentTherapists(
  branchId: string | null
): {
  therapists: Therapist[];
  loading: boolean;
  error: string | null;
} {
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTherapists() {
      try {
        setLoading(true);
        setError(null);

        // Fetch therapists for the branch
        let therapistsQuery = supabase
          .from("therapists")
          .select("id, profile_id, branch_id")
          .eq("is_active", true);

        if (branchId) {
          therapistsQuery = therapistsQuery.eq("branch_id", branchId);
        }

        const { data: therapistsData, error: therapistsError } =
          await therapistsQuery;

        if (therapistsError) throw therapistsError;

        if (!therapistsData || therapistsData.length === 0) {
          setTherapists([]);
          setLoading(false);
          return;
        }

        // Fetch therapist profiles
        const profileIds = therapistsData
          .map((t) => t.profile_id)
          .filter(Boolean);

        if (profileIds.length === 0) {
          setTherapists([]);
          setLoading(false);
          return;
        }

        const { data: profiles, error: profilesError } = await supabase
          .from("profiles")
          .select("id, full_name, avatar_url")
          .in("id", profileIds);

        if (profilesError) throw profilesError;

        // Map therapists with profiles
        const therapistMap = new Map(
          (profiles || []).map((p: any) => [p.id, p])
        );

        const transformedTherapists: Therapist[] = therapistsData
          .map((therapist: any) => {
            const profile = therapist.profile_id
              ? therapistMap.get(therapist.profile_id)
              : null;

            return {
              id: therapist.id,
              name: profile?.full_name || "Unknown Therapist",
              avatar: profile?.avatar_url || undefined,
            };
          })
          .filter((t) => t.name !== "Unknown Therapist");

        setTherapists(transformedTherapists);
      } catch (err: any) {
        console.error("Error fetching therapists:", err);
        setError(err.message || "Failed to fetch therapists");
      } finally {
        setLoading(false);
      }
    }

    fetchTherapists();
  }, [branchId]);

  return { therapists, loading, error };
}

