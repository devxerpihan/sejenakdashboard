"use client";

import React, { useState, useEffect } from "react";
import { SejenakDashboardLayout } from "@/components/layout/SejenakDashboardLayout";
import { Footer } from "@/components/layout";
import {
  Breadcrumbs,
  PageHeader,
  PromoTable,
  Pagination,
  CreatePromoModal,
  EmptyState,
} from "@/components/services";
import { PlusIcon, SearchIcon } from "@/components/icons";
import { navItems } from "@/config/navigation";
import { Promo } from "@/types/promo";
import { usePromos } from "@/hooks/usePromos";
import { supabase } from "@/lib/supabase";
import { ToastContainer } from "@/components/ui/Toast";
import { EligibilityData } from "@/components/services";

export default function PromoPage() {
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
  const [currentPage, setCurrentPage] = useState(1);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Fetch promos from database
  const { promos: allPromos, loading, error, refetch } = usePromos();

  // Toast notifications
  const [toasts, setToasts] = useState<Array<{ id: string; message: string; type?: "success" | "error" | "warning" | "info" }>>([]);
  
  const showToast = (message: string, type: "success" | "error" | "warning" | "info" = "info") => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, type }]);
  };
  
  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
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

  const filteredPromos = allPromos.filter((promo) => {
    const matchesSearch =
      searchQuery === "" ||
      promo.code.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  // Pagination
  const itemsPerPage = 5;
  const totalPages = Math.ceil(filteredPromos.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedPromos = filteredPromos.slice(startIndex, endIndex);

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const locations = ["Islamic Village", "Location 2", "Location 3"];

  const handleCreatePromo = () => {
    setCreateModalOpen(true);
  };

  const handleSavePromo = async (promoData: {
    code: string;
    type: "nominal" | "percentage";
    value: number;
    quota: number;
    minTransaction?: number;
    eligibility?: EligibilityData;
    validFrom: Date;
    validUntil: Date;
  }) => {
    try {
      const { error: insertError } = await supabase
        .from("promos")
        .insert({
          code: promoData.code,
          type: promoData.type,
          value: promoData.value,
          quota: promoData.quota,
          usage_count: 0,
          min_transaction: promoData.minTransaction || null,
          eligibility: promoData.eligibility ? JSON.stringify(promoData.eligibility) : null,
          valid_from: promoData.validFrom.toISOString(),
          valid_until: promoData.validUntil.toISOString(),
          status: "active",
        });

      if (insertError) throw insertError;

      await refetch();
      showToast("Promo created successfully!", "success");
    } catch (err: any) {
      console.error("Error creating promo:", err);
      showToast(`Failed to create promo: ${err.message || "Unknown error"}`, "error");
      throw err;
    }
  };

  const handleDeletePromo = async (promoId: string) => {
    if (!confirm("Are you sure you want to delete this promo? This action cannot be undone.")) {
      return;
    }

    try {
      setDeleting(true);
      const { error: deleteError } = await supabase
        .from("promos")
        .delete()
        .eq("id", promoId);

      if (deleteError) throw deleteError;

      await refetch();
      showToast("Promo deleted successfully!", "success");
    } catch (err: any) {
      console.error("Error deleting promo:", err);
      showToast(`Failed to delete promo: ${err.message || "Unknown error"}`, "error");
    } finally {
      setDeleting(false);
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
            { label: "Services", href: "/services" },
            { label: "Promo" },
          ]}
        />

        {/* Page Header */}
        <PageHeader
          title="Promo"
          actionButtons={[
            {
              label: "Create Promo",
              onClick: handleCreatePromo,
              variant: "primary",
              icon: <PlusIcon />,
            },
          ]}
        />

        {/* Search Bar */}
        <div className="relative flex-1 max-w-md mb-6">
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#706C6B] dark:text-[#C1A7A3]">
            <SearchIcon />
          </div>
          <input
            type="text"
            placeholder="Promo code"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-[#191919] text-[#191919] dark:text-[#F0EEED] placeholder-[#706C6B] focus:outline-none focus:ring-2 focus:ring-[#C1A7A3]"
          />
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12 text-[#706C6B] dark:text-[#C1A7A3]">
            Loading promos...
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
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
        )}

        {/* Promo Table */}
        {!loading && !error && (
          <>
            {paginatedPromos.length > 0 ? (
              <>
                <PromoTable promos={paginatedPromos} onDelete={handleDeletePromo} />
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={filteredPromos.length}
                  itemsPerPage={itemsPerPage}
                  onPageChange={setCurrentPage}
                />
              </>
            ) : (
              <EmptyState message="No promos found. Create a promo to get started." />
            )}
          </>
        )}

        {/* Create Promo Modal */}
        <CreatePromoModal
          isOpen={createModalOpen}
          onClose={() => setCreateModalOpen(false)}
          onSave={handleSavePromo}
          onError={(message) => showToast(message, "error")}
        />
      </div>
      
      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </SejenakDashboardLayout>
  );
}

