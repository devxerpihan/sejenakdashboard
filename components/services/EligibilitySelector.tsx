"use client";

import React, { useState, useEffect } from "react";
import { useCategories } from "@/hooks/useCategories";
import { useTreatments } from "@/hooks/useTreatments";
import { SearchIcon } from "@/components/icons";

export type EligibilityType = "all" | "categories" | "treatments";

export interface EligibilityData {
  type: EligibilityType;
  categoryIds?: string[];
  treatmentIds?: string[];
}

interface EligibilitySelectorProps {
  value: EligibilityData;
  onChange: (value: EligibilityData) => void;
  allowAll?: boolean;
  allowCategories?: boolean;
  allowTreatments?: boolean;
}

export const EligibilitySelector: React.FC<EligibilitySelectorProps> = ({
  value,
  onChange,
  allowAll = true,
  allowCategories = true,
  allowTreatments = true,
}) => {
  const { categories, loading: categoriesLoading } = useCategories();
  const { treatments, loading: treatmentsLoading } = useTreatments();
  const [categorySearch, setCategorySearch] = useState("");
  const [treatmentSearch, setTreatmentSearch] = useState("");

  const handleTypeChange = (type: EligibilityType) => {
    onChange({
      type,
      categoryIds: type === "categories" ? [] : undefined,
      treatmentIds: type === "treatments" ? [] : undefined,
    });
  };

  const toggleCategory = (categoryName: string) => {
    const currentIds = value.categoryIds || [];
    const isSelected = currentIds.includes(categoryName);
    const newIds = isSelected
      ? currentIds.filter((id) => id !== categoryName)
      : [...currentIds, categoryName];
    onChange({
      ...value,
      categoryIds: newIds,
    });
  };

  const toggleTreatment = (treatmentId: string) => {
    const currentIds = value.treatmentIds || [];
    const isSelected = currentIds.includes(treatmentId);
    const newIds = isSelected
      ? currentIds.filter((id) => id !== treatmentId)
      : [...currentIds, treatmentId];
    onChange({
      ...value,
      treatmentIds: newIds,
    });
  };

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(categorySearch.toLowerCase())
  );

  const filteredTreatments = treatments.filter((treatment) =>
    treatment.name.toLowerCase().includes(treatmentSearch.toLowerCase())
  );

  // Get unique categories from treatments
  const uniqueCategories = Array.from(
    new Set(treatments.map((t) => t.category))
  ).filter(Boolean);

  return (
    <div className="space-y-4">
      {/* Type Selection */}
      <div>
        <label className="block text-sm font-medium text-[#191919] dark:text-[#F0EEED] mb-2">
          Eligibility Type
        </label>
        <div className="flex flex-wrap gap-2">
          {allowAll && (
            <button
              type="button"
              onClick={() => handleTypeChange("all")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                value.type === "all"
                  ? "bg-[#C1A7A3] text-white"
                  : "border border-zinc-300 dark:border-zinc-700 text-[#191919] dark:text-[#F0EEED] hover:bg-zinc-50 dark:hover:bg-zinc-800"
              }`}
            >
              All Services
            </button>
          )}
          {allowCategories && (
            <button
              type="button"
              onClick={() => handleTypeChange("categories")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                value.type === "categories"
                  ? "bg-[#C1A7A3] text-white"
                  : "border border-zinc-300 dark:border-zinc-700 text-[#191919] dark:text-[#F0EEED] hover:bg-zinc-50 dark:hover:bg-zinc-800"
              }`}
            >
              Categories
            </button>
          )}
          {allowTreatments && (
            <button
              type="button"
              onClick={() => handleTypeChange("treatments")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                value.type === "treatments"
                  ? "bg-[#C1A7A3] text-white"
                  : "border border-zinc-300 dark:border-zinc-700 text-[#191919] dark:text-[#F0EEED] hover:bg-zinc-50 dark:hover:bg-zinc-800"
              }`}
            >
              Treatments
            </button>
          )}
        </div>
      </div>

      {/* Category Selection */}
      {value.type === "categories" && (
        <div>
          <label className="block text-sm font-medium text-[#191919] dark:text-[#F0EEED] mb-2">
            Select Categories
          </label>
          <div className="relative mb-3">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#706C6B] dark:text-[#C1A7A3]">
              <SearchIcon />
            </div>
            <input
              type="text"
              placeholder="Search categories..."
              value={categorySearch}
              onChange={(e) => setCategorySearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-[#191919] text-[#191919] dark:text-[#F0EEED] placeholder-[#706C6B] focus:outline-none focus:ring-2 focus:ring-[#C1A7A3]"
            />
          </div>
          <div className="max-h-48 overflow-y-auto border border-zinc-300 dark:border-zinc-700 rounded-lg p-2 space-y-2">
            {categoriesLoading ? (
              <div className="text-center py-4 text-[#706C6B] dark:text-[#C1A7A3]">
                Loading categories...
              </div>
            ) : filteredCategories.length === 0 ? (
              <div className="text-center py-4 text-[#706C6B] dark:text-[#C1A7A3]">
                No categories found
              </div>
            ) : (
              filteredCategories.map((category) => {
                const isSelected = value.categoryIds?.includes(category.name);
                return (
                  <label
                    key={category.name}
                    className="flex items-center p-2 rounded hover:bg-zinc-50 dark:hover:bg-zinc-800 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleCategory(category.name)}
                      className="w-4 h-4 text-[#C1A7A3] border-zinc-300 dark:border-zinc-700 rounded focus:ring-[#C1A7A3]"
                    />
                    <span className="ml-3 text-sm text-[#191919] dark:text-[#F0EEED]">
                      {category.name} ({category.totalTreatment} treatments)
                    </span>
                  </label>
                );
              })
            )}
          </div>
          {value.categoryIds && value.categoryIds.length > 0 && (
            <div className="mt-2 text-xs text-[#706C6B] dark:text-[#C1A7A3]">
              {value.categoryIds.length} categor{value.categoryIds.length === 1 ? "y" : "ies"} selected
            </div>
          )}
        </div>
      )}

      {/* Treatment Selection */}
      {value.type === "treatments" && (
        <div>
          <label className="block text-sm font-medium text-[#191919] dark:text-[#F0EEED] mb-2">
            Select Treatments
          </label>
          <div className="relative mb-3">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#706C6B] dark:text-[#C1A7A3]">
              <SearchIcon />
            </div>
            <input
              type="text"
              placeholder="Search treatments..."
              value={treatmentSearch}
              onChange={(e) => setTreatmentSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-[#191919] text-[#191919] dark:text-[#F0EEED] placeholder-[#706C6B] focus:outline-none focus:ring-2 focus:ring-[#C1A7A3]"
            />
          </div>
          <div className="max-h-48 overflow-y-auto border border-zinc-300 dark:border-zinc-700 rounded-lg p-2 space-y-2">
            {treatmentsLoading ? (
              <div className="text-center py-4 text-[#706C6B] dark:text-[#C1A7A3]">
                Loading treatments...
              </div>
            ) : filteredTreatments.length === 0 ? (
              <div className="text-center py-4 text-[#706C6B] dark:text-[#C1A7A3]">
                No treatments found
              </div>
            ) : (
              filteredTreatments.map((treatment) => {
                const isSelected = value.treatmentIds?.includes(treatment.id);
                return (
                  <label
                    key={treatment.id}
                    className="flex items-center p-2 rounded hover:bg-zinc-50 dark:hover:bg-zinc-800 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleTreatment(treatment.id)}
                      className="w-4 h-4 text-[#C1A7A3] border-zinc-300 dark:border-zinc-700 rounded focus:ring-[#C1A7A3]"
                    />
                    <span className="ml-3 text-sm text-[#191919] dark:text-[#F0EEED]">
                      {treatment.name} {treatment.category && `(${treatment.category})`}
                    </span>
                  </label>
                );
              })
            )}
          </div>
          {value.treatmentIds && value.treatmentIds.length > 0 && (
            <div className="mt-2 text-xs text-[#706C6B] dark:text-[#C1A7A3]">
              {value.treatmentIds.length} treatment{value.treatmentIds.length === 1 ? "" : "s"} selected
            </div>
          )}
        </div>
      )}
    </div>
  );
};

