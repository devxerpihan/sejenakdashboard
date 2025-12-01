"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { DonutChartData } from "@/types/sejenak";

interface DonutChartProps {
  data: DonutChartData[];
  totalLabel: string;
  totalValue: number;
  title?: string;
}

export const DonutChart: React.FC<DonutChartProps> = ({
  data,
  totalLabel,
  totalValue,
  title,
}) => {
  // Calculate total from the data (this reflects the actual date-filtered data)
  // This ensures the center text updates when date range changes
  const totalFromData = data.reduce((sum, item) => sum + (item.value || 0), 0);
  // Always use the calculated total from data to reflect date-filtered values
  const displayTotal = totalFromData;
  const total = totalFromData || 1; // Use 1 to avoid division by zero, but we'll check below
  const outerRadius = 80;
  const innerRadius = 50; // Inner radius for the donut hole
  const centerX = 100;
  const centerY = 100;

  // If total is 0, show empty donut
  if (totalFromData === 0 || !data || data.length === 0) {
    return (
      <Card>
        {title && (
          <CardHeader>
            <CardTitle>{title}</CardTitle>
          </CardHeader>
        )}
        <CardContent>
          <div className="flex flex-col items-center">
            <div className="relative">
              <svg width="200" height="200" viewBox="0 0 200 200">
                <circle
                  cx={centerX}
                  cy={centerY}
                  r={outerRadius}
                  fill="none"
                  stroke="#E5E7EB"
                  strokeWidth="2"
                />
              </svg>
              <div 
                className="absolute flex flex-col items-center justify-center"
                style={{
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: `${innerRadius * 2}px`,
                  height: `${innerRadius * 2}px`,
                }}
              >
                <p className="text-xs text-[#706C6B] dark:text-[#C1A7A3]">
                  {totalLabel}
                </p>
                <p className="text-2xl font-bold text-[#191919] dark:text-[#F0EEED]">
                  0
                </p>
              </div>
            </div>
            <div className="mt-6 text-sm text-[#706C6B] dark:text-[#C1A7A3]">
              No data available
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  let currentAngle = -90; // Start from top

  const segments = data
    .filter((item) => item.value > 0) // Only include items with positive values
    .map((item) => {
      const safeValue = item.value || 0;
      const percentage = (safeValue / totalFromData) * 100;
      const angle = (safeValue / totalFromData) * 360;
      const startAngle = currentAngle;
      const endAngle = currentAngle + angle;
      currentAngle += angle;

      // Convert angles to radians
      const startAngleRad = (startAngle * Math.PI) / 180;
      const endAngleRad = (endAngle * Math.PI) / 180;

      // Calculate points on outer circle
      const x1 = centerX + outerRadius * Math.cos(startAngleRad);
      const y1 = centerY + outerRadius * Math.sin(startAngleRad);
      const x2 = centerX + outerRadius * Math.cos(endAngleRad);
      const y2 = centerY + outerRadius * Math.sin(endAngleRad);

      // Calculate points on inner circle
      const x3 = centerX + innerRadius * Math.cos(endAngleRad);
      const y3 = centerY + innerRadius * Math.sin(endAngleRad);
      const x4 = centerX + innerRadius * Math.cos(startAngleRad);
      const y4 = centerY + innerRadius * Math.sin(startAngleRad);

      const largeArcFlag = angle > 180 ? 1 : 0;

      // Create donut segment path
      const pathData = [
        `M ${x1} ${y1}`, // Move to outer start point
        `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${x2} ${y2}`, // Outer arc
        `L ${x3} ${y3}`, // Line to inner end point
        `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x4} ${y4}`, // Inner arc (counter-clockwise)
        "Z", // Close path
      ].join(" ");

      return {
        ...item,
        pathData,
        percentage,
        startAngle,
        angle,
      };
    });

  return (
    <Card>
      {title && (
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent>
        <div className="flex flex-col items-center">
          {/* Donut Chart */}
          <div className="relative">
            <svg width="200" height="200" viewBox="0 0 200 200">
              {segments.map((segment, index) => (
                <path
                  key={index}
                  d={segment.pathData}
                  fill={segment.color}
                  stroke="white"
                  strokeWidth="2"
                />
              ))}
            </svg>
            {/* Center text - positioned in the empty center */}
            <div 
              className="absolute flex flex-col items-center justify-center"
              style={{
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)',
                width: `${innerRadius * 2}px`,
                height: `${innerRadius * 2}px`,
              }}
            >
              <p className="text-xs text-[#706C6B] dark:text-[#C1A7A3]">
                {totalLabel}
              </p>
              <p className="text-2xl font-bold text-[#191919] dark:text-[#F0EEED]">
                {displayTotal.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Legend */}
          <div className="mt-6 space-y-2 w-full">
            {segments.map((segment, index) => (
              <div
                key={index}
                className="flex items-center justify-between text-sm"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: segment.color }}
                  />
                  <span className="text-[#706C6B] dark:text-[#C1A7A3]">
                    {segment.value} {segment.label}
                  </span>
                </div>
                <span className="font-medium text-[#191919] dark:text-[#F0EEED]">
                  {segment.percentage.toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

