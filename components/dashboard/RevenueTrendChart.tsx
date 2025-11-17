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
  const maxValue = Math.max(...data.map((d) => d.value));
  const minValue = 0;
  const range = maxValue - minValue || 1;

  // Calculate Y-axis steps (0 to max in increments)
  const yAxisMax = Math.ceil(maxValue / 8000000) * 8000000; // Round up to nearest 8M
  const yAxisStep = 8000000;
  const yAxisSteps = yAxisMax / yAxisStep;

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
  const points = data.map(
    (d, i) =>
      `${leftPadding + (i / (data.length - 1)) * chartWidth},${
        topPadding + chartHeight - ((d.value - minValue) / yAxisMax) * chartHeight
      }`
  );

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
              const y =
                topPadding +
                chartHeight -
                ((value - minValue) / yAxisMax) * chartHeight;
              return (
                <g key={i}>
                  <line
                    x1={leftPadding}
                    y1={y}
                    x2={leftPadding + chartWidth}
                    y2={y}
                    stroke="#E5E7EB"
                    strokeWidth="1"
                    strokeDasharray="4 4"
                    className="dark:stroke-zinc-700"
                  />
                  <text
                    x={leftPadding - 10}
                    y={y + 4}
                    textAnchor="end"
                    className="text-xs fill-[#706C6B] dark:fill-[#C1A7A3]"
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
            {data.map((d, i) => {
              const x = leftPadding + (i / (data.length - 1)) * chartWidth;
              const y =
                topPadding +
                chartHeight -
                ((d.value - minValue) / yAxisMax) * chartHeight;
              return (
                <g key={i}>
                  <circle
                    cx={x}
                    cy={y}
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
            {data.map((d, i) => {
              const x = leftPadding + (i / (data.length - 1)) * chartWidth;
              return (
                <text
                  key={i}
                  x={x}
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

