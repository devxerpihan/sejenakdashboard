"use client";

import React, { useState } from "react";
import { SearchIcon } from "@/components/icons";

interface FiltersBarProps {
  categories: string[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  searchPlaceholder?: string;
}

export const FiltersBar: React.FC<FiltersBarProps> = ({
  categories,
  selectedCategory,
  onCategoryChange,
  searchQuery,
  onSearchChange,
  searchPlaceholder = "Q Treatment",
}) => {
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);

  return (
    <div className="flex items-center gap-4 mb-6">
      {/* Category Dropdown */}
      <div className="relative">
        <button
          onClick={() => setIsCategoryOpen(!isCategoryOpen)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-[#191919] text-[#191919] dark:text-[#F0EEED] hover:bg-[#F0EEED] dark:hover:bg-[#3D3B3A] transition-colors min-w-[150px] justify-between"
        >
          <span>{selectedCategory}</span>
          <svg
            className="w-4 h-4 text-[#706C6B] dark:text-[#C1A7A3]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
        {isCategoryOpen && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setIsCategoryOpen(false)}
            />
            <div className="absolute top-full left-0 mt-2 w-full bg-white dark:bg-[#191919] border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-lg z-20 overflow-hidden">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => {
                    onCategoryChange(category);
                    setIsCategoryOpen(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-[#191919] dark:text-[#F0EEED] hover:bg-[#F0EEED] dark:hover:bg-[#3D3B3A] transition-colors"
                >
                  {category}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Search Input */}
      <div className="relative flex-1 max-w-md">
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#706C6B] dark:text-[#C1A7A3]">
          <SearchIcon />
        </div>
        <input
          type="text"
          placeholder={searchPlaceholder}
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-[#191919] text-[#191919] dark:text-[#F0EEED] placeholder-[#706C6B] focus:outline-none focus:ring-2 focus:ring-[#C1A7A3]"
        />
      </div>
    </div>
  );
};

