"use client";

import React from "react";

interface DayHeaderProps {
  date: Date;
  isToday?: boolean;
}

export const DayHeader: React.FC<DayHeaderProps> = ({ date, isToday = false }) => {
  const dayName = date.toLocaleDateString("en-US", { weekday: "short" });
  const dayNumber = date.getDate();
  const month = date.toLocaleDateString("en-US", { month: "short" });

  return (
    <div className={`p-3 border-b border-zinc-200 dark:border-zinc-800 ${isToday ? "bg-[#C1A7A3] dark:bg-[#706C6B]" : "bg-[#F0EEED] dark:bg-[#3D3B3A]"}`}>
      <p className={`text-xs font-medium ${isToday ? "text-white" : "text-[#706C6B] dark:text-[#C1A7A3]"}`}>
        {dayName}
      </p>
      <p className={`text-sm font-semibold ${isToday ? "text-white" : "text-[#191919] dark:text-[#F0EEED]"}`}>
        {dayNumber}
      </p>
      <p className={`text-xs ${isToday ? "text-white/80" : "text-[#706C6B] dark:text-[#C1A7A3]"}`}>
        {month}
      </p>
    </div>
  );
};

