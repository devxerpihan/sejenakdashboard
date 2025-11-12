"use client";

import React, { useState, useEffect } from "react";
import { SejenakDashboardLayout } from "@/components/layout/SejenakDashboardLayout";
import { Footer } from "@/components/layout";
import {
  SejenakStatCard,
  AppointmentSummary,
  StackedBarChart,
  DonutChart,
  TopTherapistList,
} from "@/components/dashboard";
import {
  ChartIcon,
  UsersIcon,
  AppointmentIcon,
} from "@/components/icons";
import { navItems } from "@/config/navigation";

export default function DashboardPage() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Initialize from localStorage if available, default to false (light mode)
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

  // Stat Cards Data
  const statCards = [
    {
      title: "Therapist",
      value: 30,
      icon: <UsersIcon />,
      trend: [20, 25, 28, 30, 30, 30],
      trendType: "bar" as const,
    },
    {
      title: "Customer",
      value: 500,
      icon: <UsersIcon />,
      trend: [400, 450, 480, 490, 495, 500],
      trendType: "area" as const,
    },
    {
      title: "Appointment",
      value: 745,
      icon: <AppointmentIcon />,
      trend: [600, 650, 700, 720, 735, 745],
      trendType: "bar" as const,
    },
    {
      title: "Revenue",
      value: 597000000,
      icon: <ChartIcon />,
      trend: [500000000, 520000000, 540000000, 560000000, 580000000, 597000000],
      trendType: "area" as const,
    },
  ];

  // Appointment Data
  const appointmentData = [
    { month: "Jan", completed: 85, cancelled: 5 },
    { month: "Feb", completed: 90, cancelled: 6 },
    { month: "Mar", completed: 95, cancelled: 7 },
    { month: "Apr", completed: 100, cancelled: 8 },
    { month: "May", completed: 105, cancelled: 9 },
    { month: "Jun", completed: 110, cancelled: 10 },
    { month: "Jul", completed: 105, cancelled: 9 },
    { month: "Aug", completed: 115, cancelled: 8 },
    { month: "Sep", completed: 120, cancelled: 10 },
  ];

  // Top Category Data
  const topCategoryData = [
    { label: "Hair", value: 214, color: "#C1A7A3" }, // Rose
    { label: "Nail", value: 150, color: "#DCCAB7" }, // Beige
    { label: "Body", value: 121, color: "#706C6B" }, // Taupe
  ];

  // Top Treatment Data
  const topTreatmentData = [
    { label: "Sejenak...", value: 214, color: "#C1A7A3" }, // Rose
    { label: "Menicure...", value: 150, color: "#DCCAB7" }, // Beige
    { label: "Body", value: 121, color: "#706C6B" }, // Taupe
  ];

  // Top Therapists Data
  const therapists = [
    {
      id: "1",
      name: "Cindy Caroline",
      bookings: 258,
      avatar: undefined, // Would be a real image URL
    },
    {
      id: "2",
      name: "Emily Carter",
      bookings: 125,
      avatar: undefined,
    },
    {
      id: "3",
      name: "Sarah Johnson",
      bookings: 98,
      avatar: undefined,
    },
  ];

  const locations = ["Islamic Village", "Location 2", "Location 3"];

  return (
    <SejenakDashboardLayout
      navItems={navItems}
      headerTitle="Overview Dashboard"
      location={location}
      locations={locations}
      onLocationChange={setLocation}
      dateRange={dateRange}
      onDateRangeChange={(direction) => {
        // Simple navigation - in real app, this would update dates properly
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
      footer={<Footer />}
    >
      <div className="space-y-6">
        {/* Stat Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat, index) => (
            <SejenakStatCard key={index} {...stat} />
          ))}
        </div>

        {/* Main Content Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Appointment Statistics and Top Therapist */}
          <div className="lg:col-span-2 space-y-6">
            {/* Appointment Statistics */}
            <div className="space-y-6">
              <AppointmentSummary
                all={745}
                cancelled={67}
                completed={745}
              />
              <StackedBarChart
                data={appointmentData}
                title="Appointment Statistics"
              />
            </div>

            {/* Top Therapist */}
            <TopTherapistList therapists={therapists} />
          </div>

          {/* Right Column: Top Category and Top Treatment (stacked) */}
          <div className="space-y-6">
            {/* Top Category */}
            <DonutChart
              data={topCategoryData}
              totalLabel="Total Customer"
              totalValue={569}
              title="Top Category"
            />

            {/* Top Treatment by Category */}
            <DonutChart
              data={topTreatmentData}
              totalLabel="Total Customer"
              totalValue={569}
              title="Top Treatment by Category"
            />
          </div>
        </div>
      </div>
    </SejenakDashboardLayout>
  );
}

