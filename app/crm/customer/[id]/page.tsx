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
import { Gift, ChevronLeft, ChevronRight } from "lucide-react";
import { EditProfileModal } from "@/components/crm/EditProfileModal";

interface CustomerDetail {
  id: string;
  name: string;
  email: string;
  phone: string;
  birthDate: string;
  address: string;
  city: string;
  registeredDate: string;
  avatar?: string;
  memberLevel: string;
  totalVisits: number;
  totalPoints: number;
  lifetimePoints: number;
  digitalStamps: number;
  maxStamps: number;
  lifetimeSpend: number;
  lastVisit: string | null;
  averageSpendPerVisit: number;
  nextAppointment: {
    id: string;
    date: string;
    time: string;
    service: string;
    therapist: string;
  } | null;
  feedbacks: Array<{
    id: string;
    date: string;
    service: string;
    rating: number;
    comment: string;
    tip: number;
  }>;
}

export default function CustomerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const customerId = params.id as string;

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

  const [customer, setCustomer] = useState<CustomerDetail | null>(null);
  const [customerRole, setCustomerRole] = useState<string>("customer");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "appointment" | "treatment-notes" | "loyalty">("overview");
  
  // Tab-specific state
  const [appointmentDateRange, setAppointmentDateRange] = useState({
    start: new Date(2025, 8, 11), // Sept 11, 2025
    end: new Date(2025, 8, 14), // Sept 14, 2025
  });
  const [appointmentSearch, setAppointmentSearch] = useState("");
  const [appointments, setAppointments] = useState<any[]>([]);
  
  const [treatmentNotesDateRange, setTreatmentNotesDateRange] = useState({
    start: new Date(2025, 8, 11),
    end: new Date(2025, 8, 14),
  });
  const [treatmentNotesSearch, setTreatmentNotesSearch] = useState("");
  const [treatmentNotes, setTreatmentNotes] = useState<any[]>([]);
  
  const [loyaltyDateRange, setLoyaltyDateRange] = useState({
    start: new Date(2025, 0, 1), // Jan 1, 2025
    end: new Date(2025, 0, 1),
  });
  const [loyaltySearch, setLoyaltySearch] = useState("");
  const [loyaltyRewards, setLoyaltyRewards] = useState<any[]>([]);
  const [loyaltyPage, setLoyaltyPage] = useState(1);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

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
    if (customerId) {
      fetchCustomerDetail();
    }
  }, [customerId]);

  // Check for edit query parameter - wait for customer to load first
  useEffect(() => {
    if (!loading && customer && typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("edit") === "true" && !isEditModalOpen) {
        // Small delay to ensure page is fully rendered
        setTimeout(() => {
          setIsEditModalOpen(true);
          // Remove query parameter from URL
          window.history.replaceState({}, "", window.location.pathname);
        }, 100);
      }
    }
  }, [loading, customer, isEditModalOpen]);

  // Fetch appointments when tab is active or filters change
  useEffect(() => {
    if (activeTab === "appointment" && customerId) {
      fetchAppointments();
    }
  }, [activeTab, customerId, appointmentDateRange, appointmentSearch]);

  // Fetch treatment notes when tab is active or filters change
  useEffect(() => {
    if (activeTab === "treatment-notes" && customerId) {
      fetchTreatmentNotes();
    }
  }, [activeTab, customerId, treatmentNotesDateRange, treatmentNotesSearch]);

  // Fetch loyalty rewards when tab is active or filters change
  useEffect(() => {
    if (activeTab === "loyalty" && customerId) {
      fetchLoyaltyRewards();
    }
  }, [activeTab, customerId, loyaltyDateRange, loyaltySearch, loyaltyPage]);

  const fetchCustomerDetail = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch customer profile
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", customerId)
        .eq("role", "customer")
        .single();

      if (profileError) throw profileError;
      if (!profile) {
        throw new Error("Customer not found");
      }

      // Fetch member points
      const { data: memberPoints, error: pointsError } = await supabase
        .from("member_points")
        .select("*")
        .eq("user_id", customerId)
        .single();

      // Fetch bookings for stats
      const { data: bookings, error: bookingsError } = await supabase
        .from("bookings")
        .select(`
          id,
          booking_date,
          booking_time,
          total_price,
          status,
          treatment_id,
          therapist_id
        `)
        .eq("user_id", customerId)
        .order("booking_date", { ascending: false });

      // Fetch treatments and therapists separately
      const treatmentIds = [...new Set((bookings || []).map((b: any) => b.treatment_id).filter(Boolean))];
      const therapistIds = [...new Set((bookings || []).map((b: any) => b.therapist_id).filter(Boolean))];

      const { data: treatments } = await supabase
        .from("treatments")
        .select("id, name")
        .in("id", treatmentIds);

      // Fetch therapists and their profiles
      const { data: therapistsData } = await supabase
        .from("therapists")
        .select("id, profile_id")
        .in("id", therapistIds);

      const profileIds = [...new Set((therapistsData || []).map((t: any) => t.profile_id).filter(Boolean))];
      const { data: therapistProfiles } = await supabase
        .from("profiles")
        .select("id, full_name")
        .in("id", profileIds);

      // Create a map of therapist_id -> full_name
      const therapistMap = new Map();
      (therapistsData || []).forEach((therapist: any) => {
        const profile = therapistProfiles?.find((p: any) => p.id === therapist.profile_id);
        if (profile) {
          therapistMap.set(therapist.id, profile.full_name);
        }
      });

      if (bookingsError) {
        console.warn("Error fetching bookings:", bookingsError);
      }

      // Fetch reviews/feedback
      const { data: reviews, error: reviewsError } = await supabase
        .from("reviews")
        .select(`
          id,
          rating,
          comment,
          created_at,
          booking_id,
          treatment_id
        `)
        .eq("user_id", customerId)
        .order("created_at", { ascending: false })
        .limit(10);

      // Fetch booking details for reviews
      const reviewBookingIds = [...new Set((reviews || []).map((r: any) => r.booking_id).filter(Boolean))];
      const { data: reviewBookings } = await supabase
        .from("bookings")
        .select("id, booking_date, treatment_id")
        .in("id", reviewBookingIds);

      if (reviewsError) {
        console.warn("Error fetching reviews:", reviewsError);
      }

      // Calculate stats
      const completedBookings = (bookings || []).filter((b: any) => b.status === "completed");
      const totalVisits = completedBookings.length || 0; // Ensure it's 0 if no bookings
      const lifetimeSpend = completedBookings.reduce((sum: number, b: any) => sum + (parseFloat(b.total_price) || 0), 0);
      const lastVisit = completedBookings.length > 0 ? completedBookings[0].booking_date : null;
      const averageSpendPerVisit = totalVisits > 0 ? lifetimeSpend / totalVisits : 0;

      // Find next appointment
      const upcomingBookings = (bookings || []).filter((b: any) => {
        const bookingDate = new Date(b.booking_date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return bookingDate >= today && b.status !== "cancelled" && b.status !== "completed";
      });

      const nextAppointment = upcomingBookings.length > 0 ? {
        id: upcomingBookings[0].id,
        date: upcomingBookings[0].booking_date,
        time: upcomingBookings[0].booking_time,
        service: treatments?.find((t: any) => t.id === upcomingBookings[0].treatment_id)?.name || "Unknown Service",
        therapist: therapistMap.get(upcomingBookings[0].therapist_id) || "Unknown Therapist",
      } : null;

      // Format feedbacks
      const feedbacks = (reviews || []).map((review: any) => {
        const booking = reviewBookings?.find((b: any) => b.id === review.booking_id);
        const treatment = treatments?.find((t: any) => t.id === (booking?.treatment_id || review.treatment_id));
        return {
          id: review.id,
          date: booking?.booking_date || review.created_at,
          service: treatment?.name || "Unknown Service",
          rating: review.rating,
          comment: review.comment || "",
          tip: 0, // Tips would need to be fetched from a separate table if available
        };
      });

      // Format dates
      const formatDate = (dateStr: string | null) => {
        if (!dateStr) return "N/A";
        const date = new Date(dateStr);
        return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
      };

      // Format date for form (DD/MM/YYYY)
      const formatDateForForm = (dateStr: string | null) => {
        if (!dateStr) return "";
        const date = new Date(dateStr);
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
      };

      // Format phone with +62 prefix
      const formattedPhone = profile.phone ? (profile.phone.startsWith("+62") ? profile.phone : `+62${profile.phone}`) : "";

      // Store role for modal
      setCustomerRole(profile.role || "customer");

      const customerDetail: CustomerDetail = {
        id: profile.id,
        name: profile.full_name || "Unknown Customer",
        email: profile.email || "",
        phone: formattedPhone,
        birthDate: formatDateForForm(profile.date_of_birth),
        address: profile.address || "",
        city: "-", // Would need to be stored in profile or fetched separately
        registeredDate: formatDate(profile.created_at),
        avatar: profile.avatar_url || undefined,
        memberLevel: memberPoints?.tier || "Bliss",
        totalVisits,
        totalPoints: memberPoints?.total_points || 0,
        lifetimePoints: memberPoints?.lifetime_points || 0,
        digitalStamps: totalVisits > 0 ? Math.min(totalVisits % 8, 7) : 0, // Stamps based on visits (0-7 stamps, 8th is gift)
        maxStamps: 8,
        lifetimeSpend,
        lastVisit: lastVisit ? formatDate(lastVisit) : null,
        averageSpendPerVisit,
        nextAppointment,
        feedbacks,
      };

      setCustomer(customerDetail);
    } catch (err: any) {
      console.error("Error fetching customer detail:", err);
      setError(err.message || "Failed to load customer details");
    } finally {
      setLoading(false);
    }
  };

  const locations = ["Islamic Village", "Location 2", "Location 3"];

  const fetchAppointments = async () => {
    try {
      const startDate = appointmentDateRange.start.toISOString().split("T")[0];
      const endDate = appointmentDateRange.end.toISOString().split("T")[0];

      let query = supabase
        .from("bookings")
        .select(`
          id,
          booking_date,
          booking_time,
          status,
          treatments:treatment_id (
            name
          ),
          therapists:therapist_id (
            profile_id
          )
        `)
        .eq("user_id", customerId)
        .gte("booking_date", startDate)
        .lte("booking_date", endDate)
        .order("booking_date", { ascending: false });

      const { data: bookings, error } = await query;

      if (error) throw error;

      // Fetch therapist profiles
      const therapistIds = [...new Set((bookings || []).map((b: any) => b.therapists?.profile_id).filter(Boolean))];
      const { data: therapistProfiles } = await supabase
        .from("profiles")
        .select("id, full_name")
        .in("id", therapistIds);

      const therapistMap = new Map();
      (therapistProfiles || []).forEach((profile: any) => {
        therapistMap.set(profile.id, profile.full_name);
      });

      const mappedAppointments = (bookings || []).map((booking: any) => {
        const therapistProfileId = booking.therapists?.profile_id;
        return {
          id: booking.id,
          booking_date: booking.booking_date,
          booking_time: booking.booking_time,
          treatment_name: booking.treatments?.name || "Unknown Service",
          therapist_name: therapistProfileId ? therapistMap.get(therapistProfileId) || "Unknown" : "Unknown",
          status: booking.status,
        };
      });

      // Filter by search query
      const filtered = appointmentSearch
        ? mappedAppointments.filter(
            (a: any) =>
              a.treatment_name.toLowerCase().includes(appointmentSearch.toLowerCase()) ||
              a.therapist_name.toLowerCase().includes(appointmentSearch.toLowerCase())
          )
        : mappedAppointments;

      setAppointments(filtered);
    } catch (err: any) {
      console.error("Error fetching appointments:", err);
      setAppointments([]);
    }
  };

  const fetchTreatmentNotes = async () => {
    try {
      const startDate = treatmentNotesDateRange.start.toISOString().split("T")[0];
      const endDate = treatmentNotesDateRange.end.toISOString().split("T")[0];

      const { data: notes, error } = await supabase
        .from("treatment_notes")
        .select(`
          id,
          note,
          rating,
          created_at,
          therapist_id,
          treatment_id,
          bookings:booking_id (
            booking_date,
            treatments:treatment_id (
              name
            )
          )
        `)
        .eq("user_id", customerId)
        .gte("created_at", startDate)
        .lte("created_at", endDate)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch therapist profiles
      const therapistIds = [...new Set((notes || []).map((n: any) => n.therapist_id).filter(Boolean))];
      const { data: therapistProfiles } = await supabase
        .from("therapists")
        .select("id, profile_id")
        .in("id", therapistIds);

      const profileIds = [...new Set((therapistProfiles || []).map((t: any) => t.profile_id).filter(Boolean))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name")
        .in("id", profileIds);

      const profileMap = new Map();
      (profiles || []).forEach((profile: any) => {
        profileMap.set(profile.id, profile.full_name);
      });

      const therapistProfileMap = new Map();
      (therapistProfiles || []).forEach((therapist: any) => {
        therapistProfileMap.set(therapist.id, profileMap.get(therapist.profile_id));
      });

      const mappedNotes = (notes || []).map((note: any) => {
        const booking = note.bookings as any;
        return {
          id: note.id,
          note: note.note,
          rating: note.rating || 5,
          date: booking?.booking_date || note.created_at,
          treatment_name: booking?.treatments?.name || "Unknown Service",
          therapist_name: therapistProfileMap.get(note.therapist_id) || "Unknown",
        };
      });

      // Filter by search query
      const filtered = treatmentNotesSearch
        ? mappedNotes.filter(
            (n: any) =>
              n.treatment_name.toLowerCase().includes(treatmentNotesSearch.toLowerCase()) ||
              n.therapist_name.toLowerCase().includes(treatmentNotesSearch.toLowerCase())
          )
        : mappedNotes;

      setTreatmentNotes(filtered);
    } catch (err: any) {
      console.error("Error fetching treatment notes:", err);
      setTreatmentNotes([]);
    }
  };

  const fetchLoyaltyRewards = async () => {
    try {
      const startDate = loyaltyDateRange.start.toISOString().split("T")[0];
      const endDate = loyaltyDateRange.end.toISOString().split("T")[0];
      const itemsPerPage = 10;
      const from = (loyaltyPage - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;

      // Fetch rewards/redemptions from database
      // Note: This would need to be implemented based on your rewards/redemptions table structure
      // For now, using placeholder data structure
      const { data: rewards, error } = await supabase
        .from("redemptions")
        .select("*")
        .eq("user_id", customerId)
        .gte("created_at", startDate)
        .lte("created_at", endDate)
        .order("created_at", { ascending: false })
        .range(from, to);

      if (error && error.code !== "PGRST116") {
        console.warn("Error fetching rewards:", error);
      }

      // Map to display format
      const mappedRewards = (rewards || []).map((reward: any) => ({
        id: reward.id,
        date: reward.created_at || reward.redeemed_at,
        reward_type: reward.reward_type || "Points",
        reward_name: reward.reward_name || reward.name || "Unknown Reward",
        method: reward.method || "Redeem",
        status: reward.status === "completed" ? "Completed" : "Pending",
      }));

      // Filter by search query
      const filtered = loyaltySearch
        ? mappedRewards.filter((r: any) =>
            r.reward_name.toLowerCase().includes(loyaltySearch.toLowerCase())
          )
        : mappedRewards;

      setLoyaltyRewards(filtered);
    } catch (err: any) {
      console.error("Error fetching loyalty rewards:", err);
      setLoyaltyRewards([]);
    }
  };

  if (loading) {
    return (
      <SejenakDashboardLayout
        navItems={navItems}
        headerTitle=""
        location={location}
        locations={locations}
        onLocationChange={setLocation}
        dateRange={dateRange}
        onDateRangeChange={() => {}}
        isDarkMode={isDarkMode}
        onDarkModeToggle={() => setIsDarkMode((prev) => !prev)}
        customHeader={null}
        footer={<Footer />}
      >
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-sm text-[#706C6B] dark:text-[#C1A7A3]">
            Loading customer details...
          </div>
        </div>
      </SejenakDashboardLayout>
    );
  }

  if (error || !customer) {
    return (
      <SejenakDashboardLayout
        navItems={navItems}
        headerTitle=""
        location={location}
        locations={locations}
        onLocationChange={setLocation}
        dateRange={dateRange}
        onDateRangeChange={() => {}}
        isDarkMode={isDarkMode}
        onDarkModeToggle={() => setIsDarkMode((prev) => !prev)}
        customHeader={null}
        footer={<Footer />}
      >
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <p className="text-sm text-red-600 dark:text-red-400 mb-4">
            {error || "Customer not found"}
          </p>
          <Button onClick={() => router.push("/crm/customer")}>
            Back to Customers
          </Button>
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
      onDateRangeChange={() => {}}
      isDarkMode={isDarkMode}
      onDarkModeToggle={() => setIsDarkMode((prev) => !prev)}
      customHeader={null}
      footer={<Footer />}
    >
      <div className="space-y-6">
        {/* Breadcrumbs */}
        <Breadcrumbs
          items={[
            { label: "CRM", href: "/crm" },
            { label: "Customer", href: "/crm/customer" },
            { label: customer.name },
          ]}
        />

        {/* Header with Block Customer Button */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-[#191919] dark:text-[#F0EEED]">
            Customer Details
          </h1>
          <Button
            variant="danger"
            onClick={() => {
              // TODO: Implement block customer functionality
              console.log("Block customer:", customer.id);
            }}
          >
            Block Customer
          </Button>
        </div>

        {/* Main Content Layout: Left Column (Profile + Tabs) and Right Column (Loyalty + Feedback) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Profile + General Info Card and Tabs */}
          <div className="lg:col-span-2 space-y-6">
            {/* Combined Profile and General Info Card */}
            <div className="bg-white dark:bg-[#191919] rounded-xl p-6 border border-zinc-200 dark:border-zinc-800">
              <div className="flex items-start gap-6">
                {/* Profile Section (Left) */}
                <div className="flex flex-col items-center text-center min-w-[200px]">
                  <Avatar
                    src={customer.avatar}
                    name={customer.name}
                    size="lg"
                  />
                  <h2 className="text-xl font-bold text-[#191919] dark:text-[#F0EEED] mt-4">
                    {customer.name}
                  </h2>
                  <p className="text-sm text-[#706C6B] dark:text-[#C1A7A3] mt-1">
                    {customer.email}
                  </p>
                  <div className="mt-4 w-full">
                    <div className="flex items-center justify-center gap-4">
                      {/* Member Level */}
                      <div className="flex flex-col items-center">
                        <span className="text-sm font-bold text-[#191919] dark:text-[#F0EEED]">
                          {customer.memberLevel}
                        </span>
                        <span className="text-xs text-[#706C6B] dark:text-[#C1A7A3] mt-1">
                          Member level
                        </span>
                      </div>
                      {/* Vertical Divider */}
                      <div className="h-12 w-px bg-zinc-200 dark:bg-zinc-800" />
                      {/* Total Visit */}
                      <div className="flex flex-col items-center">
                        <span className="text-sm font-bold text-[#191919] dark:text-[#F0EEED]">
                          {customer.totalVisits}
                        </span>
                        <span className="text-xs text-[#706C6B] dark:text-[#C1A7A3] mt-1">
                          Total visit
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* General Info Section (Right) */}
                <div className="flex-1 border-l border-zinc-200 dark:border-zinc-800 pl-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-[#191919] dark:text-[#F0EEED]">
                      General Info
                    </h3>
                    <button
                      onClick={() => setIsEditModalOpen(true)}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#F0EEED] dark:bg-[#3D3B3A] text-[#C1A7A3] hover:bg-[#E5E3E2] dark:hover:bg-[#4A4847] transition-colors text-sm font-medium"
                    >
                      <EditIcon />
                      <span>Edit Profile</span>
                    </button>
                  </div>
                  <div className="space-y-4">
                    {/* First Row */}
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <span className="text-sm text-[#706C6B] dark:text-[#C1A7A3]">Phone Number</span>
                        <p className="text-sm font-medium text-[#191919] dark:text-[#F0EEED] mt-1">
                          {customer.phone || "N/A"}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm text-[#706C6B] dark:text-[#C1A7A3]">Birth Date</span>
                        <p className="text-sm font-medium text-[#191919] dark:text-[#F0EEED] mt-1">
                          {customer.birthDate}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm text-[#706C6B] dark:text-[#C1A7A3]">Member Status</span>
                        <p className="text-sm font-medium text-[#191919] dark:text-[#F0EEED] mt-1">
                          Active
                        </p>
                      </div>
                    </div>
                    {/* Second Row */}
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <span className="text-sm text-[#706C6B] dark:text-[#C1A7A3]">Address</span>
                        <p className="text-sm font-medium text-[#191919] dark:text-[#F0EEED] mt-1">
                          {customer.address || "N/A"}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm text-[#706C6B] dark:text-[#C1A7A3]">City</span>
                        <p className="text-sm font-medium text-[#191919] dark:text-[#F0EEED] mt-1">
                          {customer.city}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm text-[#706C6B] dark:text-[#C1A7A3]">Registered Date</span>
                        <p className="text-sm font-medium text-[#191919] dark:text-[#F0EEED] mt-1">
                          {customer.registeredDate}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="bg-white dark:bg-[#191919] rounded-xl border border-zinc-200 dark:border-zinc-800">
          <div className="flex border-b border-zinc-200 dark:border-zinc-800">
            {[
              { id: "overview", label: "Overview" },
              { id: "appointment", label: "Appointment" },
              { id: "treatment-notes", label: "Treatment Notes" },
              { id: "loyalty", label: "Loyalty" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-6 py-3 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? "text-[#C1A7A3] border-b-2 border-[#C1A7A3]"
                    : "text-[#706C6B] dark:text-[#C1A7A3] hover:text-[#191919] dark:hover:text-[#F0EEED]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-6">
            {activeTab === "overview" && (
              <div className="space-y-6">
                {/* Overview Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#F0EEED] dark:bg-[#3D3B3A] flex items-center justify-center">
                      <svg className="w-5 h-5 text-[#C1A7A3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-[#706C6B] dark:text-[#C1A7A3]">Lifetime Spend</p>
                      <p className="text-lg font-bold text-[#191919] dark:text-[#F0EEED]">
                        Rp {customer.lifetimeSpend.toLocaleString("id-ID")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#F0EEED] dark:bg-[#3D3B3A] flex items-center justify-center">
                      <svg className="w-5 h-5 text-[#C1A7A3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-[#706C6B] dark:text-[#C1A7A3]">Last Visit</p>
                      <p className="text-lg font-bold text-[#191919] dark:text-[#F0EEED]">
                        {customer.lastVisit || "N/A"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#F0EEED] dark:bg-[#3D3B3A] flex items-center justify-center">
                      <svg className="w-5 h-5 text-[#C1A7A3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-[#706C6B] dark:text-[#C1A7A3]">Average Spend/Visit</p>
                      <p className="text-lg font-bold text-[#191919] dark:text-[#F0EEED]">
                        Rp {customer.averageSpendPerVisit.toLocaleString("id-ID")}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Next Appointment */}
                <div className="bg-[#F0EEED] dark:bg-[#3D3B3A] rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-[#191919] dark:text-[#F0EEED] mb-4">
                    Next Appointment
                  </h4>
                  {customer.nextAppointment ? (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="bg-white dark:bg-[#191919] rounded-lg px-4 py-2">
                          <p className="text-sm font-medium text-[#191919] dark:text-[#F0EEED]">
                            {new Date(customer.nextAppointment.date).toLocaleDateString("en-GB", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })}
                            <span className="mx-1">•</span>
                            {customer.nextAppointment.time}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-[#191919] dark:text-[#F0EEED]">
                            {customer.nextAppointment.service}
                          </p>
                          <p className="text-sm text-[#706C6B] dark:text-[#C1A7A3]">
                            Therapist : {customer.nextAppointment.therapist}
                          </p>
                        </div>
                      </div>
                      <button className="px-4 py-2 bg-[#C1A7A3] text-white rounded-lg hover:bg-[#A88F8B] transition-colors text-sm font-medium">
                        View
                      </button>
                    </div>
                  ) : (
                    <p className="text-sm text-[#706C6B] dark:text-[#C1A7A3]">
                      No upcoming appointments
                    </p>
                  )}
                </div>
              </div>
            )}

            {activeTab === "appointment" && (
              <div className="space-y-6">
                {/* Date Range and Search */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 bg-[#F0EEED] dark:bg-[#3D3B3A] rounded-lg px-4 py-2">
                    <button
                      onClick={() => {
                        const newStart = new Date(appointmentDateRange.start);
                        newStart.setDate(newStart.getDate() - 4);
                        const newEnd = new Date(appointmentDateRange.end);
                        newEnd.setDate(newEnd.getDate() - 4);
                        setAppointmentDateRange({ start: newStart, end: newEnd });
                      }}
                      className="text-[#706C6B] dark:text-[#C1A7A3] hover:text-[#191919] dark:hover:text-[#F0EEED]"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-sm text-[#191919] dark:text-[#F0EEED]">
                      {appointmentDateRange.start.toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}{" "}
                      -{" "}
                      {appointmentDateRange.end.toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}
                    </span>
                    <button
                      onClick={() => {
                        const newStart = new Date(appointmentDateRange.start);
                        newStart.setDate(newStart.getDate() + 4);
                        const newEnd = new Date(appointmentDateRange.end);
                        newEnd.setDate(newEnd.getDate() + 4);
                        setAppointmentDateRange({ start: newStart, end: newEnd });
                      }}
                      className="text-[#706C6B] dark:text-[#C1A7A3] hover:text-[#191919] dark:hover:text-[#F0EEED]"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="relative flex-1 max-w-md">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#706C6B] dark:text-[#C1A7A3]">
                      <SearchIcon />
                    </div>
                    <input
                      type="text"
                      placeholder="Treatment, therapist"
                      value={appointmentSearch}
                      onChange={(e) => setAppointmentSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-[#191919] text-[#191919] dark:text-[#F0EEED] placeholder-[#706C6B] focus:outline-none focus:ring-2 focus:ring-[#C1A7A3]"
                    />
                  </div>
                </div>

                {/* Appointment List */}
                <div className="space-y-4">
                  {appointments.length > 0 ? (
                    appointments.map((appointment) => (
                      <div
                        key={appointment.id}
                        className="bg-[#F0EEED] dark:bg-[#3D3B3A] rounded-lg p-4 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-4">
                          <div className="bg-white dark:bg-[#191919] rounded-lg px-4 py-2">
                            <p className="text-sm font-medium text-[#191919] dark:text-[#F0EEED]">
                              {new Date(appointment.booking_date).toLocaleDateString("en-GB", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })}
                              <span className="mx-1">•</span>
                              {appointment.booking_time}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-[#191919] dark:text-[#F0EEED]">
                              {appointment.treatment_name || "Unknown Service"}
                            </p>
                            <p className="text-sm text-[#706C6B] dark:text-[#C1A7A3]">
                              Therapist : {appointment.therapist_name || "Unknown"}
                            </p>
                          </div>
                        </div>
                        <button className="px-4 py-2 bg-[#C1A7A3] text-white rounded-lg hover:bg-[#A88F8B] transition-colors text-sm font-medium">
                          View
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-[#706C6B] dark:text-[#C1A7A3] text-center py-8">
                      No appointments found
                    </p>
                  )}
                </div>
              </div>
            )}

            {activeTab === "treatment-notes" && (
              <div className="space-y-6">
                {/* Date Range and Search */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 bg-[#F0EEED] dark:bg-[#3D3B3A] rounded-lg px-4 py-2">
                    <button
                      onClick={() => {
                        const newStart = new Date(treatmentNotesDateRange.start);
                        newStart.setDate(newStart.getDate() - 4);
                        const newEnd = new Date(treatmentNotesDateRange.end);
                        newEnd.setDate(newEnd.getDate() - 4);
                        setTreatmentNotesDateRange({ start: newStart, end: newEnd });
                      }}
                      className="text-[#706C6B] dark:text-[#C1A7A3] hover:text-[#191919] dark:hover:text-[#F0EEED]"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-sm text-[#191919] dark:text-[#F0EEED]">
                      {treatmentNotesDateRange.start.toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}{" "}
                      -{" "}
                      {treatmentNotesDateRange.end.toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}
                    </span>
                    <button
                      onClick={() => {
                        const newStart = new Date(treatmentNotesDateRange.start);
                        newStart.setDate(newStart.getDate() + 4);
                        const newEnd = new Date(treatmentNotesDateRange.end);
                        newEnd.setDate(newEnd.getDate() + 4);
                        setTreatmentNotesDateRange({ start: newStart, end: newEnd });
                      }}
                      className="text-[#706C6B] dark:text-[#C1A7A3] hover:text-[#191919] dark:hover:text-[#F0EEED]"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="relative flex-1 max-w-md">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#706C6B] dark:text-[#C1A7A3]">
                      <SearchIcon />
                    </div>
                    <input
                      type="text"
                      placeholder="Treatment, therapist"
                      value={treatmentNotesSearch}
                      onChange={(e) => setTreatmentNotesSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-[#191919] text-[#191919] dark:text-[#F0EEED] placeholder-[#706C6B] focus:outline-none focus:ring-2 focus:ring-[#C1A7A3]"
                    />
                  </div>
                </div>

                {/* Treatment Notes List */}
                <div className="space-y-4">
                  {treatmentNotes.length > 0 ? (
                    treatmentNotes.map((note) => (
                      <div
                        key={note.id}
                        className="flex items-start justify-between py-3 border-b border-zinc-200 dark:border-zinc-800 last:border-0"
                      >
                        <div className="flex-1">
                          <p className="text-sm font-medium text-[#191919] dark:text-[#F0EEED] mb-1">
                            From therapist : {note.therapist_name || "Unknown"}
                          </p>
                          <p className="text-sm text-[#706C6B] dark:text-[#C1A7A3] mb-2">
                            {new Date(note.date).toLocaleDateString("en-GB", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })}{" "}
                            <span className="mx-1">•</span> {note.treatment_name || "Unknown Service"}
                          </p>
                          <p className="text-sm text-[#191919] dark:text-[#F0EEED]">
                            {note.note || "No note"}
                          </p>
                        </div>
                        <div className="flex gap-1 ml-4">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <svg
                              key={i}
                              className={`w-4 h-4 ${
                                i < (note.rating || 5)
                                  ? "text-orange-500"
                                  : "text-zinc-300 dark:text-zinc-700"
                              }`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-[#706C6B] dark:text-[#C1A7A3] text-center py-8">
                      No treatment notes found
                    </p>
                  )}
                </div>
              </div>
            )}

            {activeTab === "loyalty" && (
              <div className="space-y-6">
                {/* Date Range and Search */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 bg-[#F0EEED] dark:bg-[#3D3B3A] rounded-lg px-4 py-2">
                    <button
                      onClick={() => {
                        const newStart = new Date(loyaltyDateRange.start);
                        newStart.setDate(newStart.getDate() - 1);
                        const newEnd = new Date(loyaltyDateRange.end);
                        newEnd.setDate(newEnd.getDate() - 1);
                        setLoyaltyDateRange({ start: newStart, end: newEnd });
                      }}
                      className="text-[#706C6B] dark:text-[#C1A7A3] hover:text-[#191919] dark:hover:text-[#F0EEED]"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-sm text-[#191919] dark:text-[#F0EEED]">
                      {loyaltyDateRange.start.toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}{" "}
                      -{" "}
                      {loyaltyDateRange.end.toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}
                    </span>
                    <button
                      onClick={() => {
                        const newStart = new Date(loyaltyDateRange.start);
                        newStart.setDate(newStart.getDate() + 1);
                        const newEnd = new Date(loyaltyDateRange.end);
                        newEnd.setDate(newEnd.getDate() + 1);
                        setLoyaltyDateRange({ start: newStart, end: newEnd });
                      }}
                      className="text-[#706C6B] dark:text-[#C1A7A3] hover:text-[#191919] dark:hover:text-[#F0EEED]"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="relative flex-1 max-w-md">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#706C6B] dark:text-[#C1A7A3]">
                      <SearchIcon />
                    </div>
                    <input
                      type="text"
                      placeholder="Reward name"
                      value={loyaltySearch}
                      onChange={(e) => setLoyaltySearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-[#191919] text-[#191919] dark:text-[#F0EEED] placeholder-[#706C6B] focus:outline-none focus:ring-2 focus:ring-[#C1A7A3]"
                    />
                  </div>
                </div>

                {/* Rewards Table */}
                <div className="bg-white dark:bg-[#191919] rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-[#F0EEED] dark:bg-[#3D3B3A] border-b border-zinc-200 dark:border-zinc-800">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-[#706C6B] dark:text-[#C1A7A3] uppercase tracking-wider">
                            Date
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-[#706C6B] dark:text-[#C1A7A3] uppercase tracking-wider">
                            Reward Type
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-[#706C6B] dark:text-[#C1A7A3] uppercase tracking-wider">
                            Reward Name
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-[#706C6B] dark:text-[#C1A7A3] uppercase tracking-wider">
                            Method
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-[#706C6B] dark:text-[#C1A7A3] uppercase tracking-wider">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                        {loyaltyRewards.length > 0 ? (
                          loyaltyRewards.map((reward) => (
                            <tr key={reward.id} className="hover:bg-[#F0EEED] dark:hover:bg-[#3D3B3A]">
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-[#191919] dark:text-[#F0EEED]">
                                {new Date(reward.date).toLocaleDateString("en-GB", {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                })}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-[#191919] dark:text-[#F0EEED]">
                                {reward.reward_type}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-[#191919] dark:text-[#F0EEED]">
                                {reward.reward_name}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-[#191919] dark:text-[#F0EEED]">
                                {reward.method}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span
                                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                                    reward.status === "Completed"
                                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                      : "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
                                  }`}
                                >
                                  {reward.status}
                                </span>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={5} className="px-6 py-8 text-center text-sm text-[#706C6B] dark:text-[#C1A7A3]">
                              No rewards found
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                  
                  {/* Pagination */}
                  {loyaltyRewards.length > 0 && (
                    <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-200 dark:border-zinc-800">
                      <p className="text-sm text-[#706C6B] dark:text-[#C1A7A3]">
                        Showing data 1-10 of 200
                      </p>
                      <div className="flex items-center gap-2">
                        <button
                          disabled={loyaltyPage === 1}
                          className="p-2 rounded-lg border border-zinc-300 dark:border-zinc-700 text-[#706C6B] dark:text-[#C1A7A3] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#F0EEED] dark:hover:bg-[#3D3B3A]"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setLoyaltyPage(1)}
                          className={`px-3 py-1 rounded-lg text-sm font-medium ${
                            loyaltyPage === 1
                              ? "bg-[#C1A7A3] text-white"
                              : "border border-zinc-300 dark:border-zinc-700 text-[#191919] dark:text-[#F0EEED] hover:bg-[#F0EEED] dark:hover:bg-[#3D3B3A]"
                          }`}
                        >
                          1
                        </button>
                        <button
                          onClick={() => setLoyaltyPage(2)}
                          className={`px-3 py-1 rounded-lg text-sm font-medium ${
                            loyaltyPage === 2
                              ? "bg-[#C1A7A3] text-white"
                              : "border border-zinc-300 dark:border-zinc-700 text-[#191919] dark:text-[#F0EEED] hover:bg-[#F0EEED] dark:hover:bg-[#3D3B3A]"
                          }`}
                        >
                          2
                        </button>
                        <button
                          className="p-2 rounded-lg border border-zinc-300 dark:border-zinc-700 text-[#706C6B] dark:text-[#C1A7A3] hover:bg-[#F0EEED] dark:hover:bg-[#3D3B3A]"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
          </div>

          {/* Right Column: Loyalty and Feedback */}
          <div className="space-y-6">
            {/* Loyalty Card */}
            <div className="bg-white dark:bg-[#191919] rounded-xl p-6 border border-zinc-200 dark:border-zinc-800">
              <h3 className="text-lg font-semibold text-[#191919] dark:text-[#F0EEED] mb-4">
                Loyalty
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-[#706C6B] dark:text-[#C1A7A3]">Total Points</span>
                    <span className="text-lg font-bold text-[#191919] dark:text-[#F0EEED]">
                      {customer.totalPoints}
                    </span>
                  </div>
                  <div className="w-full bg-[#F0EEED] dark:bg-[#3D3B3A] rounded-full h-2">
                    <div
                      className="bg-[#C1A7A3] h-2 rounded-full"
                      style={{ width: `${Math.min((customer.totalPoints / 1000) * 100, 100)}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-[#706C6B] dark:text-[#C1A7A3]">Digital Stamp</span>
                    <span className="text-sm font-medium text-[#191919] dark:text-[#F0EEED]">
                      {customer.digitalStamps}/{customer.maxStamps}
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {Array.from({ length: customer.maxStamps }).map((_, i) => {
                      const isFilled = i < customer.digitalStamps;
                      const isLast = i === customer.maxStamps - 1;
                      
                      return (
                        <div key={i} className="flex items-center justify-center">
                          {isLast ? (
                            // Gift box icon for 8th stamp with circular border
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                              isFilled 
                                ? "bg-[#C1A7A3]" 
                                : "border-2 border-zinc-300 dark:border-zinc-700"
                            }`}>
                              <Gift 
                                className={`w-6 h-6 ${
                                  isFilled 
                                    ? "text-white" 
                                    : "text-zinc-300 dark:text-zinc-700"
                                }`}
                              />
                            </div>
                          ) : (
                            // Stamp Sejenak SVG
                            <img
                              src="/assets/Stamp Sejenak.svg"
                              alt="Stamp"
                              className={`w-12 h-12 ${isFilled ? "" : "opacity-30"}`}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Feedback Card */}
            <div className="bg-white dark:bg-[#191919] rounded-xl p-6 border border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-[#191919] dark:text-[#F0EEED]">
                  Feedback
                </h3>
                {customer.feedbacks.length > 0 && (
                  <span className="text-xs bg-[#C1A7A3] text-white rounded-full px-2 py-1">
                    {customer.feedbacks.length}!
                  </span>
                )}
              </div>
              <div className="space-y-4 max-h-[400px] overflow-y-auto">
                {customer.feedbacks.length > 0 ? (
                  customer.feedbacks.map((feedback) => (
                    <div key={feedback.id} className="border-b border-zinc-300 dark:border-zinc-700 pb-3 last:border-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm text-[#706C6B] dark:text-[#C1A7A3]">
                          {new Date(feedback.date).toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })} • {feedback.service}
                        </p>
                        <div className="flex gap-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <svg
                              key={i}
                              className={`w-4 h-4 ${
                                i < feedback.rating
                                  ? "text-yellow-400"
                                  : "text-zinc-300 dark:text-zinc-700"
                              }`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-[#191919] dark:text-[#F0EEED] mb-1">
                        {feedback.comment}
                      </p>
                      <p className="text-xs text-[#706C6B] dark:text-[#C1A7A3]">
                        Tip: Rp {feedback.tip.toLocaleString("id-ID")}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-[#706C6B] dark:text-[#C1A7A3]">
                    No feedback yet
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {customer && (
        <EditProfileModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          customer={{
            id: customer.id,
            name: customer.name,
            email: customer.email,
            phone: customer.phone,
            birthDate: customer.birthDate,
            address: customer.address,
            city: customer.city,
            registeredDate: customer.registeredDate,
            memberStatus: "Active", // This would need to be fetched from database
            role: customerRole, // Get role from state
          }}
          onSave={() => {
            fetchCustomerDetail(); // Refresh customer data
          }}
        />
      )}
    </SejenakDashboardLayout>
  );
}

