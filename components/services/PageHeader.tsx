"use client";

import React from "react";
import { PlusIcon } from "@/components/icons";

interface PageHeaderProps {
  title: string;
  actionButtons?: {
    label: string;
    onClick: () => void;
    variant?: "primary" | "secondary" | "outline";
    icon?: React.ReactNode;
  }[];
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  actionButtons = [],
}) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <h1 className="text-3xl font-bold text-[#191919] dark:text-[#F0EEED]">
        {title}
      </h1>
      {actionButtons.length > 0 && (
        <div className="flex items-center gap-3">
          {actionButtons.map((button, index) => (
            <button
              key={index}
              onClick={button.onClick}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors
                ${
                  button.variant === "primary"
                    ? "bg-[#C1A7A3] hover:bg-[#A88F8B] text-white"
                    : button.variant === "outline"
                    ? "border border-[#C1A7A3] text-[#C1A7A3] hover:bg-[#C1A7A3] hover:text-white dark:border-[#C1A7A3] dark:text-[#C1A7A3] dark:hover:bg-[#C1A7A3] dark:hover:text-white"
                    : "bg-[#FEE2E2] hover:bg-[#FECACA] text-[#991B1B] dark:bg-[#7F1D1D] dark:hover:bg-[#991B1B] dark:text-[#FEE2E2]"
                }
              `}
            >
              {button.icon && <span>{button.icon}</span>}
              <span>{button.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

