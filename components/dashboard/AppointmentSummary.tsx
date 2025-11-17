import React from "react";
import { Card, CardContent } from "@/components/ui/Card";

interface AppointmentSummaryProps {
  all: number;
  cancelled: number;
  completed: number;
}

export const AppointmentSummary: React.FC<AppointmentSummaryProps> = ({
  all,
  cancelled,
  completed,
}) => {
  // Ensure values are numbers
  const allCount = typeof all === "number" ? all : 0;
  const cancelledCount = typeof cancelled === "number" ? cancelled : 0;
  const completedCount = typeof completed === "number" ? completed : 0;

  const cards = [
    {
      label: "All Appointments",
      value: allCount,
      color: "bg-blue-500",
      dotColor: "bg-blue-500",
    },
    {
      label: "Cancelled",
      value: cancelledCount,
      color: "bg-orange-500",
      dotColor: "bg-orange-500",
    },
    {
      label: "Completed",
      value: completedCount,
      color: "bg-red-500",
      dotColor: "bg-red-500",
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-1.5 mb-2">
      {cards.map((card, index) => (
        <Card key={index} hover>
          <CardContent className="px-1 py-0.5">
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-1 mb-0.5">
                <div className={`w-1.5 h-1.5 rounded-full ${card.dotColor}`} />
                <p className="text-xs text-[#706C6B] dark:text-[#C1A7A3]">
                  {card.label}
                </p>
              </div>
              <p className="text-2xl font-bold text-[#191919] dark:text-[#F0EEED]">
                {card.value.toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

