import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ActivityItem } from "@/types";

interface ActivityFeedProps {
  activities: ActivityItem[];
  title?: string;
  maxItems?: number;
}

const typeToBadgeVariant = {
  info: "info" as const,
  success: "success" as const,
  warning: "warning" as const,
  error: "error" as const,
};

export const ActivityFeed: React.FC<ActivityFeedProps> = ({
  activities,
  title = "Recent Activity",
  maxItems = 5,
}) => {
  const displayActivities = activities.slice(0, maxItems);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {displayActivities.map((activity) => (
            <div
              key={activity.id}
              className="flex gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800 last:border-0 last:pb-0"
            >
              <div className="flex-shrink-0">
                <div
                  className={`w-2 h-2 rounded-full mt-2 ${
                    activity.type === "success"
                      ? "bg-green-500"
                      : activity.type === "warning"
                      ? "bg-yellow-500"
                      : activity.type === "error"
                      ? "bg-red-500"
                      : "bg-blue-500"
                  }`}
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                    {activity.title}
                  </p>
                  <Badge variant={typeToBadgeVariant[activity.type]}>
                    {activity.type}
                  </Badge>
                </div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">
                  {activity.description}
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-500">
                  {activity.time}
                </p>
              </div>
            </div>
          ))}
          {activities.length === 0 && (
            <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center py-8">
              No activities yet
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

