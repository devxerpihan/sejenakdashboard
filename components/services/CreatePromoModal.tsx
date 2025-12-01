"use client";

import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { EligibilitySelector, EligibilityData } from "./EligibilitySelector";

interface CreatePromoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (promo: {
    code: string;
    type: "nominal" | "percentage";
    value: number;
    quota: number;
    minTransaction?: number;
    eligibility?: EligibilityData;
    validFrom: Date;
    validUntil: Date;
  }) => void;
  onError?: (message: string) => void;
}

export const CreatePromoModal: React.FC<CreatePromoModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onError,
}) => {
  const [promoCode, setPromoCode] = useState("");
  const [type, setType] = useState<"nominal" | "percentage">("nominal");
  const [value, setValue] = useState<string>("");
  const [quota, setQuota] = useState<number>(0);
  const [minTransaction, setMinTransaction] = useState<string>("");
  const [eligibility, setEligibility] = useState<EligibilityData>({ type: "all" });
  const [validFrom, setValidFrom] = useState<string>("");
  const [validUntil, setValidUntil] = useState<string>("");
  const [saving, setSaving] = useState(false);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setPromoCode("");
      setType("nominal");
      setValue("");
      setQuota(0);
      setMinTransaction("");
      setEligibility({ type: "all" });
      const today = new Date().toISOString().split("T")[0];
      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      setValidFrom(today);
      setValidUntil(nextMonth.toISOString().split("T")[0]);
      setSaving(false);
    }
  }, [isOpen]);

  const generateCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPromoCode(code);
  };

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    const numValue = inputValue.replace(/[^0-9]/g, "");
    setValue(numValue);
  };

  const handleMinTransactionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    const numValue = inputValue.replace(/[^0-9]/g, "");
    setMinTransaction(numValue);
  };

  const handleQuotaChange = (delta: number) => {
    setQuota((prev) => Math.max(0, prev + delta));
  };

  const handleSave = async () => {
    if (!promoCode.trim()) {
      const errorMessage = "Please enter a promo code";
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

    if (quota <= 0) {
      const errorMessage = "Please enter a valid quota";
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
        code: promoCode.trim().toUpperCase(),
        type,
        value: parseFloat(value),
        quota,
        minTransaction: minTransaction ? parseFloat(minTransaction) : undefined,
        eligibility: eligibility.type === "all" ? undefined : eligibility,
        validFrom: fromDate,
        validUntil: untilDate,
      });
      onClose();
    } catch (err: any) {
      console.error("Error creating promo:", err);
      const errorMessage = err.message || "Failed to create promo";
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
            Create Promo
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
          {/* Details Promo */}
          <div>
            <h3 className="text-lg font-semibold text-[#191919] dark:text-[#F0EEED] mb-4">
              Details Promo
            </h3>

            <div className="space-y-4">
              {/* Promo Code */}
              <div>
                <label className="block text-sm font-medium text-[#191919] dark:text-[#F0EEED] mb-2">
                  Promo Code
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. SEJENAK50"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                    className="flex-1 px-4 py-3 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-[#191919] text-[#191919] dark:text-[#F0EEED] placeholder-[#706C6B] focus:outline-none focus:ring-2 focus:ring-[#C1A7A3]"
                  />
                  <button
                    type="button"
                    onClick={generateCode}
                    className="px-4 py-3 border border-zinc-300 dark:border-zinc-700 rounded-lg text-sm font-medium text-[#191919] dark:text-[#F0EEED] hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                  >
                    Generate Code
                  </button>
                </div>
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
                  <option value="nominal">Nominal (Rp)</option>
                  <option value="percentage">Percentage (%)</option>
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

              {/* Quota */}
              <div>
                <label className="block text-sm font-medium text-[#191919] dark:text-[#F0EEED] mb-2">
                  Quota (total claims)
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuotaChange(-1)}
                    className="px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg text-[#191919] dark:text-[#F0EEED] hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="0"
                    value={quota}
                    onChange={(e) => setQuota(Math.max(0, parseInt(e.target.value) || 0))}
                    className="flex-1 px-4 py-3 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-[#191919] text-[#191919] dark:text-[#F0EEED] focus:outline-none focus:ring-2 focus:ring-[#C1A7A3] text-center"
                    placeholder="e.g. 100"
                  />
                  <button
                    type="button"
                    onClick={() => handleQuotaChange(1)}
                    className="px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg text-[#191919] dark:text-[#F0EEED] hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Min Transaction */}
              <div>
                <label className="block text-sm font-medium text-[#191919] dark:text-[#F0EEED] mb-2">
                  Min. Transaction (Rp)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 1000000"
                  value={minTransaction}
                  onChange={handleMinTransactionChange}
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

              {/* Valid Period */}
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
            disabled={saving || !promoCode.trim() || !value || quota <= 0}
            className="px-6 py-2 bg-[#C1A7A3] text-white rounded-lg hover:bg-[#A88F8B] transition-colors disabled:opacity-50 text-sm font-medium"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

