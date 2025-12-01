"use client";

import React from "react";
import Link from "next/link";

interface BreadcrumbItem {
  label: string;
  href?: string;
  onClick?: (e: React.MouseEvent) => void;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items }) => {
  return (
    <nav className="flex items-center gap-2 text-sm mb-4">
      {items.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && (
            <span className="text-[#706C6B] dark:text-[#C1A7A3]">/</span>
          )}
          {item.href || item.onClick ? (
            item.onClick ? (
              <button
                onClick={item.onClick}
                className="text-[#706C6B] dark:text-[#C1A7A3] hover:text-[#191919] dark:hover:text-[#F0EEED] transition-colors"
              >
                {item.label}
              </button>
            ) : (
              <Link
                href={item.href!}
                className="text-[#706C6B] dark:text-[#C1A7A3] hover:text-[#191919] dark:hover:text-[#F0EEED] transition-colors"
              >
                {item.label}
              </Link>
            )
          ) : (
            <span
              className={
                index === items.length - 1
                  ? "text-[#191919] dark:text-[#F0EEED] font-medium"
                  : "text-[#706C6B] dark:text-[#C1A7A3]"
              }
            >
              {item.label}
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

