"use client";

import React, { useState, useEffect } from "react";
import { SejenakDashboardLayout } from "@/components/layout/SejenakDashboardLayout";
import { Footer } from "@/components/layout";
import {
  AppointmentSchedule,
  AppointmentHeader,
} from "@/components/appointment";
import { Appointment, Therapist, ViewMode } from "@/types/appointment";
import { getNavItems } from "@/config/navigation";
import { useProfile } from "@/hooks/useProfile";

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

  // Sample therapists data
  const therapists: Therapist[] = [
    { id: "1", name: "Abril Lewis", avatar: undefined },
    { id: "2", name: "Allan Hicks", avatar: undefined },
    { id: "3", name: "Abril Lewis", avatar: undefined },
    { id: "4", name: "Allan Hicks", avatar: undefined },
    { id: "5", name: "Allan Hic Physician", avatar: undefined },
  ];

  // Sample appointments data
  const appointments: Appointment[] = [
    {
      id: "1",
      treatmentName: "TREATMENT NAME",
      patientName: "Patient name",
      startTime: "08:00",
      endTime: "09:00",
      room: "VIP Room",
      therapistId: "1",
      status: "completed",
      color: "#FED7AA", // Light orange
    },
    {
      id: "2",
      treatmentName: "TREATMENT NAME",
      patientName: "Patient name",
      startTime: "09:00",
      endTime: "10:00",
      room: "VIP Room",
      therapistId: "1",
      color: "#E9D5FF", // Light purple
    },
    {
      id: "3",
      treatmentName: "TREATMENT NAME",
      patientName: "Patient name",
      startTime: "09:00",
      endTime: "10:00",
      room: "VIP Room",
      therapistId: "1",
      color: "#D1FAE5", // Light green
    },
    {
      id: "4",
      treatmentName: "TREATMENT NAME",
      patientName: "Patient name",
      startTime: "10:00",
      endTime: "11:00",
      room: "VIP Room",
      therapistId: "1",
      color: "#FEE2E2", // Light red
    },
    {
      id: "5",
      treatmentName: "TREATMENT NAME",
      patientName: "Patient name",
      startTime: "09:00",
      endTime: "10:00",
      room: "VIP Room",
      therapistId: "2",
      color: "#FED7AA", // Light orange
    },
    {
      id: "6",
      treatmentName: "TREATMENT NAME",
      patientName: "Patient name",
      startTime: "10:00",
      endTime: "11:00",
      room: "VIP Room",
      therapistId: "2",
      color: "#FED7AA", // Light orange
    },
    {
      id: "7",
      treatmentName: "TREATMENT NAME",
      patientName: "Patient name",
      startTime: "09:00",
      endTime: "10:00",
      room: "VIP Room",
      therapistId: "3",
      color: "#FED7AA", // Light orange
    },
    {
      id: "8",
      treatmentName: "TREATMENT NAME",
      patientName: "Patient name",
      startTime: "10:00",
      endTime: "11:00",
      room: "VIP Room",
      therapistId: "3",
      color: "#FED7AA", // Light orange
    },
    {
      id: "9",
      treatmentName: "TREATMENT NAME",
      patientName: "Patient name",
      startTime: "11:00",
      endTime: "12:00",
      room: "VIP Room",
      therapistId: "1",
      status: "check-in",
      color: "#D1FAE5", // Light green
    },
    {
      id: "10",
      treatmentName: "TREATMENT NAME",
      patientName: "Patient name",
      startTime: "11:00",
      endTime: "12:00",
      room: "VIP Room",
      therapistId: "2",
      color: "#E9D5FF", // Light purple
    },
    {
      id: "11",
      treatmentName: "TREATMENT NAME",
      patientName: "Patient name",
      startTime: "12:00",
      endTime: "13:00",
      room: "VIP Room",
      therapistId: "1",
      status: "check-in",
      color: "#E9D5FF", // Light purple
    },
    {
      id: "12",
      treatmentName: "TREATMENT NAME",
      patientName: "Patient name",
      startTime: "12:00",
      endTime: "13:00",
      room: "VIP Room",
      therapistId: "2",
      status: "check-in",
      color: "#E9D5FF", // Light purple
    },
    {
      id: "13",
      treatmentName: "TREATMENT NAME",
      patientName: "Patient name",
      startTime: "12:00",
      endTime: "13:00",
      room: "VIP Room",
      therapistId: "3",
      status: "check-in",
      color: "#E9D5FF", // Light purple
    },
    {
      id: "14",
      treatmentName: "TREATMENT NAME",
      patientName: "Patient name",
      startTime: "12:00",
      endTime: "13:00",
      room: "VIP Room",
      therapistId: "4",
      status: "check-in",
      color: "#FEE2E2", // Light red
    },
    {
      id: "15",
      treatmentName: "TREATMENT NAME",
      patientName: "Patient name",
      startTime: "12:00",
      endTime: "13:00",
      room: "VIP Room",
      therapistId: "5",
      status: "check-in",
      color: "#FEE2E2", // Light red
    },
    {
      id: "16",
      treatmentName: "TREATMENT NAME",
      patientName: "Patient name",
      startTime: "13:00",
      endTime: "14:00",
      room: "VIP Room",
      therapistId: "3",
      status: "check-in",
      color: "#FEE2E2", // Light red
    },
  ];

  const locations = ["Islamic Village", "Location 2", "Location 3"];

  return (
    <SejenakDashboardLayout
      navItems={getNavItems(profile?.role)}
      headerTitle="Appointment"
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
      customHeader={
        <AppointmentHeader
          title="Appointment"
          dateRange={dateRange}
          onDateRangeChange={(direction) => {
            // Simple navigation - in real app, this would update dates properly
            console.log("Navigate", direction);
          }}
          currentView={currentView}
          onViewChange={setCurrentView}
          onNewAppointment={() => {
            // Handle new appointment creation
            console.log("New Appointment");
          }}
        />
      }
      footer={<Footer />}
    >
      <div className="mb-4">
        <AppointmentSchedule
          appointments={appointments}
          therapists={therapists}
          startHour={8}
          endHour={20}
          hourHeight={80}
        />
      </div>
    </SejenakDashboardLayout>
  );
}

