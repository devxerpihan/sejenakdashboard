"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { Treatment } from "@/types/treatment";

export function useTreatments(): {
  treatments: Treatment[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
} {
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTreatments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("treatments")
        .select("id, name, category, duration, price, is_active, description, image_url")
        .order("name", { ascending: true });

      if (fetchError) throw fetchError;

      // Map database fields to Treatment type
      const mappedTreatments: Treatment[] = (data || []).map((treatment: any) => ({
        id: treatment.id,
        name: treatment.name,
        category: treatment.category || "Uncategorized",
        duration: treatment.duration || 0,
        price: treatment.price ? parseFloat(treatment.price) : 0,
        status: treatment.is_active ? "active" : "inactive",
        description: treatment.description || undefined,
        image: treatment.image_url || undefined,
      }));

      setTreatments(mappedTreatments);
    } catch (err: any) {
      console.error("Error fetching treatments:", err);
      setError(err.message || "Failed to fetch treatments");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTreatments();
  }, [fetchTreatments]);

  return { treatments, loading, error, refetch: fetchTreatments };
}

