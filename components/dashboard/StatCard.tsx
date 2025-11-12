import React from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { StatCardProps } from "@/types";

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  icon,
  trend,
}) => {
  const formatValue = (val: string | number): string => {
    if (typeof val === "number") {
      return val.toLocaleString();
    }
    return val;
  };

  return (
    <Card hover className="h-full">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-1">
              {title}
            </p>
            <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
              {formatValue(value)}
            </p>
            {change && (
              <div className="flex items-center gap-1">
                <span
                  className={`text-sm font-medium ${
                    change.type === "increase"
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {change.type === "increase" ? "↑" : "↓"} {Math.abs(change.value)}%
                </span>
                <span className="text-sm text-zinc-500 dark:text-zinc-400">
                  vs {change.period}
                </span>
              </div>
            )}
          </div>
          {icon && (
            <div className="flex-shrink-0 p-3 rounded-lg bg-zinc-100 dark:bg-zinc-800">
              {icon}
            </div>
          )}
        </div>
        {trend && trend.length > 0 && (
          <div className="mt-4 h-12 flex items-end gap-1">
            {trend.map((point, index) => (
              <div
                key={index}
                className="flex-1 bg-zinc-200 dark:bg-zinc-700 rounded-t"
                style={{ height: `${(point / Math.max(...trend)) * 100}%` }}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

