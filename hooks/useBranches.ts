"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export interface Branch {
  id: string;
  name: string;
  address?: string;
}

export function useBranches(): {
  branches: Branch[];
  loading: boolean;
  error: string | null;
} {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBranches() {
      try {
        setLoading(true);
        setError(null);

        const { data, error: fetchError } = await supabase
          .from("branches")
          .select("id, name, address")
          .order("name", { ascending: true });

        if (fetchError) throw fetchError;

        setBranches(data || []);
      } catch (err: any) {
        console.error("Error fetching branches:", err);
        setError(err.message || "Failed to fetch branches");
      } finally {
        setLoading(false);
      }
    }

    fetchBranches();
  }, []);

  return { branches, loading, error };
}

