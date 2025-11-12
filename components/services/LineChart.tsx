"use client";

import React from "react";

interface LineChartData {
  label: string;
  value: number;
}

interface LineChartProps {
  data: LineChartData[];
  yAxisMin?: number;
  yAxisMax?: number;
  color?: string;
}

export const LineChart: React.FC<LineChartProps> = ({
  data,
  yAxisMin,
  yAxisMax,
  color = "#C1A7A3",
}) => {
  const maxValue = yAxisMax ?? Math.max(...data.map((d) => d.value));
  const minValue = yAxisMin ?? Math.min(...data.map((d) => d.value));
  const range = maxValue - minValue || 1;

  const width = 600;
  const height = 300;
  const padding = 40;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  const points = data.map(
    (d, i) =>
      `${padding + (i / (data.length - 1)) * chartWidth},${
        padding + chartHeight - ((d.value - minValue) / range) * chartHeight
      }`
  );

  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
        {/* Y-axis labels */}
        {[0, 1, 2, 3, 4, 5].map((val) => {
          const y =
            padding +
            chartHeight -
            ((val - minValue) / range) * chartHeight;
          return (
            <g key={val}>
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
                {val}
              </text>
            </g>
          );
        })}

        {/* Line */}
        <polyline
          fill="none"
          stroke={color}
          strokeWidth="3"
          points={points.join(" ")}
        />

        {/* Data points */}
        {data.map((d, i) => {
          const x = padding + (i / (data.length - 1)) * chartWidth;
          const y =
            padding +
            chartHeight -
            ((d.value - minValue) / range) * chartHeight;
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r="5"
              fill={color}
              stroke="white"
              strokeWidth="2"
              className="dark:stroke-[#191919]"
            />
          );
        })}

        {/* X-axis labels */}
        {data.map((d, i) => {
          const x = padding + (i / (data.length - 1)) * chartWidth;
          return (
            <text
              key={i}
              x={x}
              y={height - padding + 20}
              textAnchor="middle"
              className="text-xs fill-[#706C6B] dark:fill-[#C1A7A3]"
            >
              {d.label}
            </text>
          );
        })}
      </svg>
    </div>
  );
};

