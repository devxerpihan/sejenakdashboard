"use client";

import React, { useState, useEffect } from "react";
import { SejenakDashboardLayout } from "@/components/layout/SejenakDashboardLayout";
import { Footer } from "@/components/layout";
import {
  Breadcrumbs,
  PageHeader,
  Tabs,
  LineChart,
  WordCloud,
  ImprovementSuggestion,
} from "@/components/services";
import { DateRangePicker } from "@/components/ui/DateRangePicker";
import { SejenakStatCard } from "@/components/dashboard/SejenakStatCard";
import { ChartCard } from "@/components/dashboard/ChartCard";
import { DonutChart } from "@/components/dashboard/DonutChart";
import { navItems } from "@/config/navigation";
import { UsersIcon } from "@/components/icons";

export default function InLoungeFeedbackPage() {
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

  const [activeTab, setActiveTab] = useState("overview");

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

  // Summary cards data
  const summaryCards = [
    {
      title: "Therapist Score",
      value: "4.95",
      icon: <UsersIcon />,
      trend: [4.5, 4.6, 4.7, 4.8, 4.9, 4.95],
      trendType: "bar" as const,
    },
    {
      title: "Cleanliness",
      value: "92%",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      trend: [85, 87, 89, 90, 91, 92],
      trendType: "area" as const,
    },
    {
      title: "Comfort",
      value: "95%",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
      ),
      trend: [90, 91, 92, 93, 94, 95],
      trendType: "bar" as const,
    },
    {
      title: "Would Recommend",
      value: "100%",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
          />
        </svg>
      ),
      trend: [95, 96, 97, 98, 99, 100],
      trendType: "area" as const,
    },
  ];

  // Therapist Score line chart data
  const therapistScoreData = [
    { label: "Jan", value: 4.5 },
    { label: "Feb", value: 4.6 },
    { label: "Mar", value: 4.7 },
    { label: "Apr", value: 4.8 },
    { label: "May", value: 4.9 },
    { label: "Jun", value: 4.85 },
  ];

  // Post Treatment Feel donut chart data
  const postTreatmentFeelData = [
    { label: "Relax", value: 214, color: "#C1A7A3" },
    { label: "Fresh", value: 150, color: "#DCCAB7" },
    { label: "Energized", value: 121, color: "#706C6B" },
  ];

  // Word cloud data
  const wordCloudData = [
    { text: "Treatment", weight: 10 },
    { text: "Ruangan", weight: 8 },
    { text: "Nyaman", weight: 9 },
    { text: "Overall", weight: 7 },
    { text: "Kesini", weight: 6 },
    { text: "Bagus", weight: 5 },
    { text: "Service", weight: 8 },
    { text: "Staff", weight: 7 },
    { text: "Lokasi", weight: 6 },
    { text: "Harga", weight: 5 },
    { text: "Fasilitas", weight: 6 },
    { text: "Atmosphere", weight: 5 },
  ];

  // Improvement suggestions
  const improvementSuggestions = [
    {
      id: "1",
      text: "Waktu tunggu saat di receptionist (check in) terlalu lama",
      mentionCount: 20,
    },
    {
      id: "2",
      text: "Ruangan terlalu dingin, perlu penyesuaian suhu AC",
      mentionCount: 15,
    },
    {
      id: "3",
      text: "Parkir terbatas, perlu penambahan area parkir",
      mentionCount: 12,
    },
    {
      id: "4",
      text: "WiFi kurang stabil di beberapa area",
      mentionCount: 8,
    },
  ];

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "responses", label: "Responses", count: 500 },
  ];

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
            { label: "CRM", href: "/crm" },
            { label: "In Lounge Feedback" },
          ]}
        />

        {/* Page Header with Tabs and Date Range */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-[#191919] dark:text-[#F0EEED] mb-4">
              In Lounge Feedback
            </h1>
            <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
          </div>
          <DateRangePicker
            startDate={dateRange.start}
            endDate={dateRange.end}
            onNavigate={handleDateNavigate}
            onClick={() => {
              // TODO: Open date picker modal
              console.log("Open date picker");
            }}
          />
        </div>

        {activeTab === "overview" && (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              {summaryCards.map((card, index) => (
                <SejenakStatCard key={index} {...card} />
              ))}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Therapist Score Line Chart */}
              <ChartCard title="Therapist Score">
                <LineChart
                  data={therapistScoreData}
                  yAxisMin={0}
                  yAxisMax={5}
                />
              </ChartCard>

              {/* Post Treatment Feel Donut Chart */}
              <DonutChart
                data={postTreatmentFeelData}
                totalLabel="Total Customer"
                totalValue={569}
                title="Post Treatment Feel"
              />
            </div>

            {/* Word Cloud and Improvement Suggestions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <WordCloud words={wordCloudData} title="Word Cloud" />
              <ImprovementSuggestion
                suggestions={improvementSuggestions}
                title="Improvement Suggestion"
              />
            </div>
          </>
        )}

        {activeTab === "responses" && (
          <div className="bg-white dark:bg-[#191919] rounded-lg border border-zinc-200 dark:border-zinc-800 p-6">
            <p className="text-[#706C6B] dark:text-[#C1A7A3]">
              Responses tab content will be implemented here
            </p>
          </div>
        )}
      </div>
    </SejenakDashboardLayout>
  );
}

