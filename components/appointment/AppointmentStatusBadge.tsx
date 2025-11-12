"use client";

import React from "react";

interface AppointmentStatusBadgeProps {
  status: "completed" | "check-in" | "pending" | "cancelled";
}

export const AppointmentStatusBadge: React.FC<AppointmentStatusBadgeProps> = ({
  status,
}) => {
  const statusConfig = {
    completed: {
      label: "Completed",
      className: "bg-green-500 text-white",
    },
    "check-in": {
      label: "Check In",
      className: "bg-blue-500 text-white",
    },
    pending: {
      label: "Pending",
      className: "bg-yellow-500 text-white",
    },
    cancelled: {
      label: "Cancelled",
      className: "bg-red-500 text-white",
    },
  };

  const config = statusConfig[status];

  return (
    <span
      className={`px-2 py-0.5 rounded text-xs font-medium ${config.className}`}
    >
      {config.label}
    </span>
  );
};

