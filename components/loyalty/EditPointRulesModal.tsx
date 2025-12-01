"use client";

import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { PointRule } from "@/types/pointRule";
import { Dropdown } from "@/components/ui/Dropdown";
import { useTreatmentCategories } from "@/hooks/useTreatmentCategories";
import { useTreatments } from "@/hooks/useTreatments";

interface EditPointRulesModalProps {
  isOpen: boolean;
  onClose: () => void;
  rule: PointRule | null; // null for create mode
  onSave: (rule: PointRule) => void;
}

export const EditPointRulesModal: React.FC<EditPointRulesModalProps> = ({
  isOpen,
  onClose,
  rule,
  onSave,
}) => {
  const isEditMode = rule !== null;
  const { categories } = useTreatmentCategories();
  const { treatments } = useTreatments();

  const [formData, setFormData] = useState({
    spendAmount: rule?.spendAmount.toString() || "",
    pointEarned: rule?.pointEarned.toString() || "",
    expiry: rule?.expiry.toString() || "12",
    status: rule?.status || "Active",
    welcomePoint: rule?.welcomePoint?.toString() || "",
    ruleType: rule?.ruleType || "general",
    category: rule?.category || "",
    days: rule?.days || [],
    treatments: rule?.treatments || [],
  });

  useEffect(() => {
    if (isOpen) {
      if (rule) {
        setFormData({
          spendAmount: rule.spendAmount.toString(),
          pointEarned: rule.pointEarned.toString(),
          expiry: rule.expiry.toString(),
          status: rule.status,
          welcomePoint: rule.welcomePoint?.toString() || "",
          ruleType: rule.ruleType || "general",
          category: rule.category || "",
          days: rule.days || [],
          treatments: rule.treatments || [],
        });
      } else {
        // Reset for create mode
        setFormData({
          spendAmount: "",
          pointEarned: "",
          expiry: "12",
          status: "Active",
          welcomePoint: "",
          ruleType: "general",
          category: "",
          days: [],
          treatments: [],
        });
      }
    }
  }, [isOpen, rule]);

  const handleChange = (field: string, value: string | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleDayToggle = (day: string) => {
    setFormData((prev) => {
      const currentDays = Array.isArray(prev.days) ? prev.days : [];
      if (currentDays.includes(day)) {
        return { ...prev, days: currentDays.filter((d) => d !== day) };
      } else {
        return { ...prev, days: [...currentDays, day] };
      }
    });
  };

  const handleTreatmentToggle = (treatmentId: string) => {
    setFormData((prev) => {
      const currentTreatments = Array.isArray(prev.treatments) ? prev.treatments : [];
      if (currentTreatments.includes(treatmentId)) {
        return { ...prev, treatments: currentTreatments.filter((t) => t !== treatmentId) };
      } else {
        return { ...prev, treatments: [...currentTreatments, treatmentId] };
      }
    });
  };

  const handleSave = () => {
    if (!formData.spendAmount || !formData.pointEarned) {
      alert("Please fill in Spend Amount and Point Earned");
      return;
    }

    const updatedRule: PointRule = {
      id: rule?.id || `rule-${Date.now()}`,
      spendAmount: parseInt(formData.spendAmount.replace(/\./g, "")) || 0,
      pointEarned: parseInt(formData.pointEarned) || 0,
      expiry: parseInt(formData.expiry) || 12,
      status: formData.status as "Active" | "Inactive",
      welcomePoint: formData.welcomePoint ? parseInt(formData.welcomePoint) : undefined,
      ruleType: formData.ruleType as "general" | "category" | "treatment" | "day",
      category: formData.category || undefined,
      days: formData.days.length > 0 ? formData.days : undefined,
      treatments: formData.treatments.length > 0 ? formData.treatments : undefined,
      createdAt: rule?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSave(updatedRule);
    onClose();
  };

  const expiryOptions = [
    { value: "1", label: "1 month" },
    { value: "3", label: "3 months" },
    { value: "6", label: "6 months" },
    { value: "12", label: "12 months" },
    { value: "24", label: "24 months" },
  ];

  const statusOptions = [
    { value: "Active", label: "Active" },
    { value: "Inactive", label: "Inactive" },
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
      <div className="relative bg-white dark:bg-[#191919] rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
          <h2 className="text-xl font-semibold text-[#191919] dark:text-[#F0EEED]">
            {isEditMode ? "Edit Point Rules" : "Add Point Rules"}
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
          <div className="grid grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              {/* Spend Amount (Rp) */}
              <div>
                <label className="block text-sm font-medium text-[#706C6B] dark:text-[#C1A7A3] mb-2">
                  Spend Amount (Rp)
                </label>
                <input
                  type="text"
                  value={formData.spendAmount}
                  onChange={(e) => {
                    // Allow only numbers and dots
                    const value = e.target.value.replace(/[^\d.]/g, "");
                    // Format with dots as thousand separators
                    const numValue = value.replace(/\./g, "");
                    if (numValue === "" || !isNaN(Number(numValue))) {
                      const formatted = numValue
                        ? parseInt(numValue).toLocaleString("id-ID")
                        : "";
                      handleChange("spendAmount", formatted);
                    }
                  }}
                  placeholder="100000"
                  className="w-full px-3 py-2 bg-white dark:bg-[#191919] border border-zinc-300 dark:border-zinc-700 rounded-md text-[#191919] dark:text-[#F0EEED] focus:outline-none focus:ring-2 focus:ring-[#C1A7A3] dark:focus:ring-[#706C6B]"
                />
              </div>

              {/* Point Earned */}
              <div>
                <label className="block text-sm font-medium text-[#706C6B] dark:text-[#C1A7A3] mb-2">
                  Point Earned
                </label>
                <input
                  type="number"
                  value={formData.pointEarned}
                  onChange={(e) => handleChange("pointEarned", e.target.value)}
                  min="0"
                  placeholder="10"
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

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-[#706C6B] dark:text-[#C1A7A3] mb-2">
                  Status
                </label>
                <Dropdown
                  options={statusOptions}
                  value={formData.status}
                  onChange={(value) => handleChange("status", value)}
                  placeholder="Select status"
                />
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              {/* Welcome Point (for new member) */}
              <div>
                <label className="block text-sm font-medium text-[#706C6B] dark:text-[#C1A7A3] mb-2">
                  Welcome Point (for new member)
                </label>
                <input
                  type="number"
                  value={formData.welcomePoint}
                  onChange={(e) => handleChange("welcomePoint", e.target.value)}
                  min="0"
                  placeholder="10"
                  className="w-full px-3 py-2 bg-white dark:bg-[#191919] border border-zinc-300 dark:border-zinc-700 rounded-md text-[#191919] dark:text-[#F0EEED] focus:outline-none focus:ring-2 focus:ring-[#C1A7A3] dark:focus:ring-[#706C6B]"
                />
                <p className="mt-1 text-xs text-[#706C6B] dark:text-[#C1A7A3]">
                  Optional: Points given to new members when they first join
                </p>
              </div>

              {/* Rule Type */}
              <div>
                <label className="block text-sm font-medium text-[#706C6B] dark:text-[#C1A7A3] mb-2">
                  Rule Type
                </label>
                <Dropdown
                  options={[
                    { value: "general", label: "General (All transactions)" },
                    { value: "category", label: "Category Specific" },
                    { value: "treatment", label: "Treatment Specific" },
                    { value: "day", label: "Day Specific" },
                  ]}
                  value={formData.ruleType}
                  onChange={(value) => handleChange("ruleType", value)}
                  placeholder="Select rule type"
                />
              </div>

              {/* Category Selection (if rule type is category) */}
              {formData.ruleType === "category" && (
                <div>
                  <label className="block text-sm font-medium text-[#706C6B] dark:text-[#C1A7A3] mb-2">
                    Treatment Category
                  </label>
                  <Dropdown
                    options={[
                      { value: "", label: "Select category" },
                      ...categories.map((cat) => ({
                        value: cat,
                        label: cat,
                      })),
                    ]}
                    value={formData.category}
                    onChange={(value) => handleChange("category", value)}
                    placeholder="Select category"
                  />
                </div>
              )}

              {/* Day Selection (if rule type is day) */}
              {formData.ruleType === "day" && (
                <div>
                  <label className="block text-sm font-medium text-[#706C6B] dark:text-[#C1A7A3] mb-2">
                    Days of Week
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map(
                      (day) => (
                        <button
                          key={day}
                          type="button"
                          onClick={() => handleDayToggle(day)}
                        className={`px-3 py-1.5 text-sm rounded-md border transition-colors ${
                          (formData.days || []).includes(day)
                            ? "bg-[#C1A7A3] dark:bg-[#706C6B] text-white border-[#C1A7A3] dark:border-[#706C6B]"
                            : "bg-white dark:bg-[#191919] text-[#706C6B] dark:text-[#C1A7A3] border-zinc-300 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-[#3D3B3A]"
                        }`}
                        >
                          {day}
                        </button>
                      )
                    )}
                  </div>
                {(formData.days || []).length > 0 && (
                  <p className="mt-2 text-xs text-[#706C6B] dark:text-[#C1A7A3]">
                    Selected: {(formData.days || []).join(", ")}
                  </p>
                )}
                </div>
              )}
            </div>
          </div>

          {/* Treatment Selection (if rule type is treatment) - Full Width */}
          {formData.ruleType === "treatment" && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-[#706C6B] dark:text-[#C1A7A3] mb-2">
                Select Treatments
              </label>
              <div className="max-h-48 overflow-y-auto border border-zinc-300 dark:border-zinc-700 rounded-md p-2 space-y-2">
                {treatments.length === 0 ? (
                  <p className="text-sm text-[#706C6B] dark:text-[#C1A7A3] text-center py-4">
                    No treatments available
                  </p>
                ) : (
                  treatments.map((treatment) => (
                    <label
                      key={treatment.id}
                      className="flex items-center gap-2 p-2 hover:bg-zinc-50 dark:hover:bg-[#3D3B3A] rounded cursor-pointer"
                    >
                        <input
                          type="checkbox"
                          checked={(formData.treatments || []).includes(treatment.id)}
                          onChange={() => handleTreatmentToggle(treatment.id)}
                          className="w-4 h-4 text-[#C1A7A3] dark:text-[#706C6B] border-zinc-300 dark:border-zinc-700 rounded focus:ring-[#C1A7A3] dark:focus:ring-[#706C6B]"
                        />
                      <span className="text-sm text-[#191919] dark:text-[#F0EEED]">
                        {treatment.name} {treatment.category && `(${treatment.category})`}
                      </span>
                    </label>
                  ))
                )}
              </div>
                {(formData.treatments || []).length > 0 && (
                  <p className="mt-2 text-xs text-[#706C6B] dark:text-[#C1A7A3]">
                    {(formData.treatments || []).length} treatment{(formData.treatments || []).length !== 1 ? "s" : ""} selected
                  </p>
                )}
            </div>
          )}
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
            className="px-4 py-2 text-sm font-medium text-white bg-[#C1A7A3] dark:bg-[#706C6B] rounded-md hover:bg-[#A8928F] dark:hover:bg-[#5A4F4D] transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

