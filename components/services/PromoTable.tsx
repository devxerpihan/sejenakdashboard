"use client";

import React from "react";
import { Promo } from "@/types/promo";
import { StatusBadge } from "./StatusBadge";

interface PromoTableProps {
  promos: Promo[];
}

export const PromoTable: React.FC<PromoTableProps> = ({ promos }) => {
  const formatValidPeriod = (start: string, end: string) => {
    return `${start} - ${end}`;
  };

  const formatUsageCount = (usageCount: number, quota: number) => {
    return `${usageCount}/${quota}`;
  };

  return (
    <div className="bg-white dark:bg-[#191919] rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-[#F0EEED] dark:bg-[#3D3B3A] border-b border-zinc-200 dark:border-zinc-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#706C6B] dark:text-[#C1A7A3] uppercase tracking-wider">
                Code
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#706C6B] dark:text-[#C1A7A3] uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#706C6B] dark:text-[#C1A7A3] uppercase tracking-wider">
                Quota
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#706C6B] dark:text-[#C1A7A3] uppercase tracking-wider">
                Usage Count
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#706C6B] dark:text-[#C1A7A3] uppercase tracking-wider">
                Valid Period
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#706C6B] dark:text-[#C1A7A3] uppercase tracking-wider">
                Targetting
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#706C6B] dark:text-[#C1A7A3] uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {promos.map((promo) => (
              <tr
                key={promo.id}
                className="hover:bg-[#F0EEED] dark:hover:bg-[#3D3B3A] transition-colors"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-[#191919] dark:text-[#F0EEED]">
                    {promo.code}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-[#706C6B] dark:text-[#C1A7A3]">
                    {promo.amount}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-[#706C6B] dark:text-[#C1A7A3]">
                    {promo.quota}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-[#706C6B] dark:text-[#C1A7A3]">
                    {formatUsageCount(promo.usageCount, promo.quota)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-[#706C6B] dark:text-[#C1A7A3]">
                    {formatValidPeriod(promo.validPeriod.start, promo.validPeriod.end)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-[#706C6B] dark:text-[#C1A7A3]">
                    {promo.targetting}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <StatusBadge status={promo.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

