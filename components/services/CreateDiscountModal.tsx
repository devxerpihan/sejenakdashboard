"use client";

import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Discount } from "@/types/discount";
import { EligibilitySelector, EligibilityData } from "./EligibilitySelector";

interface CreateDiscountModalProps {
  isOpen: boolean;
  onClose: () => void;
  discount?: Discount; // If provided, it's edit mode
  onSave: (discount: {
    name: string;
    type: "nominal" | "percentage";
    value: number;
    eligibility?: EligibilityData;
    validFrom: Date;
    validUntil: Date;
  }) => void;
  onError?: (message: string) => void;
}

export const CreateDiscountModal: React.FC<CreateDiscountModalProps> = ({
  isOpen,
  onClose,
  discount,
  onSave,
  onError,
}) => {
  const isEditMode = !!discount;
  const [name, setName] = useState("");
  const [type, setType] = useState<"nominal" | "percentage">("percentage");
  const [value, setValue] = useState<string>("");
  const [eligibility, setEligibility] = useState<EligibilityData>({ type: "all" });
  const [validFrom, setValidFrom] = useState<string>("");
  const [validUntil, setValidUntil] = useState<string>("");
  const [saving, setSaving] = useState(false);

  // Parse discount data if in edit mode
  useEffect(() => {
    if (isOpen) {
      if (discount) {
        // Edit mode - populate with existing data
        setName(discount.name);
        
        // Parse type from amount string
        const isPercentage = discount.amount.includes("%");
        setType(isPercentage ? "percentage" : "nominal");
        
        // Extract numeric value
        const numValue = discount.amount.replace(/[^0-9]/g, "");
        setValue(numValue);
        
        // Parse eligibility - try to parse as JSON first, otherwise treat as "All Services"
        let parsedEligibility: EligibilityData = { type: "all" };
        try {
          if (discount.eligibility && discount.eligibility !== "All Services") {
            const parsed = JSON.parse(discount.eligibility);
            parsedEligibility = parsed;
          } else {
            parsedEligibility = { type: "all" };
          }
        } catch {
          // If parsing fails, check if it's a simple string like "2 Categories" or "3 Treatments"
          if (discount.eligibility?.includes("Categories")) {
            parsedEligibility = { type: "categories", categoryIds: [] };
          } else if (discount.eligibility?.includes("Treatments")) {
            parsedEligibility = { type: "treatments", treatmentIds: [] };
          } else {
            parsedEligibility = { type: "all" };
          }
        }
        setEligibility(parsedEligibility);
        
        // Parse dates from DD/MM/YY format
        const parseDate = (dateStr: string) => {
          try {
            const [day, month, year] = dateStr.split("/");
            const fullYear = parseInt(year) < 100 ? 2000 + parseInt(year) : parseInt(year);
            return `${fullYear}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
          } catch (err) {
            // Fallback to current date if parsing fails
            return new Date().toISOString().split("T")[0];
          }
        };
        
        setValidFrom(parseDate(discount.validPeriod.start));
        setValidUntil(parseDate(discount.validPeriod.end));
      } else {
        // Create mode - reset form
        setName("");
        setType("percentage");
        setValue("");
        setEligibility({ type: "all" });
        const today = new Date().toISOString().split("T")[0];
        const nextMonth = new Date();
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        setValidFrom(today);
        setValidUntil(nextMonth.toISOString().split("T")[0]);
      }
      setSaving(false);
    }
  }, [isOpen, discount]);

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    const numValue = inputValue.replace(/[^0-9]/g, "");
    setValue(numValue);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      const errorMessage = "Please enter a discount name";
      if (onError) {
        onError(errorMessage);
      } else {
        alert(errorMessage);
      }
      return;
    }

    if (!value || parseFloat(value) <= 0) {
      const errorMessage = "Please enter a valid value";
      if (onError) {
        onError(errorMessage);
      } else {
        alert(errorMessage);
      }
      return;
    }

    if (!validFrom || !validUntil) {
      const errorMessage = "Please select valid period dates";
      if (onError) {
        onError(errorMessage);
      } else {
        alert(errorMessage);
      }
      return;
    }

    const fromDate = new Date(validFrom);
    const untilDate = new Date(validUntil);

    if (untilDate <= fromDate) {
      const errorMessage = "End date must be after start date";
      if (onError) {
        onError(errorMessage);
      } else {
        alert(errorMessage);
      }
      return;
    }

    setSaving(true);
    try {
      await onSave({
        name: name.trim(),
        type,
        value: parseFloat(value),
        eligibility: eligibility.type === "all" ? undefined : eligibility,
        validFrom: fromDate,
        validUntil: untilDate,
      });
      onClose();
    } catch (err: any) {
      console.error("Error saving discount:", err);
      const errorMessage = err.message || "Failed to save discount";
      if (onError) {
        onError(errorMessage);
      } else {
        alert(errorMessage);
      }
    } finally {
      setSaving(false);
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
            {isEditMode ? "Edit Discount" : "Create Discount"}
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
          {/* Details Discount */}
          <div>
            <h3 className="text-lg font-semibold text-[#191919] dark:text-[#F0EEED] mb-4">
              Details Discount
            </h3>

            <div className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-[#191919] dark:text-[#F0EEED] mb-2">
                  Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Soft Opening"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-[#191919] text-[#191919] dark:text-[#F0EEED] placeholder-[#706C6B] focus:outline-none focus:ring-2 focus:ring-[#C1A7A3]"
                  autoFocus
                />
              </div>

              {/* Type */}
              <div>
                <label className="block text-sm font-medium text-[#191919] dark:text-[#F0EEED] mb-2">
                  Type
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as "nominal" | "percentage")}
                  className="w-full px-4 py-3 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-[#191919] text-[#191919] dark:text-[#F0EEED] focus:outline-none focus:ring-2 focus:ring-[#C1A7A3] appearance-none cursor-pointer"
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="nominal">Nominal (Rp)</option>
                </select>
              </div>

              {/* Value */}
              <div>
                <label className="block text-sm font-medium text-[#191919] dark:text-[#F0EEED] mb-2">
                  Value {type === "nominal" ? "(Rp)" : "(%)"}
                </label>
                <input
                  type="text"
                  placeholder={type === "nominal" ? "e.g. 200000" : "e.g. 20"}
                  value={value}
                  onChange={handleValueChange}
                  className="w-full px-4 py-3 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-[#191919] text-[#191919] dark:text-[#F0EEED] placeholder-[#706C6B] focus:outline-none focus:ring-2 focus:ring-[#C1A7A3]"
                />
              </div>

              {/* Eligibility */}
              <div>
                <EligibilitySelector
                  value={eligibility}
                  onChange={setEligibility}
                  allowAll={true}
                  allowCategories={true}
                  allowTreatments={true}
                />
              </div>

              {/* Period */}
              <div>
                <h4 className="text-sm font-semibold text-[#191919] dark:text-[#F0EEED] mb-4">
                  Period
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#191919] dark:text-[#F0EEED] mb-2">
                      Start Period
                    </label>
                    <input
                      type="date"
                      value={validFrom}
                      onChange={(e) => setValidFrom(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-[#191919] text-[#191919] dark:text-[#F0EEED] focus:outline-none focus:ring-2 focus:ring-[#C1A7A3]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#191919] dark:text-[#F0EEED] mb-2">
                      End Period
                    </label>
                    <input
                      type="date"
                      value={validUntil}
                      onChange={(e) => setValidUntil(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-[#191919] text-[#191919] dark:text-[#F0EEED] focus:outline-none focus:ring-2 focus:ring-[#C1A7A3]"
                    />
                  </div>
                </div>
              </div>
            </div>
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
            disabled={saving || !name.trim() || !value}
            className="px-6 py-2 bg-[#C1A7A3] text-white rounded-lg hover:bg-[#A88F8B] transition-colors disabled:opacity-50 text-sm font-medium"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

