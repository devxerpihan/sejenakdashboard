"use client";

import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { ImageUpload } from "./ImageUpload";
import { useTreatments } from "@/hooks/useTreatments";
import { Treatment } from "@/types/treatment";
import { supabase } from "@/lib/supabase";

interface CreateBundleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (bundle: { 
    name: string; 
    branch: string; 
    image?: string;
    treatments: string[];
    pricing: number;
  }) => void;
  branches?: string[];
  onError?: (message: string) => void;
}

export const CreateBundleModal: React.FC<CreateBundleModalProps> = ({
  isOpen,
  onClose,
  onSave,
  branches = ["Sejenak Islamic Village"],
  onError,
}) => {
  const [bundleName, setBundleName] = useState("");
  const [selectedBranch, setSelectedBranch] = useState(branches[0] || "");
  const [imageUrl, setImageUrl] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [selectedTreatments, setSelectedTreatments] = useState<Set<string>>(new Set());
  const [bundlePricing, setBundlePricing] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [saving, setSaving] = useState(false);

  // Fetch treatments
  const { treatments, loading: treatmentsLoading } = useTreatments();

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setBundleName("");
      setSelectedBranch(branches[0] || "");
      setImageUrl("");
      setImageFile(null);
      setSelectedTreatments(new Set());
      setBundlePricing("");
      setSearchQuery("");
      setSaving(false);
    }
  }, [isOpen, branches]);

  const handleToggleTreatment = (treatmentId: string) => {
    setSelectedTreatments((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(treatmentId)) {
        newSet.delete(treatmentId);
      } else {
        newSet.add(treatmentId);
      }
      return newSet;
    });
  };

  const filteredTreatments = treatments.filter((treatment) =>
    treatment.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSave = async () => {
    if (!bundleName.trim()) {
      const errorMessage = "Please enter a bundle name";
      if (onError) {
        onError(errorMessage);
      } else {
        alert(errorMessage);
      }
      return;
    }

    if (!selectedBranch) {
      const errorMessage = "Please select a branch";
      if (onError) {
        onError(errorMessage);
      } else {
        alert(errorMessage);
      }
      return;
    }

    if (selectedTreatments.size === 0) {
      const errorMessage = "Please select at least one treatment";
      if (onError) {
        onError(errorMessage);
      } else {
        alert(errorMessage);
      }
      return;
    }

    if (!bundlePricing || parseFloat(bundlePricing.replace(/[^0-9]/g, "")) <= 0) {
      const errorMessage = "Please enter a valid bundle price";
      if (onError) {
        onError(errorMessage);
      } else {
        alert(errorMessage);
      }
      return;
    }

    const numericPrice = parseFloat(bundlePricing.replace(/[^0-9]/g, ""));

    setSaving(true);
    try {
      let finalImageUrl = imageUrl;

      // Upload image to Supabase storage if a new file is selected
      if (imageFile) {
        const fileExt = imageFile.name.split(".").pop();
        const fileName = `bundle-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `bundles/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("images")
          .upload(filePath, imageFile, {
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError) {
          throw new Error(`Failed to upload image: ${uploadError.message}`);
        }

        // Get public URL
        const { data: urlData } = supabase.storage
          .from("images")
          .getPublicUrl(filePath);

        finalImageUrl = urlData.publicUrl;
      }

      await onSave({
        name: bundleName.trim(),
        branch: selectedBranch,
        image: finalImageUrl,
        treatments: Array.from(selectedTreatments),
        pricing: numericPrice,
      });
      onClose();
    } catch (err: any) {
      console.error("Error creating bundle:", err);
      const errorMessage = err.message || "Failed to create bundle";
      if (onError) {
        onError(errorMessage);
      } else {
        alert(errorMessage);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !saving) {
      handleSave();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/20 backdrop-blur-[2px]"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-2xl bg-white dark:bg-[#191919] rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-200 dark:border-zinc-800">
          <h2 className="text-xl font-bold text-[#191919] dark:text-[#F0EEED]">
            Create Bundle Package
          </h2>
          <button
            onClick={onClose}
            className="text-[#706C6B] dark:text-[#C1A7A3] hover:text-[#191919] dark:hover:text-[#F0EEED] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Bundle Information */}
          <div>
            <h3 className="text-lg font-semibold text-[#191919] dark:text-[#F0EEED] mb-4">
              Bundle Information
            </h3>

            {/* Image Upload */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-[#191919] dark:text-[#F0EEED] mb-2">
                Image
              </label>
              <ImageUpload
                imageUrl={imageUrl}
                onImageChange={(file) => {
                  setImageFile(file);
                  if (file) {
                    // Create preview URL
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      setImageUrl(reader.result as string);
                    };
                    reader.readAsDataURL(file);
                  } else {
                    setImageUrl("");
                  }
                }}
              />
            </div>

            {/* Name, Branch, and Pricing */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#191919] dark:text-[#F0EEED] mb-2">
                  Name
                </label>
                <input
                  type="text"
                  placeholder="Bundle name"
                  value={bundleName}
                  onChange={(e) => setBundleName(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="w-full px-4 py-3 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-[#191919] text-[#191919] dark:text-[#F0EEED] placeholder-[#706C6B] focus:outline-none focus:ring-2 focus:ring-[#C1A7A3]"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#191919] dark:text-[#F0EEED] mb-2">
                  Branch
                </label>
                <select
                  value={selectedBranch}
                  onChange={(e) => setSelectedBranch(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-[#191919] text-[#191919] dark:text-[#F0EEED] focus:outline-none focus:ring-2 focus:ring-[#C1A7A3] appearance-none cursor-pointer"
                >
                  {branches.map((branch) => (
                    <option key={branch} value={branch}>
                      {branch}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#191919] dark:text-[#F0EEED] mb-2">
                  Pricing
                </label>
                <input
                  type="text"
                  placeholder="Rp 0"
                  value={bundlePricing}
                  onChange={(e) => {
                    const value = e.target.value;
                    // Allow numbers and formatting
                    const numValue = value.replace(/[^0-9]/g, "");
                    if (numValue === "") {
                      setBundlePricing("");
                    } else {
                      const formatted = `Rp ${parseInt(numValue, 10).toLocaleString("id-ID")}`;
                      setBundlePricing(formatted);
                    }
                  }}
                  onBlur={(e) => {
                    const numValue = e.target.value.replace(/[^0-9]/g, "");
                    if (!numValue) {
                      setBundlePricing("");
                    }
                  }}
                  className="w-full px-4 py-3 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-[#191919] text-[#191919] dark:text-[#F0EEED] placeholder-[#706C6B] focus:outline-none focus:ring-2 focus:ring-[#C1A7A3]"
                />
              </div>
            </div>
          </div>

          {/* Treatment Selection */}
          <div>
            <h3 className="text-lg font-semibold text-[#191919] dark:text-[#F0EEED] mb-4">
              Select Treatments
            </h3>

            {/* Search */}
            <div className="mb-4">
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#706C6B] dark:text-[#C1A7A3]">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search treatments..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-[#191919] text-[#191919] dark:text-[#F0EEED] placeholder-[#706C6B] focus:outline-none focus:ring-2 focus:ring-[#C1A7A3]"
                />
              </div>
            </div>

            {/* Treatment List */}
            <div className="border border-zinc-200 dark:border-zinc-800 rounded-lg max-h-64 overflow-y-auto">
              {treatmentsLoading ? (
                <div className="p-4 text-center text-[#706C6B] dark:text-[#C1A7A3]">
                  Loading treatments...
                </div>
              ) : filteredTreatments.length === 0 ? (
                <div className="p-4 text-center text-[#706C6B] dark:text-[#C1A7A3]">
                  No treatments found
                </div>
              ) : (
                <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {filteredTreatments.map((treatment) => (
                    <div
                      key={treatment.id}
                      className="flex items-center gap-3 p-3 hover:bg-[#F0EEED] dark:hover:bg-[#3D3B3A] transition-colors cursor-pointer"
                      onClick={() => handleToggleTreatment(treatment.id)}
                    >
                      {/* Treatment Image */}
                      {treatment.image ? (
                        <img
                          src={treatment.image}
                          alt={treatment.name}
                          className="w-12 h-12 rounded object-cover flex-shrink-0"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const placeholder = target.nextElementSibling as HTMLDivElement;
                            if (placeholder) placeholder.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div 
                        className={`w-12 h-12 bg-zinc-200 dark:bg-zinc-700 rounded flex-shrink-0 ${treatment.image ? 'hidden' : 'flex'}`}
                      />
                      
                      {/* Treatment Info */}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-[#191919] dark:text-[#F0EEED]">
                          {treatment.name}
                        </div>
                        <div className="text-xs text-[#706C6B] dark:text-[#C1A7A3]">
                          {typeof treatment.price === "number" 
                            ? `Rp ${treatment.price.toLocaleString("id-ID")}`
                            : treatment.price}
                        </div>
                      </div>

                      {/* Checkbox */}
                      <input
                        type="checkbox"
                        checked={selectedTreatments.has(treatment.id)}
                        onChange={() => handleToggleTreatment(treatment.id)}
                        onClick={(e) => e.stopPropagation()}
                        className="w-5 h-5 rounded border-zinc-300 dark:border-zinc-700 text-[#C1A7A3] focus:ring-[#C1A7A3] focus:ring-2"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Selected Treatments Summary */}
            {selectedTreatments.size > 0 && (
              <div className="mt-4 p-4 bg-[#F0EEED] dark:bg-[#3D3B3A] rounded-lg">
                <div className="text-sm font-medium text-[#191919] dark:text-[#F0EEED]">
                  {selectedTreatments.size} treatment{selectedTreatments.size > 1 ? "s" : ""} selected
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-zinc-200 dark:border-zinc-800">
          <button
            onClick={onClose}
            disabled={saving}
            className="px-6 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg text-sm font-medium text-[#191919] dark:text-[#F0EEED] hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !bundleName.trim() || !selectedBranch || selectedTreatments.size === 0 || !bundlePricing || parseFloat(bundlePricing.replace(/[^0-9]/g, "")) <= 0}
            className="px-6 py-2 bg-[#C1A7A3] text-white rounded-lg hover:bg-[#A88F8B] transition-colors disabled:opacity-50 text-sm font-medium"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

