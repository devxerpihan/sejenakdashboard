"use client";

import React from "react";
import Link from "next/link";
import { SejenakDashboardLayout } from "@/components/layout/SejenakDashboardLayout";
import { navItems } from "@/config/navigation";
import { DashboardIcon } from "@/components/icons";

export default function NotFound() {
  const [isDarkMode, setIsDarkMode] = React.useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("darkMode");
      return saved === "true";
    }
    return false;
  });

  const [location, setLocation] = React.useState("Islamic Village");
  const [dateRange, setDateRange] = React.useState({
    start: new Date(2025, 0, 1),
    end: new Date(2025, 8, 9),
  });

  // Apply dark mode class to HTML element and save to localStorage
  React.useEffect(() => {
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
      dateRange={dateRange}
      onDateRangeChange={(direction) => {
        console.log("Navigate", direction);
      }}
      user={{
        name: "John Doe",
        email: "john@example.com",
        avatar: undefined,
      }}
      isDarkMode={isDarkMode}
      onDarkModeToggle={() => {
        setIsDarkMode((prev) => !prev);
      }}
      customHeader={null}
    >
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="text-center">
          {/* 404 Number */}
          <h1 className="text-9xl font-bold text-[#C1A7A3] dark:text-[#A88F8B] mb-4">
            404
          </h1>

          {/* Error Message */}
          <h2 className="text-3xl font-bold text-[#191919] dark:text-[#F0EEED] mb-2">
            Page Not Found
          </h2>
          <p className="text-lg text-[#706C6B] dark:text-[#C1A7A3] mb-8 max-w-md">
            The page you're looking for doesn't exist or has been moved.
          </p>

          {/* Action Buttons */}
          <div className="flex items-center justify-center gap-4">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 px-6 py-3 rounded-lg bg-[#C1A7A3] hover:bg-[#A88F8B] text-white font-medium transition-colors"
            >
              <DashboardIcon />
              <span>Go to Dashboard</span>
            </Link>
            <button
              onClick={() => window.history.back()}
              className="px-6 py-3 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-[#191919] text-[#191919] dark:text-[#F0EEED] hover:bg-[#F0EEED] dark:hover:bg-[#3D3B3A] font-medium transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    </SejenakDashboardLayout>
  );
}

