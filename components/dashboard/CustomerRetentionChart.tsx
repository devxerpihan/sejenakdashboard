"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";

interface CustomerRetentionData {
  new: number;
  returning: number;
}

interface CustomerRetentionChartProps {
  data: CustomerRetentionData;
  title?: string;
}

export const CustomerRetentionChart: React.FC<CustomerRetentionChartProps> = ({
  data,
  title = "Customer Retention",
}) => {
  const total = data.new + data.returning;
  const newPercentage = total > 0 ? (data.new / total) * 100 : 0;
  const returningPercentage = total > 0 ? (data.returning / total) * 100 : 0;

  // Radial chart configuration
  const radius = 60;
  const centerX = 100;
  const centerY = 100;
  const strokeWidth = 20;
  const circumference = 2 * Math.PI * radius;

  // Calculate stroke-dasharray for each segment
  const newDashArray = (newPercentage / 100) * circumference;
  const returningDashArray = (returningPercentage / 100) * circumference;

  // Offset for returning segment (starts after new segment)
  const returningOffset = -newDashArray;

  return (
    <Card>
      {title && (
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent>
        <div className="flex flex-col items-center">
          {/* Radial Chart */}
          <div className="relative">
            <svg width="200" height="200" viewBox="0 0 200 200" className="transform -rotate-90">
              {/* Background circle */}
              <circle
                cx={centerX}
                cy={centerY}
                r={radius}
                fill="none"
                stroke="#F0EEED"
                strokeWidth={strokeWidth}
                className="dark:stroke-[#3D3B3A]"
              />
              {/* New customers segment */}
              <circle
                cx={centerX}
                cy={centerY}
                r={radius}
                fill="none"
                stroke="#C1A7A3"
                strokeWidth={strokeWidth}
                strokeDasharray={`${newDashArray} ${circumference}`}
                strokeDashoffset={0}
                strokeLinecap="round"
                className="transition-all duration-500"
              />
              {/* Returning customers segment */}
              <circle
                cx={centerX}
                cy={centerY}
                r={radius}
                fill="none"
                stroke="#DCCAB7"
                strokeWidth={strokeWidth}
                strokeDasharray={`${returningDashArray} ${circumference}`}
                strokeDashoffset={returningOffset}
                strokeLinecap="round"
                className="transition-all duration-500"
              />
            </svg>
            {/* Center text */}
            <div
              className="absolute flex flex-col items-center justify-center"
              style={{
                left: "50%",
                top: "50%",
                transform: "translate(-50%, -50%)",
                width: `${radius * 2}px`,
                height: `${radius * 2}px`,
              }}
            >
              <p className="text-xs text-[#706C6B] dark:text-[#C1A7A3]">Total</p>
              <p className="text-2xl font-bold text-[#191919] dark:text-[#F0EEED]">
                {total.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Legend and Stats */}
          <div className="mt-6 space-y-3 w-full">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: "#C1A7A3" }} />
                <span className="text-sm text-[#706C6B] dark:text-[#C1A7A3]">New</span>
              </div>
              <span className="font-medium text-[#191919] dark:text-[#F0EEED]">
                {newPercentage.toFixed(0)}%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: "#DCCAB7" }} />
                <span className="text-sm text-[#706C6B] dark:text-[#C1A7A3]">Returning</span>
              </div>
              <span className="font-medium text-[#191919] dark:text-[#F0EEED]">
                {returningPercentage.toFixed(0)}%
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

