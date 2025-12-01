"use client";

import React, { useState, useEffect } from "react";
import { X } from "lucide-react";

interface CreateCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (categoryName: string) => void;
  onError?: (message: string) => void;
}

export const CreateCategoryModal: React.FC<CreateCategoryModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onError,
}) => {
  const [categoryName, setCategoryName] = useState("");
  const [saving, setSaving] = useState(false);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setCategoryName("");
      setSaving(false);
    }
  }, [isOpen]);

  const handleSave = async () => {
    if (!categoryName.trim()) {
      const errorMessage = "Please enter a category name";
      if (onError) {
        onError(errorMessage);
      } else {
        alert(errorMessage);
      }
      return;
    }

    setSaving(true);
    try {
      await onSave(categoryName.trim());
      onClose();
    } catch (err: any) {
      console.error("Error creating category:", err);
      const errorMessage = err.message || "Failed to create category";
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
      <div className="relative w-full max-w-md bg-white dark:bg-[#191919] rounded-lg shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-200 dark:border-zinc-800">
          <h2 className="text-xl font-bold text-[#191919] dark:text-[#F0EEED]">
            Create Category
          </h2>
          <button
            onClick={onClose}
            className="text-[#706C6B] dark:text-[#C1A7A3] hover:text-[#191919] dark:hover:text-[#F0EEED] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <label className="block text-sm font-medium text-[#191919] dark:text-[#F0EEED] mb-2">
            Name
          </label>
          <input
            type="text"
            placeholder="Category name"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            onKeyPress={handleKeyPress}
            className="w-full px-4 py-3 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-[#191919] text-[#191919] dark:text-[#F0EEED] placeholder-[#706C6B] focus:outline-none focus:ring-2 focus:ring-[#C1A7A3]"
            autoFocus
          />
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
            disabled={saving || !categoryName.trim()}
            className="px-6 py-2 bg-[#C1A7A3] text-white rounded-lg hover:bg-[#A88F8B] transition-colors disabled:opacity-50 text-sm font-medium"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

