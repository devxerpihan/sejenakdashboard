"use client";

import React from "react";

interface StatusBadgeProps {
  status: "active" | "inactive" | "expired";
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getStatusConfig = () => {
    switch (status) {
      case "active":
        return {
          label: "Active",
          className:
            "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
        };
      case "expired":
        return {
          label: "Expired",
          className:
            "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
        };
      case "inactive":
      default:
        return {
          label: "Inactive",
          className:
            "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
        };
    }
  };

  const config = getStatusConfig();

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-medium ${config.className}`}
    >
      {config.label}
    </span>
  );
};

