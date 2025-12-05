"use client";

import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { EligibilitySelector, EligibilityData } from "./EligibilitySelector";
import { Promo } from "@/types/promo";
import { useBranches } from "@/hooks/useBranches";
import { Dropdown } from "@/components/ui/Dropdown";
import { MultiSelectDropdown } from "@/components/ui/MultiSelectDropdown";

interface CreatePromoModalProps {
  isOpen: boolean;
  onClose: () => void;
  promo?: Promo; // If provided, it's edit mode
  onSave: (promo: {
    code: string;
    type: "nominal" | "percentage";
    value: number;
    quota: number;
    minTransaction?: number;
    eligibility?: EligibilityData;
    validFrom: Date;
    validUntil: Date;
    branchIds?: string[];
    customerTier?: "all" | "Grace" | "Signature" | "Elite";
    claimMethod?: "manual" | "auto";
    status?: "active" | "expired" | "disabled";
  }) => void;
  onError?: (message: string) => void;
}

export const CreatePromoModal: React.FC<CreatePromoModalProps> = ({
  isOpen,
  onClose,
  promo,
  onSave,
  onError,
}) => {
  const isEditMode = !!promo;
  const [promoCode, setPromoCode] = useState("");
  const [type, setType] = useState<"nominal" | "percentage">("nominal");
  const [value, setValue] = useState<string>("");
  const [quota, setQuota] = useState<number>(0);
  const [minTransaction, setMinTransaction] = useState<string>("");
  const [eligibility, setEligibility] = useState<EligibilityData>({ type: "all" });
  const [validFrom, setValidFrom] = useState<string>("");
  const [validUntil, setValidUntil] = useState<string>("");
  const [selectedBranches, setSelectedBranches] = useState<string[]>([]);
  const [customerTier, setCustomerTier] = useState<"all" | "Grace" | "Signature" | "Elite">("all");
  const [claimMethod, setClaimMethod] = useState<"manual" | "auto">("manual");
  const [status, setStatus] = useState<"active" | "expired" | "disabled">("active");
  const [saving, setSaving] = useState(false);

  const { branches, loading: branchesLoading } = useBranches();

  // Reset form when modal opens/closes or promo changes
  useEffect(() => {
    if (isOpen) {
      if (promo) {
        // Edit mode - populate with existing data
        setPromoCode(promo.code);
        
        // Parse type from amount string
        const isPercentage = promo.amount.includes("%");
        setType(isPercentage ? "percentage" : "nominal");
        
        // Extract numeric value
        const numValue = promo.amount.replace(/[^0-9]/g, "");
        setValue(numValue);
        
        setQuota(promo.quota);
        
        // Parse dates from DD/MM/YY format
        const parseDate = (dateStr: string) => {
          try {
            const [day, month, year] = dateStr.split("/");
            const fullYear = parseInt(year) < 100 ? 2000 + parseInt(year) : parseInt(year);
            return `${fullYear}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
          } catch (err) {
            return new Date().toISOString().split("T")[0];
          }
        };
        
        setValidFrom(parseDate(promo.validPeriod.start));
        setValidUntil(parseDate(promo.validPeriod.end));
        
        // Set customer tier from targetting
        if (promo.targetting === "All" || promo.targetting === "all") {
          setCustomerTier("all");
        } else if (promo.targetting === "Grace") {
          setCustomerTier("Grace");
        } else if (promo.targetting === "Signature") {
          setCustomerTier("Signature");
        } else if (promo.targetting === "Elite") {
          setCustomerTier("Elite");
        } else {
          setCustomerTier("all");
        }
        
        // Map status
        if (promo.status === "active") {
          setStatus("active");
        } else if (promo.status === "expired") {
          setStatus("expired");
        } else {
          setStatus("disabled");
        }
        
        // TODO: Load branch IDs and claim method from promo data when available
        setSelectedBranches([]);
        setClaimMethod("manual");
        setEligibility({ type: "all" });
        setMinTransaction("");
      } else {
        // Create mode - reset form
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
        setSelectedBranches([]);
        setCustomerTier("all");
        setClaimMethod("manual");
        setStatus("active");
      }
      setSaving(false);
    }
  }, [isOpen, promo]);

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
        branchIds: selectedBranches.length > 0 ? selectedBranches : undefined,
        customerTier,
        claimMethod,
        status,
      });
      onClose();
    } catch (err: any) {
      console.error("Error saving promo:", err);
      const errorMessage = err.message || "Failed to save promo";
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
            {isEditMode ? "Edit Promo" : "Create Promo"}
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

              {/* Type and Value */}
              <div className="grid grid-cols-2 gap-4">
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
              </div>

              {/* Quota and Min Transaction */}
              <div className="grid grid-cols-2 gap-4">
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

              {/* Assign to Outlets, Customer Targeting, Claim Method, Status */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#191919] dark:text-[#F0EEED] mb-2">
                    Assign to Outlets
                  </label>
                  {branchesLoading ? (
                    <div className="px-4 py-3 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-[#191919] text-sm text-[#706C6B] dark:text-[#C1A7A3]">
                      Loading branches...
                    </div>
                  ) : branches.length === 0 ? (
                    <div className="px-4 py-3 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-[#191919] text-sm text-[#706C6B] dark:text-[#C1A7A3]">
                      No branches available
                    </div>
                  ) : (
                    <MultiSelectDropdown
                      options={branches.map((branch) => ({
                        value: branch.id,
                        label: branch.name,
                      }))}
                      selectedValues={selectedBranches}
                      onChange={setSelectedBranches}
                      placeholder="Select outlets"
                      className="w-full"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#191919] dark:text-[#F0EEED] mb-2">
                    Customer Targeting
                  </label>
                  <Dropdown
                    options={[
                      { value: "all", label: "All Customers" },
                      { value: "Grace", label: "Grace" },
                      { value: "Signature", label: "Signature" },
                      { value: "Elite", label: "Elite" },
                    ]}
                    value={customerTier}
                    onChange={(value) => setCustomerTier(value as "all" | "Grace" | "Signature" | "Elite")}
                    placeholder="Select customer tier"
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#191919] dark:text-[#F0EEED] mb-2">
                    Claim Method
                  </label>
                  <Dropdown
                    options={[
                      { value: "manual", label: "Manual" },
                      { value: "auto", label: "Auto" },
                    ]}
                    value={claimMethod}
                    onChange={(value) => setClaimMethod(value as "manual" | "auto")}
                    placeholder="Select claim method"
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#191919] dark:text-[#F0EEED] mb-2">
                    Status
                  </label>
                  <Dropdown
                    options={[
                      { value: "active", label: "Active" },
                      { value: "expired", label: "Expired" },
                      { value: "disabled", label: "Disabled" },
                    ]}
                    value={status}
                    onChange={(value) => setStatus(value as "active" | "expired" | "disabled")}
                    placeholder="Select status"
                    className="w-full"
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
            {saving ? "Saving..." : isEditMode ? "Update" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

