"use client";

import React, { useState, useEffect } from "react";
import { SejenakDashboardLayout } from "@/components/layout/SejenakDashboardLayout";
import { Footer } from "@/components/layout";
import {
  Breadcrumbs,
  PageHeader,
  EmptyState,
  CreateBundleModal,
  BundleTable,
  Pagination,
} from "@/components/services";
import { PlusIcon, SearchIcon } from "@/components/icons";
import { navItems } from "@/config/navigation";
import { useBundles } from "@/hooks/useBundles";
import { Bundle } from "@/types/bundle";
import { supabase } from "@/lib/supabase";
import { ToastContainer } from "@/components/ui/Toast";

export default function BundlePackagePage() {
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

  // Fetch bundles from database
  const { bundles: allBundles, loading, error, refetch } = useBundles();

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

  const locations = ["Islamic Village", "Location 2", "Location 3"];
  const branches = ["Sejenak Islamic Village"];

  // Filter bundles
  const filteredBundles = allBundles.filter((bundle) => {
    const matchesSearch =
      searchQuery === "" ||
      bundle.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  // Pagination
  const itemsPerPage = 5;
  const totalPages = Math.ceil(filteredBundles.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedBundles = filteredBundles.slice(startIndex, endIndex);

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const handleCreateBundle = () => {
    setCreateModalOpen(true);
  };

  const handleSaveBundle = async (bundleData: { 
    name: string; 
    branch: string; 
    image?: string;
    treatments: string[];
    pricing: number;
  }) => {
    try {
      // Fetch treatment names
      const { data: treatmentsData } = await supabase
        .from("treatments")
        .select("id, name")
        .in("id", bundleData.treatments);

      const treatmentNames = (treatmentsData || []).map((t: any) => t.name);
      const itemsString = treatmentNames.join(", ");

      // Insert bundle package
      const { data: bundleDataResult, error: insertError } = await supabase
        .from("bundle_packages")
        .insert({
          name: bundleData.name,
          branch: bundleData.branch,
          image_url: bundleData.image || null,
          items: itemsString,
          pricing: bundleData.pricing,
          status: "active",
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // Save bundle treatments relationship
      if (bundleData.treatments.length > 0 && bundleDataResult) {
        const bundleTreatments = bundleData.treatments.map((treatmentId) => ({
          bundle_package_id: bundleDataResult.id,
          treatment_id: treatmentId,
        }));

        const { error: bundleTreatmentsError } = await supabase
          .from("bundle_treatments")
          .insert(bundleTreatments);

        if (bundleTreatmentsError) {
          console.error("Error saving bundle treatments:", bundleTreatmentsError);
          // Don't throw - bundle is created, treatments can be added later
        }
      }

      await refetch();
      showToast("Bundle package created successfully!", "success");
    } catch (err: any) {
      console.error("Error creating bundle:", err);
      showToast(`Failed to create bundle: ${err.message || "Unknown error"}`, "error");
      throw err;
    }
  };

  const handleDeleteBundle = async (bundleId: string) => {
    if (!confirm("Are you sure you want to delete this bundle? This action cannot be undone.")) {
      return;
    }

    try {
      setDeleting(true);

      // Delete bundle treatments first (cascade should handle this, but being explicit)
      await supabase
        .from("bundle_treatments")
        .delete()
        .eq("bundle_package_id", bundleId);

      // Delete bundle package
      const { error: deleteError } = await supabase
        .from("bundle_packages")
        .delete()
        .eq("id", bundleId);

      if (deleteError) throw deleteError;

      await refetch();
      showToast("Bundle deleted successfully!", "success");
    } catch (err: any) {
      console.error("Error deleting bundle:", err);
      showToast(`Failed to delete bundle: ${err.message || "Unknown error"}`, "error");
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
            { label: "Bundle Package" },
          ]}
        />

        {/* Page Header */}
        <PageHeader
          title="Bundle Package"
          actionButtons={[
            {
              label: "Create Bundle",
              onClick: handleCreateBundle,
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
            placeholder="Bundle"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-[#191919] text-[#191919] dark:text-[#F0EEED] placeholder-[#706C6B] focus:outline-none focus:ring-2 focus:ring-[#C1A7A3]"
          />
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12 text-[#706C6B] dark:text-[#C1A7A3]">
            Loading bundles...
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

        {/* Bundle Table */}
        {!loading && !error && (
          <>
            {paginatedBundles.length > 0 ? (
              <>
                <BundleTable 
                  bundles={paginatedBundles} 
                  onDelete={handleDeleteBundle}
                />
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={filteredBundles.length}
                  itemsPerPage={itemsPerPage}
                  onPageChange={setCurrentPage}
                />
              </>
            ) : (
              <EmptyState message="No bundles found. Create a bundle to get started." />
            )}
          </>
        )}

        {/* Create Bundle Modal */}
        <CreateBundleModal
          isOpen={createModalOpen}
          onClose={() => setCreateModalOpen(false)}
          onSave={handleSaveBundle}
          branches={branches}
          onError={(message) => showToast(message, "error")}
        />
      </div>
      
      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </SejenakDashboardLayout>
  );
}

