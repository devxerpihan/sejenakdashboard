"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { Category } from "@/types/category";

export function useCategories(): {
  categories: Category[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
} {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all treatments to aggregate categories
      const { data: treatments, error: fetchError } = await supabase
        .from("treatments")
        .select("category")
        .not("category", "is", null);

      if (fetchError) throw fetchError;

      // Count treatments per category
      const categoryCounts: Record<string, number> = {};
      (treatments || []).forEach((treatment: any) => {
        const categoryName = treatment.category as string;
        if (categoryName) {
          categoryCounts[categoryName] = (categoryCounts[categoryName] || 0) + 1;
        }
      });

      // Convert to Category array
      // Use category name as ID since categories are stored as text in treatments
      const categoryList: Category[] = Object.entries(categoryCounts)
        .map(([name, count]) => ({
          id: name, // Use name as ID since categories are just text fields
          name,
          totalTreatment: count,
        }))
        .sort((a, b) => a.name.localeCompare(b.name));

      setCategories(categoryList);
    } catch (err: any) {
      console.error("Error fetching categories:", err);
      setError(err.message || "Failed to fetch categories");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return { categories, loading, error, refetch: fetchCategories };
}

