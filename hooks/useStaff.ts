"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Staff } from "@/types/staff";

export function useStaff(): {
  staff: Staff[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
} {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch staff profiles (therapist, receptionist, cook_helper, spa_attendant)
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, full_name, email, phone, avatar_url, date_of_birth, address, created_at, role")
        .in("role", ["therapist", "receptionist", "cook_helper", "spa_attendant"])
        .order("full_name", { ascending: true });

      if (profilesError) throw profilesError;

      // Fetch therapists to get branch information
      const { data: therapists, error: therapistsError } = await supabase
        .from("therapists")
        .select("id, profile_id, branch_id, is_active");

      if (therapistsError && therapistsError.code !== "PGRST116") {
        console.warn("Error fetching therapists:", therapistsError);
      }

      // Fetch branches for branch names
      const { data: branches } = await supabase
        .from("branches")
        .select("id, name");

      const branchMap = new Map((branches || []).map((b: any) => [b.id, b.name]));

      // Map profiles to Staff type
      const mappedStaff: Staff[] = (profiles || []).map((profile: any) => {
        // Find therapist record if exists
        const therapist = therapists?.find((t: any) => t.profile_id === profile.id);
        const branchId = therapist?.branch_id;
        const branchName = branchId ? branchMap.get(branchId) || "Unknown" : "Unknown";
        const isActive = therapist?.is_active !== false; // Default to true if not set

        // Map role from database to Staff role
        let role: Staff["role"] = "Therapist";
        if (profile.role === "receptionist") role = "Receptionist";
        else if (profile.role === "cook_helper") role = "Cook Helper";
        else if (profile.role === "spa_attendant") role = "Spa Attendant";
        else role = "Therapist";

        return {
          id: profile.id,
          name: profile.full_name || "Unknown Staff",
          email: profile.email || "",
          role,
          branch: branchName,
          status: isActive ? "active" : "inactive",
          avatar: profile.avatar_url || undefined,
        };
      });

      setStaff(mappedStaff);
    } catch (err: any) {
      console.error("Error fetching staff:", err);
      setError(err.message || "Failed to fetch staff");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  return { staff, loading, error, refetch: fetchStaff };
}



