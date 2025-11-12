"use client";

import React from "react";

interface Tab {
  id: string;
  label: string;
  count?: number;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export const Tabs: React.FC<TabsProps> = ({ tabs, activeTab, onTabChange }) => {
  return (
    <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800 mb-6">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`
            px-4 py-2 text-sm font-medium transition-colors relative
            ${
              activeTab === tab.id
                ? "text-[#C1A7A3] border-b-2 border-[#C1A7A3]"
                : "text-[#706C6B] dark:text-[#C1A7A3] hover:text-[#191919] dark:hover:text-[#F0EEED]"
            }
          `}
        >
          {tab.label}
          {tab.count !== undefined && (
            <span className="ml-2 text-xs">({tab.count})</span>
          )}
        </button>
      ))}
    </div>
  );
};

