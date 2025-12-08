"use client";

import React, { useState, useEffect } from "react";
import { SejenakDashboardLayout } from "@/components/layout/SejenakDashboardLayout";
import { Footer } from "@/components/layout";
import { Breadcrumbs, MembershipTable, EditMembershipModal, MembershipBenefits } from "@/components/services";
import { navItems } from "@/config/navigation";
import { Membership } from "@/types/membership";
import { useMemberships } from "@/hooks/useMemberships";

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

  const { memberships, loading, updateMembership, fetchMemberships } = useMemberships();
  
  const locations = ["Islamic Village", "Location 2", "Location 3"];

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingMembership, setEditingMembership] = useState<Membership | null>(null);

  const handleMembershipAction = (membership: Membership) => {
    setEditingMembership(membership);
    setIsEditModalOpen(true);
  };

  const handleSaveMembership = async (updatedMembership: Membership) => {
    const { id, ...updates } = updatedMembership;
    const result = await updateMembership(id, updates);
    if (result.success) {
      setIsEditModalOpen(false);
      setEditingMembership(null);
    } else {
      // Handle error (could add a toast notification here)
      console.error("Failed to update membership");
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
            { label: "Membership" },
          ]}
        />

        {/* Page Title */}
        <h1 className="text-3xl font-bold text-[#191919] dark:text-[#F0EEED] mb-6">
          Membership
        </h1>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C1A7A3]"></div>
          </div>
        ) : (
          <>
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
          </>
        )}

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


