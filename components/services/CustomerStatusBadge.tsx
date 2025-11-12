"use client";

import React from "react";

interface CustomerStatusBadgeProps {
  status: "active" | "at-risk" | "flagged" | "blocked";
}

export const CustomerStatusBadge: React.FC<CustomerStatusBadgeProps> = ({
  status,
}) => {
  const getStatusConfig = () => {
    switch (status) {
      case "active":
        return {
          label: "Active",
          className:
            "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
        };
      case "flagged":
        return {
          label: "Flagged",
          className:
            "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
        };
      case "blocked":
        return {
          label: "Blocked",
          className:
            "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200",
        };
      case "at-risk":
        return {
          label: "At Risk",
          className:
            "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
        };
      default:
        return {
          label: "Unknown",
          className:
            "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200",
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

