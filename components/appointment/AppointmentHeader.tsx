"use client";

import React, { useState } from "react";
import { DateRangePicker } from "@/components/ui/DateRangePicker";
import { ViewSwitcher } from "./ViewSwitcher";
import { ViewMode } from "@/types/appointment";
import { PlusIcon, ListIcon, GridIcon } from "@/components/icons";

interface AppointmentHeaderProps {
  title: string;
  dateRange: { start: Date; end: Date };
  onDateRangeChange: (direction: "prev" | "next") => void;
  onPeriodChange?: (period: import("@/components/ui/DateRangePicker").PeriodType, start: Date, end: Date) => void;
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  onNewAppointment?: () => void;
  viewMode?: "list" | "grid";
  onViewModeChange?: (mode: "list" | "grid") => void;
}

export const AppointmentHeader: React.FC<AppointmentHeaderProps> = ({
  title,
  dateRange,
  onDateRangeChange,
  onPeriodChange,
  currentView,
  onViewChange,
  onNewAppointment,
  viewMode: controlledViewMode,
  onViewModeChange,
}) => {
  const [internalViewMode, setInternalViewMode] = useState<"list" | "grid">("grid");
  const viewMode = controlledViewMode ?? internalViewMode;
  const handleViewModeChange = (mode: "list" | "grid") => {
    if (onViewModeChange) {
      onViewModeChange(mode);
    } else {
      setInternalViewMode(mode);
    }
  };
  return (
    <div className="px-6 py-4 space-y-4">
      {/* First Row: Title and Action Buttons */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#191919] dark:text-[#F0EEED]">
          {title}
        </h1>
        <div className="flex items-center gap-2">
          <button
            onClick={onNewAppointment}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#C1A7A3] hover:bg-[#A88F8B] text-white transition-colors text-sm font-medium"
          >
            <PlusIcon />
            <span>New Appointment</span>
          </button>
          <div className="flex items-center gap-1 p-1 rounded-lg bg-[#F0EEED] dark:bg-[#3D3B3A]">
            <button
              onClick={() => handleViewModeChange("list")}
              className={`p-2 rounded transition-colors ${
                viewMode === "list"
                  ? "bg-white dark:bg-[#191919] text-[#191919] dark:text-[#F0EEED] shadow-sm"
                  : "text-[#706C6B] dark:text-[#C1A7A3] hover:text-[#191919] dark:hover:text-[#F0EEED]"
              }`}
              aria-label="List view"
            >
              <ListIcon />
            </button>
            <button
              onClick={() => handleViewModeChange("grid")}
              className={`p-2 rounded transition-colors ${
                viewMode === "grid"
                  ? "bg-white dark:bg-[#191919] text-[#191919] dark:text-[#F0EEED] shadow-sm"
                  : "text-[#706C6B] dark:text-[#C1A7A3] hover:text-[#191919] dark:hover:text-[#F0EEED]"
              }`}
              aria-label="Grid view"
            >
              <GridIcon />
            </button>
          </div>
        </div>
      </div>

      {/* Second Row: Date Range and View Switcher */}
      <div className="flex items-center justify-between">
        <DateRangePicker
          startDate={dateRange.start}
          endDate={dateRange.end}
          onNavigate={onDateRangeChange}
          onPeriodChange={onPeriodChange}
        />
        <ViewSwitcher currentView={currentView} onViewChange={onViewChange} />
      </div>
    </div>
  );
};

