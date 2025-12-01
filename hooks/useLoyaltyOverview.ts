"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export interface LoyaltyOverviewStats {
  totalMembers: number;
  newMembers: number;
  avgPointsPerMember: number;
  rewardsRedeemed: number;
  tierDistribution: {
    grace: number;
    signature: number;
    elite: number;
  };
  pointsEarned: number;
  pointsRedeemed: number;
  memberGrowth: Array<{
    month: string;
    newMembers: number;
    totalMembers: number;
  }>;
  pointsFlow: Array<{
    month: string;
    earned: number;
    redeemed: number;
  }>;
  redeemRewards: Array<{
    label: string;
    value: number;
  }>;
}

export function useLoyaltyOverview(
  startDate?: Date,
  endDate?: Date,
  branchId?: string | null
): {
  stats: LoyaltyOverviewStats | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
} {
  const [stats, setStats] = useState<LoyaltyOverviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all member points
      const { data: memberPoints, error: memberPointsError } = await supabase
        .from("member_points")
        .select("user_id, tier, total_points, lifetime_points, created_at");

      if (memberPointsError) throw memberPointsError;

      // Fetch profiles to get creation dates
      const userIds = (memberPoints || []).map((mp: any) => mp.user_id).filter(Boolean);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, created_at")
        .in("id", userIds)
        .eq("role", "customer");

      // Fetch points history for earned/redeemed
      const startDateStr = startDate ? startDate.toISOString().split("T")[0] : null;
      const endDateStr = endDate ? new Date(endDate).toISOString().split("T")[0] : null;

      let pointsHistoryQuery = supabase
        .from("points_history")
        .select("points, type, created_at");

      if (startDateStr) {
        pointsHistoryQuery = pointsHistoryQuery.gte("created_at", startDateStr);
      }
      if (endDateStr) {
        pointsHistoryQuery = pointsHistoryQuery.lte("created_at", endDateStr);
      }

      const { data: pointsHistory, error: pointsHistoryError } = await pointsHistoryQuery;
      if (pointsHistoryError) throw pointsHistoryError;

      // Fetch redemptions
      let redemptions: any[] = [];
      try {
        let redemptionsQuery = supabase
          .from("reward_redemptions")
          .select("id, reward_id, redeemed_at");

        if (startDateStr) {
          redemptionsQuery = redemptionsQuery.gte("redeemed_at", startDateStr);
        }
        if (endDateStr) {
          redemptionsQuery = redemptionsQuery.lte("redeemed_at", endDateStr);
        }

        const { data: redemptionsData, error: redemptionsError } = await redemptionsQuery;
        
        // Handle errors gracefully - table might not exist or have RLS issues
        if (redemptionsError) {
          // PGRST116 = not found, 42P01 = relation does not exist
          if (redemptionsError.code === "PGRST116" || redemptionsError.code === "42P01" || redemptionsError.message?.includes("does not exist")) {
            console.warn("reward_redemptions table not found or not accessible, using empty array");
            redemptions = [];
          } else {
            console.warn("Error fetching redemptions:", redemptionsError);
            redemptions = [];
          }
        } else {
          redemptions = redemptionsData || [];
        }
      } catch (redemptionErr: any) {
        // Catch any unexpected errors and continue with empty array
        console.warn("Error fetching redemptions:", redemptionErr);
        redemptions = [];
      }

      // Fetch reward details for redemption breakdown
      const rewardIds = [...new Set(redemptions.map((r: any) => r.reward_id).filter(Boolean))];
      let rewards: any[] = [];
      if (rewardIds.length > 0) {
        try {
          const { data: rewardsData, error: rewardsError } = await supabase
            .from("rewards")
            .select("id, reward")
            .in("id", rewardIds);
          
          if (rewardsError) {
            console.warn("Error fetching rewards:", rewardsError);
            rewards = [];
          } else {
            rewards = rewardsData || [];
          }
        } catch (rewardsErr: any) {
          console.warn("Error fetching rewards:", rewardsErr);
          rewards = [];
        }
      }

      // Map rewards: use 'reward' column (not 'name') as per schema
      const rewardMap = new Map(rewards.map((r: any) => [r.id, r.reward || "Unknown Reward"]));

      // Calculate stats
      const totalMembers = memberPoints?.length || 0;
      
      // New members in date range
      const newMembers = profiles?.filter((p: any) => {
        if (!startDateStr || !endDateStr) return false;
        const created = new Date(p.created_at).toISOString().split("T")[0];
        return created >= startDateStr && created <= endDateStr;
      }).length || 0;

      // Average points per member
      const totalPoints = memberPoints?.reduce((sum: number, mp: any) => sum + (mp.total_points || 0), 0) || 0;
      const avgPointsPerMember = totalMembers > 0 ? Math.round(totalPoints / totalMembers) : 0;

      // Rewards redeemed
      const rewardsRedeemed = redemptions.length || 0;

      // Tier distribution (new system: Grace, Signature, Elite)
      const tierDistribution = {
        grace: memberPoints?.filter((mp: any) => {
          const tier = mp.tier?.toLowerCase();
          return !tier || tier === "grace" || tier === "bliss"; // Include old "bliss" for backward compatibility
        }).length || 0,
        signature: memberPoints?.filter((mp: any) => {
          const tier = mp.tier?.toLowerCase();
          return tier === "signature" || tier === "silver"; // Include old "silver" for backward compatibility
        }).length || 0,
        elite: memberPoints?.filter((mp: any) => {
          const tier = mp.tier?.toLowerCase();
          return tier === "elite" || tier === "vip" || tier === "gold" || tier === "platinum"; // Include old tier names for backward compatibility
        }).length || 0,
      };

      // Points earned and redeemed
      // Points earned: positive points
      // Points redeemed: negative points (or positive with type "redeemed")
      const pointsEarned = (pointsHistory || [])
        .filter((ph: any) => {
          const type = ph.type?.toLowerCase();
          return type === "earned" || type === "purchase" || type === "transaction" || (ph.points > 0 && !type?.includes("redeem"));
        })
        .reduce((sum: number, ph: any) => sum + Math.abs(ph.points || 0), 0);

      const pointsRedeemed = (pointsHistory || [])
        .filter((ph: any) => {
          const type = ph.type?.toLowerCase();
          return type === "redeemed" || type === "redemption" || ph.points < 0;
        })
        .reduce((sum: number, ph: any) => sum + Math.abs(ph.points || 0), 0);

      // Member growth (monthly)
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const monthlyGrowth: { [key: string]: { new: number; total: number } } = {};

      profiles?.forEach((profile: any) => {
        const date = new Date(profile.created_at);
        const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
        if (!monthlyGrowth[monthKey]) {
          monthlyGrowth[monthKey] = { new: 0, total: 0 };
        }
        monthlyGrowth[monthKey].new++;
      });

      // Calculate cumulative totals
      let cumulativeTotal = 0;
      const memberGrowth = Object.keys(monthlyGrowth)
        .sort()
        .slice(-9) // Last 9 months
        .map((key) => {
          const [year, month] = key.split("-");
          cumulativeTotal += monthlyGrowth[key].new;
          return {
            month: monthNames[parseInt(month)],
            newMembers: monthlyGrowth[key].new,
            totalMembers: cumulativeTotal,
          };
        });

      // Points flow (monthly)
      const monthlyPoints: { [key: string]: { earned: number; redeemed: number } } = {};

      (pointsHistory || []).forEach((ph: any) => {
        const date = new Date(ph.created_at);
        const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
        if (!monthlyPoints[monthKey]) {
          monthlyPoints[monthKey] = { earned: 0, redeemed: 0 };
        }
        const type = ph.type?.toLowerCase();
        if (type === "earned" || type === "purchase" || type === "transaction" || (ph.points > 0 && !type?.includes("redeem"))) {
          monthlyPoints[monthKey].earned += Math.abs(ph.points || 0);
        } else if (type === "redeemed" || type === "redemption" || ph.points < 0) {
          monthlyPoints[monthKey].redeemed += Math.abs(ph.points || 0);
        }
      });

      const pointsFlow = Object.keys(monthlyPoints)
        .sort()
        .slice(-9) // Last 9 months
        .map((key) => {
          const [year, month] = key.split("-");
          return {
            month: monthNames[parseInt(month)],
            earned: monthlyPoints[key].earned,
            redeemed: monthlyPoints[key].redeemed,
          };
        });

      // Redeem rewards breakdown
      const redeemRewardsMap: { [key: string]: number } = {};
      redemptions.forEach((r: any) => {
        const rewardName = rewardMap.get(r.reward_id) || "Unknown Reward";
        redeemRewardsMap[rewardName] = (redeemRewardsMap[rewardName] || 0) + 1;
      });

      const redeemRewards = Object.entries(redeemRewardsMap)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 4)
        .map(([label, value]) => ({ label, value }));

      setStats({
        totalMembers,
        newMembers,
        avgPointsPerMember,
        rewardsRedeemed,
        tierDistribution,
        pointsEarned,
        pointsRedeemed,
        memberGrowth,
        pointsFlow,
        redeemRewards,
      });
    } catch (err: any) {
      console.error("Error fetching loyalty overview:", err);
      setError(err.message || "Failed to fetch loyalty overview");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [startDate, endDate, branchId]);

  return { stats, loading, error, refetch: fetchStats };
}

