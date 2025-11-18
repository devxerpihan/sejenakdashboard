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
    <div className="relative" style={{ minHeight: `${totalHeight}px` }}>
      {timeSlots.map((slot, index) => {
        // Use the same calculation as grid lines: index * hourHeight
        // Grid lines are at top: index * hourHeight from the top of appointment columns
        // Time labels should be at the same position relative to the time slots container
        const topPosition = index * hourHeight;
        return (
          <span
            key={`time-${slot.hour}-${slot.minute}`}
            className="absolute text-xs text-[#706C6B] dark:text-[#C1A7A3] pr-2 leading-none"
            style={{ 
              top: `${topPosition}px`,
              right: 0,
              margin: 0,
              padding: 0,
              lineHeight: 1,
              display: 'block',
              height: 'auto'
            }}
          >
            {slot.display}
          </span>
        );
      })}
    </div>
  );
};

