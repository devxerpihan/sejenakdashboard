"use client";

import React, { useState, useEffect } from "react";
import { SejenakDashboardLayout } from "@/components/layout/SejenakDashboardLayout";
import { Footer } from "@/components/layout";
import { Breadcrumbs } from "@/components/services";
import { navItems } from "@/config/navigation";

export default function ReportsPage() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("darkMode");
      return saved === "true";
    }
    return false;
  });

  const [location, setLocation] = useState("Islamic Village");

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

  return (
    <SejenakDashboardLayout
      navItems={navItems}
      headerTitle=""
      location={location}
      locations={locations}
      onLocationChange={setLocation}
      dateRange={{
        start: new Date(),
        end: new Date(),
      }}
      onDateRangeChange={() => {}}
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
            { label: "Reports" },
          ]}
        />

        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-[#191919] dark:text-[#F0EEED]">
            Reports
          </h1>
          <p className="text-sm text-[#706C6B] dark:text-[#C1A7A3] mt-2">
            View and analyze business reports and analytics
          </p>
        </div>

        {/* Reports Content */}
        <div className="space-y-6">
          {/* Reports Sections */}
          <div className="bg-white dark:bg-[#2A2A2A] rounded-lg border border-[#E5E7EB] dark:border-[#404040] p-6">
            <h2 className="text-xl font-semibold text-[#191919] dark:text-[#F0EEED] mb-4">
              Reports Sections
            </h2>
            <div className="space-y-4">
              <div className="p-4 border border-[#E5E7EB] dark:border-[#404040] rounded-lg hover:bg-[#F9FAFB] dark:hover:bg-[#333333] transition-colors">
                <h3 className="font-medium text-[#191919] dark:text-[#F0EEED] mb-1">
                  Sales
                </h3>
                <p className="text-sm text-[#706C6B] dark:text-[#C1A7A3]">
                  View sales reports and analytics
                </p>
                <a
                  href="/reports/sales"
                  className="text-sm text-[#C1A7A3] hover:text-[#A8928E] mt-2 inline-block"
                >
                  View sales reports →
                </a>
              </div>

              <div className="p-4 border border-[#E5E7EB] dark:border-[#404040] rounded-lg hover:bg-[#F9FAFB] dark:hover:bg-[#333333] transition-colors">
                <h3 className="font-medium text-[#191919] dark:text-[#F0EEED] mb-1">
                  Transaction
                </h3>
                <p className="text-sm text-[#706C6B] dark:text-[#C1A7A3]">
                  View transaction history and details
                </p>
                <a
                  href="/reports/transaction"
                  className="text-sm text-[#C1A7A3] hover:text-[#A8928E] mt-2 inline-block"
                >
                  View transactions →
                </a>
              </div>

              <div className="p-4 border border-[#E5E7EB] dark:border-[#404040] rounded-lg hover:bg-[#F9FAFB] dark:hover:bg-[#333333] transition-colors">
                <h3 className="font-medium text-[#191919] dark:text-[#F0EEED] mb-1">
                  Shift
                </h3>
                <p className="text-sm text-[#706C6B] dark:text-[#C1A7A3]">
                  View shift reports and staff schedules
                </p>
                <a
                  href="/reports/shift"
                  className="text-sm text-[#C1A7A3] hover:text-[#A8928E] mt-2 inline-block"
                >
                  View shift reports →
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SejenakDashboardLayout>
  );
}





