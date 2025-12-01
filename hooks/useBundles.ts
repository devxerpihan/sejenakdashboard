"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { Bundle } from "@/types/bundle";

export function useBundles(): {
  bundles: Bundle[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
} {
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBundles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Note: Adjust table name based on your actual database schema
      // This assumes a table named "bundle_packages" or "bundles"
      const { data, error: fetchError } = await supabase
        .from("bundle_packages")
        .select("id, name, items, pricing, branch, status, image_url")
        .order("name", { ascending: true });

      if (fetchError) throw fetchError;

      // Map database fields to Bundle type
      const mappedBundles: Bundle[] = (data || []).map((bundle: any) => ({
        id: bundle.id,
        name: bundle.name,
        items: bundle.items || "",
        pricing: bundle.pricing ? parseFloat(bundle.pricing) : 0,
        branch: bundle.branch || "",
        status: bundle.status === "active" ? "active" : "inactive",
        image: bundle.image_url || undefined,
      }));

      setBundles(mappedBundles);
    } catch (err: any) {
      console.error("Error fetching bundles:", err);
      setError(err.message || "Failed to fetch bundles");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBundles();
  }, [fetchBundles]);

  return { bundles, loading, error, refetch: fetchBundles };
}

