"use client";

import React from "react";
import { ViewMode } from "@/types/appointment";

interface ViewSwitcherProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
}

export const ViewSwitcher: React.FC<ViewSwitcherProps> = ({
  currentView,
  onViewChange,
}) => {
  const views: { label: string; value: ViewMode }[] = [
    { label: "Day", value: "day" },
    { label: "Week", value: "week" },
    { label: "Therapist", value: "therapist" },
    { label: "Room", value: "room" },
    { label: "All", value: "all" },
  ];

  return (
    <div className="flex items-center gap-2">
      {views.map((view) => (
        <button
          key={view.value}
          onClick={() => onViewChange(view.value)}
          className={`
            px-4 py-2 rounded-lg text-sm font-medium transition-colors
            ${
              currentView === view.value
                ? "bg-[#F0EEED] dark:bg-[#3D3B3A] text-[#191919] dark:text-[#F0EEED]"
                : "text-[#706C6B] dark:text-[#C1A7A3] hover:bg-[#F0EEED] dark:hover:bg-[#3D3B3A]"
            }
          `}
        >
          {view.label}
        </button>
      ))}
    </div>
  );
};

