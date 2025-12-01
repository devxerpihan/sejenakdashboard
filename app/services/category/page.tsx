"use client";

import React, { useState, useEffect } from "react";
import { SejenakDashboardLayout } from "@/components/layout/SejenakDashboardLayout";
import { Footer } from "@/components/layout";
import {
  Breadcrumbs,
  PageHeader,
  CategoryTable,
  Pagination,
  AssignToTreatmentModal,
  CreateCategoryModal,
  EmptyState,
} from "@/components/services";
import { PlusIcon, SearchIcon } from "@/components/icons";
import { navItems } from "@/config/navigation";
import { Category } from "@/types/category";
import { useCategories } from "@/hooks/useCategories";
import { ToastContainer } from "@/components/ui/Toast";

export default function CategoryPage() {
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
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedCategoryName, setSelectedCategoryName] = useState("");

  // Fetch categories from database
  const { categories: allCategories, loading, error, refetch } = useCategories();

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

  // Filter categories
  const filteredCategories = allCategories.filter((category) => {
    const matchesSearch =
      searchQuery === "" ||
      category.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  // Pagination
  const itemsPerPage = 5;
  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedCategories = filteredCategories.slice(startIndex, endIndex);

  const locations = ["Islamic Village", "Location 2", "Location 3"];

  const handleAssignToTreatment = (categoryId: string) => {
    const category = allCategories.find((c) => c.id === categoryId);
    if (category) {
      setSelectedCategoryName(category.name);
      setAssignModalOpen(true);
    }
  };

  const handleCreateCategory = () => {
    setCreateModalOpen(true);
  };

  const handleSaveCategory = async (categoryName: string) => {
    // Categories are stored as text in treatments table
    // Creating a category just means it's available to be used
    // The category will be created when a treatment is assigned to it
    showToast(`Category "${categoryName}" is now available to use. Assign it to treatments to start using it.`, "success");
    // Refetch to update the list (though it won't show until treatments use it)
    await refetch();
  };

  const handleAssignSave = async () => {
    showToast("Category assigned to treatments successfully!", "success");
    await refetch();
  };

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

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
            { label: "Category" },
          ]}
        />

        {/* Page Header */}
        <PageHeader
          title="Category"
          actionButtons={[
            {
              label: "Create Category",
              onClick: handleCreateCategory,
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
            placeholder="Treatment"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-[#191919] text-[#191919] dark:text-[#F0EEED] placeholder-[#706C6B] focus:outline-none focus:ring-2 focus:ring-[#C1A7A3]"
          />
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12 text-[#706C6B] dark:text-[#C1A7A3]">
            Loading categories...
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

        {/* Category Table */}
        {!loading && !error && (
          <>
            {paginatedCategories.length > 0 ? (
              <>
                <CategoryTable
                  categories={paginatedCategories}
                  onAssignToTreatment={handleAssignToTreatment}
                />

                {/* Pagination */}
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={filteredCategories.length}
                  itemsPerPage={itemsPerPage}
                  onPageChange={setCurrentPage}
                />
              </>
            ) : (
              <EmptyState message="No categories found. Create a category to get started." />
            )}
          </>
        )}

        {/* Modals */}
        <AssignToTreatmentModal
          isOpen={assignModalOpen}
          onClose={() => setAssignModalOpen(false)}
          categoryName={selectedCategoryName}
          onSave={handleAssignSave}
          onError={(message) => showToast(message, "error")}
        />

        <CreateCategoryModal
          isOpen={createModalOpen}
          onClose={() => setCreateModalOpen(false)}
          onSave={handleSaveCategory}
          onError={(message) => showToast(message, "error")}
        />
      </div>
      
      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </SejenakDashboardLayout>
  );
}

