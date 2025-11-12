"use client";

import React from "react";
import { TimeSlot } from "@/types/appointment";

interface TimeAxisProps {
  timeSlots: TimeSlot[];
  hourHeight: number; // Height in pixels for each hour
}

export const TimeAxis: React.FC<TimeAxisProps> = ({ timeSlots, hourHeight }) => {
  const totalHeight = timeSlots.length * hourHeight;
  
  return (
    <div className="flex flex-col relative" style={{ minHeight: `${totalHeight}px` }}>
      {/* Header spacer to align with therapist headers */}
      <div className="h-16 border-b border-zinc-200 dark:border-zinc-800" />
      
      {/* Time slots */}
      <div className="flex flex-col relative" style={{ minHeight: `${totalHeight}px` }}>
        {timeSlots.map((slot, index) => (
          <div
            key={index}
            className="absolute flex items-start justify-end pr-2"
            style={{ 
              top: `${index * hourHeight}px`,
              height: `${hourHeight}px`,
              width: '100%'
            }}
          >
            <span className="text-xs text-[#706C6B] dark:text-[#C1A7A3]">
              {slot.display}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

