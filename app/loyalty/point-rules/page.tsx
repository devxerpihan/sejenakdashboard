"use client";

import React, { useState, useEffect } from "react";
import { SejenakDashboardLayout } from "@/components/layout/SejenakDashboardLayout";
import { Footer } from "@/components/layout";
import { Breadcrumbs, PageHeader, EditPointRulesModal } from "@/components/services";
import { ResetLoyaltyModal } from "@/components/loyalty/ResetLoyaltyModal";
import { EditIcon, PlusIcon } from "@/components/icons";
import { navItems } from "@/config/navigation";
import { PointRule } from "@/types/pointRule";
import { usePointRules } from "@/hooks/usePointRules";
import { ToastContainer } from "@/components/ui/Toast";
import { supabase } from "@/lib/supabase";

export default function PointRulesPage() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("darkMode");
      return saved === "true";
    }
    return false;
  });

  const [location, setLocation] = useState("Islamic Village");
  const [dateRange, setDateRange] = useState({
    start: new Date(2025, 0, 1),
    end: new Date(2025, 8, 9),
  });

  // Apply dark mode class to HTML element and save to localStorage
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("darkMode", "true");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("darkMode", "false");
    }
  }, [isDarkMode]);

  const locations = ["Islamic Village", "Location 2", "Location 3"];

  const { pointRules, loading, error, createRule, updateRule, deleteRule } = usePointRules();

  // Get the oldest rule's created date for program active date
  const oldestRule = pointRules.length > 0 
    ? pointRules.reduce((oldest, current) => {
        const oldestDate = oldest.createdAt ? new Date(oldest.createdAt) : new Date(0);
        const currentDate = current.createdAt ? new Date(current.createdAt) : new Date(0);
        return currentDate < oldestDate ? current : oldest;
      })
    : null;

  const programActiveDate = oldestRule?.createdAt 
    ? new Date(oldestRule.createdAt).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "21 October 2025";

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<PointRule | null>(null);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [resetting, setResetting] = useState(false);

  // Toast notifications
  const [toasts, setToasts] = useState<Array<{ id: string; message: string; type?: "success" | "error" | "warning" | "info" }>>([]);
  
  const showToast = (message: string, type: "success" | "error" | "warning" | "info" = "info") => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, type }]);
  };
  
  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const handleAddRule = () => {
    setEditingRule(null);
    setIsModalOpen(true);
  };

  const handleEditRule = (rule: PointRule) => {
    setEditingRule(rule);
    setIsModalOpen(true);
  };

  const handleDeleteRule = async (ruleId: string) => {
    if (confirm("Are you sure you want to delete this point rule?")) {
      try {
        await deleteRule(ruleId);
        showToast("Point rule deleted successfully", "success");
      } catch (err: any) {
        showToast(err.message || "Failed to delete point rule", "error");
      }
    }
  };

  const handleSaveRule = async (rule: PointRule) => {
    try {
      if (editingRule) {
        // Update existing rule
        await updateRule(rule);
        showToast("Point rule updated successfully", "success");
      } else {
        // Add new rule
        await createRule({
          spendAmount: rule.spendAmount,
          pointEarned: rule.pointEarned,
          expiry: rule.expiry,
          status: rule.status,
          welcomePoint: rule.welcomePoint,
          ruleType: rule.ruleType,
          category: rule.category,
          days: rule.days,
          treatments: rule.treatments,
        });
        showToast("Point rule created successfully", "success");
      }
      setIsModalOpen(false);
      setEditingRule(null);
    } catch (err: any) {
      showToast(err.message || "Failed to save point rule", "error");
    }
  };

  const handleResetClick = () => {
    setIsResetModalOpen(true);
  };

  const handleResetConfirm = async () => {
    try {
      setResetting(true);
      
      // Delete all point rules
      const { data: allPointRules, error: fetchPointRulesError } = await supabase
        .from("point_rules")
        .select("id");

      if (fetchPointRulesError) throw fetchPointRulesError;

      if (allPointRules && allPointRules.length > 0) {
        const pointRuleIds = allPointRules.map((r) => r.id);
        const { error: pointRulesError } = await supabase
          .from("point_rules")
          .delete()
          .in("id", pointRuleIds);

        if (pointRulesError) throw pointRulesError;
      }

      // Reset all member points (set to 0 and Grace tier)
      const { error: memberPointsError } = await supabase
        .from("member_points")
        .update({
          total_points: 0,
          lifetime_points: 0,
          tier: "Grace",
        });

      if (memberPointsError) throw memberPointsError;

      // Delete all redemptions
      const { data: allRedemptions, error: fetchRedemptionsError } = await supabase
        .from("reward_redemptions")
        .select("id");

      if (fetchRedemptionsError) throw fetchRedemptionsError;

      if (allRedemptions && allRedemptions.length > 0) {
        const redemptionIds = allRedemptions.map((r) => r.id);
        const { error: redemptionsError } = await supabase
          .from("reward_redemptions")
          .delete()
          .in("id", redemptionIds);

        if (redemptionsError) throw redemptionsError;
      }

      // Delete all points history
      const { data: allPointsHistory, error: fetchPointsHistoryError } = await supabase
        .from("points_history")
        .select("id");

      if (fetchPointsHistoryError) throw fetchPointsHistoryError;

      if (allPointsHistory && allPointsHistory.length > 0) {
        const pointsHistoryIds = allPointsHistory.map((p) => p.id);
        const { error: pointsHistoryError } = await supabase
          .from("points_history")
          .delete()
          .in("id", pointsHistoryIds);

        if (pointsHistoryError) throw pointsHistoryError;
      }

      showToast("Loyalty program reset successfully", "success");
      setIsResetModalOpen(false);
      
      // Refetch point rules to update the UI
      window.location.reload();
    } catch (err: any) {
      console.error("Error resetting loyalty program:", err);
      showToast(err.message || "Failed to reset loyalty program", "error");
    } finally {
      setResetting(false);
    }
  };

  return (
    <SejenakDashboardLayout
      navItems={navItems}
      headerTitle=""
      location={location}
      locations={locations}
      onLocationChange={setLocation}
      dateRange={dateRange}
      onDateRangeChange={(direction) => {
        console.log("Navigate", direction);
      }}
      isDarkMode={isDarkMode}
      onDarkModeToggle={() => {
        setIsDarkMode((prev) => !prev);
      }}
      customHeader={null}
      footer={<Footer />}
    >
      <div>
        {/* Breadcrumbs */}
        <Breadcrumbs
          items={[
            { label: "Loyalty", href: "/loyalty" },
            { label: "Point Rules" },
          ]}
        />

        {/* Page Header */}
        <PageHeader
          title="Point Rules"
          actionButtons={[
            {
              label: "Add Rule",
              onClick: handleAddRule,
              variant: "primary",
              icon: <PlusIcon />,
            },
            {
              label: "Reset",
              onClick: handleResetClick,
              variant: "secondary",
            },
          ]}
        />

        {/* Program Active Date */}
        {!loading && (
          <p className="text-sm text-[#706C6B] dark:text-[#C1A7A3] mb-6">
            Program active since {programActiveDate}
          </p>
        )}

        {/* Loading State */}
        {loading && (
          <div className="bg-white dark:bg-[#191919] rounded-lg border border-zinc-200 dark:border-zinc-800 p-12 text-center">
            <p className="text-sm text-[#706C6B] dark:text-[#C1A7A3]">Loading point rules...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-white dark:bg-[#191919] rounded-lg border border-zinc-200 dark:border-zinc-800 p-12 text-center">
            <p className="text-sm text-red-500 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Point Rules Cards */}
        {!loading && !error && (
          <>
            {pointRules.length === 0 ? (
              <div className="bg-white dark:bg-[#191919] rounded-lg border border-zinc-200 dark:border-zinc-800 p-12 text-center">
                <p className="text-sm text-[#706C6B] dark:text-[#C1A7A3] mb-4">
                  No point rules found. Click "Add Rule" to create one.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pointRules.map((rule) => (
                  <div
                    key={rule.id}
                    className="bg-white dark:bg-[#191919] rounded-lg border border-zinc-200 dark:border-zinc-800 p-6 flex flex-col"
                  >

                    {/* Rules Details */}
                    <div className="flex-1 space-y-2 mb-4">
                      {rule.welcomePoint && (
                        <div className="flex items-start gap-2">
                          <p className="text-xs text-[#191919] dark:text-[#F0EEED]">
                            New member gain {rule.welcomePoint} points
                          </p>
                        </div>
                      )}
                      <div className="flex items-start gap-2">
                        <p className="text-xs text-[#191919] dark:text-[#F0EEED]">
                          Members gain {rule.pointEarned} for every Rp {rule.spendAmount.toLocaleString("id-ID")} spent
                        </p>
                      </div>
                      {rule.ruleType && rule.ruleType !== "general" && (
                        <div className="flex items-start gap-2">
                          <p className="text-xs text-[#191919] dark:text-[#F0EEED]">
                            {rule.ruleType === "category" && rule.category && (
                              <>Applies to: <span className="font-medium">{rule.category}</span></>
                            )}
                            {rule.ruleType === "treatment" && rule.treatments && rule.treatments.length > 0 && (
                              <>Applies to: <span className="font-medium">{rule.treatments.length} treatment{rule.treatments.length !== 1 ? "s" : ""}</span></>
                            )}
                            {rule.ruleType === "day" && rule.days && rule.days.length > 0 && (
                              <>Applies on: <span className="font-medium">{rule.days.join(", ")}</span></>
                            )}
                          </p>
                        </div>
                      )}
                      <div className="flex items-start gap-2">
                        <p className="text-xs text-[#191919] dark:text-[#F0EEED]">
                          Expiry: {rule.expiry} month{rule.expiry !== 1 ? "s" : ""} • {rule.status}
                        </p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                      <button
                        onClick={() => handleEditRule(rule)}
                        className="flex-1 px-3 py-2 text-xs font-medium text-[#706C6B] dark:text-[#C1A7A3] bg-white dark:bg-[#191919] border border-zinc-300 dark:border-zinc-700 rounded-md hover:bg-zinc-50 dark:hover:bg-[#3D3B3A] transition-colors flex items-center justify-center gap-2"
                      >
                        <EditIcon />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteRule(rule.id)}
                        className="p-2 text-[#706C6B] dark:text-[#C1A7A3] hover:text-red-500 dark:hover:text-red-400 transition-colors"
                        aria-label="Delete"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Edit Point Rules Modal */}
        <EditPointRulesModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingRule(null);
          }}
          rule={editingRule}
          onSave={handleSaveRule}
        />

        {/* Reset Loyalty Modal */}
        <ResetLoyaltyModal
          isOpen={isResetModalOpen}
          onClose={() => !resetting && setIsResetModalOpen(false)}
          onConfirm={handleResetConfirm}
          isResetting={resetting}
        />

        {/* Toast Container */}
        <ToastContainer toasts={toasts} onRemove={removeToast} />
      </div>
    </SejenakDashboardLayout>
  );
}

