"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";

interface BarGroup {
  label: string;
  values: { label: string; value: number; color: string }[];
}

interface GroupedBarChartProps {
  data: BarGroup[];
  yAxisMin?: number;
  yAxisMax?: number;
  yAxisStep?: number;
  title?: string;
}

export const GroupedBarChart: React.FC<GroupedBarChartProps> = ({
  data,
  yAxisMin,
  yAxisMax,
  yAxisStep,
  title,
}) => {
  // Calculate max value across all groups
  const allValues = data.flatMap((group) => group.values.map((v) => v.value));
  const maxValue = yAxisMax ?? Math.max(...allValues);
  const minValue = yAxisMin ?? 0;
  const range = maxValue - minValue || 1;

  // Calculate Y-axis steps
  const step = yAxisStep ?? Math.ceil(maxValue / 5);
  const yAxisSteps = Math.ceil(maxValue / step);

  // Get all unique series labels for legend
  const seriesLabels = Array.from(
    new Set(data.flatMap((group) => group.values.map((v) => v.label)))
  );
  const seriesColors = data[0]?.values.map((v) => v.color) || [];

  return (
    <Card>
      {title && (
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent>
        <div className="space-y-4">
          {/* Chart */}
          <div className="relative">
            {/* Y-axis labels */}
            <div className="absolute left-0 top-0 bottom-8 flex flex-col justify-between text-xs text-[#706C6B] dark:text-[#C1A7A3] pr-2">
              {Array.from({ length: yAxisSteps + 1 })
                .reverse()
                .map((_, i) => (
                  <span key={i}>{i * step}</span>
                ))}
            </div>

            {/* Chart area */}
            <div className="ml-12">
              <div className="relative h-64 flex items-end gap-2">
                {data.map((group, groupIndex) => {
                  const barWidth = 100 / data.length;
                  const gap = 2;
                  const barGroupWidth = barWidth - gap;

                  return (
                    <div
                      key={groupIndex}
                      className="flex-1 flex items-end gap-1"
                    >
                      {group.values.map((bar, barIndex) => {
                        const barHeight = (bar.value / maxValue) * 100;
                        return (
                          <div
                            key={barIndex}
                            className="flex-1 rounded-t"
                            style={{
                              height: `${barHeight}%`,
                              backgroundColor: bar.color,
                              minHeight: barHeight > 0 ? "2px" : "0",
                            }}
                          />
                        );
                      })}
                    </div>
                  );
                })}
              </div>

              {/* X-axis labels */}
              <div className="flex justify-between mt-2 text-xs text-[#706C6B] dark:text-[#C1A7A3]">
                {data.map((group, index) => (
                  <span key={index} className="flex-1 text-center">
                    {group.label}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-6 text-sm justify-center">
            {seriesLabels.map((label, index) => (
              <div key={index} className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: seriesColors[index] }}
                />
                <span className="text-[#706C6B] dark:text-[#C1A7A3]">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

