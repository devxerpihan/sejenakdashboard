"use client";

import React, { useState, useEffect } from "react";
import { SejenakDashboardLayout } from "@/components/layout/SejenakDashboardLayout";
import { Footer } from "@/components/layout";
import {
  Breadcrumbs,
  PageHeader,
  DiscountTable,
  Pagination,
  CreateDiscountModal,
  EmptyState,
} from "@/components/services";
import { PlusIcon, SearchIcon } from "@/components/icons";
import { navItems } from "@/config/navigation";
import { Discount } from "@/types/discount";
import { useDiscounts } from "@/hooks/useDiscounts";
import { supabase } from "@/lib/supabase";
import { ToastContainer } from "@/components/ui/Toast";
import { EligibilityData } from "@/components/services";

export default function DiscountPage() {
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
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedDiscount, setSelectedDiscount] = useState<Discount | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Fetch discounts from database
  const { discounts: allDiscounts, loading, error, refetch } = useDiscounts();

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
    
  // Filter discounts
  const filteredDiscounts = allDiscounts.filter((discount) => {
    const matchesSearch =
      searchQuery === "" ||
      discount.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  // Pagination
  const itemsPerPage = 5;
  const totalPages = Math.ceil(filteredDiscounts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedDiscounts = filteredDiscounts.slice(startIndex, endIndex);

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const locations = ["Islamic Village", "Location 2", "Location 3"];

  const handleCreateDiscount = () => {
    setSelectedDiscount(null);
    setCreateModalOpen(true);
  };

  const handleDiscountClick = (discount: Discount) => {
    setSelectedDiscount(discount);
    setEditModalOpen(true);
  };

  const handleSaveDiscount = async (discountData: {
    name: string;
    type: "nominal" | "percentage";
    value: number;
    eligibility?: EligibilityData;
    validFrom: Date;
    validUntil: Date;
  }) => {
    try {
      if (selectedDiscount) {
        // Update existing discount
        const { error: updateError } = await supabase
          .from("discounts")
          .update({
            name: discountData.name,
            type: discountData.type,
            value: discountData.value,
            eligibility: discountData.eligibility ? JSON.stringify(discountData.eligibility) : null,
            valid_from: discountData.validFrom.toISOString(),
            valid_until: discountData.validUntil.toISOString(),
          })
          .eq("id", selectedDiscount.id);

        if (updateError) throw updateError;
        showToast("Discount updated successfully!", "success");
      } else {
        // Create new discount
        const { error: insertError } = await supabase
          .from("discounts")
          .insert({
            name: discountData.name,
            type: discountData.type,
            value: discountData.value,
            eligibility: discountData.eligibility ? JSON.stringify(discountData.eligibility) : null,
            valid_from: discountData.validFrom.toISOString(),
            valid_until: discountData.validUntil.toISOString(),
            status: "active",
          });

        if (insertError) throw insertError;
        showToast("Discount created successfully!", "success");
      }

      await refetch();
      setEditModalOpen(false);
      setCreateModalOpen(false);
      setSelectedDiscount(null);
    } catch (err: any) {
      console.error("Error saving discount:", err);
      showToast(`Failed to save discount: ${err.message || "Unknown error"}`, "error");
      throw err;
    }
  };

  const handleDeleteDiscount = async (discountId: string) => {
    if (!confirm("Are you sure you want to delete this discount? This action cannot be undone.")) {
      return;
    }

    try {
      setDeleting(true);
      const { error: deleteError } = await supabase
        .from("discounts")
        .delete()
        .eq("id", discountId);

      if (deleteError) throw deleteError;

      await refetch();
      showToast("Discount deleted successfully!", "success");
    } catch (err: any) {
      console.error("Error deleting discount:", err);
      showToast(`Failed to delete discount: ${err.message || "Unknown error"}`, "error");
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
            { label: "Discount" },
          ]}
        />

        {/* Page Header */}
        <PageHeader
          title="Discount"
          actionButtons={[
            {
              label: "Create Discount",
              onClick: handleCreateDiscount,
              variant: "outline",
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
            placeholder="Discount name"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-[#191919] text-[#191919] dark:text-[#F0EEED] placeholder-[#706C6B] focus:outline-none focus:ring-2 focus:ring-[#C1A7A3]"
          />
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12 text-[#706C6B] dark:text-[#C1A7A3]">
            Loading discounts...
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

        {/* Discount Table */}
        {!loading && !error && (
          <>
            {paginatedDiscounts.length > 0 ? (
              <>
                <DiscountTable 
                  discounts={paginatedDiscounts} 
                  onDiscountClick={handleDiscountClick}
                  onDelete={handleDeleteDiscount}
                />
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={filteredDiscounts.length}
                  itemsPerPage={itemsPerPage}
                  onPageChange={setCurrentPage}
                />
              </>
            ) : (
              <EmptyState message="No discounts found. Create a discount to get started." />
            )}
          </>
        )}

        {/* Create/Edit Discount Modal */}
        <CreateDiscountModal
          isOpen={createModalOpen || editModalOpen}
          onClose={() => {
            setCreateModalOpen(false);
            setEditModalOpen(false);
            setSelectedDiscount(null);
          }}
          discount={selectedDiscount || undefined}
          onSave={handleSaveDiscount}
          onError={(message) => showToast(message, "error")}
        />
      </div>
      
      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </SejenakDashboardLayout>
  );
}

