"use client";

import React, { useState, useEffect } from "react";
import { SejenakDashboardLayout } from "@/components/layout/SejenakDashboardLayout";
import {
  Breadcrumbs,
  PageHeader,
  FiltersBar,
  TreatmentTable,
  Pagination,
} from "@/components/services";
import { PlusIcon } from "@/components/icons";
import { navItems } from "@/config/navigation";
import { Treatment } from "@/types/treatment";

export default function TreatmentPage() {
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

  const [selectedCategory, setSelectedCategory] = useState("All Category");
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

  // Sample treatments data
  const allTreatments: Treatment[] = [
    {
      id: "1",
      name: "Luxury Scalp Hair Therapy",
      category: "Hair",
      duration: 90,
      price: "4 prices",
      status: "active",
    },
    {
      id: "2",
      name: "Sejenak Express Refresh",
      category: "Hair",
      duration: 90,
      price: 350000,
      status: "inactive",
    },
    {
      id: "3",
      name: "Sejenak Complete Rituals",
      category: "Body",
      duration: 120,
      price: 450000,
      status: "active",
    },
    {
      id: "4",
      name: "Sejenak Deep Relax",
      category: "Body",
      duration: 90,
      price: "2 prices",
      status: "active",
    },
    {
      id: "5",
      name: "Sejenak Quick Hair Wash",
      category: "Hair",
      duration: 30,
      price: 150000,
      status: "active",
    },
  ];

  const categories = ["All Category", "Hair", "Body", "Nail", "Face"];

  // Filter treatments
  const filteredTreatments = allTreatments.filter((treatment) => {
    const matchesCategory =
      selectedCategory === "All Category" ||
      treatment.category === selectedCategory;
    const matchesSearch =
      searchQuery === "" ||
      treatment.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Pagination
  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredTreatments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedTreatments = filteredTreatments.slice(startIndex, endIndex);

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
      <div>
        {/* Breadcrumbs */}
        <Breadcrumbs items={[{ label: "Services", href: "/services" }, { label: "Treatment" }]} />

        {/* Page Header */}
        <PageHeader
          title="Treatment"
          actionButtons={[
            {
              label: "Export / Import",
              onClick: () => console.log("Export / Import"),
              variant: "primary",
            },
            {
              label: "Create Treatment",
              onClick: () => console.log("Create Treatment"),
              variant: "outline",
              icon: <PlusIcon />,
            },
          ]}
        />

        {/* Filters */}
        <FiltersBar
          categories={categories}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="Q Treatment"
        />

        {/* Treatment Table */}
        <TreatmentTable treatments={paginatedTreatments} />

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredTreatments.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
        />
      </div>
    </SejenakDashboardLayout>
  );
}

