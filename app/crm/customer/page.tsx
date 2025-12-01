"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { SejenakDashboardLayout } from "@/components/layout/SejenakDashboardLayout";
import { Footer } from "@/components/layout";
import {
  Breadcrumbs,
  PageHeader,
  CustomerTable,
  StatusFilterTabs,
  Pagination,
} from "@/components/services";
import { SearchIcon } from "@/components/icons";
import { Dropdown } from "@/components/ui/Dropdown";
import { navItems } from "@/config/navigation";
import { Customer, CustomerStatus } from "@/types/customer";
import { useCustomers } from "@/hooks/useCustomers";
import { EditProfileModal } from "@/components/crm/EditProfileModal";
import { supabase } from "@/lib/supabase";

export default function CustomerPage() {
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
  const [selectedStatus, setSelectedStatus] = useState<CustomerStatus>("all");
  const [selectedMemberLevel, setSelectedMemberLevel] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [editingCustomerDetails, setEditingCustomerDetails] = useState<any>(null);
  const [loadingCustomerDetails, setLoadingCustomerDetails] = useState(false);
  const router = useRouter();

  // Fetch customers from database
  const { customers: allCustomers, loading, error, refetch } = useCustomers();

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


  // Calculate status counts
  const statusCounts = useMemo(() => {
    return {
      all: allCustomers.length,
      active: allCustomers.filter((c) => c.status === "active").length,
      "at-risk": allCustomers.filter((c) => c.status === "at-risk").length,
      flagged: allCustomers.filter((c) => c.status === "flagged").length,
      blocked: allCustomers.filter((c) => c.status === "blocked").length,
    };
  }, [allCustomers]);

  // Filter customers
  const filteredCustomers = useMemo(() => {
    return allCustomers.filter((customer) => {
      const matchesStatus =
        selectedStatus === "all" || customer.status === selectedStatus;
      const matchesMemberLevel =
        selectedMemberLevel === "All" ||
        customer.memberLevel === selectedMemberLevel;
      const matchesSearch =
        searchQuery === "" ||
        customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (customer.phone &&
          customer.phone.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesStatus && matchesMemberLevel && matchesSearch;
    });
  }, [allCustomers, selectedStatus, selectedMemberLevel, searchQuery]);

  // Pagination
  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedCustomers = filteredCustomers.slice(startIndex, endIndex);

  const locations = ["Islamic Village", "Location 2", "Location 3"];
  const memberLevels = ["All", "Grace", "Signature", "Elite"];

  const handleExportImport = () => {
    console.log("Export / Import");
    // TODO: Implement export/import functionality
  };

  const handleCustomerClick = (customer: Customer) => {
    router.push(`/crm/customer/${customer.id}`);
  };

  const handleBlockCustomer = async (customerId: string, block: boolean) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ is_active: !block }) // block = true means is_active = false
        .eq("id", customerId);

      if (error) throw error;

      // Refresh customer list
      await refetch();
      
      // Show success message
      alert(block ? "Customer has been blocked successfully." : "Customer has been unblocked successfully.");
    } catch (err: any) {
      console.error("Error blocking/unblocking customer:", err);
      alert("Failed to update customer status: " + (err.message || "Unknown error"));
    }
  };

  const handleCustomerAction = async (action: "view" | "edit" | "block", customer: Customer) => {
    if (action === "view") {
      // Same action as clicking the row - navigate to detail page
      router.push(`/crm/customer/${customer.id}`);
    } else if (action === "edit") {
      // Fetch customer details and open edit modal directly on this page
      setLoadingCustomerDetails(true);
      try {
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", customer.id)
          .single();

        if (error) throw error;

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

        setEditingCustomerDetails({
          id: profile.id,
          name: profile.full_name || customer.name,
          email: profile.email || customer.email,
          phone: formattedPhone,
          birthDate: formatDate(profile.date_of_birth),
          address: profile.address || "",
          city: "-", // Would need to be stored in profile
          registeredDate: formatDate(profile.created_at),
          memberStatus: "Active",
          role: profile.role || "customer",
        });
        setEditingCustomer(customer);
        setIsEditModalOpen(true);
      } catch (err: any) {
        console.error("Error fetching customer details:", err);
        alert("Failed to load customer details for editing");
      } finally {
        setLoadingCustomerDetails(false);
      }
    } else if (action === "block") {
      // Show confirmation before blocking
      const isBlocked = customer.status === "blocked";
      const confirmMessage = isBlocked
        ? `Are you sure you want to unblock ${customer.name}?`
        : `Are you sure you want to block ${customer.name}? This will prevent them from making appointments.`;
      
      if (window.confirm(confirmMessage)) {
        handleBlockCustomer(customer.id, !isBlocked);
      }
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
            { label: "CRM", href: "/crm" },
            { label: "Customer" },
          ]}
        />

        {/* Page Header */}
        <PageHeader
          title="Customer"
          actionButtons={[
            {
              label: "Export / Import",
              onClick: handleExportImport,
              variant: "primary",
            },
          ]}
        />

        {/* Status Filter Tabs */}
        <StatusFilterTabs
          selectedStatus={selectedStatus}
          onStatusChange={setSelectedStatus}
          counts={statusCounts}
        />

        {/* Search and Member Level Filter */}
        <div className="flex items-center gap-4 mb-6">
          {/* Member Level Dropdown */}
          <Dropdown
            options={[
              { value: "All", label: "Member level" },
              ...memberLevels.slice(1).map((level) => ({
                value: level,
                label: level,
              })),
            ]}
            value={selectedMemberLevel}
            onChange={setSelectedMemberLevel}
            placeholder="Member level"
          />

          {/* Search Bar */}
          <div className="relative flex-1 max-w-md">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#706C6B] dark:text-[#C1A7A3]">
              <SearchIcon />
            </div>
            <input
              type="text"
              placeholder="Name, email, phone"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-[#191919] text-[#191919] dark:text-[#F0EEED] placeholder-[#706C6B] focus:outline-none focus:ring-2 focus:ring-[#C1A7A3]"
            />
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white dark:bg-[#191919] rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden">
            <div className="flex items-center justify-center py-16 px-6 min-h-[400px]">
              <div className="text-sm text-[#706C6B] dark:text-[#C1A7A3]">
                Loading customers...
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

        {/* Customer Table */}
        {!loading && !error && (
          <>
            <CustomerTable
              customers={paginatedCustomers}
              onCustomerClick={handleCustomerClick}
              onActionClick={handleCustomerAction}
            />
          </>
        )}

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredCustomers.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* Edit Profile Modal */}
      {editingCustomer && editingCustomerDetails && (
        <EditProfileModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingCustomer(null);
            setEditingCustomerDetails(null);
          }}
          customer={editingCustomerDetails}
          onSave={() => {
            // Refresh customer list
            setIsEditModalOpen(false);
            setEditingCustomer(null);
            setEditingCustomerDetails(null);
            window.location.reload();
          }}
        />
      )}
    </SejenakDashboardLayout>
  );
}

