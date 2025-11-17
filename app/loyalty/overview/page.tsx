"use client";

import React, { useState, useEffect } from "react";
import { SejenakDashboardLayout } from "@/components/layout/SejenakDashboardLayout";
import { Footer } from "@/components/layout";
import { Breadcrumbs } from "@/components/services";
import { DateRangePicker } from "@/components/ui/DateRangePicker";
import { SejenakStatCard } from "@/components/dashboard/SejenakStatCard";
import { ChartCard } from "@/components/dashboard/ChartCard";
import { DonutChart } from "@/components/dashboard/DonutChart";
import { MultiLineChart } from "@/components/services/MultiLineChart";
import { GroupedBarChart } from "@/components/services/GroupedBarChart";
import { navItems } from "@/config/navigation";
import { UsersIcon } from "@/components/icons";

export default function LoyaltyOverviewPage() {
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

  const locations = ["Islamic Village", "Location 2", "Location 3"];

  const handleDateNavigate = (direction: "prev" | "next") => {
    // TODO: Implement date navigation
    console.log("Navigate", direction);
  };

  // Summary cards data
  const summaryCards = [
    {
      title: "Total Members",
      value: "700",
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
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
          <text x="8" y="14" fontSize="8" fill="currentColor">
            M
          </text>
        </svg>
      ),
      trend: [600, 620, 640, 660, 680, 700],
      trendType: "bar" as const,
    },
    {
      title: "New Member",
      value: "90",
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
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
          <text x="8" y="14" fontSize="8" fill="currentColor">
            M
          </text>
        </svg>
      ),
      trend: [50, 60, 70, 80, 85, 90],
      trendType: "area" as const,
    },
    {
      title: "Avg Points / Member",
      value: "340",
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
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
          <text x="8" y="14" fontSize="8" fill="currentColor">
            P
          </text>
        </svg>
      ),
      trend: [300, 310, 320, 330, 335, 340],
      trendType: "bar" as const,
    },
    {
      title: "Rewards Redeem",
      value: "62",
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
            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
          />
        </svg>
      ),
      trend: [40, 45, 50, 55, 58, 62],
      trendType: "area" as const,
    },
  ];

  // Member Growth chart data
  const memberGrowthData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep"],
    series: [
      {
        label: "New Member",
        data: [50, 60, 70, 80, 90, 85, 75, 80, 90],
        color: "#6366F1", // Blue/purple
      },
      {
        label: "Total Member",
        data: [500, 520, 550, 580, 620, 650, 670, 690, 700],
        color: "#F97316", // Red/orange
      },
    ],
  };

  // Redeem Rewards donut chart data
  const redeemRewardsData = [
    { label: "Facial", value: 214, color: "#C1A7A3" },
    { label: "Creambath", value: 150, color: "#DCCAB7" },
    { label: "Facial", value: 121, color: "#706C6B" },
    { label: "Voucher 20%", value: 121, color: "#A88F8B" },
  ];

  // Points Flow grouped bar chart data
  const pointsFlowData = [
    {
      label: "Jan",
      values: [
        { label: "Points Earned", value: 1200, color: "#6366F1" },
        { label: "Points Redeemed", value: 800, color: "#F97316" },
      ],
    },
    {
      label: "Feb",
      values: [
        { label: "Points Earned", value: 1400, color: "#6366F1" },
        { label: "Points Redeemed", value: 900, color: "#F97316" },
      ],
    },
    {
      label: "Mar",
      values: [
        { label: "Points Earned", value: 1600, color: "#6366F1" },
        { label: "Points Redeemed", value: 1000, color: "#F97316" },
      ],
    },
    {
      label: "Apr",
      values: [
        { label: "Points Earned", value: 1800, color: "#6366F1" },
        { label: "Points Redeemed", value: 1100, color: "#F97316" },
      ],
    },
    {
      label: "May",
      values: [
        { label: "Points Earned", value: 2000, color: "#6366F1" },
        { label: "Points Redeemed", value: 1200, color: "#F97316" },
      ],
    },
    {
      label: "Jun",
      values: [
        { label: "Points Earned", value: 1900, color: "#6366F1" },
        { label: "Points Redeemed", value: 1300, color: "#F97316" },
      ],
    },
    {
      label: "Jul",
      values: [
        { label: "Points Earned", value: 1700, color: "#6366F1" },
        { label: "Points Redeemed", value: 1400, color: "#F97316" },
      ],
    },
    {
      label: "Aug",
      values: [
        { label: "Points Earned", value: 1800, color: "#6366F1" },
        { label: "Points Redeemed", value: 1500, color: "#F97316" },
      ],
    },
    {
      label: "Sep",
      values: [
        { label: "Points Earned", value: 1900, color: "#6366F1" },
        { label: "Points Redeemed", value: 1600, color: "#F97316" },
      ],
    },
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
            { label: "Loyalty", href: "/loyalty" },
            { label: "Overview" },
          ]}
        />

        {/* Page Header with Date Range */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-[#191919] dark:text-[#F0EEED]">
            Overview
          </h1>
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

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {summaryCards.map((card, index) => (
            <SejenakStatCard key={index} {...card} />
          ))}
        </div>

        {/* Member Growth Chart */}
        <div className="mb-6">
          <ChartCard title="Member Growth">
            <MultiLineChart
              series={memberGrowthData.series}
              labels={memberGrowthData.labels}
              yAxisMin={0}
              yAxisMax={700}
              yAxisStep={140}
            />
          </ChartCard>
        </div>

        {/* Redeem Rewards and Points Flow Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DonutChart
            data={redeemRewardsData}
            totalLabel="Total Reward"
            totalValue={569}
            title="Redeem Rewards"
          />
          <GroupedBarChart
            data={pointsFlowData}
            yAxisMin={0}
            yAxisMax={2000}
            yAxisStep={400}
            title="Points Flow"
          />
        </div>
      </div>
    </SejenakDashboardLayout>
  );
}

