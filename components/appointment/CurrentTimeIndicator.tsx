"use client";

import React from "react";

interface CurrentTimeIndicatorProps {
  currentTime: Date;
  startHour: number;
  hourHeight: number; // Height in pixels for each hour
  columnCount: number;
}

export const CurrentTimeIndicator: React.FC<CurrentTimeIndicatorProps> = ({
  currentTime,
  startHour,
  hourHeight,
  columnCount,
}) => {
  const currentHour = currentTime.getHours();
  const currentMinute = currentTime.getMinutes();
  
  // Calculate position from top
  const hoursFromStart = currentHour - startHour + currentMinute / 60;
  const topPosition = hoursFromStart * hourHeight;

  return (
    <div
      className="absolute left-0 right-0 z-10 pointer-events-none"
      style={{ top: `${topPosition}px` }}
    >
      <div className="flex">
        {/* Time axis spacer */}
        <div className="w-20" />
        {/* Red line across all columns */}
        <div className="flex-1 relative">
          <div className="absolute left-0 right-0 h-0.5 bg-red-500" />
          <div className="absolute left-0 top-0 w-2 h-2 bg-red-500 rounded-full -translate-x-1 -translate-y-1" />
        </div>
      </div>
    </div>
  );
};

