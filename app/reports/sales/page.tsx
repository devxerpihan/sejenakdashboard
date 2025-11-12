"use client";

import React, { useState, useEffect } from "react";
import { SejenakDashboardLayout } from "@/components/layout/SejenakDashboardLayout";
import { Footer } from "@/components/layout";
import {
  Breadcrumbs,
  SalesCategoryNav,
  SalesSummary,
  SalesCategory,
} from "@/components/services";
import { DateRangePicker } from "@/components/ui/DateRangePicker";
import { LocationSelector } from "@/components/ui/LocationSelector";
import { DownloadIcon } from "@/components/icons";
import { navItems } from "@/config/navigation";

export default function SalesPage() {
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

  const [selectedCategory, setSelectedCategory] =
    useState<SalesCategory>("Summary");

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

  const handleDateNavigate = (direction: "prev" | "next") => {
    // TODO: Implement date navigation
    console.log("Navigate", direction);
  };

  const handleExport = () => {
    console.log("Export sales data");
    // TODO: Implement export functionality
  };

  // Sales summary data
  const salesData = {
    grossSales: 202700000,
    discounts: 15888000,
    refunds: 5000000,
    netSales: 181967000,
    totalCollected: 181967000,
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
      footer={<Footer />}
    >
      <div>
        {/* Breadcrumbs */}
        <Breadcrumbs
          items={[
            { label: "Reports", href: "/reports" },
            { label: "Sales" },
          ]}
        />

        {/* Page Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-[#191919] dark:text-[#F0EEED]">
            Sales
          </h1>
        </div>

        {/* Filters and Controls */}
        <div className="flex items-center gap-4 mb-6">
          <LocationSelector
            location={location}
            locations={locations}
            onChange={setLocation}
          />
          <DateRangePicker
            startDate={dateRange.start}
            endDate={dateRange.end}
            onNavigate={handleDateNavigate}
            onClick={() => {
              // TODO: Open date picker modal
              console.log("Open date picker");
            }}
          />
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#C1A7A3] hover:bg-[#A88F8B] text-white text-sm font-medium transition-colors"
          >
            <DownloadIcon />
            <span>Export</span>
          </button>
        </div>

        {/* Main Content Area */}
        <div className="flex gap-6">
          {/* Left Panel - Category Navigation */}
          <SalesCategoryNav
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
          />

          {/* Right Panel - Content */}
          <div className="flex-1">
            {selectedCategory === "Summary" && (
              <SalesSummary
                grossSales={salesData.grossSales}
                discounts={salesData.discounts}
                refunds={salesData.refunds}
                netSales={salesData.netSales}
                totalCollected={salesData.totalCollected}
              />
            )}

            {selectedCategory !== "Summary" && (
              <div className="bg-white dark:bg-[#191919] rounded-lg border border-zinc-200 dark:border-zinc-800 p-6">
                <p className="text-[#706C6B] dark:text-[#C1A7A3]">
                  {selectedCategory} report content will be implemented here
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </SejenakDashboardLayout>
  );
}

