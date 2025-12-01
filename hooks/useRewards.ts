"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { Reward } from "@/types/reward";

export function useRewards(): {
  rewards: Reward[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  createReward: (reward: Omit<Reward, "id" | "createdAt" | "updatedAt">) => Promise<void>;
  updateReward: (reward: Reward) => Promise<void>;
  deleteReward: (rewardId: string) => Promise<void>;
} {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRewards = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch rewards
      const { data: rewardsData, error: fetchError } = await supabase
        .from("rewards")
        .select("*")
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;

      // Fetch usage counts from redemptions
      const { data: redemptionsData } = await supabase
        .from("reward_redemptions")
        .select("reward_id, status")
        .eq("status", "completed");

      // Calculate usage count per reward
      const usageCountMap = new Map<string, number>();
      (redemptionsData || []).forEach((redemption: any) => {
        if (redemption.reward_id) {
          usageCountMap.set(
            redemption.reward_id,
            (usageCountMap.get(redemption.reward_id) || 0) + 1
          );
        }
      });

      // Map database fields to Reward type
      // Note: Existing schema uses 'name' instead of 'reward', 'points_required' instead of 'required'
      const mappedRewards: Reward[] = (rewardsData || []).map((reward: any) => {
        const usageCount = reward.usage_count ?? usageCountMap.get(reward.id) ?? 0;
        
        return {
          id: reward.id,
          reward: reward.reward || reward.name || "", // Support both 'reward' and 'name' fields
          method: (reward.method || "Point") as "Point" | "Stamp",
          required: reward.required || reward.points_required || 0,
          claimType: reward.claim_type || "Auto",
          autoReward: reward.auto_reward || undefined,
          minPoint: reward.min_point || undefined,
          expiry: reward.expiry || undefined,
          multiplier: reward.multiplier || undefined,
          image: reward.image_url || undefined,
          category: reward.category || undefined,
          totalPoints: reward.total_points || reward.points_required || reward.required || 0,
          quota: reward.quota || undefined,
          usageCount: usageCount,
          status: reward.status || (reward.is_active !== false ? "Active" : "Expired") || "Active",
          createdAt: reward.created_at || undefined,
          updatedAt: reward.updated_at || undefined,
        };
      });

      setRewards(mappedRewards);
    } catch (err: any) {
      console.error("Error fetching rewards:", err);
      setError(err.message || "Failed to fetch rewards");
    } finally {
      setLoading(false);
    }
  }, []);

  const createReward = useCallback(
    async (reward: Omit<Reward, "id" | "createdAt" | "updatedAt">) => {
      try {
        console.log("Creating reward:", reward);
        
        const insertData: any = {
          name: reward.reward, // Use 'name' field from existing schema
          description: reward.reward, // Use reward name as description if not provided
          points_required: reward.totalPoints || reward.required || 0,
          is_active: reward.status === "Active",
          image_url: reward.image || null,
          // New fields
          method: reward.method || "Point",
          claim_type: reward.claimType || "Auto",
          auto_reward: reward.autoReward || null,
          min_point: reward.minPoint || null,
          expiry: reward.expiry || null,
          multiplier: reward.multiplier || null,
          category: reward.category || null,
          total_points: reward.totalPoints || reward.required || null,
          quota: reward.quota || null,
          usage_count: reward.usageCount || 0,
          status: reward.status || "Active",
        };

        console.log("Insert data:", insertData);

        const { data, error: insertError } = await supabase
          .from("rewards")
          .insert(insertData)
          .select();

        console.log("Insert result:", { data, error: insertError });

        if (insertError) {
          console.error("Insert error details:", insertError);
          throw insertError;
        }

        console.log("Fetching rewards after create...");
        await fetchRewards();
        console.log("Rewards fetched successfully");
      } catch (err: any) {
        console.error("Error creating reward:", err);
        throw err;
      }
    },
    [fetchRewards]
  );

  const updateReward = useCallback(
    async (reward: Reward) => {
      try {
        console.log("Updating reward with ID:", reward.id);
        console.log("Update data:", {
          name: reward.reward,
          points_required: reward.totalPoints || reward.required || 0,
          status: reward.status,
          category: reward.category,
          claim_type: reward.claimType,
          image_url: reward.image,
        });

        const updateData: any = {
          name: reward.reward, // Use 'name' field from existing schema
          description: reward.reward, // Update description as well
          points_required: reward.totalPoints || reward.required || 0,
          is_active: reward.status === "Active",
          image_url: reward.image || null,
          // New fields
          method: reward.method || "Point",
          claim_type: reward.claimType || "Auto",
          auto_reward: reward.autoReward || null,
          min_point: reward.minPoint || null,
          expiry: reward.expiry || null,
          multiplier: reward.multiplier || null,
          category: reward.category || null,
          total_points: reward.totalPoints || reward.required || null,
          quota: reward.quota || null,
          usage_count: reward.usageCount || 0,
          status: reward.status || "Active",
        };

        const { data, error: updateError } = await supabase
          .from("rewards")
          .update(updateData)
          .eq("id", reward.id)
          .select();

        console.log("Update result:", { data, error: updateError });

        if (updateError) {
          console.error("Update error details:", updateError);
          throw updateError;
        }

        console.log("Fetching rewards after update...");
        await fetchRewards();
        console.log("Rewards fetched successfully");
      } catch (err: any) {
        console.error("Error updating reward:", err);
        throw err;
      }
    },
    [fetchRewards]
  );

  const deleteReward = useCallback(
    async (rewardId: string) => {
      try {
        const { error: deleteError } = await supabase
          .from("rewards")
          .delete()
          .eq("id", rewardId);

        if (deleteError) throw deleteError;
        await fetchRewards();
      } catch (err: any) {
        console.error("Error deleting reward:", err);
        throw err;
      }
    },
    [fetchRewards]
  );

  useEffect(() => {
    fetchRewards();
  }, [fetchRewards]);

  return {
    rewards,
    loading,
    error,
    refetch: fetchRewards,
    createReward,
    updateReward,
    deleteReward,
  };
}

