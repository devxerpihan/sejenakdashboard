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

      console.log("[DEBUG] Starting loyalty overview fetch...");

      // Fetch all member points
      console.log("[DEBUG] Fetching member_points...");
      let memberPoints: any[] = [];
      try {
        const { data: memberPointsData, error: memberPointsError } = await supabase
          .from("member_points")
          .select("user_id, tier, total_points, lifetime_points, created_at");

        if (memberPointsError) {
          const errorMessage = memberPointsError.message || "";
          const errorCode = memberPointsError.code || "";
          
          console.error("[DEBUG] member_points error:", {
            message: errorMessage,
            code: errorCode,
          });
          
          if (errorMessage.includes("Load failed") || errorMessage.includes("TypeError") || errorCode === "") {
            console.log("[DEBUG] member_points: Network error detected, using empty array");
            memberPoints = [];
          } else {
            memberPoints = [];
          }
        } else {
          memberPoints = memberPointsData || [];
          console.log("[DEBUG] member_points fetched:", memberPoints.length, "records");
        }
      } catch (memberPointsErr: any) {
        console.error("[DEBUG] member_points exception:", {
          message: memberPointsErr?.message,
        });
        memberPoints = [];
      }

      // Fetch ALL customer profiles (fast with role index)
      // Use ALL profiles for member growth chart (not just those with member_points)
      // This is much faster than .in() with 1000+ IDs
      console.log("[DEBUG] Fetching all customer profiles (optimized)...");
      let profiles: any[] = [];
      
      try {
        // Fetch all customer profiles - this is fast with the role index
        // We use ALL customer profiles for accurate member growth calculation
        const { data: allProfilesData, error: profilesError } = await supabase
          .from("profiles")
          .select("id, created_at")
          .eq("role", "customer")
          .limit(10000); // Reasonable limit
        
        if (profilesError) {
          const errorMessage = profilesError.message || "";
          const errorCode = profilesError.code || "";
          
          console.error("[DEBUG] profiles error:", {
            message: errorMessage,
            code: errorCode,
          });
          
          if (errorMessage.includes("Load failed") || errorMessage.includes("TypeError") || errorCode === "") {
            console.log("[DEBUG] profiles: Network error detected, using empty array");
            profiles = [];
          } else {
            profiles = [];
          }
        } else {
          // Use ALL customer profiles (not filtered) for accurate member growth chart
          // The growth chart should show all customers, not just those with member_points
          profiles = allProfilesData || [];
          console.log("[DEBUG] All customer profiles fetched:", profiles.length, "records");
        }
      } catch (profilesErr: any) {
        console.error("[DEBUG] profiles exception:", {
          message: profilesErr?.message,
        });
        profiles = [];
      }

      // Fetch points history for earned/redeemed
      const startDateStr = startDate ? startDate.toISOString().split("T")[0] : null;
      const endDateStr = endDate ? new Date(endDate).toISOString().split("T")[0] : null;

      console.log("[DEBUG] Fetching points_history...", { startDateStr, endDateStr });

      let pointsHistory: any[] = [];
      try {
        let pointsHistoryQuery = supabase
          .from("points_history")
          .select("points, type, created_at");

        if (startDateStr) {
          pointsHistoryQuery = pointsHistoryQuery.gte("created_at", startDateStr);
        }
        if (endDateStr) {
          pointsHistoryQuery = pointsHistoryQuery.lte("created_at", endDateStr);
        }

        const { data: pointsHistoryData, error: pointsHistoryError } = await pointsHistoryQuery;
        
        console.log("[DEBUG] points_history query result:", {
          hasData: !!pointsHistoryData,
          dataLength: pointsHistoryData?.length || 0,
          hasError: !!pointsHistoryError,
          errorCode: pointsHistoryError?.code,
          errorMessage: pointsHistoryError?.message,
          errorDetails: pointsHistoryError,
        });
        
        // Handle errors gracefully - table might not exist or have RLS issues
        if (pointsHistoryError) {
          // Suppress expected errors (table doesn't exist, RLS blocking, etc.)
          // Only log unexpected errors in development
          const errorMessage = pointsHistoryError.message || "";
          const errorCode = pointsHistoryError.code || "";
          const isExpectedError = 
            errorCode === "PGRST116" || 
            errorCode === "42P01" ||
            errorMessage.includes("does not exist") ||
            errorMessage.includes("Could not fetch properties") ||
            errorMessage.includes("access control") ||
            errorMessage.includes("Load failed") ||
            errorMessage.includes("TypeError") ||
            errorCode === ""; // Empty code often means network/CORS error
          
          console.log("[DEBUG] points_history error detected:", {
            code: errorCode,
            message: errorMessage,
            isExpectedError,
            fullError: pointsHistoryError,
          });
          
          if (!isExpectedError && process.env.NODE_ENV === "development") {
            console.warn("Error fetching points_history:", pointsHistoryError);
          }
          pointsHistory = [];
        } else {
          pointsHistory = pointsHistoryData || [];
          console.log("[DEBUG] points_history success:", pointsHistory.length, "records");
        }
      } catch (pointsHistoryErr: any) {
        // Catch any unexpected errors and continue with empty array
        console.error("[DEBUG] points_history exception caught:", {
          message: pointsHistoryErr?.message,
          stack: pointsHistoryErr?.stack,
          fullError: pointsHistoryErr,
        });
        if (process.env.NODE_ENV === "development") {
          console.warn("Error fetching points_history:", pointsHistoryErr);
        }
        pointsHistory = [];
      }

      // Fetch redemptions
      console.log("[DEBUG] Fetching reward_redemptions...", { startDateStr, endDateStr });
      
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
        
        console.log("[DEBUG] reward_redemptions query result:", {
          hasData: !!redemptionsData,
          dataLength: redemptionsData?.length || 0,
          hasError: !!redemptionsError,
          errorCode: redemptionsError?.code,
          errorMessage: redemptionsError?.message,
          errorDetails: redemptionsError,
        });
        
        // Handle errors gracefully - table might not exist or have RLS issues
        if (redemptionsError) {
          // Suppress expected errors (table doesn't exist, RLS blocking, etc.)
          // Only log unexpected errors in development
          const errorMessage = redemptionsError.message || "";
          const errorCode = redemptionsError.code || "";
          const isExpectedError = 
            errorCode === "PGRST116" || 
            errorCode === "42P01" ||
            errorMessage.includes("does not exist") ||
            errorMessage.includes("Could not fetch properties") ||
            errorMessage.includes("access control") ||
            errorMessage.includes("Load failed") ||
            errorMessage.includes("TypeError") ||
            errorCode === ""; // Empty code often means network/CORS error
          
          console.log("[DEBUG] reward_redemptions error detected:", {
            code: errorCode,
            message: errorMessage,
            isExpectedError,
            fullError: redemptionsError,
          });
          
          if (!isExpectedError && process.env.NODE_ENV === "development") {
            console.warn("Error fetching redemptions:", redemptionsError);
          }
          redemptions = [];
        } else {
          redemptions = redemptionsData || [];
          console.log("[DEBUG] reward_redemptions success:", redemptions.length, "records");
        }
      } catch (redemptionErr: any) {
        // Catch any unexpected errors and continue with empty array
        console.error("[DEBUG] reward_redemptions exception caught:", {
          message: redemptionErr?.message,
          stack: redemptionErr?.stack,
          fullError: redemptionErr,
        });
        if (process.env.NODE_ENV === "development") {
          console.warn("Error fetching redemptions:", redemptionErr);
        }
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
      const pointsEarned = pointsHistory
        .filter((ph: any) => {
          const type = ph.type?.toLowerCase();
          return type === "earned" || type === "purchase" || type === "transaction" || (ph.points > 0 && !type?.includes("redeem"));
        })
        .reduce((sum: number, ph: any) => sum + Math.abs(ph.points || 0), 0);

      const pointsRedeemed = pointsHistory
        .filter((ph: any) => {
          const type = ph.type?.toLowerCase();
          return type === "redeemed" || type === "redemption" || ph.points < 0;
        })
        .reduce((sum: number, ph: any) => sum + Math.abs(ph.points || 0), 0);

      // Member growth (monthly)
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const monthlyGrowth: { [key: string]: { new: number; total: number; year: number; month: number } } = {};

      profiles?.forEach((profile: any) => {
        if (!profile.created_at) return;
        const date = new Date(profile.created_at);
        if (isNaN(date.getTime())) return; // Skip invalid dates
        
        const year = date.getFullYear();
        const month = date.getMonth(); // 0-11
        const monthKey = `${year}-${String(month).padStart(2, '0')}`;
        
        if (!monthlyGrowth[monthKey]) {
          monthlyGrowth[monthKey] = { new: 0, total: 0, year, month };
        }
        monthlyGrowth[monthKey].new++;
      });

      // Calculate cumulative totals
      // Sort by year and month numerically (not as strings)
      const sortedKeys = Object.keys(monthlyGrowth).sort((a, b) => {
        const [yearA, monthA] = a.split("-").map(Number);
        const [yearB, monthB] = b.split("-").map(Number);
        if (yearA !== yearB) return yearA - yearB;
        return monthA - monthB;
      });

      // Get last 9 months
      const last9Months = sortedKeys.slice(-9);
      
      // Calculate cumulative total from the beginning, not just from last 9 months
      let cumulativeTotal = 0;
      const allMonthsBefore = sortedKeys.slice(0, -9);
      allMonthsBefore.forEach(key => {
        cumulativeTotal += monthlyGrowth[key].new;
      });

      const memberGrowth = last9Months.map((key) => {
        const [year, month] = key.split("-").map(Number);
        cumulativeTotal += monthlyGrowth[key].new;
        return {
          month: monthNames[month],
          newMembers: monthlyGrowth[key].new,
          totalMembers: cumulativeTotal,
        };
      });

      // Points flow (monthly)
      const monthlyPoints: { [key: string]: { earned: number; redeemed: number } } = {};

      pointsHistory.forEach((ph: any) => {
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

      console.log("[DEBUG] Calculated stats:", {
        totalMembers,
        newMembers,
        avgPointsPerMember,
        rewardsRedeemed,
        tierDistribution,
        pointsEarned,
        pointsRedeemed,
        memberGrowthLength: memberGrowth.length,
        pointsFlowLength: pointsFlow.length,
        redeemRewardsLength: redeemRewards.length,
      });

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
      
      console.log("[DEBUG] Loyalty overview fetch completed successfully");
    } catch (err: any) {
      console.error("[DEBUG] Error fetching loyalty overview:", {
        message: err?.message,
        code: err?.code,
        details: err?.details,
        hint: err?.hint,
        statusCode: err?.statusCode,
        fullError: err,
        stack: err?.stack,
      });
      setError(err.message || "Failed to fetch loyalty overview");
    } finally {
      setLoading(false);
      console.log("[DEBUG] Loyalty overview fetch finished (loading set to false)");
    }
  };

  useEffect(() => {
    fetchStats();
  }, [startDate, endDate, branchId]);

  return { stats, loading, error, refetch: fetchStats };
}

