"use client";

import React from "react";

export type SalesCategory =
  | "Summary"
  | "Payment Method"
  | "Therapist"
  | "Treatment"
  | "Category"
  | "Discount";

interface SalesCategoryNavProps {
  selectedCategory: SalesCategory;
  onCategoryChange: (category: SalesCategory) => void;
}

export const SalesCategoryNav: React.FC<SalesCategoryNavProps> = ({
  selectedCategory,
  onCategoryChange,
}) => {
  const categories: SalesCategory[] = [
    "Summary",
    "Payment Method",
    "Therapist",
    "Treatment",
    "Category",
    "Discount",
  ];

  return (
    <div className="w-48 flex-shrink-0">
      <div className="bg-white dark:bg-[#191919] rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        <div className="flex flex-col">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => onCategoryChange(category)}
              className={`
                px-4 py-3 text-left text-sm font-medium transition-colors
                relative
                ${
                  selectedCategory === category
                    ? "bg-[#F0EEED] dark:bg-[#3D3B3A] text-[#C1A7A3]"
                    : "text-[#706C6B] dark:text-[#C1A7A3] hover:bg-[#F0EEED] dark:hover:bg-[#3D3B3A]"
                }
              `}
            >
              {selectedCategory === category && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#C1A7A3]" />
              )}
              {category}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

