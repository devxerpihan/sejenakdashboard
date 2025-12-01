"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { SejenakDashboardLayout } from "@/components/layout/SejenakDashboardLayout";
import { Footer } from "@/components/layout";
import { Breadcrumbs } from "@/components/services";
import { navItems } from "@/config/navigation";
import { supabase } from "@/lib/supabase";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { EditIcon, SearchIcon } from "@/components/icons";
import { EditStaffModal } from "@/components/staff/EditStaffModal";

interface StaffDetail {
  id: string;
  name: string;
  email: string;
  phone: string;
  birthDate: string;
  address: string;
  city: string;
  registeredDate: string;
  avatar?: string;
  role: string;
  branch: string;
  status: "active" | "inactive";
  customerHandled: number;
  treatmentCompleted: number;
  averageRating: number;
  commissionEarned: number;
}

export default function StaffDetailPage() {
  const params = useParams();
  const router = useRouter();
  const staffId = params.id as string;

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
    end: new Date(2025, 0, 8),
  });

  const [staff, setStaff] = useState<StaffDetail | null>(null);
  const [staffRole, setStaffRole] = useState<string>("therapist");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "services" | "compensation" | "work-hours">("overview");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

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
    if (staffId) {
      fetchStaffDetail();
    }
  }, [staffId]);

  // Check for edit query parameter
  useEffect(() => {
    if (!loading && staff && typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("edit") === "true" && !isEditModalOpen) {
        setTimeout(() => {
          setIsEditModalOpen(true);
          window.history.replaceState({}, "", window.location.pathname);
        }, 100);
      }
    }
  }, [loading, staff, isEditModalOpen]);

  const fetchStaffDetail = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch staff profile
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", staffId)
        .in("role", ["therapist", "receptionist", "cook_helper", "spa_attendant"])
        .single();

      if (profileError) throw profileError;
      if (!profile) {
        throw new Error("Staff not found");
      }

      // Fetch therapist record if exists
      const { data: therapist } = await supabase
        .from("therapists")
        .select("id, branch_id, is_active")
        .eq("profile_id", staffId)
        .single();

      // Fetch branch name
      let branchName = "Unknown";
      if (therapist?.branch_id) {
        const { data: branch } = await supabase
          .from("branches")
          .select("name")
          .eq("id", therapist.branch_id)
          .single();
        if (branch) branchName = branch.name;
      }

      // Fetch bookings for stats (only for therapists)
      let customerHandled = 0;
      let treatmentCompleted = 0;
      let averageRating = 0;
      let commissionEarned = 0;

      if (profile.role === "therapist") {
        const { data: bookings } = await supabase
          .from("bookings")
          .select("user_id, status, total_price")
          .eq("therapist_id", therapist?.id || "")
          .eq("status", "completed");

        if (bookings) {
          const uniqueCustomers = new Set(bookings.map((b: any) => b.user_id));
          customerHandled = uniqueCustomers.size;
          treatmentCompleted = bookings.length;
          
          // Calculate commission (assuming 10% commission)
          commissionEarned = bookings.reduce((sum: number, b: any) => sum + (b.total_price || 0) * 0.1, 0);
        }

        // Fetch reviews for average rating
        const { data: reviews } = await supabase
          .from("reviews")
          .select("rating")
          .eq("therapist_id", therapist?.id || "");

        if (reviews && reviews.length > 0) {
          const totalRating = reviews.reduce((sum: number, r: any) => sum + (r.rating || 0), 0);
          averageRating = totalRating / reviews.length;
        }
      }

      // Format dates for display
      const formatDateForDisplay = (dateStr: string | null) => {
        if (!dateStr) return "";
        const date = new Date(dateStr);
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();
        const getMonthName = (month: number) => {
          const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
          return months[month];
        };
        return `${day} ${getMonthName(date.getMonth())} ${year}`;
      };

      // Map role from database to display format
      let roleDisplay: string = "Therapist";
      if (profile.role === "receptionist") roleDisplay = "Receptionist";
      else if (profile.role === "cook_helper") roleDisplay = "Cook Helper";
      else if (profile.role === "spa_attendant") roleDisplay = "Spa Attendant";
      else roleDisplay = "Therapist";

      setStaffRole(profile.role || "therapist");

      setStaff({
        id: profile.id,
        name: profile.full_name || "Unknown Staff",
        email: profile.email || "",
        phone: profile.phone || "",
        birthDate: formatDateForDisplay(profile.date_of_birth),
        address: profile.address || "",
        city: "-", // Would need to be stored in profile
        registeredDate: formatDateForDisplay(profile.created_at),
        avatar: profile.avatar_url || undefined,
        role: roleDisplay,
        branch: branchName,
        status: therapist?.is_active !== false ? "active" : "inactive",
        customerHandled,
        treatmentCompleted,
        averageRating: Math.round(averageRating * 10) / 10,
        commissionEarned,
      });
    } catch (err: any) {
      console.error("Error fetching staff detail:", err);
      setError(err.message || "Failed to fetch staff details");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "";
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const parseDate = (dateStr: string) => {
    if (!dateStr) return null;
    // Try parsing DD MMM YYYY format first
    const parts = dateStr.split(" ");
    if (parts.length === 3) {
      const months: { [key: string]: number } = {
        "Jan": 0, "Feb": 1, "Mar": 2, "Apr": 3, "May": 4, "Jun": 5,
        "Jul": 6, "Aug": 7, "Sep": 8, "Oct": 9, "Nov": 10, "Dec": 11
      };
      const day = parseInt(parts[0]);
      const month = months[parts[1]];
      const year = parseInt(parts[2]);
      if (!isNaN(day) && month !== undefined && !isNaN(year)) {
        return new Date(year, month, day);
      }
    }
    // Fallback to Date constructor
    return new Date(dateStr);
  };

  const locations = ["Islamic Village", "Location 2", "Location 3"];

  if (loading) {
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
        <div className="flex items-center justify-center py-16">
          <div className="text-sm text-[#706C6B] dark:text-[#C1A7A3]">
            Loading staff details...
          </div>
        </div>
      </SejenakDashboardLayout>
    );
  }

  if (error || !staff) {
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
        <div className="flex flex-col items-center justify-center py-16">
          <p className="text-sm text-red-600 dark:text-red-400 mb-4">
            {error || "Staff not found"}
          </p>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-[#C1A7A3] text-white rounded-lg hover:bg-[#A8928E] transition-colors"
          >
            Go Back
          </button>
        </div>
      </SejenakDashboardLayout>
    );
  }

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
            { label: "Staff", href: "/staff" },
            { label: staff.name },
          ]}
        />

        {/* Page Title */}
        <h1 className="text-3xl font-bold text-[#191919] dark:text-[#F0EEED] mb-6">
          Staff Details
        </h1>

        {/* Profile and General Info Card */}
        <div className="bg-white dark:bg-[#191919] rounded-lg border border-zinc-200 dark:border-zinc-800 p-6 mb-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-start gap-6 flex-1">
              {/* Profile Section (Left) */}
              <div className="flex items-start gap-4">
                <Avatar
                  src={staff.avatar}
                  name={staff.name}
                  size="lg"
                />
                <div>
                  <h2 className="text-xl font-semibold text-[#191919] dark:text-[#F0EEED] mb-1">
                    {staff.name}
                  </h2>
                  <p className="text-sm text-[#706C6B] dark:text-[#C1A7A3] mb-1">
                    {staff.role}
                  </p>
                  <p className="text-sm text-[#706C6B] dark:text-[#C1A7A3]">
                    {staff.email}
                  </p>
                </div>
              </div>

              {/* Divider */}
              <div className="h-32 w-px bg-zinc-200 dark:bg-zinc-800 mx-6" />

              {/* General Info Section (Right) */}
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-[#191919] dark:text-[#F0EEED] mb-4">
                  General Info
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <div className="text-xs text-[#706C6B] dark:text-[#C1A7A3] mb-1">
                      Phone Number
                    </div>
                    <div className="text-sm font-medium text-[#191919] dark:text-[#F0EEED]">
                      {staff.phone || "-"}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-[#706C6B] dark:text-[#C1A7A3] mb-1">
                      Birth Date
                    </div>
                    <div className="text-sm font-medium text-[#191919] dark:text-[#F0EEED]">
                      {staff.birthDate || "-"}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-[#706C6B] dark:text-[#C1A7A3] mb-1">
                      Status
                    </div>
                    <div className="text-sm font-medium text-[#191919] dark:text-[#F0EEED]">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          staff.status === "active"
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                        }`}
                      >
                        {staff.status === "active" ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-[#706C6B] dark:text-[#C1A7A3] mb-1">
                      Address
                    </div>
                    <div className="text-sm font-medium text-[#191919] dark:text-[#F0EEED]">
                      {staff.address || "-"}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-[#706C6B] dark:text-[#C1A7A3] mb-1">
                      City
                    </div>
                    <div className="text-sm font-medium text-[#191919] dark:text-[#F0EEED]">
                      {staff.city || "-"}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-[#706C6B] dark:text-[#C1A7A3] mb-1">
                      Registered Date
                    </div>
                    <div className="text-sm font-medium text-[#191919] dark:text-[#F0EEED]">
                      {staff.registeredDate || "-"}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Edit Profile Button */}
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-[#191919] text-[#191919] dark:text-[#F0EEED] hover:bg-[#F0EEED] dark:hover:bg-[#3D3B3A] transition-colors"
            >
              <EditIcon />
              <span>Edit Profile</span>
            </button>
          </div>
        </div>

        {/* Work Profile Section */}
        <div className="bg-white dark:bg-[#191919] rounded-lg border border-zinc-200 dark:border-zinc-800 p-6">
          {/* Tabs */}
          <div className="flex gap-4 mb-6 border-b border-zinc-200 dark:border-zinc-800">
            {(["overview", "services", "compensation", "work-hours"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab
                    ? "border-[#C1A7A3] text-[#C1A7A3]"
                    : "border-transparent text-[#706C6B] dark:text-[#C1A7A3] hover:text-[#191919] dark:hover:text-[#F0EEED]"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1).replace("-", " ")}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === "overview" && (
            <div>
              {/* Date Range Picker */}
              <div className="mb-6">
                <div className="flex items-center gap-2 text-sm text-[#706C6B] dark:text-[#C1A7A3]">
                  <span>{formatDate(dateRange.start)} - {formatDate(dateRange.end)}</span>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="bg-[#F0EEED] dark:bg-[#3D3B3A] rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-[#C1A7A3] flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                      </svg>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-[#191919] dark:text-[#F0EEED] mb-1">
                    {staff.customerHandled}
                  </div>
                  <div className="text-xs text-[#706C6B] dark:text-[#C1A7A3]">
                    Customer handled
                  </div>
                </div>
                <div className="bg-[#F0EEED] dark:bg-[#3D3B3A] rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-[#C1A7A3] flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-[#191919] dark:text-[#F0EEED] mb-1">
                    {staff.treatmentCompleted}
                  </div>
                  <div className="text-xs text-[#706C6B] dark:text-[#C1A7A3]">
                    Treatment completed
                  </div>
                </div>
                <div className="bg-[#F0EEED] dark:bg-[#3D3B3A] rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-[#C1A7A3] flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-[#191919] dark:text-[#F0EEED] mb-1">
                    {staff.averageRating}
                  </div>
                  <div className="text-xs text-[#706C6B] dark:text-[#C1A7A3]">
                    Average rating
                  </div>
                </div>
                <div className="bg-[#F0EEED] dark:bg-[#3D3B3A] rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-[#C1A7A3] flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-[#191919] dark:text-[#F0EEED] mb-1">
                    Rp {staff.commissionEarned.toLocaleString("id-ID")}
                  </div>
                  <div className="text-xs text-[#706C6B] dark:text-[#C1A7A3]">
                    Commission earned
                  </div>
                </div>
              </div>

              {/* Charts Placeholder */}
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-[#F0EEED] dark:bg-[#3D3B3A] rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-[#191919] dark:text-[#F0EEED] mb-4">
                    Appointment Trend
                  </h3>
                  <div className="h-64 flex items-center justify-center text-[#706C6B] dark:text-[#C1A7A3]">
                    Chart placeholder
                  </div>
                </div>
                <div className="bg-[#F0EEED] dark:bg-[#3D3B3A] rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-[#191919] dark:text-[#F0EEED] mb-4">
                    Top Services
                  </h3>
                  <div className="h-64 flex items-center justify-center text-[#706C6B] dark:text-[#C1A7A3]">
                    Chart placeholder
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "services" && (
            <div>
              <p className="text-sm text-[#706C6B] dark:text-[#C1A7A3]">
                Services tab content
              </p>
            </div>
          )}

          {activeTab === "compensation" && (
            <div>
              <p className="text-sm text-[#706C6B] dark:text-[#C1A7A3]">
                Compensation tab content
              </p>
            </div>
          )}

          {activeTab === "work-hours" && (
            <div>
              <p className="text-sm text-[#706C6B] dark:text-[#C1A7A3]">
                Work Hours tab content
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Edit Staff Modal */}
      {staff && (
        <EditStaffModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          staff={{
            id: staff.id,
            name: staff.name,
            email: staff.email,
            phone: staff.phone,
            birthDate: staff.birthDate ? formatDate(parseDate(staff.birthDate)) : "",
            address: staff.address,
            city: staff.city,
            registeredDate: staff.registeredDate ? formatDate(parseDate(staff.registeredDate)) : "",
            role: staffRole,
            branch: staff.branch,
            status: staff.status,
          }}
          onSave={() => {
            fetchStaffDetail(); // Refresh staff data
          }}
        />
      )}
    </SejenakDashboardLayout>
  );
}

