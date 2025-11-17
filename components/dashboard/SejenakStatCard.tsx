import React from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { StatCardData } from "@/types/sejenak";

export const SejenakStatCard: React.FC<StatCardData> = ({
  title,
  value,
  icon,
  trend,
  trendType,
}) => {
  const formatValue = (val: string | number): string => {
    if (typeof val === "number") {
      return val.toLocaleString("id-ID");
    }
    return val;
  };

  // Ensure trend is always an array
  const trendArray = Array.isArray(trend) && trend.length > 0 ? trend : [0];
  
  const maxValue = Math.max(...trendArray);
  const minValue = Math.min(...trendArray);
  const range = maxValue - minValue || 1;

  return (
    <Card hover className="h-full">
      <CardContent className="p-2.5">
        <div className="mb-1">
          <div className="flex-shrink-0 p-0.5 rounded bg-[#F0EEED] dark:bg-[#3D3B3A] text-[#706C6B] dark:text-[#C1A7A3] w-fit mb-0.5">
            {icon}
          </div>
          <p className="text-xs font-medium text-[#706C6B] dark:text-[#C1A7A3]">
            {title}
          </p>
        </div>
        <p className="text-2xl font-bold text-[#191919] dark:text-[#F0EEED] mb-1">
          {formatValue(value)}
        </p>

        {/* Mini Trend Chart */}
        <div className="h-12 mt-4">
          {trendType === "bar" ? (
            <div className="flex items-end gap-1 h-full">
              {trendArray.map((point, index) => (
                <div
                  key={index}
                  className="flex-1 bg-[#C1A7A3] dark:bg-[#706C6B] rounded-t"
                  style={{
                    height: `${((point - minValue) / range) * 100}%`,
                    minHeight: "4px",
                  }}
                />
              ))}
            </div>
          ) : (
            <svg viewBox="0 0 200 40" className="w-full h-full">
              <defs>
                <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#C1A7A3" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#C1A7A3" stopOpacity="0" />
                </linearGradient>
              </defs>
              <polyline
                fill="url(#areaGradient)"
                stroke="#C1A7A3"
                strokeWidth="2"
                points={trendArray
                  .map(
                    (point, i) =>
                      `${(i / (trendArray.length - 1 || 1)) * 180 + 10},${38 - ((point - minValue) / range) * 30}`
                  )
                  .join(" ")}
              />
              <polyline
                fill="none"
                stroke="#C1A7A3"
                strokeWidth="2"
                points={trendArray
                  .map(
                    (point, i) =>
                      `${(i / (trendArray.length - 1 || 1)) * 180 + 10},${38 - ((point - minValue) / range) * 30}`
                  )
                  .join(" ")}
              />
            </svg>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

