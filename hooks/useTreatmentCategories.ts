"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export function useTreatmentCategories() {
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCategories() {
      try {
        setLoading(true);
        setError(null);

        const { data, error: fetchError } = await supabase
          .from("treatments")
          .select("category")
          .not("category", "is", null); // Exclude null categories

        if (fetchError) throw fetchError;

        // Get unique categories
        const uniqueCategories = Array.from(
          new Set((data || []).map((t) => t.category as string).filter(cat => cat && cat !== "null" && cat !== "Uncategorized"))
        ).sort();

        setCategories(uniqueCategories);
      } catch (err: any) {
        console.error("Error fetching treatment categories:", err);
        setError(err.message || "Failed to fetch categories");
      } finally {
        setLoading(false);
      }
    }

    fetchCategories();
  }, []);

  return { categories, loading, error };
}

