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
  // Validate data
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-[#706C6B] dark:text-[#C1A7A3]">
            No appointment data available
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate max value safely
  const values = data.map((d) => (d.completed || 0) + (d.cancelled || 0));
  const maxValue = values.length > 0 ? Math.max(...values) : 0;
  
  
  // Calculate Y-axis with smart step sizing to avoid crowding
  const maxLabels = 5;
  
  // For maxValue of 663, we want yAxisMax to be around 700-800
  // Calculate appropriate step size
  let yAxisMax: number;
  let stepValue: number;
  let yAxisSteps: number;
  
  if (maxValue <= 0) {
    yAxisMax = 1000;
    stepValue = 200;
    yAxisSteps = 5;
  } else {
    // Round up to a nice number above maxValue
    if (maxValue <= 100) {
      yAxisMax = Math.ceil(maxValue / 20) * 20;
      stepValue = 20;
    } else if (maxValue <= 500) {
      yAxisMax = Math.ceil(maxValue / 100) * 100;
      stepValue = 100;
    } else if (maxValue <= 1000) {
      yAxisMax = Math.ceil(maxValue / 200) * 200;
      stepValue = 200;
    } else {
      yAxisMax = Math.ceil(maxValue / 1000) * 1000;
      stepValue = yAxisMax / maxLabels;
    }
    yAxisSteps = Math.min(maxLabels, Math.ceil(yAxisMax / stepValue));
  }
  

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
                .map((_, i) => {
                  // Calculate value from top to bottom (highest to lowest)
                  // i=0 should be max, i=last should be 0
                  const value = (yAxisSteps - i) * stepValue;
                  // Format number nicely - use K for thousands, or show as-is for smaller numbers
                  const formattedValue = value >= 1000 
                    ? `${(value / 1000).toFixed(value % 1000 === 0 ? 0 : 1)}K`
                    : value.toString();
                  return (
                    <span key={i}>
                      {formattedValue}
                    </span>
                  );
                })}
            </div>

            {/* Chart area */}
            <div className="ml-12">
              <div className="relative h-64 flex items-end gap-2" style={{ minHeight: '256px' }}>
                {data.map((item, index) => {
                  const completed = Number(item.completed) || 0;
                  const cancelled = Number(item.cancelled) || 0;
                  const total = completed + cancelled;
                  const completedHeight = yAxisMax > 0 ? (completed / yAxisMax) * 100 : 0;
                  const cancelledHeight = yAxisMax > 0 ? (cancelled / yAxisMax) * 100 : 0;

                  return (
                    <div
                      key={index}
                      className="flex-1 flex flex-col justify-end gap-0.5 h-full"
                      title={`${item.month}: ${completed} completed, ${cancelled} cancelled`}
                    >
                      {completed > 0 && (
                        <div
                          className="bg-[#C1A7A3] rounded-t transition-all w-full"
                          style={{ 
                            height: `${completedHeight}%`,
                            minHeight: completedHeight > 0 && completedHeight < 1 ? '4px' : undefined,
                          }}
                        />
                      )}
                      {cancelled > 0 && (
                        <div
                          className="bg-[#DCCAB7] dark:bg-[#A88F8B] rounded-t transition-all w-full"
                          style={{ 
                            height: `${cancelledHeight}%`,
                            minHeight: cancelledHeight > 0 && cancelledHeight < 1 ? '4px' : undefined,
                          }}
                        />
                      )}
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

