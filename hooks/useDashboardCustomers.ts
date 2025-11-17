"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { TopCustomer, CustomerAlert } from "@/components/dashboard/TopCustomerList";
import { CustomerAlert as AlertType } from "@/components/dashboard/CustomerAlertsList";

export function useTopCustomers(
  branchId: string | null,
  limit: number = 5,
  startDate?: Date,
  endDate?: Date
): {
  customers: TopCustomer[];
  loading: boolean;
  error: string | null;
} {
  const [customers, setCustomers] = useState<TopCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTopCustomers() {
      try {
        setLoading(true);
        setError(null);

        // Format dates properly for PostgreSQL date comparison
        const startDateStr = startDate ? startDate.toISOString().split("T")[0] : undefined;
        const endDateStr = endDate ? endDate.toISOString().split("T")[0] : undefined;

        // Get all bookings for the branch with pagination
        let allBookings: any[] = [];
        let page = 0;
        const pageSize = 1000;
        let hasMore = true;

        while (hasMore) {
          let bookingsQuery = supabase
            .from("bookings")
            .select(`
              id,
              user_id,
              total_price,
              status,
              payment_status
            `)
            .range(page * pageSize, (page + 1) * pageSize - 1);

          if (startDateStr) {
            bookingsQuery = bookingsQuery.gte("booking_date", startDateStr);
          }
          if (endDateStr) {
            bookingsQuery = bookingsQuery.lte("booking_date", endDateStr);
          }
          if (branchId) {
            bookingsQuery = bookingsQuery.eq("branch_id", branchId);
          }

          const { data: bookings, error: bookingsError } = await bookingsQuery;

          if (bookingsError) throw bookingsError;

          if (bookings && bookings.length > 0) {
            allBookings = allBookings.concat(bookings);
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
            let nullBookingsQuery = supabase
              .from("bookings")
              .select(`
                id,
                user_id,
                total_price,
                status,
                payment_status
              `)
              .is("branch_id", null)
              .range(nullPage * pageSize, (nullPage + 1) * pageSize - 1);

            if (startDateStr) {
              nullBookingsQuery = nullBookingsQuery.gte("booking_date", startDateStr);
            }
            if (endDateStr) {
              nullBookingsQuery = nullBookingsQuery.lte("booking_date", endDateStr);
            }

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

        // Aggregate by customer
        const customerStats: Record<
          string,
          { totalPaid: number; appointments: number }
        > = {};

        (bookings || []).forEach((booking: any) => {
          if (!booking.user_id) return;

          const price = parseFloat(booking.total_price || "0");
          const isPaid =
            booking.payment_status === "paid" || booking.status === "completed";

          if (!customerStats[booking.user_id]) {
            customerStats[booking.user_id] = { totalPaid: 0, appointments: 0 };
          }

          customerStats[booking.user_id].appointments++;
          if (isPaid && !isNaN(price)) {
            customerStats[booking.user_id].totalPaid += price;
          }
        });

        // Get top customers
        const topCustomerIds = Object.entries(customerStats)
          .sort(([, a], [, b]) => b.totalPaid - a.totalPaid)
          .slice(0, limit)
          .map(([id]) => id);

        if (topCustomerIds.length === 0) {
          setCustomers([]);
          setLoading(false);
          return;
        }

        // Fetch customer profiles
        const { data: profiles, error: profilesError } = await supabase
          .from("profiles")
          .select("id, full_name, avatar_url")
          .in("id", topCustomerIds)
          .eq("role", "customer");

        if (profilesError) throw profilesError;

        // Map to result format
        const result: TopCustomer[] = topCustomerIds
          .map((customerId) => {
            const profile = profiles?.find((p) => p.id === customerId);
            const stats = customerStats[customerId];

            return {
              id: customerId,
              name: profile?.full_name || "Unknown Customer",
              avatar: profile?.avatar_url || undefined,
              totalPaid: stats.totalPaid,
              appointments: stats.appointments,
            };
          })
          .filter((c) => c.name !== "Unknown Customer");

        setCustomers(result);
      } catch (err: any) {
        console.error("Error fetching top customers:", err);
        setError(err.message || "Failed to fetch top customers");
      } finally {
        setLoading(false);
      }
    }

    fetchTopCustomers();
  }, [branchId, limit, startDate, endDate]);

  return { customers, loading, error };
}

