"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { PointRule } from "@/types/pointRule";

export function usePointRules(): {
  pointRules: PointRule[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  createRule: (rule: Omit<PointRule, "id" | "createdAt" | "updatedAt">) => Promise<void>;
  updateRule: (rule: PointRule) => Promise<void>;
  deleteRule: (ruleId: string) => Promise<void>;
} {
  const [pointRules, setPointRules] = useState<PointRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPointRules = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("point_rules")
        .select("*")
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;

      // Map database fields to PointRule type
      const mappedRules: PointRule[] = (data || []).map((rule: any) => ({
        id: rule.id,
        spendAmount: rule.spend_amount || 0,
        pointEarned: rule.point_earned || 0,
        expiry: rule.expiry || 12,
        status: rule.status === "Active" ? "Active" : "Inactive",
        welcomePoint: rule.welcome_point || undefined,
        ruleType: rule.rule_type || "general",
        category: rule.category || undefined,
        days: rule.days || undefined,
        treatments: rule.treatments || undefined,
        createdAt: rule.created_at || undefined,
        updatedAt: rule.updated_at || undefined,
      }));

      setPointRules(mappedRules);
    } catch (err: any) {
      console.error("Error fetching point rules:", err);
      setError(err.message || "Failed to fetch point rules");
    } finally {
      setLoading(false);
    }
  }, []);

  const createRule = useCallback(
    async (rule: Omit<PointRule, "id" | "createdAt" | "updatedAt">) => {
      try {
        const { error: insertError } = await supabase.from("point_rules").insert({
          spend_amount: rule.spendAmount,
          point_earned: rule.pointEarned,
          expiry: rule.expiry,
          status: rule.status,
          welcome_point: rule.welcomePoint || null,
          rule_type: rule.ruleType || "general",
          category: rule.category || null,
          days: rule.days || null,
          treatments: rule.treatments || null,
        });

        if (insertError) throw insertError;
        await fetchPointRules();
      } catch (err: any) {
        console.error("Error creating point rule:", err);
        throw err;
      }
    },
    [fetchPointRules]
  );

  const updateRule = useCallback(
    async (rule: PointRule) => {
      try {
        const { error: updateError } = await supabase
          .from("point_rules")
          .update({
            spend_amount: rule.spendAmount,
            point_earned: rule.pointEarned,
            expiry: rule.expiry,
            status: rule.status,
            welcome_point: rule.welcomePoint || null,
            rule_type: rule.ruleType || "general",
            category: rule.category || null,
            days: rule.days || null,
            treatments: rule.treatments || null,
          })
          .eq("id", rule.id);

        if (updateError) throw updateError;
        await fetchPointRules();
      } catch (err: any) {
        console.error("Error updating point rule:", err);
        throw err;
      }
    },
    [fetchPointRules]
  );

  const deleteRule = useCallback(
    async (ruleId: string) => {
      try {
        const { error: deleteError } = await supabase
          .from("point_rules")
          .delete()
          .eq("id", ruleId);

        if (deleteError) throw deleteError;
        await fetchPointRules();
      } catch (err: any) {
        console.error("Error deleting point rule:", err);
        throw err;
      }
    },
    [fetchPointRules]
  );

  useEffect(() => {
    fetchPointRules();
  }, [fetchPointRules]);

  return {
    pointRules,
    loading,
    error,
    refetch: fetchPointRules,
    createRule,
    updateRule,
    deleteRule,
  };
}



