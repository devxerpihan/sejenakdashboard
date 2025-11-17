"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";

interface RevenueTrendData {
  label: string;
  value: number;
}

interface RevenueTrendChartProps {
  data: RevenueTrendData[];
  title?: string;
  color?: string;
  areaColor?: string;
}

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("id-ID", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const RevenueTrendChart: React.FC<RevenueTrendChartProps> = ({
  data,
  title = "Revenue Trend",
  color = "#C1A7A3",
  areaColor = "#C1A7A3",
}) => {
  // Validate and sanitize data
  const validData = Array.isArray(data) && data.length > 0 
    ? data.filter((d) => d && typeof d.value === "number" && !isNaN(d.value))
    : [];

  // If no valid data, show empty chart
  if (validData.length === 0) {
    return (
      <Card>
        {title && (
          <CardHeader>
            <CardTitle>{title}</CardTitle>
          </CardHeader>
        )}
        <CardContent>
          <div className="flex items-center justify-center h-64 text-[#706C6B] dark:text-[#C1A7A3]">
            No revenue data available
          </div>
        </CardContent>
      </Card>
    );
  }

  const maxValue = Math.max(...validData.map((d) => d.value));
  const minValue = 0;
  
  // Ensure maxValue is valid and at least 1 to avoid division by zero
  const safeMaxValue = isNaN(maxValue) || maxValue <= 0 ? 1 : maxValue;

  // Calculate Y-axis with smart step sizing to avoid crowding (max 5 labels)
  // Find appropriate step size based on max value
  const maxLabels = 5;
  const rawStep = safeMaxValue / maxLabels;
  
  // Round to nice numbers (1, 2, 5, 10, 20, 50, 100, etc. multiplied by appropriate power of 10)
  const magnitude = Math.pow(10, Math.floor(Math.log10(rawStep)));
  const normalized = rawStep / magnitude;
  let niceStep: number;
  
  if (normalized <= 1) niceStep = 1 * magnitude;
  else if (normalized <= 2) niceStep = 2 * magnitude;
  else if (normalized <= 5) niceStep = 5 * magnitude;
  else niceStep = 10 * magnitude;
  
  const yAxisMax = Math.ceil(safeMaxValue / niceStep) * niceStep || niceStep;
  const yAxisStep = niceStep;
  const yAxisSteps = Math.min(maxLabels, Math.ceil(yAxisMax / yAxisStep)); // Max 5 steps

  const height = 300;
  const labelAreaWidth = 120; // Space for Y-axis labels on the left
  const chartAreaWidth = 800; // Desired chart area width
  const rightPadding = 50;
  const width = labelAreaWidth + chartAreaWidth; // Total SVG width
  const leftPadding = labelAreaWidth; // Chart starts after labels
  const topPadding = 40;
  const bottomPadding = 50;
  const chartWidth = chartAreaWidth - rightPadding; // Chart width (excluding right padding)
  const chartHeight = height - topPadding - bottomPadding;

  // Calculate points for the line
  const points = validData.map((d, i) => {
    const x = leftPadding + (i / Math.max(1, validData.length - 1)) * chartWidth;
    const valueRatio = yAxisMax > 0 ? (d.value - minValue) / yAxisMax : 0;
    const y = topPadding + chartHeight - valueRatio * chartHeight;
    return `${x},${y}`;
  });

  // Create area fill points
  const areaPoints = [
    `${leftPadding},${topPadding + chartHeight}`,
    ...points,
    `${leftPadding + chartWidth},${topPadding + chartHeight}`,
  ].join(" ");

  return (
    <Card>
      {title && (
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent className="overflow-x-auto">
        <div className="w-full" style={{ minWidth: `${width}px` }}>
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
            <defs>
              <linearGradient id="revenueGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={areaColor} stopOpacity="0.3" />
                <stop offset="100%" stopColor={areaColor} stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Y-axis grid lines and labels */}
            {Array.from({ length: yAxisSteps + 1 }).map((_, i) => {
              const value = i * yAxisStep;
              const valueRatio = yAxisMax > 0 ? (value - minValue) / yAxisMax : 0;
              const y = topPadding + chartHeight - valueRatio * chartHeight;
              
              // Ensure y is a valid number
              const safeY = isNaN(y) ? topPadding + chartHeight : y;
              
              return (
                <g key={i}>
                  <line
                    x1={leftPadding}
                    y1={safeY}
                    x2={leftPadding + chartWidth}
                    y2={safeY}
                    stroke="#E5E7EB"
                    strokeWidth="1"
                    strokeDasharray="4 4"
                    className="dark:stroke-zinc-700"
                  />
                  <text
                    x={leftPadding - 10}
                    y={safeY + 4}
                    textAnchor="end"
                    className="text-xs fill-[#706C6B] dark:text-[#C1A7A3]"
                  >
                    {formatCurrency(value)}
                  </text>
                </g>
              );
            })}

            {/* Area fill */}
            <polygon points={areaPoints} fill="url(#revenueGradient)" />

            {/* Line */}
            <polyline
              fill="none"
              stroke={color}
              strokeWidth="3"
              points={points.join(" ")}
            />

            {/* Data points */}
            {validData.map((d, i) => {
              const x = leftPadding + (i / Math.max(1, validData.length - 1)) * chartWidth;
              const valueRatio = yAxisMax > 0 ? (d.value - minValue) / yAxisMax : 0;
              const y = topPadding + chartHeight - valueRatio * chartHeight;
              
              // Ensure x and y are valid numbers
              const safeX = isNaN(x) ? leftPadding : x;
              const safeY = isNaN(y) ? topPadding + chartHeight : y;
              
              return (
                <g key={i}>
                  <circle
                    cx={safeX}
                    cy={safeY}
                    r="5"
                    fill={color}
                    stroke="white"
                    strokeWidth="2"
                    className="dark:stroke-[#191919]"
                  />
                </g>
              );
            })}

            {/* X-axis labels */}
            {validData.map((d, i) => {
              const x = leftPadding + (i / Math.max(1, validData.length - 1)) * chartWidth;
              const safeX = isNaN(x) ? leftPadding : x;
              return (
                <text
                  key={i}
                  x={safeX}
                  y={height - bottomPadding + 20}
                  textAnchor="middle"
                  className="text-xs fill-[#706C6B] dark:fill-[#C1A7A3]"
                >
                  {d.label}
                </text>
              );
            })}
          </svg>
        </div>
      </CardContent>
    </Card>
  );
};

