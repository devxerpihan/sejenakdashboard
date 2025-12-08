"use client";

import React, { useState, useEffect } from "react";
import { SejenakDashboardLayout } from "@/components/layout/SejenakDashboardLayout";
import { Footer } from "@/components/layout";
import { Breadcrumbs, PageHeader } from "@/components/services";
import { PlusIcon } from "@/components/icons";
import { navItems } from "@/config/navigation";
import { useSpecialOffers } from "@/hooks/useSpecialOffers";
import { SpecialOfferModal } from "@/components/loyalty/SpecialOfferModal";
import { SpecialOffer, CreateSpecialOfferInput } from "@/types/specialOffer";
import { ToastContainer } from "@/components/ui/Toast";
import Image from "next/image";

export default function SpecialForYouPage() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("darkMode");
      return saved === "true";
    }
    return false;
  });

  const [location, setLocation] = useState("Islamic Village");
  const [dateRange, setDateRange] = useState({
    start: new Date(),
    end: new Date(),
  });

  const locations = ["Islamic Village", "Location 2", "Location 3"];

  const {
    specialOffers,
    loading,
    error,
    createSpecialOffer,
    updateSpecialOffer,
    deleteSpecialOffer,
    refetch,
  } = useSpecialOffers();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<SpecialOffer | null>(null);
  const [toasts, setToasts] = useState<Array<{ id: string; message: string; type?: "success" | "error" | "warning" | "info" }>>([]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("darkMode", "true");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("darkMode", "false");
    }
  }, [isDarkMode]);

  const showToast = (message: string, type: "success" | "error" | "warning" | "info" = "info") => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const handleAddOffer = () => {
    setEditingOffer(null);
    setIsModalOpen(true);
  };

  const handleEditOffer = (offer: SpecialOffer) => {
    setEditingOffer(offer);
    setIsModalOpen(true);
  };

  const handleDeleteOffer = async (id: string) => {
    if (!confirm("Are you sure you want to delete this offer?")) return;

    try {
      await deleteSpecialOffer(id);
      showToast("Special offer deleted successfully", "success");
    } catch (err: any) {
      showToast(err.message || "Failed to delete offer", "error");
    }
  };

  const handleSaveOffer = async (offerData: CreateSpecialOfferInput & { id?: string }) => {
    try {
      if (offerData.id) {
        await updateSpecialOffer({
            id: offerData.id,
            title: offerData.title,
            description: offerData.description,
            image_url: offerData.image_url,
            is_active: offerData.is_active,
        });
        showToast("Special offer updated successfully", "success");
      } else {
        await createSpecialOffer(offerData);
        showToast("Special offer created successfully", "success");
      }
      setIsModalOpen(false);
      refetch();
    } catch (err: any) {
      throw err;
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
      onDateRangeChange={() => {}}
      isDarkMode={isDarkMode}
      onDarkModeToggle={() => setIsDarkMode(!isDarkMode)}
      customHeader={null}
      footer={<Footer />}
    >
      <div>
        <Breadcrumbs
          items={[
            { label: "Loyalty", href: "/loyalty" },
            { label: "Special For You" },
          ]}
        />

        <PageHeader
          title="Special For You"
          actionButtons={[
            {
              label: "New Offer",
              onClick: handleAddOffer,
              variant: "primary",
              icon: <PlusIcon />,
            },
          ]}
        />

        {loading && (
          <div className="text-center py-12 text-gray-500">Loading special offers...</div>
        )}

        {error && (
          <div className="text-center py-12 text-red-500">Error: {error}</div>
        )}

        {!loading && !error && specialOffers.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No special offers found. Create one to get started.
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {specialOffers.map((offer) => (
            <div
              key={offer.id}
              className="bg-white dark:bg-[#2A2A2A] rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="relative h-48 w-full bg-gray-100 dark:bg-gray-800">
                {offer.image_url ? (
                  <Image
                    src={offer.image_url}
                    alt={offer.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    No Image
                  </div>
                )}
                {!offer.is_active && (
                  <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                    Inactive
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {offer.title}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-4">
                  {offer.description}
                </p>
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => handleEditOffer(offer)}
                    className="px-3 py-1.5 text-sm text-[#C1A7A3] hover:bg-[#F9FAFB] dark:hover:bg-[#333333] rounded-md border border-[#E5E7EB] dark:border-[#404040]"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteOffer(offer.id)}
                    className="px-3 py-1.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md border border-red-200 dark:border-red-800"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <SpecialOfferModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          offer={editingOffer}
          onSave={handleSaveOffer}
        />

        <ToastContainer toasts={toasts} onRemove={removeToast} />
      </div>
    </SejenakDashboardLayout>
  );
}

