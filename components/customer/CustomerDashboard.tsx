"use client";

import React, { useState, useEffect } from "react";
import { SejenakDashboardLayout } from "@/components/layout/SejenakDashboardLayout";
import { Footer } from "@/components/layout";
import { Profile } from "@/lib/supabase";
import { supabase } from "@/lib/supabase";
import { AppointmentIcon } from "@/components/icons";
import { getNavItems } from "@/config/navigation";

interface Booking {
  id: string;
  booking_date: string;
  booking_time: string;
  status: string;
  total_price: number;
  treatment_id: string | null;
  therapist_id: string | null;
}

interface CustomerDashboardProps {
  profile: Profile;
}

export default function CustomerDashboard({ profile }: CustomerDashboardProps) {
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

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

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
    async function fetchBookings() {
      if (!profile?.id) return;

      try {
        const { data, error } = await supabase
          .from("bookings")
          .select("*")
          .eq("user_id", profile.id)
          .order("booking_date", { ascending: false })
          .limit(10);

        if (error) throw error;
        setBookings(data || []);
      } catch (error) {
        console.error("Error fetching bookings:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchBookings();
  }, [profile?.id]);

  const locations = ["Islamic Village", "Location 2", "Location 3"];

  const upcomingBookings = bookings.filter(
    (b) =>
      b.status !== "completed" &&
      b.status !== "cancelled" &&
      new Date(b.booking_date) >= new Date()
  );

  const pastBookings = bookings.filter(
    (b) =>
      b.status === "completed" ||
      b.status === "cancelled" ||
      new Date(b.booking_date) < new Date()
  );

  return (
    <SejenakDashboardLayout
      navItems={getNavItems(profile.role)}
      headerTitle="My Dashboard"
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
      footer={<Footer />}
    >
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-white dark:bg-[#3D3B3A] rounded-xl p-6 border border-zinc-200 dark:border-zinc-800">
          <h1 className="text-2xl font-bold text-[#191919] dark:text-[#F0EEED] mb-2">
            Welcome back, {profile.full_name || "Customer"}!
          </h1>
          <p className="text-[#706C6B] dark:text-[#C1A7A3]">
            Manage your appointments and view your booking history
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-[#3D3B3A] rounded-xl p-6 border border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center gap-3 mb-2">
              <AppointmentIcon />
              <h3 className="text-sm font-medium text-[#706C6B] dark:text-[#C1A7A3]">
                Upcoming Appointments
              </h3>
            </div>
            <p className="text-3xl font-bold text-[#191919] dark:text-[#F0EEED]">
              {upcomingBookings.length}
            </p>
          </div>
          <div className="bg-white dark:bg-[#3D3B3A] rounded-xl p-6 border border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center gap-3 mb-2">
              <AppointmentIcon />
              <h3 className="text-sm font-medium text-[#706C6B] dark:text-[#C1A7A3]">
                Total Bookings
              </h3>
            </div>
            <p className="text-3xl font-bold text-[#191919] dark:text-[#F0EEED]">
              {bookings.length}
            </p>
          </div>
          <div className="bg-white dark:bg-[#3D3B3A] rounded-xl p-6 border border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center gap-3 mb-2">
              <AppointmentIcon />
              <h3 className="text-sm font-medium text-[#706C6B] dark:text-[#C1A7A3]">
                Completed
              </h3>
            </div>
            <p className="text-3xl font-bold text-[#191919] dark:text-[#F0EEED]">
              {pastBookings.filter((b) => b.status === "completed").length}
            </p>
          </div>
        </div>

        {/* Upcoming Appointments */}
        <div className="bg-white dark:bg-[#3D3B3A] rounded-xl p-6 border border-zinc-200 dark:border-zinc-800">
          <h2 className="text-xl font-bold text-[#191919] dark:text-[#F0EEED] mb-4">
            Upcoming Appointments
          </h2>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C1A7A3] mx-auto mb-4"></div>
              <p className="text-[#706C6B] dark:text-[#C1A7A3]">Loading...</p>
            </div>
          ) : upcomingBookings.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-[#706C6B] dark:text-[#C1A7A3]">
                No upcoming appointments
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="flex items-center justify-between p-4 bg-[#F0EEED] dark:bg-[#191919] rounded-lg"
                >
                  <div>
                    <p className="font-semibold text-[#191919] dark:text-[#F0EEED]">
                      {new Date(booking.booking_date).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-[#706C6B] dark:text-[#C1A7A3]">
                      {booking.booking_time}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-[#C1A7A3] text-white">
                      {booking.status}
                    </span>
                    <p className="text-sm text-[#706C6B] dark:text-[#C1A7A3] mt-1">
                      Rp {booking.total_price.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Bookings */}
        <div className="bg-white dark:bg-[#3D3B3A] rounded-xl p-6 border border-zinc-200 dark:border-zinc-800">
          <h2 className="text-xl font-bold text-[#191919] dark:text-[#F0EEED] mb-4">
            Recent Bookings
          </h2>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C1A7A3] mx-auto mb-4"></div>
              <p className="text-[#706C6B] dark:text-[#C1A7A3]">Loading...</p>
            </div>
          ) : pastBookings.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-[#706C6B] dark:text-[#C1A7A3]">
                No past bookings
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {pastBookings.slice(0, 5).map((booking) => (
                <div
                  key={booking.id}
                  className="flex items-center justify-between p-4 bg-[#F0EEED] dark:bg-[#191919] rounded-lg"
                >
                  <div>
                    <p className="font-semibold text-[#191919] dark:text-[#F0EEED]">
                      {new Date(booking.booking_date).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-[#706C6B] dark:text-[#C1A7A3]">
                      {booking.booking_time} • {booking.status}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-[#191919] dark:text-[#F0EEED]">
                      Rp {booking.total_price.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </SejenakDashboardLayout>
  );
}


