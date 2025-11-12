"use client";

import React, { useState, useEffect } from "react";
import { SejenakDashboardLayout } from "@/components/layout/SejenakDashboardLayout";
import { Breadcrumbs, MembershipTable } from "@/components/services";
import { navItems } from "@/config/navigation";
import { Membership } from "@/types/membership";

export default function MembershipPage() {
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

  // Sample memberships data based on the image
  const memberships: Membership[] = [
    {
      id: "1",
      tier: "Silver",
      minPoints: 0,
      multiplier: 1,
      expiry: "12 month",
      autoReward: "Welcome Voucher",
    },
    {
      id: "2",
      tier: "Gold",
      minPoints: 500,
      multiplier: 1,
      expiry: "12 month",
      autoReward: "Free Facial",
    },
    {
      id: "3",
      tier: "Platinum",
      minPoints: 1500,
      multiplier: 1,
      expiry: "12 month",
      autoReward: "Free Sejenak Creambath",
    },
  ];

  const locations = ["Islamic Village", "Location 2", "Location 3"];

  const handleMembershipAction = (membershipId: string) => {
    console.log("Membership action:", membershipId);
    // TODO: Implement membership action menu (edit, view details, etc.)
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
      <div>
        {/* Breadcrumbs */}
        <Breadcrumbs
          items={[
            { label: "Loyalty", href: "/loyalty" },
            { label: "Membership" },
          ]}
        />

        {/* Page Title */}
        <h1 className="text-3xl font-bold text-[#191919] dark:text-[#F0EEED] mb-6">
          Membership
        </h1>

        {/* Membership Table */}
        <MembershipTable
          memberships={memberships}
          onActionClick={handleMembershipAction}
        />
      </div>
    </SejenakDashboardLayout>
  );
}

