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
import { useDashboardData } from "@/hooks/useDashboardData";
import { useDashboardAppointments } from "@/hooks/useDashboardAppointments";
import { useTopCustomers, useCustomerRetention, useCustomerAlerts } from "@/hooks/useDashboardCustomers";
import { useBranches } from "@/hooks/useBranches";
import { useTreatmentCategories } from "@/hooks/useTreatmentCategories";
import { PeriodType } from "@/components/ui/DateRangePicker";

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

  const [location, setLocation] = useState<string>("");
  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), 0, 1), // Start of year
    end: new Date(), // Today
  });

  // Fetch branches
  const { branches, loading: branchesLoading } = useBranches();
  
  // Fetch treatment categories
  const { categories, loading: categoriesLoading } = useTreatmentCategories();

  // Set default branch when branches load
  useEffect(() => {
    if (branches.length > 0 && !selectedBranchId) {
      const firstBranch = branches[0];
      setSelectedBranchId(firstBranch.id);
      setLocation(firstBranch.name);
    }
  }, [branches, selectedBranchId]);

  // Fetch dashboard data
  const {
    stats,
    appointmentData,
    topCategoryData,
    topTreatmentData,
    therapists,
    revenueTrend,
    loading: dashboardLoading,
    error: dashboardError,
  } = useDashboardData(selectedBranchId, dateRange.start, dateRange.end, selectedCategory === "all" ? null : selectedCategory);


  // Fetch appointments (fetch all, pagination handled in component)
  const {
    appointments: allAppointments,
    loading: appointmentsLoading,
  } = useDashboardAppointments(selectedBranchId, 1000);

  // Fetch top customers
  const {
    customers: topCustomers,
    loading: customersLoading,
  } = useTopCustomers(selectedBranchId, 5);

  // Fetch customer retention
  const {
    new: newCustomers,
    returning: returningCustomers,
    loading: retentionLoading,
  } = useCustomerRetention(selectedBranchId);

  // Fetch customer alerts
  const {
    alerts: customerAlerts,
    loading: alertsLoading,
  } = useCustomerAlerts(selectedBranchId, 5);

  // Handle location change
  const handleLocationChange = (locationName: string) => {
    setLocation(locationName);
    const branch = branches.find((b) => b.name === locationName);
    setSelectedBranchId(branch?.id || null);
  };

  // Handle period change
  const handlePeriodChange = (period: PeriodType, start: Date, end: Date) => {
    setDateRange({ start, end });
  };

  // Handle category change
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };

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

  const isLoading =
    branchesLoading ||
    dashboardLoading ||
    appointmentsLoading ||
    customersLoading ||
    retentionLoading ||
    alertsLoading;

  // Calculate appointment summary stats
  const appointmentSummary = stats
    ? {
        all: stats.appointmentCount || 0,
        cancelled: stats.cancelledCount || 0,
        completed: stats.completedCount || 0,
      }
    : { all: 0, cancelled: 0, completed: 0 };


  // Stat Cards Data
  const statCards = stats
    ? [
        {
          title: "Therapist",
          value: stats.therapistCount,
          icon: <UsersIcon />,
          trend: stats.therapistTrend,
          trendType: "bar" as const,
        },
        {
          title: "Customer",
          value: stats.customerCount,
          icon: <UsersIcon />,
          trend: stats.customerTrend,
          trendType: "area" as const,
        },
        {
          title: "Appointment",
          value: stats.appointmentCount,
          icon: <AppointmentIcon />,
          trend: stats.appointmentTrend,
          trendType: "bar" as const,
        },
        {
          title: "Revenue",
          value: stats.revenue,
          icon: <ChartIcon />,
          trend: stats.revenueTrend,
          trendType: "area" as const,
        },
      ]
    : [
        {
          title: "Therapist",
          value: 0,
          icon: <UsersIcon />,
          trend: [0, 0, 0, 0, 0, 0],
          trendType: "bar" as const,
        },
        {
          title: "Customer",
          value: 0,
          icon: <UsersIcon />,
          trend: [0, 0, 0, 0, 0, 0],
          trendType: "area" as const,
        },
        {
          title: "Appointment",
          value: 0,
          icon: <AppointmentIcon />,
          trend: [0, 0, 0, 0, 0, 0],
          trendType: "bar" as const,
        },
        {
          title: "Revenue",
          value: 0,
          icon: <ChartIcon />,
          trend: [0, 0, 0, 0, 0, 0],
          trendType: "area" as const,
        },
      ];

  // Mock data for fallback
  const mockAppointmentData = [
    { month: "Jan", completed: 0, cancelled: 0 },
    { month: "Feb", completed: 0, cancelled: 0 },
    { month: "Mar", completed: 0, cancelled: 0 },
    { month: "Apr", completed: 0, cancelled: 0 },
    { month: "May", completed: 0, cancelled: 0 },
    { month: "Jun", completed: 0, cancelled: 0 },
    { month: "Jul", completed: 0, cancelled: 0 },
    { month: "Aug", completed: 0, cancelled: 0 },
    { month: "Sep", completed: 0, cancelled: 0 },
  ];

  const locations = branches.map((b) => b.name);

  return (
    <SejenakDashboardLayout
      navItems={getNavItems(profile?.role)}
      headerTitle="Overview Dashboard"
      location={location}
      locations={locations}
      onLocationChange={handleLocationChange}
      dateRange={dateRange}
      onDateRangeChange={(direction) => {
        // Calculate new date range based on current period
        const daysDiff = Math.ceil((dateRange.end.getTime() - dateRange.start.getTime()) / (1000 * 60 * 60 * 24));
        if (direction === "prev") {
          setDateRange({
            start: new Date(dateRange.start.getTime() - daysDiff * 24 * 60 * 60 * 1000),
            end: new Date(dateRange.start.getTime() - 24 * 60 * 60 * 1000),
          });
        } else {
          setDateRange({
            start: new Date(dateRange.end.getTime() + 24 * 60 * 60 * 1000),
            end: new Date(dateRange.end.getTime() + daysDiff * 24 * 60 * 60 * 1000),
          });
        }
      }}
      onPeriodChange={handlePeriodChange}
      category={selectedCategory}
      categories={categories}
      onCategoryChange={handleCategoryChange}
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
                all={appointmentSummary.all}
                cancelled={appointmentSummary.cancelled}
                completed={appointmentSummary.completed}
              />
              <StackedBarChart
                data={appointmentData.length > 0 ? appointmentData : mockAppointmentData}
                title="Appointment Statistics"
              />
            </div>

            {/* Top Therapist */}
            <TopTherapistList therapists={therapists.length > 0 ? therapists : []} />
          </div>

          {/* Right Column: Top Category and Top Treatment by Category */}
          <div className="space-y-6">
            <DonutChart
              data={topCategoryData.length > 0 ? topCategoryData : []}
              totalLabel="Total Customer"
              totalValue={stats?.customerCount || 0}
              title="Top Category"
            />

            {/* Top Treatment by Category */}
            <DonutChart
              data={topTreatmentData.length > 0 ? topTreatmentData : []}
              totalLabel="Total Customer"
              totalValue={stats?.customerCount || 0}
              title="Top Treatment by Category"
            />
          </div>
        </div>

        {/* Revenue Trend - Full Row */}
        <RevenueTrendChart data={revenueTrend.length > 0 ? revenueTrend : []} />

        {/* All Appointments - Full Row */}
        <AllAppointmentsTable appointments={allAppointments} />

        {/* Bottom Section: Top Customer, Customer Retention, Customer Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Top Customer */}
          <TopCustomerList customers={topCustomers} />

          {/* Customer Retention */}
          <CustomerRetentionChart
            data={{
              new: newCustomers,
              returning: returningCustomers,
            }}
          />

          {/* Customer Alerts */}
          <CustomerAlertsList customers={customerAlerts} />
        </div>
      </div>
    </SejenakDashboardLayout>
  );
}