export function useCustomerRetention(
  branchId: string | null,
  startDate?: Date,
  endDate?: Date
): {
  new: number;
  returning: number;
  loading: boolean;
  error: string | null;
} {
  const [data, setData] = useState({ new: 0, returning: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRetention() {
      try {
        setLoading(true);
        setError(null);

        // Format dates properly for PostgreSQL date comparison
        const startDateStr = startDate ? startDate.toISOString().split("T")[0] : undefined;
        const endDateStr = endDate ? endDate.toISOString().split("T")[0] : undefined;

        // Get all bookings with pagination
        let allBookings: any[] = [];
        let page = 0;
        const pageSize = 1000;
        let hasMore = true;

        while (hasMore) {
          let bookingsQuery = supabase
            .from("bookings")
            .select("user_id, booking_date")
            .range(page * pageSize, (page + 1) * pageSize - 1);

          if (startDateStr) {
            bookingsQuery = bookingsQuery.gte("booking_date", startDateStr);
          }
          if (endDateStr) {
            bookingsQuery = bookingsQuery.lte("booking_date", endDateStr);
          }
          if (branchId) {
            bookingsQuery = bookingsQuery.eq("branch_id", branchId);
          }

          const { data: bookings, error: bookingsError } = await bookingsQuery;

          if (bookingsError) throw bookingsError;

          if (bookings && bookings.length > 0) {
            allBookings = allBookings.concat(bookings);
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
            let nullBookingsQuery = supabase
              .from("bookings")
              .select("user_id, booking_date")
              .is("branch_id", null)
              .range(nullPage * pageSize, (nullPage + 1) * pageSize - 1);

            if (startDateStr) {
              nullBookingsQuery = nullBookingsQuery.gte("booking_date", startDateStr);
            }
            if (endDateStr) {
              nullBookingsQuery = nullBookingsQuery.lte("booking_date", endDateStr);
            }

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

        // Group bookings by customer
        const customerBookings: Record<string, number> = {};

        (bookings || []).forEach((booking: any) => {
          if (booking.user_id) {
            customerBookings[booking.user_id] =
              (customerBookings[booking.user_id] || 0) + 1;
          }
        });

        // Count new (1 booking) vs returning (2+ bookings)
        let newCount = 0;
        let returningCount = 0;

        Object.values(customerBookings).forEach((count) => {
          if (count === 1) {
            newCount++;
          } else {
            returningCount++;
          }
        });

        setData({ new: newCount, returning: returningCount });
      } catch (err: any) {
        console.error("Error fetching customer retention:", err);
        setError(err.message || "Failed to fetch customer retention");
      } finally {
        setLoading(false);
      }
    }

    fetchRetention();
  }, [branchId, startDate, endDate]);

  return { ...data, loading, error };
}

export function useCustomerAlerts(
  branchId: string | null,
  limit: number = 5,
  startDate?: Date,
  endDate?: Date
): {
  alerts: AlertType[];
  loading: boolean;
  error: string | null;
} {
  const [alerts, setAlerts] = useState<AlertType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAlerts() {
      try {
        setLoading(true);
        setError(null);

        // Format dates properly for PostgreSQL date comparison
        const startDateStr = startDate ? startDate.toISOString().split("T")[0] : undefined;
        const endDateStr = endDate ? endDate.toISOString().split("T")[0] : undefined;

        // Get all bookings with pagination
        let allBookings: any[] = [];
        let page = 0;
        const pageSize = 1000;
        let hasMore = true;

        while (hasMore) {
          let bookingsQuery = supabase
            .from("bookings")
            .select("user_id, status")
            .range(page * pageSize, (page + 1) * pageSize - 1);

          if (startDateStr) {
            bookingsQuery = bookingsQuery.gte("booking_date", startDateStr);
          }
          if (endDateStr) {
            bookingsQuery = bookingsQuery.lte("booking_date", endDateStr);
          }
          if (branchId) {
            bookingsQuery = bookingsQuery.eq("branch_id", branchId);
          }

          const { data: bookings, error: bookingsError } = await bookingsQuery;

          if (bookingsError) throw bookingsError;

          if (bookings && bookings.length > 0) {
            allBookings = allBookings.concat(bookings);
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
            let nullBookingsQuery = supabase
              .from("bookings")
              .select("user_id, status")
              .is("branch_id", null)
              .range(nullPage * pageSize, (nullPage + 1) * pageSize - 1);

            if (startDateStr) {
              nullBookingsQuery = nullBookingsQuery.gte("booking_date", startDateStr);
            }
            if (endDateStr) {
              nullBookingsQuery = nullBookingsQuery.lte("booking_date", endDateStr);
            }

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

        // Count cancellations and no-shows by customer
        const customerStats: Record<
          string,
          { cancelled: number; noShow: number }
        > = {};

        (bookings || []).forEach((booking: any) => {
          if (!booking.user_id) return;

          if (!customerStats[booking.user_id]) {
            customerStats[booking.user_id] = { cancelled: 0, noShow: 0 };
          }

          if (booking.status === "cancelled") {
            customerStats[booking.user_id].cancelled++;
          } else if (booking.status === "no_show") {
            customerStats[booking.user_id].noShow++;
          }
        });

        // Filter customers with issues (cancelled >= 3 or no_show >= 2)
        const alertCustomers = Object.entries(customerStats)
          .filter(([, stats]) => stats.cancelled >= 3 || stats.noShow >= 2)
          .sort(([, a], [, b]) => {
            const aScore = a.cancelled * 2 + a.noShow;
            const bScore = b.cancelled * 2 + b.noShow;
            return bScore - aScore;
          })
          .slice(0, limit)
          .map(([id]) => id);

        if (alertCustomers.length === 0) {
          setAlerts([]);
          setLoading(false);
          return;
        }

        // Fetch customer profiles
        const { data: profiles, error: profilesError } = await supabase
          .from("profiles")
          .select("id, full_name, avatar_url")
          .in("id", alertCustomers)
          .eq("role", "customer");

        if (profilesError) throw profilesError;

        // Map to result format
        const result: AlertType[] = alertCustomers
          .map((customerId) => {
            const profile = profiles?.find((p) => p.id === customerId);
            const stats = customerStats[customerId];

            // Determine status: flagged if cancelled >= 8 or no_show >= 3, else at-risk
            const status: "flagged" | "at-risk" =
              stats.cancelled >= 8 || stats.noShow >= 3 ? "flagged" : "at-risk";

            return {
              id: customerId,
              name: profile?.full_name || "Unknown Customer",
              avatar: profile?.avatar_url || undefined,
              cancelled: stats.cancelled,
              noShow: stats.noShow,
              status,
            };
          })
          .filter((a) => a.name !== "Unknown Customer");

        setAlerts(result);
      } catch (err: any) {
        console.error("Error fetching customer alerts:", err);
        setError(err.message || "Failed to fetch customer alerts");
      } finally {
        setLoading(false);
      }
    }

    fetchAlerts();
  }, [branchId, limit, startDate, endDate]);

  return { alerts, loading, error };
}

