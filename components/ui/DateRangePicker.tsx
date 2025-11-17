"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@/components/icons";

export type PeriodType = 
  | "last_7_days"
  | "last_30_days"
  | "this_month"
  | "last_month"
  | "this_year"
  | "last_year"
  | "custom";

interface DateRangePickerProps {
  startDate: Date;
  endDate: Date;
  onNavigate: (direction: "prev" | "next") => void;
  onPeriodChange?: (period: PeriodType, start: Date, end: Date) => void;
  onClick?: () => void;
}

const periodOptions: { value: PeriodType; label: string }[] = [
  { value: "last_7_days", label: "Last 7 Days" },
  { value: "last_30_days", label: "Last 30 Days" },
  { value: "this_month", label: "This Month" },
  { value: "last_month", label: "Last Month" },
  { value: "this_year", label: "This Year" },
  { value: "last_year", label: "Last Year" },
  { value: "custom", label: "Custom" },
];

const getPeriodDates = (period: PeriodType): { start: Date; end: Date } => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  switch (period) {
    case "last_7_days":
      return {
        start: new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000),
        end: today,
      };
    case "last_30_days":
      return {
        start: new Date(today.getTime() - 29 * 24 * 60 * 60 * 1000),
        end: today,
      };
    case "this_month":
      return {
        start: new Date(today.getFullYear(), today.getMonth(), 1),
        end: today,
      };
    case "last_month":
      const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
      return {
        start: lastMonth,
        end: lastMonthEnd,
      };
    case "this_year":
      return {
        start: new Date(today.getFullYear(), 0, 1),
        end: today,
      };
    case "last_year":
      return {
        start: new Date(today.getFullYear() - 1, 0, 1),
        end: new Date(today.getFullYear() - 1, 11, 31),
      };
    case "custom":
    default:
      // For custom or unknown periods, return current month
      return {
        start: new Date(today.getFullYear(), today.getMonth(), 1),
        end: today,
      };
  }
};

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  startDate,
  endDate,
  onNavigate,
  onPeriodChange,
  onClick,
}) => {
  const [showPeriodDropdown, setShowPeriodDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const start = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
    const end = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
    
    // Check for exact period matches
    const last7Days = getPeriodDates("last_7_days");
    if (start.getTime() === last7Days.start.getTime() && end.getTime() === last7Days.end.getTime()) {
      return "last_7_days";
    }
    
    const last30Days = getPeriodDates("last_30_days");
    if (start.getTime() === last30Days.start.getTime() && end.getTime() === last30Days.end.getTime()) {
      return "last_30_days";
    }
    
    const thisMonth = getPeriodDates("this_month");
    if (start.getTime() === thisMonth.start.getTime() && end.getTime() === thisMonth.end.getTime()) {
      return "this_month";
    }
    
    const lastMonth = getPeriodDates("last_month");
    if (start.getTime() === lastMonth.start.getTime() && end.getTime() === lastMonth.end.getTime()) {
      return "last_month";
    }
    
    const thisYear = getPeriodDates("this_year");
    if (start.getTime() === thisYear.start.getTime() && end.getTime() === thisYear.end.getTime()) {
      return "this_year";
    }
    
    const lastYear = getPeriodDates("last_year");
    if (start.getTime() === lastYear.start.getTime() && end.getTime() === lastYear.end.getTime()) {
      return "last_year";
    }
    
    return "custom";
  });

  // Update period when dates change
  useEffect(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const start = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
    const end = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
    
    // Check for exact period matches
    const last7Days = getPeriodDates("last_7_days");
    if (start.getTime() === last7Days.start.getTime() && end.getTime() === last7Days.end.getTime()) {
      setSelectedPeriod("last_7_days");
      return;
    }
    
    const last30Days = getPeriodDates("last_30_days");
    if (start.getTime() === last30Days.start.getTime() && end.getTime() === last30Days.end.getTime()) {
      setSelectedPeriod("last_30_days");
      return;
    }
    
    const thisMonth = getPeriodDates("this_month");
    if (start.getTime() === thisMonth.start.getTime() && end.getTime() === thisMonth.end.getTime()) {
      setSelectedPeriod("this_month");
      return;
    }
    
    const lastMonth = getPeriodDates("last_month");
    if (start.getTime() === lastMonth.start.getTime() && end.getTime() === lastMonth.end.getTime()) {
      setSelectedPeriod("last_month");
      return;
    }
    
    const thisYear = getPeriodDates("this_year");
    if (start.getTime() === thisYear.start.getTime() && end.getTime() === thisYear.end.getTime()) {
      setSelectedPeriod("this_year");
      return;
    }
    
    const lastYear = getPeriodDates("last_year");
    if (start.getTime() === lastYear.start.getTime() && end.getTime() === lastYear.end.getTime()) {
      setSelectedPeriod("last_year");
      return;
    }
    
    setSelectedPeriod("custom");
  }, [startDate, endDate]);

  const formatDate = (date: Date): string => {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowPeriodDropdown(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handlePeriodSelect = (period: PeriodType) => {
    setSelectedPeriod(period);
    setShowPeriodDropdown(false);
    
    if (period !== "custom" && onPeriodChange) {
      const dates = getPeriodDates(period);
      onPeriodChange(period, dates.start, dates.end);
    } else if (period === "custom" && onClick) {
      onClick();
    }
  };

  const currentPeriodLabel = periodOptions.find((p) => p.value === selectedPeriod)?.label || "Custom";

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => onNavigate("prev")}
        className="p-1.5 rounded-lg hover:bg-[#F0EEED] dark:hover:bg-[#3D3B3A] transition-colors"
        aria-label="Previous period"
      >
        <ChevronLeftIcon />
      </button>
      
      {/* Period Selector */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setShowPeriodDropdown(!showPeriodDropdown)}
          className="px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-[#191919] hover:bg-[#F0EEED] dark:hover:bg-[#3D3B3A] transition-colors text-sm font-medium text-[#191919] dark:text-[#F0EEED] flex items-center gap-2"
        >
          <span>{currentPeriodLabel}</span>
          <svg
            className={`w-4 h-4 transition-transform ${showPeriodDropdown ? "rotate-180" : ""}`}
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
        
        {showPeriodDropdown && (
          <div className="absolute top-full left-0 mt-1 w-48 bg-white dark:bg-[#191919] rounded-lg shadow-lg border border-zinc-200 dark:border-zinc-800 z-50 overflow-hidden">
            {periodOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handlePeriodSelect(option.value)}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-[#F0EEED] dark:hover:bg-[#3D3B3A] transition-colors ${
                  selectedPeriod === option.value
                    ? "bg-[#F0EEED] dark:bg-[#3D3B3A] text-[#C1A7A3] dark:text-[#C1A7A3]"
                    : "text-[#191919] dark:text-[#F0EEED]"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>

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

