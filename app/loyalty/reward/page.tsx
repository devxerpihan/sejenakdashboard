"use client";

import React, { useState, useEffect } from "react";
import { SejenakDashboardLayout } from "@/components/layout/SejenakDashboardLayout";
import { Footer } from "@/components/layout";
import { Breadcrumbs, PageHeader, RewardTable } from "@/components/services";
import { EditRewardModal } from "@/components/loyalty/EditRewardModal";
import { PlusIcon } from "@/components/icons";
import { navItems } from "@/config/navigation";
import { Reward } from "@/types/reward";
import { useRewards } from "@/hooks/useRewards";
import { ToastContainer } from "@/components/ui/Toast";

export default function RewardPage() {
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

  const { rewards, loading, error, createReward, updateReward, deleteReward, refetch } = useRewards();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReward, setEditingReward] = useState<Reward | null>(null);

  // Toast notifications
  const [toasts, setToasts] = useState<Array<{ id: string; message: string; type?: "success" | "error" | "warning" | "info" }>>([]);
  
  const showToast = (message: string, type: "success" | "error" | "warning" | "info" = "info") => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, type }]);
  };
  
  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const handleAddReward = () => {
    setEditingReward(null);
    setIsModalOpen(true);
  };

  const handleRewardAction = (rewardId: string) => {
    console.log("Reward action:", rewardId);
    // TODO: Implement reward action menu (edit, view details, etc.)
  };

  const handleRowClick = (reward: Reward) => {
    setEditingReward(reward);
    setIsModalOpen(true);
  };

  const handleSaveReward = async (reward: Reward) => {
    try {
      console.log("handleSaveReward called with:", reward);
      console.log("editingReward:", editingReward);
      
      if (editingReward && editingReward.id) {
        // Update existing reward
        console.log("Updating reward with ID:", editingReward.id);
        await updateReward(reward);
        showToast("Reward updated successfully", "success");
      } else {
        // Add new reward
        console.log("Creating new reward");
        await createReward({
          reward: reward.reward,
          method: reward.method,
          required: reward.required,
          claimType: reward.claimType,
          autoReward: reward.autoReward,
          minPoint: reward.minPoint,
          expiry: reward.expiry,
          multiplier: reward.multiplier,
          image: reward.image,
          category: reward.category,
          totalPoints: reward.totalPoints,
          quota: reward.quota,
          usageCount: reward.usageCount || 0,
          status: reward.status || "Active",
        });
        showToast("Reward created successfully", "success");
      }
      
      // Force refetch to ensure table updates
      console.log("Refetching rewards...");
      await refetch();
      console.log("Rewards refetched");
      
      // Only close modal and reset state on success
      setIsModalOpen(false);
      setEditingReward(null);
    } catch (err: any) {
      console.error("Error in handleSaveReward:", err);
      // Show error toast
      showToast(err.message || "Failed to save reward", "error");
      // Re-throw so modal can handle it (keep modal open)
      throw err;
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
            { label: "Reward" },
          ]}
        />

        {/* Page Header */}
        <PageHeader
          title="Reward"
          actionButtons={[
            {
              label: "New Reward",
              onClick: handleAddReward,
              variant: "primary",
              icon: <PlusIcon />,
            },
          ]}
        />

        {/* Loading State */}
        {loading && (
          <div className="bg-white dark:bg-[#191919] rounded-lg border border-zinc-200 dark:border-zinc-800 p-12 text-center">
            <p className="text-sm text-[#706C6B] dark:text-[#C1A7A3]">Loading rewards...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-white dark:bg-[#191919] rounded-lg border border-zinc-200 dark:border-zinc-800 p-12 text-center">
            <p className="text-sm text-red-500 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Reward Table */}
        {!loading && !error && (
          <RewardTable 
            rewards={rewards} 
            onActionClick={handleRewardAction}
            onRowClick={handleRowClick}
          />
        )}

        {/* Edit Reward Modal */}
        <EditRewardModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingReward(null);
          }}
          reward={editingReward}
          onSave={handleSaveReward}
        />

        {/* Toast Container */}
        <ToastContainer toasts={toasts} onRemove={removeToast} />
      </div>
    </SejenakDashboardLayout>
  );
}

