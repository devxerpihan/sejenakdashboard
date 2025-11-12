"use client";

import React from "react";
import { CustomerStatus } from "@/types/customer";

interface StatusFilterTabsProps {
  selectedStatus: CustomerStatus;
  onStatusChange: (status: CustomerStatus) => void;
  counts: {
    all: number;
    active: number;
    "at-risk": number;
    flagged: number;
    blocked: number;
  };
}

export const StatusFilterTabs: React.FC<StatusFilterTabsProps> = ({
  selectedStatus,
  onStatusChange,
  counts,
}) => {
  const tabs: { value: CustomerStatus; label: string }[] = [
    { value: "all", label: "All" },
    { value: "active", label: "Active" },
    { value: "at-risk", label: "At Risk" },
    { value: "flagged", label: "Flagged" },
    { value: "blocked", label: "Blocked" },
  ];

  return (
    <div className="flex items-center gap-2 mb-6 flex-wrap">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          onClick={() => onStatusChange(tab.value)}
          className={`
            px-4 py-2 rounded-lg text-sm font-medium transition-colors
            ${
              selectedStatus === tab.value
                ? "bg-[#C1A7A3] text-white"
                : "bg-white dark:bg-[#191919] text-[#706C6B] dark:text-[#C1A7A3] border border-zinc-300 dark:border-zinc-700 hover:bg-[#F0EEED] dark:hover:bg-[#3D3B3A]"
            }
          `}
        >
          {tab.label} ({counts[tab.value]})
        </button>
      ))}
    </div>
  );
};

