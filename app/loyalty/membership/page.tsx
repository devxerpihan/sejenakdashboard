"use client";

import React, { useState, useEffect } from "react";
import { SejenakDashboardLayout } from "@/components/layout/SejenakDashboardLayout";
import { Footer } from "@/components/layout";
import { Breadcrumbs, MembershipTable, EditMembershipModal, MembershipBenefits } from "@/components/services";
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

  // Sample memberships data based on the new tier system from loyalty and rewards.md
  const memberships: Membership[] = [
    {
      id: "1",
      tier: "Grace",
      minPoints: 0,
      multiplier: 1.0,
      expiry: "12 month",
      autoReward: "Free Herbal Tea",
      cashback: 3,
      stampProgram: true,
      doubleStampWeekday: false,
      doubleStampEvent: false,
      priorityBooking: false,
      freeRewards: ["Free Herbal Tea setiap kunjungan"],
      upgradeRequirement: 3000000, // Rp3,000,000
      description: "Untuk kamu yang mulai memberi ruang bagi diri sendiri. Simbol awal perjalanan lembut menuju ketenangan.",
      customerProfile: "Biasanya 1–2x/bulan",
      color: "#F5F5DC", // Soft beige / Ivory
    },
    {
      id: "2",
      tier: "Signature",
      minPoints: 3000, // Rp3,000,000 spending = 3000 points (1 point = Rp1,000)
      multiplier: 1.25,
      expiry: "12 month",
      autoReward: "Free Sejenak Quick Hairwash",
      cashback: 4,
      stampProgram: true,
      doubleStampWeekday: false,
      doubleStampEvent: true, // Midweek Calm
      priorityBooking: false,
      freeRewards: ["Free Sejenak Quick Hairwash 1x"],
      upgradeRequirement: 7500000, // Rp7,500,000
      description: "Untuk kamu yang sudah menjadikan self-care sebagai bagian dari rutinitas. Menemukan keseimbangan di tengah kesibukan.",
      customerProfile: "Rutin 2–3x/bulan",
      color: "#FFB6C1", // Blush rose
    },
    {
      id: "3",
      tier: "Elite",
      minPoints: 7500, // Rp7,500,000 spending = 7500 points
      multiplier: 1.5,
      expiry: "12 month",
      autoReward: "Exclusive Elite Ritual Box",
      cashback: 5,
      stampProgram: true,
      doubleStampWeekday: true, // Double stamp for weekday visits
      doubleStampEvent: true,
      priorityBooking: true,
      freeRewards: ["Exclusive Elite Ritual Box", "Free Sejenak Ultimate Hydration Pedicure"],
      maintainRequirement: 12000000, // Rp12,000,000
      description: "Untuk kamu yang hidup dalam ritme tenang, penuh keseimbangan. Ketenangan telah menjadi gaya hidupmu.",
      customerProfile: "Rutin tiap minggu",
      color: "#F7E7CE", // Champagne gold
    },
  ];

  const locations = ["Islamic Village", "Location 2", "Location 3"];

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingMembership, setEditingMembership] = useState<Membership | null>(null);

  const handleMembershipAction = (membership: Membership) => {
    setEditingMembership(membership);
    setIsEditModalOpen(true);
  };

  const handleSaveMembership = (updatedMembership: Membership) => {
    // Update the membership in the local state
    // In a real app, this would update the database
    console.log("Updated membership:", updatedMembership);
    // TODO: Implement database update
    setIsEditModalOpen(false);
    setEditingMembership(null);
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
            { label: "Membership" },
          ]}
        />

        {/* Page Title */}
        <h1 className="text-3xl font-bold text-[#191919] dark:text-[#F0EEED] mb-6">
          Membership
        </h1>

        {/* Membership Benefits Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {memberships.map((membership) => (
            <MembershipBenefits key={membership.id} membership={membership} />
          ))}
        </div>

        {/* Membership Table */}
        <MembershipTable
          memberships={memberships}
          onActionClick={handleMembershipAction}
        />

        {/* Edit Membership Modal */}
        {editingMembership && (
          <EditMembershipModal
            isOpen={isEditModalOpen}
            onClose={() => {
              setIsEditModalOpen(false);
              setEditingMembership(null);
            }}
            membership={editingMembership}
            onSave={handleSaveMembership}
          />
        )}
      </div>
    </SejenakDashboardLayout>
  );
}

