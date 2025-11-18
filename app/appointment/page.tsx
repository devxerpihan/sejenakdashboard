"use client";

import React, { useState, useEffect, useMemo } from "react";
import { SejenakDashboardLayout } from "@/components/layout/SejenakDashboardLayout";
import { Footer } from "@/components/layout";
import {
  AppointmentSchedule,
  AppointmentHeader,
  AppointmentListView,
} from "@/components/appointment";
import { Appointment, Therapist, ViewMode } from "@/types/appointment";
import { getNavItems } from "@/config/navigation";
import { useProfile } from "@/hooks/useProfile";
import { useAppointments } from "@/hooks/useAppointments";
import { useAppointmentTherapists } from "@/hooks/useAppointmentTherapists";
import { useBranches } from "@/hooks/useBranches";

export default function AppointmentPage() {
  const { profile } = useProfile();
  
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("darkMode");
      return saved === "true";
    }
    return false;
  });

  const [currentView, setCurrentView] = useState<ViewMode>("week");
  const [viewMode, setViewMode] = useState<"list" | "grid">("grid");
  
  // Helper functions for date ranges
  const getCurrentDay = () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setHours(23, 59, 59, 999);
    return { start, end };
  };

  const getCurrentWeek = () => {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Adjust to Monday
    const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - day + (day === 0 ? -6 : 1));
    monday.setHours(0, 0, 0, 0);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);
    return { start: monday, end: sunday };
  };

  // Initialize date range based on view mode
  const [dateRange, setDateRange] = useState(() => {
    // Default to week view
    return getCurrentWeek();
  });
  
  // Get branches for location selector
  const { branches, loading: branchesLoading } = useBranches();
  const locations = useMemo(() => {
    return branches.map((b) => b.name);
  }, [branches]);
  
  const [location, setLocation] = useState("All Locations");
  
  // Get selected branch ID
  const selectedBranchId = useMemo(() => {
    const branch = branches.find((b) => b.name === location);
    return branch?.id || null;
  }, [branches, location]);

  // Fetch appointments and therapists
  const {
    appointments: allAppointments,
    loading: appointmentsLoading,
    error: appointmentsError,
  } = useAppointments(selectedBranchId, dateRange.start, dateRange.end);

  const {
    therapists: allTherapists,
    loading: therapistsLoading,
    error: therapistsError,
  } = useAppointmentTherapists(selectedBranchId);

  // Extract unique rooms from appointments
  const rooms = useMemo(() => {
    const roomMap = new Map<string, { id: string; name: string }>();
    allAppointments.forEach((apt) => {
      if (apt.roomId && apt.room) {
        roomMap.set(apt.roomId, { id: apt.roomId, name: apt.room });
      }
    });
    return Array.from(roomMap.values());
  }, [allAppointments]);

  // Filter appointments and therapists/rooms based on view mode
  const { filteredAppointments, filteredTherapists, filteredRooms, viewType } = useMemo(() => {
    let filtered = [...allAppointments];
    let therapists = [...allTherapists];
    let roomList = [...rooms];
    let viewType: "therapist" | "room" = "therapist";

    // Filter by view mode
    if (currentView === "day") {
      // Show only appointments for the selected day (dateRange.start)
      // Format date without timezone conversion to avoid date shifts
      const selectedDate = new Date(dateRange.start);
      const selectedDateStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, "0")}-${String(selectedDate.getDate()).padStart(2, "0")}`;
      filtered = filtered.filter((apt) => {
        if (!apt.bookingDate) return false;
        // Ensure we're comparing just the date part (YYYY-MM-DD)
        const aptDateStr = apt.bookingDate.split("T")[0];
        return aptDateStr === selectedDateStr;
      });
    } else if (currentView === "week") {
      // Show appointments within the date range (already filtered by useAppointments)
      // No additional filtering needed
    } else if (currentView === "therapist") {
      // Show all appointments, group by therapist
      // Filter therapists to only those with appointments
      const therapistIdsWithAppointments = new Set(
        filtered.map((apt) => apt.therapistId).filter(Boolean)
      );
      therapists = therapists.filter((t) =>
        therapistIdsWithAppointments.has(t.id)
      );
    } else if (currentView === "room") {
      // Show all appointments, group by room
      viewType = "room";
      const roomIdsWithAppointments = new Set(
        filtered.map((apt) => apt.roomId).filter(Boolean)
      );
      roomList = roomList.filter((r) => roomIdsWithAppointments.has(r.id));
    } else if (currentView === "all") {
      // Show all appointments and therapists
      // No additional filtering needed
    }

    // For therapist and all views, filter therapists to only those with appointments
    // Also include appointments without therapist_id
    if (currentView === "therapist" || currentView === "all") {
      const therapistIdsInAppointments = new Set(
        filtered.map((apt) => apt.therapistId).filter(Boolean)
      );
      therapists = therapists.filter((t) => therapistIdsInAppointments.has(t.id));
      
      // Add a special "Unassigned" therapist for appointments without therapist_id
      const hasUnassignedAppointments = filtered.some((apt) => !apt.therapistId || apt.therapistId === "");
      if (hasUnassignedAppointments) {
        therapists.push({
          id: "__unassigned__",
          name: "Unassigned",
          avatar: undefined,
        });
      }
    }
    
    // For room view, also include appointments without room_id
    if (currentView === "room") {
      const hasUnassignedAppointments = filtered.some((apt) => !apt.roomId || apt.roomId === undefined);
      if (hasUnassignedAppointments) {
        roomList.push({
          id: "__unassigned__",
          name: "Unassigned",
        });
      }
    }

    return {
      filteredAppointments: filtered,
      filteredTherapists: therapists,
      filteredRooms: roomList,
      viewType,
    };
  }, [allAppointments, allTherapists, rooms, currentView, dateRange.start]);

  // Handle date range navigation - respects view mode
  const handleDateRangeChange = (direction: "prev" | "next") => {
    setDateRange((prev) => {
      if (currentView === "day") {
        // Navigate by day
        const newStart = new Date(prev.start);
        if (direction === "prev") {
          newStart.setDate(newStart.getDate() - 1);
        } else {
          newStart.setDate(newStart.getDate() + 1);
        }
        newStart.setHours(0, 0, 0, 0);
        const newEnd = new Date(newStart);
        newEnd.setHours(23, 59, 59, 999);
        return { start: newStart, end: newEnd };
      } else if (currentView === "week") {
        // Navigate by week
        const diff = prev.end.getTime() - prev.start.getTime();
        const days = Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;
        
        const newStart = new Date(prev.start);
        const newEnd = new Date(prev.end);
        
        if (direction === "prev") {
          newStart.setDate(newStart.getDate() - days);
          newEnd.setDate(newEnd.getDate() - days);
        } else {
          newStart.setDate(newStart.getDate() + days);
          newEnd.setDate(newEnd.getDate() + days);
        }
        
        return { start: newStart, end: newEnd };
      } else {
        // For therapist, room, and all views, navigate by the current range
        const diff = prev.end.getTime() - prev.start.getTime();
        const days = Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;
        
        const newStart = new Date(prev.start);
        const newEnd = new Date(prev.end);
        
        if (direction === "prev") {
          newStart.setDate(newStart.getDate() - days);
          newEnd.setDate(newEnd.getDate() - days);
        } else {
          newStart.setDate(newStart.getDate() + days);
          newEnd.setDate(newEnd.getDate() + days);
        }
        
        return { start: newStart, end: newEnd };
      }
    });
  };

  // Handle view change - adjust date range if needed
  const handleViewChange = (view: ViewMode) => {
    setCurrentView(view);
    
    // Adjust date range based on view mode
    if (view === "day") {
      setDateRange(getCurrentDay());
    } else if (view === "week") {
      setDateRange(getCurrentWeek());
    }
    // For therapist, room, and all views, keep current date range
  };

  // Handle period change from DateRangePicker
  const handlePeriodChange = (
    period: import("@/components/ui/DateRangePicker").PeriodType,
    start: Date,
    end: Date
  ) => {
    setDateRange({ start, end });
    
    // Auto-adjust view mode based on period selection
    const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    if (daysDiff === 0 || daysDiff === 1) {
      // Single day - switch to day view
      setCurrentView("day");
    } else if (daysDiff <= 7) {
      // Week or less - switch to week view
      setCurrentView("week");
    }
    // For longer periods, keep current view
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

  // Update location when branches load
  useEffect(() => {
    if (branches.length > 0 && !location) {
      setLocation(branches[0].name);
    }
  }, [branches, location]);

  const loading = appointmentsLoading || therapistsLoading || branchesLoading;
  const error = appointmentsError || therapistsError;

  return (
    <SejenakDashboardLayout
      navItems={getNavItems(profile?.role)}
      headerTitle="Appointment"
      location={location}
      locations={locations}
      onLocationChange={setLocation}
      dateRange={dateRange}
      onDateRangeChange={handleDateRangeChange}
      onPeriodChange={handlePeriodChange}
      isDarkMode={isDarkMode}
      onDarkModeToggle={() => {
        setIsDarkMode((prev) => !prev);
      }}
      customHeader={
        <AppointmentHeader
          title="Appointment"
          dateRange={dateRange}
          onDateRangeChange={handleDateRangeChange}
          onPeriodChange={handlePeriodChange}
          currentView={currentView}
          onViewChange={handleViewChange}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onNewAppointment={() => {
            // Handle new appointment creation
            console.log("New Appointment");
          }}
        />
      }
      footer={<Footer />}
    >
      <div className="mb-4">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-[#706C6B] dark:text-[#C1A7A3]">
              Loading appointments...
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-red-500">Error: {error}</div>
          </div>
        ) : viewMode === "list" ? (
          <AppointmentListView
            appointments={filteredAppointments}
            loading={loading}
          />
        ) : (
          <AppointmentSchedule
            appointments={filteredAppointments}
            therapists={viewType === "therapist" || currentView === "all" ? filteredTherapists : []}
            rooms={viewType === "room" ? filteredRooms : []}
            viewType={currentView === "week" ? "week" : currentView === "day" ? "day" : viewType}
            dateRange={dateRange}
            startHour={8}
            endHour={20}
            hourHeight={80}
          />
        )}
      </div>
    </SejenakDashboardLayout>
  );
}

