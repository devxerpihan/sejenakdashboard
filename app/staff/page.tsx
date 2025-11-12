"use client";

import React, { useState, useEffect, useMemo } from "react";
import { SejenakDashboardLayout } from "@/components/layout/SejenakDashboardLayout";
import {
  Breadcrumbs,
  PageHeader,
  StaffTable,
  RoleFilterTabs,
  Pagination,
} from "@/components/services";
import { SearchIcon } from "@/components/icons";
import { navItems } from "@/config/navigation";
import { Staff, StaffRole } from "@/types/staff";

export default function StaffPage() {
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

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState<StaffRole>("all");
  const [currentPage, setCurrentPage] = useState(1);

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

  // Sample staff data based on the image
  const allStaff: Staff[] = [
    {
      id: "1",
      name: "Claire Morgan",
      email: "clairmorgan@gmail.com",
      role: "Therapist",
      branch: "Islamic Village",
      status: "active",
    },
    {
      id: "2",
      name: "Grace Wallen",
      email: "gracewallen@gmail.com",
      role: "Receptionist",
      branch: "Islamic Village",
      status: "inactive",
    },
    {
      id: "3",
      name: "Grace Wallen",
      email: "gracewallen@gmail.com",
      role: "Therapist",
      branch: "Alam Sutera",
      status: "active",
    },
    {
      id: "4",
      name: "Grace Wallen",
      email: "gracewallen@gmail.com",
      role: "Therapist",
      branch: "BSD Tangerang",
      status: "active",
    },
    {
      id: "5",
      name: "Margot Kim",
      email: "margotkim@gmail.com",
      role: "Cook Helper",
      branch: "PIK 2",
      status: "active",
    },
    // Add more staff to reach 200 total
    // Using deterministic values based on index to avoid hydration errors
    ...Array.from({ length: 195 }, (_, i) => {
      const index = i + 6;
      const roles: Staff["role"][] = [
        "Therapist",
        "Receptionist",
        "Cook Helper",
        "Spa Attendant",
      ];
      const branches = [
        "Islamic Village",
        "Alam Sutera",
        "BSD Tangerang",
        "PIK 2",
        "Kemang",
      ];
      const statuses: Staff["status"][] = ["active", "inactive"];
      return {
        id: `${index}`,
        name: `Staff Member ${index}`,
        email: `staff${index}@gmail.com`,
        role: roles[index % 4],
        branch: branches[index % 5],
        status: statuses[index % 2],
      };
    }),
  ];

  // Calculate role counts
  const roleCounts = useMemo(() => {
    return {
      all: allStaff.length,
      Therapist: allStaff.filter((s) => s.role === "Therapist").length,
      Receptionist: allStaff.filter((s) => s.role === "Receptionist").length,
      "Cook Helper": allStaff.filter((s) => s.role === "Cook Helper").length,
      "Spa Attendant": allStaff.filter((s) => s.role === "Spa Attendant").length,
    };
  }, [allStaff]);

  // Filter staff
  const filteredStaff = useMemo(() => {
    return allStaff.filter((member) => {
      const matchesRole =
        selectedRole === "all" || member.role === selectedRole;
      const matchesSearch =
        searchQuery === "" ||
        member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.email.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesRole && matchesSearch;
    });
  }, [allStaff, selectedRole, searchQuery]);

  // Pagination
  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredStaff.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedStaff = filteredStaff.slice(startIndex, endIndex);

  const locations = ["Islamic Village", "Location 2", "Location 3"];

  const handleStaffAction = (staffId: string) => {
    console.log("Staff action:", staffId);
    // TODO: Implement staff action menu (edit, view details, etc.)
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
        {/* Page Title */}
        <h1 className="text-3xl font-bold text-[#191919] dark:text-[#F0EEED] mb-6">
          Staff
        </h1>

        {/* Role Filter Tabs */}
        <RoleFilterTabs
          selectedRole={selectedRole}
          onRoleChange={setSelectedRole}
          counts={roleCounts}
        />

        {/* Search Bar */}
        <div className="relative flex-1 max-w-md mb-6">
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#706C6B] dark:text-[#C1A7A3]">
            <SearchIcon />
          </div>
          <input
            type="text"
            placeholder="Name, email"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-[#191919] text-[#191919] dark:text-[#F0EEED] placeholder-[#706C6B] focus:outline-none focus:ring-2 focus:ring-[#C1A7A3]"
          />
        </div>

        {/* Staff Table */}
        <StaffTable staff={paginatedStaff} onActionClick={handleStaffAction} />

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredStaff.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
        />
      </div>
    </SejenakDashboardLayout>
  );
}

