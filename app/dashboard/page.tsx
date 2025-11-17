"use client";

import React, { useState, useEffect } from "react";
import { useUser, useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useProfile } from "@/hooks/useProfile";
import { SejenakDashboardLayout } from "@/components/layout/SejenakDashboardLayout";
import { Footer } from "@/components/layout";
import {
  SejenakStatCard,
  AppointmentSummary,
  StackedBarChart,
  DonutChart,
  TopTherapistList,
  AllAppointmentsTable,
  TopCustomerList,
  CustomerRetentionChart,
  CustomerAlertsList,
  RevenueTrendChart,
} from "@/components/dashboard";
import {
  ChartIcon,
  UsersIcon,
  AppointmentIcon,
} from "@/components/icons";
import { getNavItems } from "@/config/navigation";
import CustomerDashboard from "@/components/customer/CustomerDashboard";

export default function DashboardPage() {
  const { user, isLoaded: userLoaded } = useUser();
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const { profile, loading: profileLoading } = useProfile();

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

  useEffect(() => {
    if (userLoaded && !isSignedIn) {
      router.push("/?redirect=/dashboard");
    }
  }, [userLoaded, isSignedIn, router]);

  // Redirect based on role
  useEffect(() => {
    if (profile && profile.role === "customer") {
      // Customer should see their own dashboard, not admin dashboard
      // We'll show customer view in the same route
    }
  }, [profile]);

  if (!userLoaded || !isSignedIn || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C1A7A3] mx-auto mb-4"></div>
          <p className="text-[#706C6B] dark:text-[#C1A7A3]">Loading...</p>
        </div>
      </div>
    );
  }

  // Show customer dashboard if user is a customer
  if (profile?.role === "customer") {
    return <CustomerDashboard profile={profile} />;
  }

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

  // All Appointments Data
  const allAppointments = [
    {
      id: "1",
      customerName: "Patricia",
      customerAvatar: undefined,
      therapistName: "Margot Kim",
      therapistAvatar: undefined,
      date: "28 May 2025 - 11:15 AM",
      treatment: "The Prestiges Menicure",
      status: "confirmed" as const,
    },
    {
      id: "2",
      customerName: "Grace Wallen",
      customerAvatar: undefined,
      therapistName: "Margot Kim",
      therapistAvatar: undefined,
      date: "29 May 2025 - 11:30 AM",
      treatment: "Sejenak Complete Rituals +1",
      status: "cancelled" as const,
    },
    {
      id: "3",
      customerName: "Grace Wallen",
      customerAvatar: undefined,
      therapistName: "Margot Kim",
      therapistAvatar: undefined,
      date: "30 May 2025 - 09:30 AM",
      treatment: "Sejenak Mini Escape +1",
      status: "confirmed" as const,
    },
    {
      id: "4",
      customerName: "Grace Wallen",
      customerAvatar: undefined,
      therapistName: "Margot Kim",
      therapistAvatar: undefined,
      date: "30 May 2025 - 10:00 AM",
      treatment: "Sejenak Full Body Indulgence +1",
      status: "schedule" as const,
    },
    {
      id: "5",
      customerName: "Margot Kim",
      customerAvatar: undefined,
      therapistName: "Margot Kim",
      therapistAvatar: undefined,
      date: "30 May 2025 - 11:00 AM",
      treatment: "The Presiges Pedicure",
      status: "schedule" as const,
    },
  ];

  // Top Customers Data
  const topCustomers = [
    {
      id: "1",
      name: "Jane Doe",
      avatar: undefined,
      totalPaid: 10000000,
      appointments: 80,
    },
    {
      id: "2",
      name: "Jane Doe",
      avatar: undefined,
      totalPaid: 8000000,
      appointments: 60,
    },
    {
      id: "3",
      name: "Jane Doe",
      avatar: undefined,
      totalPaid: 6000000,
      appointments: 45,
    },
    {
      id: "4",
      name: "Jane Doe",
      avatar: undefined,
      totalPaid: 3500000,
      appointments: 30,
    },
    {
      id: "5",
      name: "Jane Doe",
      avatar: undefined,
      totalPaid: 1500000,
      appointments: 10,
    },
  ];

  // Customer Retention Data
  const customerRetentionData = {
    new: 70,
    returning: 30,
  };

  // Customer Alerts Data
  const customerAlerts = [
    {
      id: "1",
      name: "Angel Caroline",
      avatar: undefined,
      cancelled: 12,
      noShow: 2,
      status: "flagged" as const,
    },
    {
      id: "2",
      name: "Desy Wallen",
      avatar: undefined,
      cancelled: 8,
      noShow: 3,
      status: "flagged" as const,
    },
    {
      id: "3",
      name: "Grace Wallen",
      avatar: undefined,
      cancelled: 3,
      noShow: 2,
      status: "at-risk" as const,
    },
    {
      id: "4",
      name: "Ezra Belcher",
      avatar: undefined,
      cancelled: 3,
      noShow: 2,
      status: "at-risk" as const,
    },
    {
      id: "5",
      name: "Sandy Katherin",
      avatar: undefined,
      cancelled: 3,
      noShow: 2,
      status: "at-risk" as const,
    },
  ];

  // Revenue Trend Data
  const revenueTrendData = [
    { label: "Jan", value: 20000000 },
    { label: "Feb", value: 22000000 },
    { label: "Mar", value: 30000000 },
    { label: "Apr", value: 25000000 },
    { label: "May", value: 32000000 },
    { label: "Jun", value: 28000000 },
    { label: "Jul", value: 29000000 },
    { label: "Aug", value: 31000000 },
    { label: "Sept", value: 33000000 },
  ];

  const locations = ["Islamic Village", "Location 2", "Location 3"];

  return (
    <SejenakDashboardLayout
      navItems={getNavItems(profile?.role)}
      headerTitle="Overview Dashboard"
      location={location}
      locations={locations}
      onLocationChange={setLocation}
      dateRange={dateRange}
      onDateRangeChange={(direction) => {
        // Simple navigation - in real app, this would update dates properly
        console.log("Navigate", direction);
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

          {/* Right Column: Top Category and Top Treatment by Category */}
          <div className="space-y-6">
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

        {/* Revenue Trend - Full Row */}
        <RevenueTrendChart data={revenueTrendData} />

        {/* All Appointments - Full Row */}
        <AllAppointmentsTable appointments={allAppointments} />

        {/* Bottom Section: Top Customer, Customer Retention, Customer Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Top Customer */}
          <TopCustomerList customers={topCustomers} />

          {/* Customer Retention */}
          <CustomerRetentionChart data={customerRetentionData} />

          {/* Customer Alerts */}
          <CustomerAlertsList customers={customerAlerts} />
        </div>
      </div>
    </SejenakDashboardLayout>
  );
}

