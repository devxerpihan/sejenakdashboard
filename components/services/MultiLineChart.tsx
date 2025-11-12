"use client";

import React from "react";

interface LineSeries {
  label: string;
  data: number[];
  color: string;
}

interface MultiLineChartProps {
  series: LineSeries[];
  labels: string[];
  yAxisMin?: number;
  yAxisMax?: number;
  yAxisStep?: number;
}

export const MultiLineChart: React.FC<MultiLineChartProps> = ({
  series,
  labels,
  yAxisMin,
  yAxisMax,
  yAxisStep,
}) => {
  // Calculate max and min values across all series
  const allValues = series.flatMap((s) => s.data);
  const maxValue = yAxisMax ?? Math.max(...allValues);
  const minValue = yAxisMin ?? 0;
  const range = maxValue - minValue || 1;

  const width = 600;
  const height = 300;
  const padding = 50;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  // Calculate Y-axis steps
  const step = yAxisStep ?? Math.ceil(maxValue / 5);
  const yAxisSteps = Math.ceil(maxValue / step);

  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
        {/* Y-axis grid lines and labels */}
        {Array.from({ length: yAxisSteps + 1 }).map((_, i) => {
          const value = i * step;
          const y =
            padding +
            chartHeight -
            ((value - minValue) / range) * chartHeight;
          return (
            <g key={i}>
              <line
                x1={padding}
                y1={y}
                x2={width - padding}
                y2={y}
                stroke="#E5E7EB"
                strokeWidth="1"
                strokeDasharray="4 4"
                className="dark:stroke-zinc-700"
              />
              <text
                x={padding - 10}
                y={y + 4}
                textAnchor="end"
                className="text-xs fill-[#706C6B] dark:fill-[#C1A7A3]"
              >
                {value}
              </text>
            </g>
          );
        })}

        {/* Draw each line series */}
        {series.map((lineSeries, seriesIndex) => {
          const points = lineSeries.data.map(
            (value, i) =>
              `${padding + (i / (labels.length - 1)) * chartWidth},${
                padding +
                chartHeight -
                ((value - minValue) / range) * chartHeight
              }`
          );

          // Create gradient for area fill
          const gradientId = `gradient-${seriesIndex}`;
          const areaPoints = [
            `${padding},${padding + chartHeight}`,
            ...points,
            `${padding + chartWidth},${padding + chartHeight}`,
          ].join(" ");

          return (
            <g key={seriesIndex}>
              {/* Area fill */}
              <defs>
                <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor={lineSeries.color} stopOpacity="0.3" />
                  <stop offset="100%" stopColor={lineSeries.color} stopOpacity="0" />
                </linearGradient>
              </defs>
              <polygon
                points={areaPoints}
                fill={`url(#${gradientId})`}
              />
              
              {/* Line */}
              <polyline
                fill="none"
                stroke={lineSeries.color}
                strokeWidth="3"
                points={points.join(" ")}
              />

              {/* Data points */}
              {lineSeries.data.map((value, i) => {
                const x = padding + (i / (labels.length - 1)) * chartWidth;
                const y =
                  padding +
                  chartHeight -
                  ((value - minValue) / range) * chartHeight;
                return (
                  <circle
                    key={i}
                    cx={x}
                    cy={y}
                    r="4"
                    fill={lineSeries.color}
                    stroke="white"
                    strokeWidth="2"
                    className="dark:stroke-[#191919]"
                  />
                );
              })}
            </g>
          );
        })}

        {/* X-axis labels */}
        {labels.map((label, i) => {
          const x = padding + (i / (labels.length - 1)) * chartWidth;
          return (
            <text
              key={i}
              x={x}
              y={height - padding + 20}
              textAnchor="middle"
              className="text-xs fill-[#706C6B] dark:fill-[#C1A7A3]"
            >
              {label}
            </text>
          );
        })}
      </svg>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-4">
        {series.map((lineSeries, index) => (
          <div key={index} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: lineSeries.color }}
            />
            <span className="text-xs text-[#706C6B] dark:text-[#C1A7A3]">
              {lineSeries.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

