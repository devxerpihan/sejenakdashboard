"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { SejenakDashboardLayout } from "@/components/layout/SejenakDashboardLayout";
import { Footer } from "@/components/layout";
import {
  Breadcrumbs,
  PageHeader,
  StaffTable,
  RoleFilterTabs,
  Pagination,
} from "@/components/services";
import { SearchIcon } from "@/components/icons";
import { navItems } from "@/config/navigation";
import { Staff, StaffRole } from "@/types/staff";
import { useStaff } from "@/hooks/useStaff";
import { EditStaffModal } from "@/components/staff/EditStaffModal";
import { supabase } from "@/lib/supabase";

export default function StaffPage() {
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

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState<StaffRole>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [editingStaffDetails, setEditingStaffDetails] = useState<any>(null);
  const [loadingStaffDetails, setLoadingStaffDetails] = useState(false);
  const router = useRouter();

  // Fetch staff from database
  const { staff: allStaff, loading, error, refetch } = useStaff();

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


  // Calculate role counts
  const roleCounts = useMemo(() => {
    return {
      all: allStaff.length,
      Therapist: allStaff.filter((s) => s.role === "Therapist").length,
      Receptionist: allStaff.filter((s) => s.role === "Receptionist").length,
      "Cook Helper": allStaff.filter((s) => s.role === "Cook Helper").length,
      "Spa Attendant": allStaff.filter((s) => s.role === "Spa Attendant").length,
    };
  }, [allStaff]);

  // Filter staff
  const filteredStaff = useMemo(() => {
    return allStaff.filter((member) => {
      const matchesRole =
        selectedRole === "all" || member.role === selectedRole;
      const matchesSearch =
        searchQuery === "" ||
        member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.email.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesRole && matchesSearch;
    });
  }, [allStaff, selectedRole, searchQuery]);

  // Pagination
  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredStaff.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedStaff = filteredStaff.slice(startIndex, endIndex);

  const locations = ["Islamic Village", "Location 2", "Location 3"];

  const handleStaffClick = (staff: Staff) => {
    router.push(`/staff/${staff.id}`);
  };

  const handleStaffAction = async (action: "view" | "edit" | "setInactive", staff: Staff) => {
    if (action === "view") {
      // Same action as clicking the row - navigate to detail page
      router.push(`/staff/${staff.id}`);
    } else if (action === "edit") {
      // Fetch staff details and open edit modal directly on this page
      setLoadingStaffDetails(true);
      try {
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", staff.id)
          .single();

        if (error) throw error;

        // Fetch therapist record if exists
        const { data: therapist } = await supabase
          .from("therapists")
          .select("branch_id")
          .eq("profile_id", staff.id)
          .single();

        // Fetch branch name
        let branchName = staff.branch;
        if (therapist?.branch_id) {
          const { data: branch } = await supabase
            .from("branches")
            .select("name")
            .eq("id", therapist.branch_id)
            .single();
          if (branch) branchName = branch.name;
        }

        // Format dates
        const formatDate = (dateStr: string | null) => {
          if (!dateStr) return "";
          const date = new Date(dateStr);
          const day = String(date.getDate()).padStart(2, "0");
          const month = String(date.getMonth() + 1).padStart(2, "0");
          const year = date.getFullYear();
          return `${day}/${month}/${year}`;
        };

        // Format phone with +62 prefix
        const formattedPhone = profile.phone ? (profile.phone.startsWith("+62") ? profile.phone : `+62${profile.phone}`) : "";

        // Map role from database to display format
        let role: string = "therapist";
        if (profile.role === "receptionist") role = "receptionist";
        else if (profile.role === "cook_helper") role = "cook_helper";
        else if (profile.role === "spa_attendant") role = "spa_attendant";
        else role = "therapist";

        setEditingStaffDetails({
          id: profile.id,
          name: profile.full_name || staff.name,
          email: profile.email || staff.email,
          phone: formattedPhone,
          birthDate: formatDate(profile.date_of_birth),
          address: profile.address || "",
          city: "-", // Would need to be stored in profile
          registeredDate: formatDate(profile.created_at),
          role,
          branch: branchName,
          status: staff.status,
        });
        setEditingStaff(staff);
        setIsEditModalOpen(true);
      } catch (err: any) {
        console.error("Error fetching staff details:", err);
        alert("Failed to load staff details for editing");
      } finally {
        setLoadingStaffDetails(false);
      }
    } else if (action === "setInactive") {
      // TODO: Implement set inactive functionality
      console.log("Set inactive staff:", staff.id);
      // Could show a confirmation modal here
    }
  };

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
            { label: "Staff" },
          ]}
        />

        {/* Page Header */}
        <PageHeader
          title="Staff"
          actionButtons={[]}
        />

        {/* Role Filter Tabs */}
        <RoleFilterTabs
          selectedRole={selectedRole}
          onRoleChange={setSelectedRole}
          counts={roleCounts}
        />

        {/* Search Bar */}
        <div className="relative flex-1 max-w-md mb-6">
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#706C6B] dark:text-[#C1A7A3]">
            <SearchIcon />
          </div>
          <input
            type="text"
            placeholder="Name, email"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-[#191919] text-[#191919] dark:text-[#F0EEED] placeholder-[#706C6B] focus:outline-none focus:ring-2 focus:ring-[#C1A7A3]"
          />
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white dark:bg-[#191919] rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden">
            <div className="flex items-center justify-center py-16 px-6 min-h-[400px]">
              <div className="text-sm text-[#706C6B] dark:text-[#C1A7A3]">
                Loading staff...
              </div>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-white dark:bg-[#191919] rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden">
            <div className="flex flex-col items-center justify-center py-16 px-6 min-h-[400px]">
              <p className="text-sm text-red-600 dark:text-red-400 mb-4">
                Error: {error}
              </p>
              <button
                onClick={() => refetch()}
                className="px-4 py-2 bg-[#C1A7A3] text-white rounded-lg hover:bg-[#A8928E] transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Staff Table */}
        {!loading && !error && (
          <>
            <StaffTable
              staff={paginatedStaff}
              onStaffClick={handleStaffClick}
              onActionClick={handleStaffAction}
            />
          </>
        )}

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredStaff.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* Edit Staff Modal */}
      {editingStaff && editingStaffDetails && (
        <EditStaffModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingStaff(null);
            setEditingStaffDetails(null);
          }}
          staff={editingStaffDetails}
          onSave={() => {
            // Refresh staff list
            setIsEditModalOpen(false);
            setEditingStaff(null);
            setEditingStaffDetails(null);
            window.location.reload();
          }}
        />
      )}
    </SejenakDashboardLayout>
  );
}

