"use client";

import React from "react";
import { Bundle } from "@/types/bundle";
import { StatusBadge } from "./StatusBadge";
import { TrashIcon } from "@/components/icons";

interface BundleTableProps {
  bundles: Bundle[];
  onBundleClick?: (bundle: Bundle) => void;
  onDelete?: (bundleId: string) => void;
}

export const BundleTable: React.FC<BundleTableProps> = ({
  bundles,
  onBundleClick,
  onDelete,
}) => {
  const formatCurrency = (value: number) => {
    return `Rp ${value.toLocaleString("id-ID")}`;
  };

  const truncateItems = (items: string, maxLength: number = 30) => {
    if (items.length <= maxLength) return items;
    return items.substring(0, maxLength) + "...";
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
                Items
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#706C6B] dark:text-[#C1A7A3] uppercase tracking-wider">
                Pricing
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#706C6B] dark:text-[#C1A7A3] uppercase tracking-wider">
                Branch
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#706C6B] dark:text-[#C1A7A3] uppercase tracking-wider">
                Status
              </th>
              {onDelete && (
                <th className="px-6 py-3 text-left text-xs font-medium text-[#706C6B] dark:text-[#C1A7A3] uppercase tracking-wider">
                  Action
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {bundles.map((bundle) => (
              <tr
                key={bundle.id}
                className={`hover:bg-[#F0EEED] dark:hover:bg-[#3D3B3A] transition-colors ${
                  onBundleClick ? "cursor-pointer" : ""
                }`}
                onClick={() => onBundleClick && onBundleClick(bundle)}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-[#191919] dark:text-[#F0EEED]">
                    {bundle.name}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-[#706C6B] dark:text-[#C1A7A3]">
                    {truncateItems(bundle.items)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-[#706C6B] dark:text-[#C1A7A3]">
                    {formatCurrency(bundle.pricing)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-[#706C6B] dark:text-[#C1A7A3]">
                    {bundle.branch}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <StatusBadge status={bundle.status} />
                </td>
                {onDelete && (
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Are you sure you want to delete "${bundle.name}"?`)) {
                          onDelete(bundle.id);
                        }
                      }}
                      className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                      title="Delete bundle"
                    >
                      <TrashIcon />
                    </button>
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

