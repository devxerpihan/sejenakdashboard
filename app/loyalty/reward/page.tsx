"use client";

import React, { useState, useEffect } from "react";
import { SejenakDashboardLayout } from "@/components/layout/SejenakDashboardLayout";
import { Footer } from "@/components/layout";
import { Breadcrumbs, PageHeader, RewardTable } from "@/components/services";
import { EditIcon } from "@/components/icons";
import { navItems } from "@/config/navigation";
import { Reward } from "@/types/reward";

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

  // Sample rewards data based on the image
  const rewards: Reward[] = [
    {
      id: "1",
      reward: "Free Facial",
      method: "Stamp",
      required: 150,
      claimType: "Auto",
      autoReward: "Welcome Voucher",
    },
    {
      id: "2",
      reward: "Voucher 100k",
      method: "Point",
      required: 400,
      claimType: "12 month",
      autoReward: "Free Facial",
    },
    {
      id: "3",
      reward: "Free Hair Spa",
      method: "Stamp",
      required: 500,
      claimType: "12 month",
      autoReward: "Free Sejenak Creambath",
    },
  ];

  const locations = ["Islamic Village", "Location 2", "Location 3"];

  const handleEditRules = () => {
    console.log("Edit rules");
    // TODO: Implement edit rules functionality
  };

  const handleRewardAction = (rewardId: string) => {
    console.log("Reward action:", rewardId);
    // TODO: Implement reward action menu (edit, view details, etc.)
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
              label: "Edit Rules",
              onClick: handleEditRules,
              variant: "primary",
              icon: <EditIcon />,
            },
          ]}
        />

        {/* Reward Table */}
        <RewardTable rewards={rewards} onActionClick={handleRewardAction} />
      </div>
    </SejenakDashboardLayout>
  );
}

