"use client";

import React, { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";
import { Reward } from "@/types/reward";
import { Dropdown } from "@/components/ui/Dropdown";
import { ImageUpload } from "@/components/services";
import { DropdownWithCRUD } from "./DropdownWithCRUD";
import { supabase } from "@/lib/supabase";

interface EditRewardModalProps {
  isOpen: boolean;
  onClose: () => void;
  reward: Reward | null; // null for create mode
  onSave: (reward: Reward) => void;
}

export const EditRewardModal: React.FC<EditRewardModalProps> = ({
  isOpen,
  onClose,
  reward,
  onSave,
}) => {
  const isEditMode = reward !== null;
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(reward?.image || null);
  const [saving, setSaving] = useState(false);

  // Default options for categories and claim types
  const [categoryOptions, setCategoryOptions] = useState<Array<{ value: string; label: string }>>([
    { value: "Service", label: "Service" },
    { value: "Discount", label: "Discount" },
    { value: "Product", label: "Product" },
    { value: "Voucher", label: "Voucher" },
  ]);

  const [claimTypeOptions, setClaimTypeOptions] = useState<Array<{ value: string; label: string }>>([
    { value: "Auto", label: "Auto" },
    { value: "12 month", label: "12 month" },
    { value: "6 month", label: "6 month" },
    { value: "3 month", label: "3 month" },
    { value: "1 month", label: "1 month" },
  ]);

  const [formData, setFormData] = useState({
    reward: reward?.reward || "",
    method: reward?.method || "Point",
    required: reward?.totalPoints?.toString() || reward?.required?.toString() || "0",
    claimType: reward?.claimType || "Auto",
    autoReward: reward?.autoReward || "",
    minPoint: reward?.minPoint?.toString() || "0",
    expiry: reward?.expiry?.toString() || "12",
    multiplier: reward?.multiplier || "1x",
    image: reward?.image || "",
    category: reward?.category || "",
    quota: reward?.quota?.toString() || "",
    status: reward?.status || "Active",
  });

  useEffect(() => {
    if (isOpen) {
      if (reward) {
        // Add reward's category to options if it doesn't exist
        if (reward.category && !categoryOptions.find((opt) => opt.value === reward.category)) {
          setCategoryOptions((prev) => [...prev, { value: reward.category!, label: reward.category! }]);
        }
        // Add reward's claim type to options if it doesn't exist
        if (reward.claimType && !claimTypeOptions.find((opt) => opt.value === reward.claimType)) {
          setClaimTypeOptions((prev) => [...prev, { value: reward.claimType!, label: reward.claimType! }]);
        }

        setFormData({
          reward: reward.reward || "",
          method: reward.method || "Point",
          required: reward.totalPoints?.toString() || reward.required?.toString() || "0",
          claimType: reward.claimType || "Auto",
          autoReward: reward.autoReward || "",
          minPoint: reward.minPoint?.toString() || "0",
          expiry: reward.expiry?.toString() || "12",
          multiplier: reward.multiplier || "1x",
          image: reward.image || "",
          category: reward.category || "",
          quota: reward.quota?.toString() || "",
          status: reward.status || "Active",
        });
        setImagePreview(reward.image || null);
        setImageFile(null);
      } else {
        // Reset for create mode
        setFormData({
          reward: "",
          method: "Point",
          required: "0",
          claimType: "Auto",
          autoReward: "",
          minPoint: "0",
          expiry: "12",
          multiplier: "1x",
          image: "",
          category: "",
          quota: "",
          status: "Active",
        });
        setImagePreview(null);
        setImageFile(null);
      }
    }
  }, [isOpen, reward]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageChange = (file: File | null) => {
    setImageFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
      setFormData((prev) => ({ ...prev, image: "" }));
    }
  };

  const handleAddCategory = (newCategory: string) => {
    if (!categoryOptions.find((opt) => opt.value.toLowerCase() === newCategory.toLowerCase())) {
      setCategoryOptions((prev) => [...prev, { value: newCategory, label: newCategory }]);
    }
  };

  const handleRemoveCategory = (categoryValue: string) => {
    setCategoryOptions((prev) => prev.filter((opt) => opt.value !== categoryValue));
  };

  const handleAddClaimType = (newClaimType: string) => {
    if (!claimTypeOptions.find((opt) => opt.value.toLowerCase() === newClaimType.toLowerCase())) {
      setClaimTypeOptions((prev) => [...prev, { value: newClaimType, label: newClaimType }]);
    }
  };

  const handleRemoveClaimType = (claimTypeValue: string) => {
    setClaimTypeOptions((prev) => prev.filter((opt) => opt.value !== claimTypeValue));
  };

  const handleSave = async () => {
    if (!formData.reward) {
      alert("Please fill in Reward name");
      return;
    }

    if (saving) return; // Prevent multiple saves

    setSaving(true);

    try {
      let finalImageUrl = formData.image;

      // Upload image to Supabase storage if a new file is selected
      if (imageFile) {
        try {
          const fileExt = imageFile.name.split(".").pop();
          const fileName = `reward-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
          const filePath = `rewards/${fileName}`;

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
        } catch (err: any) {
          setSaving(false);
          alert(`Failed to upload image: ${err.message}`);
          return;
        }
      }

      // For updates, we MUST use the original reward ID from the database
      // For creates, we don't need an ID (database will generate one)
      const updatedReward: Reward = {
        id: reward?.id || "", // Use original ID for updates, empty string for creates (will be ignored)
        reward: formData.reward,
        method: formData.method as "Point" | "Stamp",
        required: parseInt(formData.required) || 0,
        claimType: formData.claimType,
        autoReward: formData.autoReward || undefined,
        minPoint: formData.minPoint ? parseInt(formData.minPoint) : undefined,
        expiry: formData.expiry ? parseInt(formData.expiry) : undefined,
        multiplier: formData.multiplier || undefined,
        image: finalImageUrl || undefined,
        category: formData.category || undefined,
        totalPoints: parseInt(formData.required) || 0,
        quota: formData.quota ? parseInt(formData.quota) : undefined,
        status: formData.status as "Active" | "Expired",
      };

      console.log("Saving reward:", updatedReward);
      console.log("Is edit mode:", isEditMode);
      console.log("Original reward:", reward);
      console.log("Reward ID:", updatedReward.id);
      console.log("Has valid ID for update:", reward?.id && reward.id.length > 0);

      // Call onSave and wait for it to complete
      await onSave(updatedReward);
      
      // Only close modal after successful save (onSave handles closing in the page component)
    } catch (err: any) {
      console.error("Error saving reward:", err);
      // Error is already handled by the page component's toast
      // Modal stays open so user can fix the issue
    } finally {
      setSaving(false);
    }
  };

  const methodOptions = [
    { value: "Point", label: "Point" },
    { value: "Stamp", label: "Stamp" },
  ];

  const multiplierOptions = [
    { value: "1x", label: "1x" },
    { value: "1.25x", label: "1.25x" },
    { value: "1.5x", label: "1.5x" },
    { value: "2x", label: "2x" },
  ];

  const expiryOptions = [
    { value: "1", label: "1 month" },
    { value: "3", label: "3 months" },
    { value: "6", label: "6 months" },
    { value: "12", label: "12 months" },
    { value: "24", label: "24 months" },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/20 backdrop-blur-[2px]"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white dark:bg-[#191919] rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
          <h2 className="text-xl font-semibold text-[#191919] dark:text-[#F0EEED]">
            {isEditMode ? "Edit Reward" : "Add Reward"}
          </h2>
          <button
            onClick={onClose}
            className="text-[#706C6B] dark:text-[#C1A7A3] hover:text-[#191919] dark:hover:text-[#F0EEED] transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="space-y-4">
            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-[#706C6B] dark:text-[#C1A7A3] mb-2">
                Reward Image
              </label>
              <ImageUpload
                imageUrl={imagePreview || undefined}
                onImageChange={handleImageChange}
              />
            </div>

            {/* Reward Name */}
            <div>
              <label className="block text-sm font-medium text-[#706C6B] dark:text-[#C1A7A3] mb-2">
                Reward Name
              </label>
              <input
                type="text"
                value={formData.reward}
                onChange={(e) => handleChange("reward", e.target.value)}
                placeholder="Free Facial"
                className="w-full px-3 py-2 bg-white dark:bg-[#191919] border border-zinc-300 dark:border-zinc-700 rounded-md text-[#191919] dark:text-[#F0EEED] focus:outline-none focus:ring-2 focus:ring-[#C1A7A3] dark:focus:ring-[#706C6B]"
              />
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-2 gap-4">
              {/* Min. Point */}
              <div>
                <label className="block text-sm font-medium text-[#706C6B] dark:text-[#C1A7A3] mb-2">
                  Min. Point
                </label>
                <input
                  type="number"
                  value={formData.minPoint}
                  onChange={(e) => handleChange("minPoint", e.target.value)}
                  min="0"
                  placeholder="0"
                  className="w-full px-3 py-2 bg-white dark:bg-[#191919] border border-zinc-300 dark:border-zinc-700 rounded-md text-[#191919] dark:text-[#F0EEED] focus:outline-none focus:ring-2 focus:ring-[#C1A7A3] dark:focus:ring-[#706C6B]"
                />
              </div>

              {/* Expiry (month) */}
              <div>
                <label className="block text-sm font-medium text-[#706C6B] dark:text-[#C1A7A3] mb-2">
                  Expiry (month)
                </label>
                <Dropdown
                  options={expiryOptions}
                  value={formData.expiry}
                  onChange={(value) => handleChange("expiry", value)}
                  placeholder="Select expiry"
                />
              </div>

              {/* Multiplier */}
              <div>
                <label className="block text-sm font-medium text-[#706C6B] dark:text-[#C1A7A3] mb-2">
                  Multiplier
                </label>
                <Dropdown
                  options={multiplierOptions}
                  value={formData.multiplier}
                  onChange={(value) => handleChange("multiplier", value)}
                  placeholder="Select multiplier"
                />
              </div>

              {/* Auto Reward */}
              <div>
                <label className="block text-sm font-medium text-[#706C6B] dark:text-[#C1A7A3] mb-2">
                  Auto Reward
                </label>
                <input
                  type="text"
                  value={formData.autoReward}
                  onChange={(e) => handleChange("autoReward", e.target.value)}
                  placeholder="Welcome voucher"
                  className="w-full px-3 py-2 bg-white dark:bg-[#191919] border border-zinc-300 dark:border-zinc-700 rounded-md text-[#191919] dark:text-[#F0EEED] focus:outline-none focus:ring-2 focus:ring-[#C1A7A3] dark:focus:ring-[#706C6B]"
                />
              </div>
            </div>

            {/* Method */}
            <div>
              <label className="block text-sm font-medium text-[#706C6B] dark:text-[#C1A7A3] mb-2">
                Method
              </label>
              <Dropdown
                options={methodOptions}
                value={formData.method}
                onChange={(value) => handleChange("method", value)}
                placeholder="Select method"
              />
            </div>

            {/* Required */}
            <div>
              <label className="block text-sm font-medium text-[#706C6B] dark:text-[#C1A7A3] mb-2">
                Required ({formData.method === "Point" ? "points" : "stamps"})
              </label>
              <input
                type="number"
                value={formData.required}
                onChange={(e) => handleChange("required", e.target.value)}
                min="0"
                placeholder="0"
                className="w-full px-3 py-2 bg-white dark:bg-[#191919] border border-zinc-300 dark:border-zinc-700 rounded-md text-[#191919] dark:text-[#F0EEED] focus:outline-none focus:ring-2 focus:ring-[#C1A7A3] dark:focus:ring-[#706C6B]"
              />
            </div>

            {/* Claim Type */}
            <DropdownWithCRUD
              label="Claim Type"
              options={claimTypeOptions}
              value={formData.claimType}
              onChange={(value) => handleChange("claimType", value)}
              onAddOption={handleAddClaimType}
              onRemoveOption={handleRemoveClaimType}
              placeholder="Select claim type"
              allowRemove={true}
            />

            {/* Category */}
            <DropdownWithCRUD
              label="Category"
              options={categoryOptions}
              value={formData.category}
              onChange={(value) => handleChange("category", value)}
              onAddOption={handleAddCategory}
              onRemoveOption={handleRemoveCategory}
              placeholder="Select category"
              allowRemove={true}
            />

            {/* Quota */}
            <div>
              <label className="block text-sm font-medium text-[#706C6B] dark:text-[#C1A7A3] mb-2">
                Quota
              </label>
              <input
                type="number"
                value={formData.quota}
                onChange={(e) => handleChange("quota", e.target.value)}
                min="0"
                placeholder="Leave empty for unlimited"
                className="w-full px-3 py-2 bg-white dark:bg-[#191919] border border-zinc-300 dark:border-zinc-700 rounded-md text-[#191919] dark:text-[#F0EEED] focus:outline-none focus:ring-2 focus:ring-[#C1A7A3] dark:focus:ring-[#706C6B]"
              />
              <p className="mt-1 text-xs text-[#706C6B] dark:text-[#C1A7A3]">
                Maximum number of redemptions allowed (leave empty for unlimited)
              </p>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-[#706C6B] dark:text-[#C1A7A3] mb-2">
                Status
              </label>
              <Dropdown
                options={[
                  { value: "Active", label: "Active" },
                  { value: "Expired", label: "Expired" },
                ]}
                value={formData.status}
                onChange={(value) => handleChange("status", value)}
                placeholder="Select status"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-zinc-200 dark:border-zinc-800">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-[#706C6B] dark:text-[#C1A7A3] bg-white dark:bg-[#191919] border border-zinc-300 dark:border-zinc-700 rounded-md hover:bg-zinc-50 dark:hover:bg-[#3D3B3A] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 text-sm font-medium text-white bg-[#C1A7A3] dark:bg-[#706C6B] rounded-md hover:bg-[#A8928F] dark:hover:bg-[#5A4F4D] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

