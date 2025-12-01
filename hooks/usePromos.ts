"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { Promo } from "@/types/promo";

export function usePromos(): {
  promos: Promo[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
} {
  const [promos, setPromos] = useState<Promo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPromos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("promos")
        .select("id, code, type, value, quota, usage_count, min_transaction, eligibility, valid_from, valid_until, status")
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;

      // Map database fields to Promo type
      const mappedPromos: Promo[] = (data || []).map((promo: any) => {
        const formatDate = (dateStr: string) => {
          const date = new Date(dateStr);
          const day = date.getDate().toString().padStart(2, "0");
          const month = (date.getMonth() + 1).toString().padStart(2, "0");
          const year = date.getFullYear().toString().slice(-2);
          return `${day}/${month}/${year}`;
        };

        const amount = promo.type === "percentage"
          ? `${promo.value}%`
          : `Rp ${parseFloat(promo.value).toLocaleString("id-ID")}`;

        // Determine status based on dates and current status
        const now = new Date();
        const validUntil = new Date(promo.valid_until);
        let status: "active" | "expired" = promo.status === "active" && validUntil >= now ? "active" : "expired";

        // Format eligibility
        let targetting = "All";
        if (promo.eligibility) {
          try {
            const eligibility = typeof promo.eligibility === "string" 
              ? JSON.parse(promo.eligibility) 
              : promo.eligibility;
            
            if (eligibility.type === "all") {
              targetting = "All";
            } else if (eligibility.type === "categories") {
              const count = eligibility.categoryIds?.length || 0;
              targetting = count > 0 ? `${count} Categor${count === 1 ? "y" : "ies"}` : "Categories";
            } else if (eligibility.type === "treatments") {
              const count = eligibility.treatmentIds?.length || 0;
              targetting = count > 0 ? `${count} Treatment${count === 1 ? "" : "s"}` : "Treatments";
            }
          } catch {
            // If parsing fails, use the raw value
            targetting = typeof promo.eligibility === "string" ? promo.eligibility : "All";
          }
        }

        return {
          id: promo.id,
          code: promo.code,
          amount,
          quota: promo.quota || 0,
          usageCount: promo.usage_count || 0,
          validPeriod: {
            start: formatDate(promo.valid_from),
            end: formatDate(promo.valid_until),
          },
          targetting,
          status,
        };
      });

      setPromos(mappedPromos);
    } catch (err: any) {
      console.error("Error fetching promos:", err);
      setError(err.message || "Failed to fetch promos");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPromos();
  }, [fetchPromos]);

  return { promos, loading, error, refetch: fetchPromos };
}

