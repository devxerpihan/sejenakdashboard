"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { Discount } from "@/types/discount";

export function useDiscounts(): {
  discounts: Discount[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
} {
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDiscounts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("discounts")
        .select("id, name, type, value, eligibility, valid_from, valid_until, status")
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;

      // Map database fields to Discount type
      const mappedDiscounts: Discount[] = (data || []).map((discount: any) => {
        const formatDate = (dateStr: string) => {
          const date = new Date(dateStr);
          const day = date.getDate().toString().padStart(2, "0");
          const month = (date.getMonth() + 1).toString().padStart(2, "0");
          const year = date.getFullYear().toString().slice(-2);
          return `${day}/${month}/${year}`;
        };

        const amount = discount.type === "percentage"
          ? `${discount.value}%`
          : `Rp ${parseFloat(discount.value).toLocaleString("id-ID")}`;

        // Determine status based on dates and current status
        const now = new Date();
        const validUntil = new Date(discount.valid_until);
        let status: "active" | "expired" = discount.status === "active" && validUntil >= now ? "active" : "expired";

        // Format eligibility
        let eligibilityDisplay = "All Services";
        if (discount.eligibility) {
          try {
            const eligibility = typeof discount.eligibility === "string" 
              ? JSON.parse(discount.eligibility) 
              : discount.eligibility;
            
            if (eligibility.type === "all") {
              eligibilityDisplay = "All Services";
            } else if (eligibility.type === "categories") {
              const count = eligibility.categoryIds?.length || 0;
              eligibilityDisplay = count > 0 ? `${count} Categor${count === 1 ? "y" : "ies"}` : "Categories";
            } else if (eligibility.type === "treatments") {
              const count = eligibility.treatmentIds?.length || 0;
              eligibilityDisplay = count > 0 ? `${count} Treatment${count === 1 ? "" : "s"}` : "Treatments";
            }
          } catch {
            // If parsing fails, use the raw value
            eligibilityDisplay = typeof discount.eligibility === "string" ? discount.eligibility : "All Services";
          }
        }

        return {
          id: discount.id,
          name: discount.name,
          amount,
          validPeriod: {
            start: formatDate(discount.valid_from),
            end: formatDate(discount.valid_until),
          },
          eligibility: eligibilityDisplay,
          status,
        };
      });

      setDiscounts(mappedDiscounts);
    } catch (err: any) {
      console.error("Error fetching discounts:", err);
      setError(err.message || "Failed to fetch discounts");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDiscounts();
  }, [fetchDiscounts]);

  return { discounts, loading, error, refetch: fetchDiscounts };
}

