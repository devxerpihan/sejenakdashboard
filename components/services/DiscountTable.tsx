"use client";

import React from "react";
import { Discount } from "@/types/discount";
import { StatusBadge } from "./StatusBadge";
import { TrashIcon } from "@/components/icons";

interface DiscountTableProps {
  discounts: Discount[];
  onDiscountClick?: (discount: Discount) => void;
  onDelete?: (discountId: string) => void;
}

export const DiscountTable: React.FC<DiscountTableProps> = ({ 
  discounts, 
  onDiscountClick,
  onDelete 
}) => {
  const formatValidPeriod = (start: string, end: string) => {
    return `${start} - ${end}`;
  };

  return (
    <div className="bg-white dark:bg-[#191919] rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-[#F0EEED] dark:bg-[#3D3B3A] border-b border-zinc-200 dark:border-zinc-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#706C6B] dark:text-[#C1A7A3] uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#706C6B] dark:text-[#C1A7A3] uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#706C6B] dark:text-[#C1A7A3] uppercase tracking-wider">
                Valid Period
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#706C6B] dark:text-[#C1A7A3] uppercase tracking-wider">
                Eligibility
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#706C6B] dark:text-[#C1A7A3] uppercase tracking-wider">
                Status
              </th>
              {(onDiscountClick || onDelete) && (
                <th className="px-6 py-3 text-left text-xs font-medium text-[#706C6B] dark:text-[#C1A7A3] uppercase tracking-wider">
                  Action
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {discounts.map((discount) => (
              <tr
                key={discount.id}
                className={`hover:bg-[#F0EEED] dark:hover:bg-[#3D3B3A] transition-colors ${
                  onDiscountClick ? "cursor-pointer" : ""
                }`}
                onClick={() => onDiscountClick && onDiscountClick(discount)}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-[#191919] dark:text-[#F0EEED]">
                    {discount.name}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-[#706C6B] dark:text-[#C1A7A3]">
                    {discount.amount}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-[#706C6B] dark:text-[#C1A7A3]">
                    {formatValidPeriod(discount.validPeriod.start, discount.validPeriod.end)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-[#706C6B] dark:text-[#C1A7A3]">
                    {discount.eligibility}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <StatusBadge status={discount.status} />
                </td>
                {(onDiscountClick || onDelete) && (
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {onDiscountClick && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDiscountClick(discount);
                          }}
                          className="text-[#C1A7A3] hover:text-[#A88F8B] transition-colors text-sm"
                          title="Edit discount"
                        >
                          Edit
                        </button>
                      )}
                      {onDelete && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm(`Are you sure you want to delete discount "${discount.name}"?`)) {
                              onDelete(discount.id);
                            }
                          }}
                          className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                          title="Delete discount"
                        >
                          <TrashIcon />
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

