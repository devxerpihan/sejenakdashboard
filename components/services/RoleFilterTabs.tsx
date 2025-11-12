"use client";

import React from "react";
import { StaffRole } from "@/types/staff";

interface RoleFilterTabsProps {
  selectedRole: StaffRole;
  onRoleChange: (role: StaffRole) => void;
  counts: {
    all: number;
    Therapist: number;
    Receptionist: number;
    "Cook Helper": number;
    "Spa Attendant": number;
  };
}

export const RoleFilterTabs: React.FC<RoleFilterTabsProps> = ({
  selectedRole,
  onRoleChange,
  counts,
}) => {
  const tabs: { value: StaffRole; label: string }[] = [
    { value: "all", label: "All" },
    { value: "Therapist", label: "Therapist" },
    { value: "Receptionist", label: "Receptionist" },
    { value: "Cook Helper", label: "Cook Helper" },
    { value: "Spa Attendant", label: "Spa Attendant" },
  ];

  return (
    <div className="flex items-center gap-2 mb-6 flex-wrap">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          onClick={() => onRoleChange(tab.value)}
          className={`
            px-4 py-2 rounded-lg text-sm font-medium transition-colors
            ${
              selectedRole === tab.value
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

