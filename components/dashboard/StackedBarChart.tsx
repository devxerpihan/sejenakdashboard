"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { AppointmentData } from "@/types/sejenak";

interface StackedBarChartProps {
  data: AppointmentData[];
  title?: string;
}

export const StackedBarChart: React.FC<StackedBarChartProps> = ({
  data,
  title = "Appointment Statistics",
}) => {
  const maxValue = Math.max(
    ...data.map((d) => d.completed + d.cancelled)
  );
  const yAxisMax = Math.ceil(maxValue / 1000) * 1000; // Round up to nearest 1000
  const yAxisSteps = 5;
  const stepValue = yAxisMax / yAxisSteps;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <div className="mt-2 border-b border-zinc-200 dark:border-zinc-800" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Chart */}
          <div className="relative">
            {/* Y-axis labels */}
            <div className="absolute left-0 top-0 bottom-8 flex flex-col justify-between text-xs text-[#706C6B] dark:text-[#C1A7A3] pr-2">
              {Array.from({ length: yAxisSteps + 1 })
                .reverse()
                .map((_, i) => (
                  <span key={i}>
                    {((i * stepValue) / 1000).toFixed(0)}K
                  </span>
                ))}
            </div>

            {/* Chart area */}
            <div className="ml-12">
              <div className="relative h-64 flex items-end gap-2">
                {data.map((item, index) => {
                  const total = item.completed + item.cancelled;
                  const completedHeight = (item.completed / yAxisMax) * 100;
                  const cancelledHeight = (item.cancelled / yAxisMax) * 100;

                  return (
                    <div
                      key={index}
                      className="flex-1 flex flex-col justify-end gap-0.5"
                    >
                      <div
                        className="bg-[#C1A7A3] rounded-t"
                        style={{ height: `${completedHeight}%` }}
                      />
                      <div
                        className="bg-[#DCCAB7] dark:bg-[#A88F8B] rounded-t"
                        style={{ height: `${cancelledHeight}%` }}
                      />
                    </div>
                  );
                })}
              </div>

              {/* X-axis labels */}
              <div className="flex justify-between mt-2 text-xs text-[#706C6B] dark:text-[#C1A7A3]">
                {data.map((item, index) => (
                  <span key={index} className="flex-1 text-center">
                    {item.month}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Legend - Below the chart */}
          <div className="flex items-center gap-6 text-sm justify-center">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-[#C1A7A3] rounded" />
              <span className="text-[#706C6B] dark:text-[#C1A7A3]">Completed</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-[#DCCAB7] rounded" />
              <span className="text-[#706C6B] dark:text-[#C1A7A3]">Canceled</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

