"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Customer } from "@/types/customer";

export function useCustomers(): {
  customers: Customer[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
} {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch customer profiles
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, full_name, email, phone, avatar_url, date_of_birth, address, created_at, is_active")
        .eq("role", "customer")
        .order("full_name", { ascending: true });

      if (profilesError) throw profilesError;

      // Fetch member points to get tier/member level
      const { data: memberPoints, error: pointsError } = await supabase
        .from("member_points")
        .select("user_id, tier, total_points");

      if (pointsError && pointsError.code !== "PGRST116") {
        console.warn("Error fetching member points:", pointsError);
      }

      // Fetch booking counts and status for each customer
      const { data: bookings, error: bookingsError } = await supabase
        .from("bookings")
        .select("user_id, status");

      if (bookingsError) {
        console.warn("Error fetching bookings:", bookingsError);
      }

      // Calculate customer stats
      const customerStats: Record<string, { appointmentCount: number; cancelledCount: number; noShowCount: number }> = {};
      
      (bookings || []).forEach((booking: any) => {
        if (!booking.user_id) return;
        
        if (!customerStats[booking.user_id]) {
          customerStats[booking.user_id] = { appointmentCount: 0, cancelledCount: 0, noShowCount: 0 };
        }
        
        customerStats[booking.user_id].appointmentCount++;
        if (booking.status === "cancelled") {
          customerStats[booking.user_id].cancelledCount++;
        }
        if (booking.status === "no_show") {
          customerStats[booking.user_id].noShowCount++;
        }
      });

      // Map profiles to Customer type
      const mappedCustomers: Customer[] = (profiles || []).map((profile: any) => {
        const memberPoint = memberPoints?.find((mp) => mp.user_id === profile.id);
        const stats = customerStats[profile.id] || { appointmentCount: 0, cancelledCount: 0, noShowCount: 0 };
        
        // Determine member level from tier (new system: Grace, Signature, Elite)
        let memberLevel: "Grace" | "Signature" | "Elite" = "Grace";
        if (memberPoint?.tier) {
          const tier = memberPoint.tier.toLowerCase();
          // Map old tier names to new system for backward compatibility
          if (tier === "signature" || tier === "silver") {
            memberLevel = "Signature";
          } else if (tier === "elite" || tier === "vip" || tier === "gold" || tier === "platinum") {
            memberLevel = "Elite";
          } else {
            // Default to Grace (includes "grace", "bliss", and any other)
            memberLevel = "Grace";
          }
        }

        // Determine status based on booking behavior and blocked status
        let status: "active" | "at-risk" | "flagged" | "blocked" = "active";
        
        // Check if customer is blocked (is_active = false)
        if (profile.is_active === false) {
          status = "blocked";
        } else if (stats.cancelledCount >= 8 || stats.noShowCount >= 3) {
          status = "flagged";
        } else if (stats.cancelledCount >= 3 || stats.noShowCount >= 2) {
          status = "at-risk";
        }

        return {
          id: profile.id,
          name: profile.full_name || "Unknown Customer",
          email: profile.email || "",
          phone: profile.phone || undefined,
          memberLevel,
          appointmentCount: stats.appointmentCount,
          status,
          avatar: profile.avatar_url || undefined,
        };
      });

      setCustomers(mappedCustomers);
    } catch (err: any) {
      console.error("Error fetching customers:", err);
      setError(err.message || "Failed to fetch customers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  return { customers, loading, error, refetch: fetchCustomers };
}

