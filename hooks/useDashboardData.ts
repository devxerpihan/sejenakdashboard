"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

interface DashboardStats {
  therapistCount: number;
  customerCount: number;
  appointmentCount: number;
  revenue: number;
  completedCount: number;
  cancelledCount: number;
  therapistTrend: number[];
  customerTrend: number[];
  appointmentTrend: number[];
  revenueTrend: number[];
}

interface AppointmentData {
  month: string;
  completed: number;
  cancelled: number;
}

interface TopCategoryData {
  label: string;
  value: number;
  color: string;
}

interface TopTreatmentData {
  label: string;
  value: number;
  color: string;
}

interface Therapist {
  id: string;
  name: string;
  bookings: number;
  avatar?: string;
}

interface RevenueTrendData {
  label: string;
  value: number;
}

interface DashboardData {
  stats: DashboardStats | null;
  appointmentData: AppointmentData[];
  topCategoryData: TopCategoryData[];
  topTreatmentData: TopTreatmentData[];
  therapists: Therapist[];
  revenueTrend: RevenueTrendData[];
  loading: boolean;
  error: string | null;
}

export function useDashboardData(
  branchId: string | null,
  startDate: Date,
  endDate: Date,
  category: string | null = null
): DashboardData {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [appointmentData, setAppointmentData] = useState<AppointmentData[]>([]);
  const [topCategoryData, setTopCategoryData] = useState<TopCategoryData[]>([]);
  const [topTreatmentData, setTopTreatmentData] = useState<TopTreatmentData[]>([]);
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [revenueTrend, setRevenueTrend] = useState<RevenueTrendData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setLoading(true);
        setError(null);

        // Format dates properly for PostgreSQL date comparison
        const startDateStr = startDate.toISOString().split("T")[0];
        const endDateStr = endDate.toISOString().split("T")[0];

        // Fetch all bookings with pagination (Supabase default limit is 1000)
        let allBookings: any[] = [];
        let page = 0;
        const pageSize = 1000;
        let hasMore = true;

        while (hasMore) {
          let bookingsQuery = supabase
            .from("bookings")
            .select("*")
            .gte("booking_date", startDateStr)
            .lte("booking_date", endDateStr)
            .order("booking_date", { ascending: false })
            .range(page * pageSize, (page + 1) * pageSize - 1);

          // If branchId is provided, filter by branch_id (including null for old data)
          // If no branchId, fetch all bookings regardless of branch_id
          if (branchId) {
            // Fetch bookings with the specific branch_id OR null branch_id (old data)
            // We'll filter in memory after fetching to handle the OR condition properly
            // First, try to get bookings with the branch_id
            bookingsQuery = bookingsQuery.eq("branch_id", branchId);
          }

          const { data: bookings, error: bookingsError } = await bookingsQuery;

          if (bookingsError) throw bookingsError;

          if (bookings && bookings.length > 0) {
            allBookings = allBookings.concat(bookings);
            // If we got less than pageSize, we've reached the end
            hasMore = bookings.length === pageSize;
            page++;
          } else {
            hasMore = false;
          }
        }

        let bookings = allBookings;

        // If branchId was provided, also fetch bookings with null branch_id (old data) and combine
        if (branchId) {
          let allNullBranchBookings: any[] = [];
          let nullPage = 0;
          let hasMoreNull = true;

          while (hasMoreNull) {
            const nullBookingsQuery = supabase
              .from("bookings")
              .select("*")
              .gte("booking_date", startDateStr)
              .lte("booking_date", endDateStr)
              .is("branch_id", null)
              .order("booking_date", { ascending: false })
              .range(nullPage * pageSize, (nullPage + 1) * pageSize - 1);

            const { data: nullBookings, error: nullError } = await nullBookingsQuery;

            if (nullError) throw nullError;

            if (nullBookings && nullBookings.length > 0) {
              allNullBranchBookings = allNullBranchBookings.concat(nullBookings);
              hasMoreNull = nullBookings.length === pageSize;
              nullPage++;
            } else {
              hasMoreNull = false;
            }
          }

          // Combine bookings with branch_id and null branch_id
          bookings = [...bookings, ...allNullBranchBookings];
        }

        // Filter by category if specified
        let filteredBookings = bookings || [];
        if (category && category !== "all") {
          // Only filter bookings that have a treatment_id (exclude null treatment_id from old data)
          const bookingsWithTreatment = filteredBookings.filter((b: any) => b.treatment_id);
          const bookingsWithoutTreatment = filteredBookings.filter((b: any) => !b.treatment_id);
          
          // Fetch treatment categories for bookings with treatment_id
          const treatmentIds = [...new Set(bookingsWithTreatment.map((b: any) => b.treatment_id).filter(Boolean))];
          if (treatmentIds.length > 0) {
            const { data: treatments } = await supabase
              .from("treatments")
              .select("id, category")
              .in("id", treatmentIds);
            
            const treatmentCategoryMap = new Map(
              (treatments || []).map((t: any) => [t.id, t.category])
            );
            
            // Filter bookings with treatment_id by category
            const filteredWithTreatment = bookingsWithTreatment.filter((booking: any) => {
              const treatmentCategory = treatmentCategoryMap.get(booking.treatment_id);
              return treatmentCategory === category;
            });
            
            // Combine filtered bookings (old data without treatment_id is excluded when filtering by category)
            filteredBookings = filteredWithTreatment;
          } else {
            // No treatments found, so no bookings match the category
            filteredBookings = [];
          }
        }

        // Fetch therapists count
        let therapistsQuery = supabase
          .from("therapists")
          .select("id", { count: "exact", head: true });

        if (branchId) {
          therapistsQuery = therapistsQuery.eq("branch_id", branchId);
        }

        const { count: therapistCount, error: therapistsError } = await therapistsQuery;

        if (therapistsError) throw therapistsError;

        // Calculate unique customers from filtered bookings (within date range)
        const uniqueCustomerIds = new Set(
          filteredBookings
            .map((b) => b.user_id)
            .filter((id) => id !== null && id !== undefined)
        );
        const customerCount = uniqueCustomerIds.size;

        // Calculate stats
        const appointmentCount = filteredBookings.length;
        const revenue = filteredBookings.reduce((sum, b) => {
          // total_price is numeric in database, handle both string and number
          const price = typeof b.total_price === "number" 
            ? b.total_price 
            : parseFloat(String(b.total_price || "0"));
          return sum + (isNaN(price) ? 0 : price);
        }, 0);

        // Calculate appointment summary stats (completed, cancelled, all)
        // Handle case-insensitive status matching and null values
        const completedCount = filteredBookings.filter((b: any) => {
          const status = String(b.status || "").toLowerCase();
          return status === "completed";
        }).length;
        const cancelledCount = filteredBookings.filter((b: any) => {
          const status = String(b.status || "").toLowerCase();
          return status === "cancelled";
        }).length;


        // Calculate trends based on date range
        const trends = await calculateTrends(filteredBookings, branchId, startDate, endDate);
        
        // Debug: Log trends to verify they're being calculated
        console.log("Trends calculated:", {
          therapistTrend: trends.therapistTrend,
          customerTrend: trends.customerTrend,
          appointmentTrend: trends.appointmentTrend,
          revenueTrend: trends.revenueTrend,
          bookingsCount: filteredBookings.length,
        });

        setStats({
          therapistCount: therapistCount || 0,
          customerCount: customerCount || 0,
          appointmentCount,
          revenue,
          completedCount,
          cancelledCount,
          therapistTrend: trends.therapistTrend,
          customerTrend: trends.customerTrend,
          appointmentTrend: trends.appointmentTrend,
          revenueTrend: trends.revenueTrend,
        });

        // Calculate appointment data by month (within date range)
        const appointmentStats = calculateAppointmentStats(filteredBookings, startDate, endDate);
        setAppointmentData(appointmentStats);

        // Calculate top categories (within date range)
        const topCategories = await calculateTopCategories(filteredBookings, branchId, startDate, endDate);
        setTopCategoryData(topCategories);

        // Calculate top treatments (within date range)
        const topTreatments = await calculateTopTreatments(filteredBookings, branchId, startDate, endDate);
        setTopTreatmentData(topTreatments);

        // Calculate top therapists
        const topTherapists = await calculateTopTherapists(filteredBookings, branchId);
        setTherapists(topTherapists);

        // Calculate revenue trend (within date range)
        const revenueTrendData = calculateRevenueTrend(filteredBookings, startDate, endDate);
        setRevenueTrend(revenueTrendData);
      } catch (err: any) {
        console.error("Error fetching dashboard data:", err);
        setError(err.message || "Failed to fetch dashboard data");
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, [branchId, startDate, endDate, category]);

  return {
    stats,
    appointmentData,
    topCategoryData,
    topTreatmentData,
    therapists,
    revenueTrend,
    loading,
    error,
  };
}

