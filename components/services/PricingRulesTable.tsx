"use client";

import React from "react";
import { PricingVariant } from "@/types/treatment";
import { TrashIcon } from "@/components/icons";

interface PricingRulesTableProps {
  variants: PricingVariant[];
  onVariantChange: (variant: PricingVariant) => void;
  onVariantDelete: (variantId: string) => void;
  onAddVariant: () => void;
  onToggleWeekday: () => void;
  onToggleWeekend: () => void;
  onToggleHoliday: () => void;
  weekdayEnabled: boolean;
  weekendEnabled: boolean;
  holidayEnabled: boolean;
}

export const PricingRulesTable: React.FC<PricingRulesTableProps> = ({
  variants,
  onVariantChange,
  onVariantDelete,
  onAddVariant,
  onToggleWeekday,
  onToggleWeekend,
  onToggleHoliday,
  weekdayEnabled,
  weekendEnabled,
  holidayEnabled,
}) => {
  const formatCurrency = (value: number) => {
    if (value === 0) return "Rp 0";
    return `Rp ${value.toLocaleString("id-ID")}`;
  };

  const handlePriceChange = (
    variantId: string,
    field: "weekday" | "weekend" | "holiday",
    value: string
  ) => {
    const variant = variants.find((v) => v.id === variantId);
    if (variant) {
      const numValue = value.replace(/[^0-9]/g, "");
      onVariantChange({
        ...variant,
        [field]: numValue ? parseInt(numValue, 10) : 0,
      });
    }
  };

  const handleNameChange = (variantId: string, value: string) => {
    const variant = variants.find((v) => v.id === variantId);
    if (variant) {
      onVariantChange({
        ...variant,
        name: value,
      });
    }
  };

  // Toggle switch component
  const ToggleSwitch = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => {
    return (
      <button
        type="button"
        onClick={onChange}
        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#C1A7A3] focus:ring-offset-2 ${
          checked ? "bg-[#C1A7A3]" : "bg-zinc-300 dark:bg-zinc-600"
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            checked ? "translate-x-5" : "translate-x-0.5"
          }`}
        />
      </button>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-[#191919] dark:text-[#F0EEED]">
          Pricing Rules
        </h3>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-[#191919] rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#F0EEED] dark:bg-[#3D3B3A] border-b border-zinc-200 dark:border-zinc-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#706C6B] dark:text-[#C1A7A3] uppercase tracking-wider">
                  Variant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#706C6B] dark:text-[#C1A7A3] uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <span>Weekday</span>
                    <ToggleSwitch checked={weekdayEnabled} onChange={onToggleWeekday} />
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#706C6B] dark:text-[#C1A7A3] uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <span>Weekend</span>
                    <ToggleSwitch checked={weekendEnabled} onChange={onToggleWeekend} />
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#706C6B] dark:text-[#C1A7A3] uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <span>Holiday</span>
                    <ToggleSwitch checked={holidayEnabled} onChange={onToggleHoliday} />
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#706C6B] dark:text-[#C1A7A3] uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {variants.map((variant) => (
                <tr
                  key={variant.id}
                  className="hover:bg-[#F0EEED] dark:hover:bg-[#3D3B3A] transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="text"
                      value={variant.name}
                      onChange={(e) => handleNameChange(variant.id, e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-[#191919] text-sm font-medium text-[#191919] dark:text-[#F0EEED] focus:outline-none focus:ring-2 focus:ring-[#C1A7A3]"
                      placeholder="Variant name"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="text"
                      value={variant.weekday === 0 ? "" : formatCurrency(variant.weekday)}
                      onChange={(e) =>
                        handlePriceChange(variant.id, "weekday", e.target.value)
                      }
                      onBlur={(e) => {
                        const numValue = e.target.value.replace(/[^0-9]/g, "");
                        if (!numValue) {
                          onVariantChange({ ...variant, weekday: 0 });
                        }
                      }}
                      disabled={!weekdayEnabled}
                      className={`w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-[#191919] text-[#191919] dark:text-[#F0EEED] focus:outline-none focus:ring-2 focus:ring-[#C1A7A3] ${
                        !weekdayEnabled ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                      placeholder="Rp 0"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="text"
                      value={variant.weekend === 0 ? "" : formatCurrency(variant.weekend)}
                      onChange={(e) =>
                        handlePriceChange(variant.id, "weekend", e.target.value)
                      }
                      onBlur={(e) => {
                        const numValue = e.target.value.replace(/[^0-9]/g, "");
                        if (!numValue) {
                          onVariantChange({ ...variant, weekend: 0 });
                        }
                      }}
                      disabled={!weekendEnabled}
                      className={`w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-[#191919] text-[#191919] dark:text-[#F0EEED] focus:outline-none focus:ring-2 focus:ring-[#C1A7A3] ${
                        !weekendEnabled ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                      placeholder="Rp 0"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="text"
                      value={variant.holiday === 0 ? "" : formatCurrency(variant.holiday)}
                      onChange={(e) =>
                        handlePriceChange(variant.id, "holiday", e.target.value)
                      }
                      onBlur={(e) => {
                        const numValue = e.target.value.replace(/[^0-9]/g, "");
                        if (!numValue) {
                          onVariantChange({ ...variant, holiday: 0 });
                        }
                      }}
                      disabled={!holidayEnabled}
                      className={`w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-[#191919] text-[#191919] dark:text-[#F0EEED] focus:outline-none focus:ring-2 focus:ring-[#C1A7A3] ${
                        !holidayEnabled ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                      placeholder="Rp 0"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => onVariantDelete(variant.id)}
                      className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                    >
                      <TrashIcon />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Variant Button */}
      <button
        onClick={onAddVariant}
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#C1A7A3] border border-[#C1A7A3] rounded-lg hover:bg-[#C1A7A3] hover:text-white transition-colors"
      >
        <span>+</span>
        <span>Add Variant</span>
      </button>
    </div>
  );
};

