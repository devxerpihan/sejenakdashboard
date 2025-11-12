"use client";

import React, { useState, useEffect } from "react";
import { SejenakDashboardLayout } from "@/components/layout/SejenakDashboardLayout";
import {
  Breadcrumbs,
  PageHeader,
  CategoryTable,
  Pagination,
} from "@/components/services";
import { PlusIcon, SearchIcon } from "@/components/icons";
import { navItems } from "@/config/navigation";
import { Category } from "@/types/category";

export default function CategoryPage() {
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

  // Sample categories data based on the image
  const allCategories: Category[] = [
    {
      id: "1",
      name: "Body",
      totalTreatment: 3,
    },
    {
      id: "2",
      name: "Nail",
      totalTreatment: 3,
    },
    {
      id: "3",
      name: "Hair",
      totalTreatment: 8,
    },
    {
      id: "4",
      name: "Kids",
      totalTreatment: 7,
    },
    {
      id: "5",
      name: "Pilates",
      totalTreatment: 5,
    },
    {
      id: "6",
      name: "Face",
      totalTreatment: 4,
    },
    {
      id: "7",
      name: "Massage",
      totalTreatment: 6,
    },
    {
      id: "8",
      name: "Spa",
      totalTreatment: 2,
    },
    {
      id: "9",
      name: "Wellness",
      totalTreatment: 5,
    },
    {
      id: "10",
      name: "Beauty",
      totalTreatment: 3,
    },
    {
      id: "11",
      name: "Facial",
      totalTreatment: 4,
    },
    {
      id: "12",
      name: "Haircut",
      totalTreatment: 2,
    },
    {
      id: "13",
      name: "Manicure",
      totalTreatment: 3,
    },
    {
      id: "14",
      name: "Pedicure",
      totalTreatment: 3,
    },
  ];

  // Filter categories
  const filteredCategories = allCategories.filter((category) => {
    const matchesSearch =
      searchQuery === "" ||
      category.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  // Pagination
  const itemsPerPage = 5;
  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedCategories = filteredCategories.slice(startIndex, endIndex);

  const locations = ["Islamic Village", "Location 2", "Location 3"];

  const handleAssignToTreatment = (categoryId: string) => {
    console.log("Assign category to treatment:", categoryId);
    // TODO: Implement assign to treatment functionality
  };

  const handleCreateCategory = () => {
    console.log("Create category");
    // TODO: Implement create category functionality
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
            { label: "Services", href: "/services" },
            { label: "Category" },
          ]}
        />

        {/* Page Header */}
        <PageHeader
          title="Category"
          actionButtons={[
            {
              label: "Create Category",
              onClick: handleCreateCategory,
              variant: "primary",
              icon: <PlusIcon />,
            },
          ]}
        />

        {/* Search Bar */}
        <div className="relative flex-1 max-w-md mb-6">
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#706C6B] dark:text-[#C1A7A3]">
            <SearchIcon />
          </div>
          <input
            type="text"
            placeholder="Treatment"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-[#191919] text-[#191919] dark:text-[#F0EEED] placeholder-[#706C6B] focus:outline-none focus:ring-2 focus:ring-[#C1A7A3]"
          />
        </div>

        {/* Category Table */}
        <CategoryTable
          categories={paginatedCategories}
          onAssignToTreatment={handleAssignToTreatment}
        />

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredCategories.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
        />
      </div>
    </SejenakDashboardLayout>
  );
}

