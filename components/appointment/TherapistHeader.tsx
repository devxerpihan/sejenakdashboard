"use client";

import React from "react";
import { Therapist } from "@/types/appointment";
import { Avatar } from "@/components/ui/Avatar";

interface TherapistHeaderProps {
  therapist: Therapist;
}

export const TherapistHeader: React.FC<TherapistHeaderProps> = ({
  therapist,
}) => {
  return (
    <div className="h-16 flex items-center justify-center border-b border-r border-zinc-200 dark:border-zinc-800 px-4">
      <div className="flex flex-col items-center gap-1">
        <Avatar src={therapist.avatar} name={therapist.name} size="sm" />
        <span className="text-xs font-medium text-[#191919] dark:text-[#F0EEED] text-center">
          {therapist.name}
        </span>
      </div>
    </div>
  );
};

