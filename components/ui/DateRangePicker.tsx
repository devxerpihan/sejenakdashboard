"use client";

import React from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@/components/icons";

interface DateRangePickerProps {
  startDate: Date;
  endDate: Date;
  onNavigate: (direction: "prev" | "next") => void;
  onClick?: () => void;
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  startDate,
  endDate,
  onNavigate,
  onClick,
}) => {
  const formatDate = (date: Date): string => {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => onNavigate("prev")}
        className="p-1.5 rounded-lg hover:bg-[#F0EEED] dark:hover:bg-[#3D3B3A] transition-colors"
        aria-label="Previous period"
      >
        <ChevronLeftIcon />
      </button>
      <button
        onClick={onClick}
        className="px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-[#191919] hover:bg-[#F0EEED] dark:hover:bg-[#3D3B3A] transition-colors text-sm font-medium text-[#191919] dark:text-[#F0EEED]"
      >
        {formatDate(startDate)} - {formatDate(endDate)}
      </button>
      <button
        onClick={() => onNavigate("next")}
        className="p-1.5 rounded-lg hover:bg-[#F0EEED] dark:hover:bg-[#3D3B3A] transition-colors"
        aria-label="Next period"
      >
        <ChevronRightIcon />
      </button>
    </div>
  );
};

