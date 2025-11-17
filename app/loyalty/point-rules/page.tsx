"use client";

import React, { useState, useEffect } from "react";
import { SejenakDashboardLayout } from "@/components/layout/SejenakDashboardLayout";
import { Footer } from "@/components/layout";
import { Breadcrumbs, PageHeader } from "@/components/services";
import { EditIcon } from "@/components/icons";
import { navItems } from "@/config/navigation";

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

  const handleEditRules = () => {
    console.log("Edit rules");
    // TODO: Implement edit rules functionality
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
              label: "Edit Rules",
              onClick: handleEditRules,
              variant: "primary",
              icon: <EditIcon />,
            },
          ]}
        />

        {/* Point Rules Card */}
        <div className="bg-white dark:bg-[#191919] rounded-lg border border-zinc-200 dark:border-zinc-800 p-6">
          {/* Program Active Date */}
          <p className="text-sm text-[#706C6B] dark:text-[#C1A7A3] mb-6">
            Program active since 21 October 2025
          </p>

          {/* Rules Content */}
          <div className="flex items-start gap-6">
            {/* Placeholder Icon */}
            <div className="flex-shrink-0">
              <div className="w-16 h-16 rounded-full bg-[#F0EEED] dark:bg-[#3D3B3A] flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-[#706C6B] dark:text-[#C1A7A3]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>

            {/* Rules Details */}
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-[#191919] dark:text-[#F0EEED] mb-4">
                Gain point from total spent
              </h2>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-[#706C6B] dark:text-[#C1A7A3]">•</span>
                  <p className="text-sm text-[#191919] dark:text-[#F0EEED]">
                    New member gain 10 points
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[#706C6B] dark:text-[#C1A7A3]">•</span>
                  <p className="text-sm text-[#191919] dark:text-[#F0EEED]">
                    Point rule : Members gain 10 for every Rp 100.000 spent
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SejenakDashboardLayout>
  );
}

