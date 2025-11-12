"use client";

import React from "react";

interface StatusBadgeProps {
  status: "active" | "inactive";
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  return (
    <span
      className={`
        px-3 py-1 rounded-full text-xs font-medium
        ${
          status === "active"
            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
            : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
        }
      `}
    >
      {status === "active" ? "Active" : "Inactive"}
    </span>
  );
};

