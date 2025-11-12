"use client";

import React from "react";

interface SalesSummaryProps {
  grossSales: number;
  discounts: number;
  refunds: number;
  netSales: number;
  totalCollected: number;
}

export const SalesSummary: React.FC<SalesSummaryProps> = ({
  grossSales,
  discounts,
  refunds,
  netSales,
  totalCollected,
}) => {
  const formatCurrency = (amount: number) => {
    return `Rp ${amount.toLocaleString("id-ID")}`;
  };

  return (
    <div className="bg-white dark:bg-[#191919] rounded-lg border border-zinc-200 dark:border-zinc-800 p-6">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-sm text-[#706C6B] dark:text-[#C1A7A3]">
            Gross Sales
          </span>
          <span className="text-sm font-medium text-[#191919] dark:text-[#F0EEED]">
            {formatCurrency(grossSales)}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-[#706C6B] dark:text-[#C1A7A3]">
            Discounts
          </span>
          <span className="text-sm font-medium text-red-600 dark:text-red-400">
            ({formatCurrency(discounts)})
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-[#706C6B] dark:text-[#C1A7A3]">
            Refunds
          </span>
          <span className="text-sm font-medium text-red-600 dark:text-red-400">
            ({formatCurrency(refunds)})
          </span>
        </div>

        <div className="border-t border-zinc-200 dark:border-zinc-800 pt-4 mt-4">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm font-semibold text-[#191919] dark:text-[#F0EEED]">
              Net Sales
            </span>
            <span className="text-base font-bold text-[#191919] dark:text-[#F0EEED]">
              {formatCurrency(netSales)}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold text-[#191919] dark:text-[#F0EEED]">
              Total Collected
            </span>
            <span className="text-base font-bold text-[#191919] dark:text-[#F0EEED]">
              {formatCurrency(totalCollected)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

