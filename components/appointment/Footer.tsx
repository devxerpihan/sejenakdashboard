"use client";

import React from "react";

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <div className="py-4 px-6 text-center bg-white dark:bg-[#191919]">
      <p className="text-sm text-[#706C6B] dark:text-[#C1A7A3]">
        {currentYear} © Sejenak Beauty Lounge, All Rights Reserved
      </p>
    </div>
  );
};

