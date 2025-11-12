"use client";

import React, { useState } from "react";
import { BuildingIcon, ChevronRightIcon } from "@/components/icons";

interface LocationSelectorProps {
  location: string;
  locations: string[];
  onChange: (location: string) => void;
}

export const LocationSelector: React.FC<LocationSelectorProps> = ({
  location,
  locations,
  onChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-[#191919] hover:bg-[#F0EEED] dark:hover:bg-[#3D3B3A] transition-colors"
      >
        <BuildingIcon />
        <span className="text-sm font-medium text-[#191919] dark:text-[#F0EEED]">
          {location}
        </span>
        <ChevronRightIcon />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full left-0 mt-2 w-64 bg-white dark:bg-[#191919] border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-lg z-20 overflow-hidden">
            {locations.map((loc) => (
              <button
                key={loc}
                onClick={() => {
                  onChange(loc);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-4 py-2 hover:bg-[#F0EEED] dark:hover:bg-[#3D3B3A] transition-colors ${
                  loc === location
                    ? "bg-[#F0EEED] dark:bg-[#3D3B3A] font-medium"
                    : ""
                }`}
              >
                <div className="flex items-center gap-2">
                  <BuildingIcon />
                  <span className="text-sm text-[#191919] dark:text-[#F0EEED]">
                    {loc}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

