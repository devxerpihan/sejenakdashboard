import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

interface QuickAction {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  variant?: "primary" | "secondary" | "outline";
}

interface QuickActionsProps {
  actions: QuickAction[];
  title?: string;
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  actions,
  title = "Quick Actions",
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {actions.map((action, index) => (
            <Button
              key={index}
              variant={action.variant || "outline"}
              className="flex flex-col items-center gap-2 h-auto py-4"
              onClick={action.onClick}
            >
              <span className="text-xl">{action.icon}</span>
              <span className="text-xs">{action.label}</span>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

