import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { Therapist } from "@/types/sejenak";

interface TopTherapistListProps {
  therapists: Therapist[];
  title?: string;
}

export const TopTherapistList: React.FC<TopTherapistListProps> = ({
  therapists,
  title = "Top Therapist",
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4">
          {therapists.map((therapist) => (
            <div
              key={therapist.id}
              className="flex flex-col gap-2 p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-[#F0EEED] dark:hover:bg-[#3D3B3A]/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Avatar
                  src={therapist.avatar}
                  name={therapist.name}
                  size="lg"
                />
                <p className="font-medium text-[#191919] dark:text-[#F0EEED] text-sm">
                  {therapist.name}
                </p>
              </div>
              <p className="text-xs text-[#706C6B] dark:text-[#C1A7A3]">
                {therapist.bookings.toLocaleString()} Bookings
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

