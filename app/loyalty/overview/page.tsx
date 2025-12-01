"use client";

import React, { useState, useEffect, useMemo } from "react";
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
import { useLoyaltyOverview } from "@/hooks/useLoyaltyOverview";

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

  // Fetch loyalty overview data
  const { stats, loading, error, refetch } = useLoyaltyOverview(
    dateRange.start,
    dateRange.end,
    null // branchId
  );

  // Summary cards data (calculated from real data)
  const summaryCards = useMemo(() => {
    if (!stats) {
      return [
        {
          title: "Total Members",
          value: "0",
          icon: <UsersIcon />,
          trend: [0],
          trendType: "bar" as const,
        },
        {
          title: "New Member",
          value: "0",
          icon: <UsersIcon />,
          trend: [0],
          trendType: "area" as const,
        },
        {
          title: "Avg Points / Member",
          value: "0",
          icon: <UsersIcon />,
          trend: [0],
          trendType: "bar" as const,
        },
        {
          title: "Rewards Redeem",
          value: "0",
          icon: <UsersIcon />,
          trend: [0],
          trendType: "area" as const,
        },
      ];
    }

    return [
      {
        title: "Total Members",
        value: stats.totalMembers.toString(),
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
        trend: stats.memberGrowth.map((m) => m.totalMembers),
        trendType: "bar" as const,
      },
      {
        title: "New Member",
        value: stats.newMembers.toString(),
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
        trend: stats.memberGrowth.map((m) => m.newMembers),
        trendType: "area" as const,
      },
      {
        title: "Avg Points / Member",
        value: stats.avgPointsPerMember.toString(),
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
        trend: [stats.avgPointsPerMember],
        trendType: "bar" as const,
      },
      {
        title: "Rewards Redeem",
        value: stats.rewardsRedeemed.toString(),
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
        trend: [stats.rewardsRedeemed],
        trendType: "area" as const,
      },
    ];
  }, [stats]);

  // Member Growth chart data
  const memberGrowthData = useMemo(() => {
    if (!stats || !stats.memberGrowth || stats.memberGrowth.length === 0) {
      return {
        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep"],
        series: [
          {
            label: "New Member",
            data: [0, 0, 0, 0, 0, 0, 0, 0, 0],
            color: "#6366F1",
          },
          {
            label: "Total Member",
            data: [0, 0, 0, 0, 0, 0, 0, 0, 0],
            color: "#F97316",
          },
        ],
      };
    }

    const labels = stats.memberGrowth.map((m) => m.month);
    const newMemberData = stats.memberGrowth.map((m) => m.newMembers);
    const totalMemberData = stats.memberGrowth.map((m) => m.totalMembers);

    return {
      labels,
      series: [
        {
          label: "New Member",
          data: newMemberData,
          color: "#6366F1",
        },
        {
          label: "Total Member",
          data: totalMemberData,
          color: "#F97316",
        },
      ],
    };
  }, [stats]);

  // Redeem Rewards donut chart data
  const redeemRewardsData = useMemo(() => {
    if (!stats || !stats.redeemRewards || stats.redeemRewards.length === 0) {
      return [
        { label: "No Redemptions", value: 0, color: "#C1A7A3" },
      ];
    }

    const colors = ["#C1A7A3", "#DCCAB7", "#706C6B", "#A88F8B"];
    return stats.redeemRewards.map((reward, index) => ({
      label: reward.label,
      value: reward.value,
      color: colors[index % colors.length],
    }));
  }, [stats]);

  // Points Flow grouped bar chart data
  const pointsFlowData = useMemo(() => {
    if (!stats || !stats.pointsFlow || stats.pointsFlow.length === 0) {
      return [
        {
          label: "Jan",
          values: [
            { label: "Points Earned", value: 0, color: "#6366F1" },
            { label: "Points Redeemed", value: 0, color: "#F97316" },
          ],
        },
      ];
    }

    return stats.pointsFlow.map((flow) => ({
      label: flow.month,
      values: [
        { label: "Points Earned", value: flow.earned, color: "#6366F1" },
        { label: "Points Redeemed", value: flow.redeemed, color: "#F97316" },
      ],
    }));
  }, [stats]);

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

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-16">
            <div className="text-sm text-[#706C6B] dark:text-[#C1A7A3]">
              Loading loyalty data...
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="flex flex-col items-center justify-center py-16">
            <p className="text-sm text-red-600 dark:text-red-400 mb-4">
              Error: {error}
            </p>
            <button
              onClick={() => refetch()}
              className="px-4 py-2 bg-[#C1A7A3] text-white rounded-lg hover:bg-[#A8928E] transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* Content */}
        {!loading && !error && stats && (
          <>
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
                  yAxisMax={Math.max(...memberGrowthData.series[1]?.data || [0], 100)}
                  yAxisStep={Math.ceil(Math.max(...memberGrowthData.series[1]?.data || [0], 100) / 5)}
                />
              </ChartCard>
            </div>

            {/* Redeem Rewards and Points Flow Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <DonutChart
                data={redeemRewardsData}
                totalLabel="Total Reward"
                totalValue={redeemRewardsData.reduce((sum, item) => sum + item.value, 0)}
                title="Redeem Rewards"
              />
              <GroupedBarChart
                data={pointsFlowData}
                yAxisMin={0}
                yAxisMax={Math.max(...pointsFlowData.flatMap(d => d.values.map(v => v.value)), 1000)}
                yAxisStep={Math.ceil(Math.max(...pointsFlowData.flatMap(d => d.values.map(v => v.value)), 1000) / 5)}
                title="Points Flow"
              />
            </div>
          </>
        )}
      </div>
    </SejenakDashboardLayout>
  );
}

