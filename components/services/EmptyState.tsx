"use client";

import React from "react";
import Image from "next/image";

interface EmptyStateProps {
  message?: string;
  imageSrc?: string;
  imageAlt?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  message = "No data yet",
  imageSrc = "/assets/No Shift Available.png",
  imageAlt = "No data",
}) => {
  return (
    <div className="bg-white dark:bg-[#191919] rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden">
      <div className="flex flex-col items-center justify-center py-16 px-6 min-h-[400px]">
        <div className="mb-6 max-w-md">
          <Image
            src={imageSrc}
            alt={imageAlt}
            width={400}
            height={400}
            className="object-contain w-full h-auto"
            unoptimized
          />
        </div>
        <p className="text-sm text-[#706C6B] dark:text-[#C1A7A3] text-center">
          {message}
        </p>
      </div>
    </div>
  );
};

