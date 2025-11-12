"use client";

import React from "react";

interface RoleBadgeProps {
  role: "Therapist" | "Receptionist" | "Cook Helper" | "Spa Attendant";
}

export const RoleBadge: React.FC<RoleBadgeProps> = ({ role }) => {
  const getRoleConfig = () => {
    switch (role) {
      case "Therapist":
        return {
          label: "Therapist",
          className:
            "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
        };
      case "Receptionist":
        return {
          label: "Receptionist",
          className:
            "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
        };
      case "Cook Helper":
        return {
          label: "Cook Helper",
          className:
            "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
        };
      case "Spa Attendant":
        return {
          label: "Spa Attendant",
          className:
            "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
        };
      default:
        return {
          label: role,
          className:
            "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200",
        };
    }
  };

  const config = getRoleConfig();

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-medium ${config.className}`}
    >
      {config.label}
    </span>
  );
};

