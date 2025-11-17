"use client";

import React, { useState } from "react";
import { SejenakSidebar } from "./SejenakSidebar";
import { TopHeaderBar, OverviewBar } from "./SejenakHeader";
import { NavItem } from "@/types/sejenak";

interface SejenakDashboardLayoutProps {
  children: React.ReactNode;
  navItems: NavItem[];
  headerTitle: string;
  location: string;
  locations: string[];
  onLocationChange: (location: string) => void;
  dateRange: { start: Date; end: Date };
  onDateRangeChange: (direction: "prev" | "next") => void;
  onPeriodChange?: (period: import("@/components/ui/DateRangePicker").PeriodType, start: Date, end: Date) => void;
  isDarkMode: boolean;
  onDarkModeToggle: () => void;
  viewSwitcher?: React.ReactNode;
  customHeader?: React.ReactNode;
  footer?: React.ReactNode;
}

export const SejenakDashboardLayout: React.FC<SejenakDashboardLayoutProps> = ({
  children,
  navItems,
  headerTitle,
  location,
  locations,
  onLocationChange,
  dateRange,
  onDateRangeChange,
  onPeriodChange,
  isDarkMode,
  onDarkModeToggle,
  viewSwitcher,
  customHeader,
  footer,
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="flex flex-col h-screen bg-zinc-50 dark:bg-zinc-950 overflow-hidden">
      {/* Top Header Bar - Full width */}
      <TopHeaderBar 
        onSidebarToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        isSidebarOpen={isSidebarOpen}
      />
      
      {/* Content area: Sidebar and main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Full height on left */}
        {isSidebarOpen && (
          <SejenakSidebar
            navItems={navItems}
            isDarkMode={isDarkMode}
            onDarkModeToggle={onDarkModeToggle}
          />
        )}
        {/* Right side: Overview bar and main content */}
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Header - Custom or default OverviewBar */}
          {customHeader !== undefined ? (
            customHeader
          ) : (
            <OverviewBar
              title={headerTitle}
              location={location}
              locations={locations}
              onLocationChange={onLocationChange}
              dateRange={dateRange}
              onDateRangeChange={onDateRangeChange}
              onPeriodChange={onPeriodChange}
              viewSwitcher={viewSwitcher}
            />
          )}
          {/* Main content */}
          <main className="flex-1 overflow-y-auto flex flex-col min-h-0">
            <div className="flex-1 p-6">{children}</div>
            {/* Footer - inside scrollable content, at bottom */}
            {footer && (
              <div className="border-t border-zinc-200 dark:border-zinc-800 mt-auto w-full">
                {footer}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

