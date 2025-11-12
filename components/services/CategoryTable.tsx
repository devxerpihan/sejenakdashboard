"use client";

import React from "react";
import { Category } from "@/types/category";

interface CategoryTableProps {
  categories: Category[];
  onAssignToTreatment?: (categoryId: string) => void;
}

export const CategoryTable: React.FC<CategoryTableProps> = ({
  categories,
  onAssignToTreatment,
}) => {
  return (
    <div className="bg-white dark:bg-[#191919] rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-[#F0EEED] dark:bg-[#3D3B3A] border-b border-zinc-200 dark:border-zinc-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#706C6B] dark:text-[#C1A7A3] uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#706C6B] dark:text-[#C1A7A3] uppercase tracking-wider">
                Total Treatment
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#706C6B] dark:text-[#C1A7A3] uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {categories.map((category) => (
              <tr
                key={category.id}
                className="hover:bg-[#F0EEED] dark:hover:bg-[#3D3B3A] transition-colors"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-[#191919] dark:text-[#F0EEED]">
                    {category.name}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-[#706C6B] dark:text-[#C1A7A3]">
                    {category.totalTreatment} Treatment
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() =>
                      onAssignToTreatment && onAssignToTreatment(category.id)
                    }
                    className="px-4 py-2 text-sm font-medium rounded-lg border border-[#C1A7A3] text-[#C1A7A3] hover:bg-[#C1A7A3] hover:text-white dark:border-[#C1A7A3] dark:text-[#C1A7A3] dark:hover:bg-[#C1A7A3] dark:hover:text-white transition-colors"
                  >
                    Assign To Treatment
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