// Helper functions
async function calculateTopCategories(
  bookings: any[],
  branchId: string | null,
  startDate: Date,
  endDate: Date
): Promise<TopCategoryData[]> {
  const categoryColors = ["#C1A7A3", "#DCCAB7", "#706C6B"];
  
  // Filter bookings by date range explicitly
  const startDateStr = startDate.toISOString().split("T")[0];
  const endDateStr = endDate.toISOString().split("T")[0];
  
  const dateFilteredBookings = bookings.filter((booking) => {
    if (!booking.booking_date) return false;
    const bookingDate = booking.booking_date instanceof Date 
      ? booking.booking_date 
      : new Date(booking.booking_date);
    
    if (isNaN(bookingDate.getTime())) return false;
    
    const bookingDateStr = bookingDate.toISOString().split("T")[0];
    return bookingDateStr >= startDateStr && bookingDateStr <= endDateStr;
  });
  
  // Get treatment IDs from bookings
  const treatmentIds = dateFilteredBookings
    .map((b) => b.treatment_id)
    .filter((id) => id);

  if (treatmentIds.length === 0) {
    return [];
  }

  // Fetch treatments with categories
  const { data: treatments, error } = await supabase
    .from("treatments")
    .select("id, category")
    .in("id", [...new Set(treatmentIds)]);

  if (error || !treatments) {
    return [];
  }

  // Create a map of treatment_id to category
  const treatmentCategoryMap = new Map(
    treatments.map((t: any) => [t.id, t.category || "Other"])
  );

  // Count bookings by category (not treatments)
  const categoryCounts: Record<string, number> = {};
  
  dateFilteredBookings.forEach((booking) => {
    if (booking.treatment_id) {
      const categoryName = treatmentCategoryMap.get(booking.treatment_id) || "Other";
      categoryCounts[categoryName] = (categoryCounts[categoryName] || 0) + 1;
    }
  });

  // Convert to array and sort
  const result = Object.entries(categoryCounts)
    .map(([label, value], index) => ({
      label,
      value,
      color: categoryColors[index % categoryColors.length],
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 3);

  return result;
}

async function calculateTopTreatments(
  bookings: any[],
  branchId: string | null,
  startDate: Date,
  endDate: Date
): Promise<TopTreatmentData[]> {
  const treatmentColors = ["#C1A7A3", "#DCCAB7", "#706C6B"];

  // Filter bookings by date range explicitly
  const startDateStr = startDate.toISOString().split("T")[0];
  const endDateStr = endDate.toISOString().split("T")[0];
  
  const dateFilteredBookings = bookings.filter((booking) => {
    if (!booking.booking_date) return false;
    const bookingDate = booking.booking_date instanceof Date 
      ? booking.booking_date 
      : new Date(booking.booking_date);
    
    if (isNaN(bookingDate.getTime())) return false;
    
    const bookingDateStr = bookingDate.toISOString().split("T")[0];
    return bookingDateStr >= startDateStr && bookingDateStr <= endDateStr;
  });

  // Count bookings by treatment
  const treatmentCounts: Record<string, number> = {};
  
  dateFilteredBookings.forEach((booking) => {
    if (booking.treatment_id) {
      treatmentCounts[booking.treatment_id] = (treatmentCounts[booking.treatment_id] || 0) + 1;
    }
  });

  // Get top treatment IDs
  const topTreatmentIds = Object.entries(treatmentCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([id]) => id);

  if (topTreatmentIds.length === 0) {
    return [];
  }

  // Fetch treatment names
  const { data: treatments } = await supabase
    .from("treatments")
    .select("id, name")
    .in("id", topTreatmentIds);

  if (!treatments) {
    return [];
  }

  // Map to result format
  const result = topTreatmentIds
    .map((id, index) => {
      const treatment = treatments.find((t) => t.id === id);
      const count = treatmentCounts[id];
      return {
        label: treatment ? (treatment.name.length > 15 ? treatment.name.substring(0, 15) + "..." : treatment.name) : "Unknown",
        value: count,
        color: treatmentColors[index % treatmentColors.length],
      };
    })
    .filter((item) => item.label !== "Unknown");

  return result;
}

async function calculateTopTherapists(
  bookings: any[],
  branchId: string | null
): Promise<Therapist[]> {
  // Count bookings by therapist
  const therapistCounts: Record<string, number> = {};
  
  bookings.forEach((booking) => {
    const therapistId = booking.actual_therapist_id || booking.therapist_id;
    if (therapistId) {
      therapistCounts[therapistId] = (therapistCounts[therapistId] || 0) + 1;
    }
  });

  // Get top therapist IDs
  const topTherapistIds = Object.entries(therapistCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([id]) => id);

  if (topTherapistIds.length === 0) {
    return [];
  }

  // Fetch therapist profiles
  const { data: therapists } = await supabase
    .from("therapists")
    .select("id, profile_id")
    .in("id", topTherapistIds);

  if (!therapists) {
    return [];
  }

  const profileIds = therapists.map((t) => t.profile_id).filter((id) => id);
  
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name, avatar_url")
    .in("id", profileIds);

  if (!profiles) {
    return [];
  }

  // Map to result format
  const result = topTherapistIds
    .map((therapistId) => {
      const therapist = therapists.find((t) => t.id === therapistId);
      const profile = therapist
        ? profiles.find((p) => p.id === therapist.profile_id)
        : null;
      const count = therapistCounts[therapistId];

      return {
        id: therapistId,
        name: profile?.full_name || "Unknown Therapist",
        bookings: count,
        avatar: profile?.avatar_url || undefined,
      };
    })
    .filter((t) => t.name !== "Unknown Therapist");

  return result;
}

function calculateAppointmentStats(
  bookings: any[],
  startDate: Date,
  endDate: Date
): AppointmentData[] {
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const stats: Record<string, { completed: number; cancelled: number }> = {};

  // Get all months in the date range
  const monthsInRange: string[] = [];
  const start = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
  const end = new Date(endDate.getFullYear(), endDate.getMonth(), 1);
  
  let current = new Date(start);
  while (current <= end) {
    monthsInRange.push(monthNames[current.getMonth()]);
    current = new Date(current.getFullYear(), current.getMonth() + 1, 1);
  }

  bookings.forEach((booking) => {
    // Parse booking_date properly - handle both date strings and Date objects
    const date = booking.booking_date instanceof Date 
      ? booking.booking_date 
      : new Date(booking.booking_date);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      console.warn("Invalid booking_date:", booking.booking_date, "for booking:", booking.id);
      return;
    }
    
    const monthKey = monthNames[date.getMonth()];
    const year = date.getFullYear();
    
    // Only count if the booking is within the date range
    const bookingDateOnly = new Date(year, date.getMonth(), date.getDate());
    if (bookingDateOnly < start || bookingDateOnly > end) {
      return; // Skip bookings outside the date range
    }

    if (!stats[monthKey]) {
      stats[monthKey] = { completed: 0, cancelled: 0 };
    }

    // Handle case-insensitive status matching
    const status = String(booking.status || "").toLowerCase();
    if (status === "completed") {
      stats[monthKey].completed++;
    } else if (status === "cancelled") {
      stats[monthKey].cancelled++;
    }
  });

  // Return only months in the date range
  return monthsInRange.map((month) => ({
    month,
    completed: stats[month]?.completed || 0,
    cancelled: stats[month]?.cancelled || 0,
  }));
}

function calculateRevenueTrend(
  bookings: any[],
  startDate: Date,
  endDate: Date
): RevenueTrendData[] {
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const revenueByMonth: Record<string, number> = {};

  // Get all months in the date range
  const monthsInRange: string[] = [];
  const start = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
  const end = new Date(endDate.getFullYear(), endDate.getMonth(), 1);
  
  let current = new Date(start);
  while (current <= end) {
    monthsInRange.push(monthNames[current.getMonth()]);
    current = new Date(current.getFullYear(), current.getMonth() + 1, 1);
  }

  bookings.forEach((booking) => {
    const date = new Date(booking.booking_date);
    const monthKey = monthNames[date.getMonth()];
    
    // total_price is numeric in database
    const price = typeof booking.total_price === "number" 
      ? booking.total_price 
      : parseFloat(String(booking.total_price || "0"));
    const revenue = isNaN(price) ? 0 : price;

    if (monthKey && monthsInRange.includes(monthKey)) {
      revenueByMonth[monthKey] = (revenueByMonth[monthKey] || 0) + revenue;
    }
  });

  // Return only months in the date range
  return monthsInRange.map((month) => ({
    label: month,
    value: revenueByMonth[month] || 0,
  }));
}

async function calculateTrends(
  bookings: any[],
  branchId: string | null,
  startDate: Date,
  endDate: Date
): Promise<{
  therapistTrend: number[];
  customerTrend: number[];
  appointmentTrend: number[];
  revenueTrend: number[];
}> {
  // Calculate trends based on the date range
  const therapistTrend: number[] = [];
  const customerTrend: number[] = [];
  const appointmentTrend: number[] = [];
  const revenueTrend: number[] = [];

  // Determine grouping period based on date range length
  const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  let periodType: "day" | "week" | "month";
  let periodKey: (date: Date) => string;
  
  if (daysDiff <= 30) {
    // Group by day if range is <= 30 days
    periodType = "day";
    periodKey = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  } else if (daysDiff <= 90) {
    // Group by week if range is <= 90 days
    periodType = "week";
    periodKey = (date: Date) => {
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay()); // Start of week (Sunday)
      const year = weekStart.getFullYear();
      const month = String(weekStart.getMonth() + 1).padStart(2, "0");
      const day = String(weekStart.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`; // Use week start date as key
    };
  } else {
    // Group by month if range is > 90 days
    periodType = "month";
    periodKey = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
  }

  // Group bookings by period within the date range
  const periodData: Record<string, {
    bookings: any[];
    uniqueCustomers: Set<string>;
    uniqueTherapists: Set<string>;
  }> = {};

  bookings.forEach((booking) => {
    if (!booking.booking_date) return;
    
    const date = booking.booking_date instanceof Date 
      ? booking.booking_date 
      : new Date(booking.booking_date);
    
    if (isNaN(date.getTime())) return;
    
    // Filter by date range explicitly
    const bookingDateStr = date.toISOString().split("T")[0];
    const startDateStr = startDate.toISOString().split("T")[0];
    const endDateStr = endDate.toISOString().split("T")[0];
    
    if (bookingDateStr < startDateStr || bookingDateStr > endDateStr) {
      return; // Skip bookings outside date range
    }
    
    const key = periodKey(date);
    
    if (!periodData[key]) {
      periodData[key] = {
        bookings: [],
        uniqueCustomers: new Set(),
        uniqueTherapists: new Set(),
      };
    }
    
    periodData[key].bookings.push(booking);
    if (booking.user_id) {
      periodData[key].uniqueCustomers.add(booking.user_id);
    }
    if (booking.actual_therapist_id || booking.therapist_id) {
      periodData[key].uniqueTherapists.add(booking.actual_therapist_id || booking.therapist_id);
    }
  });

  // Generate all periods within the date range
  const allPeriods: string[] = [];
  const current = new Date(startDate);
  
  while (current <= endDate) {
    allPeriods.push(periodKey(new Date(current)));
    
    if (periodType === "day") {
      current.setDate(current.getDate() + 1);
    } else if (periodType === "week") {
      current.setDate(current.getDate() + 7);
    } else {
      current.setMonth(current.getMonth() + 1);
    }
  }

  // Remove duplicates and sort
  const uniquePeriods = [...new Set(allPeriods)].sort();
  
  // Limit to max 12 data points for readability
  const maxPoints = 12;
  const periodsToShow = uniquePeriods.length > maxPoints 
    ? uniquePeriods.slice(-maxPoints) 
    : uniquePeriods;

  // Calculate trends for each period
  periodsToShow.forEach((periodKey) => {
    const data = periodData[periodKey] || {
      bookings: [],
      uniqueCustomers: new Set(),
      uniqueTherapists: new Set(),
    };
    
    appointmentTrend.push(data.bookings.length);
    
    const periodRevenue = data.bookings.reduce((sum, b) => {
      const price = typeof b.total_price === "number" 
        ? b.total_price 
        : parseFloat(String(b.total_price || "0"));
      return sum + (isNaN(price) ? 0 : price);
    }, 0);
    revenueTrend.push(periodRevenue);
    
    therapistTrend.push(data.uniqueTherapists.size);
    customerTrend.push(data.uniqueCustomers.size);
  });

  // Ensure we have at least some data points
  // If we have data but less than 6 points, pad with zeros at the beginning
  const minPoints = 6;
  
  while (appointmentTrend.length < minPoints && appointmentTrend.length > 0) {
    appointmentTrend.unshift(0);
    revenueTrend.unshift(0);
    therapistTrend.unshift(0);
    customerTrend.unshift(0);
  }
  
  // If no data at all, return array of zeros
  if (appointmentTrend.length === 0) {
    return {
      therapistTrend: [0, 0, 0, 0, 0, 0],
      customerTrend: [0, 0, 0, 0, 0, 0],
      appointmentTrend: [0, 0, 0, 0, 0, 0],
      revenueTrend: [0, 0, 0, 0, 0, 0],
    };
  }

  return {
    therapistTrend: therapistTrend.slice(-minPoints),
    customerTrend: customerTrend.slice(-minPoints),
    appointmentTrend: appointmentTrend.slice(-minPoints),
    revenueTrend: revenueTrend.slice(-minPoints),
  };
}

