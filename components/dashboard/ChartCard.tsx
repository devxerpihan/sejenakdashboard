import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";

interface ChartCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}

export const ChartCard: React.FC<ChartCardProps> = ({
  title,
  description,
  children,
  action,
}) => {
  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>{title}</CardTitle>
            {description && <CardDescription className="mt-1">{description}</CardDescription>}
          </div>
          {action && <div>{action}</div>}
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
};

// Simple Line Chart Component
interface SimpleLineChartProps {
  data: { label: string; value: number }[];
  color?: string;
}

export const SimpleLineChart: React.FC<SimpleLineChartProps> = ({
  data,
  color = "zinc",
}) => {
  const maxValue = Math.max(...data.map((d) => d.value));
  const minValue = Math.min(...data.map((d) => d.value));
  const range = maxValue - minValue || 1;

  return (
    <div className="h-64 w-full">
      <svg viewBox="0 0 400 200" className="w-full h-full">
        <polyline
          fill="none"
          stroke={`rgb(${color === "zinc" ? "63 63 70" : "59 130 246"})`}
          strokeWidth="2"
          points={data
            .map(
              (d, i) =>
                `${(i / (data.length - 1)) * 380 + 10},${190 - ((d.value - minValue) / range) * 170}`
            )
            .join(" ")}
        />
        {data.map((d, i) => (
          <circle
            key={i}
            cx={(i / (data.length - 1)) * 380 + 10}
            cy={190 - ((d.value - minValue) / range) * 170}
            r="3"
            fill={`rgb(${color === "zinc" ? "63 63 70" : "59 130 246"})`}
          />
        ))}
      </svg>
      <div className="flex justify-between text-xs text-zinc-500 dark:text-zinc-400 mt-2">
        {data.map((d, i) => (
          <span key={i}>{d.label}</span>
        ))}
      </div>
    </div>
  );
};

