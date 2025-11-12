"use client";

import React from "react";
import { Avatar } from "@/components/ui/Avatar";
import {
  SearchIcon,
  GridIcon,
  CalendarIcon,
  SettingsIcon,
} from "@/components/icons";
import { DateRangePicker } from "@/components/ui/DateRangePicker";
import { LocationSelector } from "@/components/ui/LocationSelector";

interface SejenakHeaderProps {
  title: string;
  location: string;
  locations: string[];
  onLocationChange: (location: string) => void;
  dateRange: { start: Date; end: Date };
  onDateRangeChange: (direction: "prev" | "next") => void;
  user?: {
    name: string;
    email?: string;
    avatar?: string;
  };
}

// Top Header Bar - Full width
export const TopHeaderBar: React.FC<{
  user?: {
    name: string;
    email?: string;
    avatar?: string;
  };
  onSidebarToggle?: () => void;
  isSidebarOpen?: boolean;
}> = ({ user, onSidebarToggle, isSidebarOpen = true }) => {
  return (
    <div className="h-16 flex items-center border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#191919]">
      {/* Logo on far left */}
      <div className="flex items-center px-6 h-full">
        <img 
          src="/images/Logo Baru Sejenak-03.png" 
          alt="Sejenak Logo" 
          className="h-40 w-auto"
          onError={(e) => {
            // Fallback if image doesn't exist
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
      </div>
      
      {/* Search area - starts after sidebar width (256px = w-64) */}
      <div 
        className="flex items-center gap-3 pl-4 flex-1"
        style={{ marginLeft: isSidebarOpen ? '0' : '0' }}
      >
        {/* Sidebar toggle button */}
        <button
          onClick={onSidebarToggle}
          className="p-2 rounded-full bg-[#F0EEED] dark:bg-[#3D3B3A] hover:bg-[#DCCAB7] dark:hover:bg-[#5A5756] transition-colors flex-shrink-0"
          aria-label="Toggle sidebar"
        >
          <svg
            className="w-4 h-4 text-[#706C6B] dark:text-[#C1A7A3]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d={isSidebarOpen ? "M15 19l-7-7 7-7" : "M9 5l7 7-7 7"}
            />
          </svg>
        </button>
        
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#706C6B]">
            <SearchIcon />
          </div>
          <input
            type="text"
            placeholder="Search"
            className="w-full pl-10 pr-10 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-[#191919] text-[#191919] dark:text-[#F0EEED] placeholder-[#706C6B] focus:outline-none focus:ring-2 focus:ring-[#C1A7A3]"
          />
          <button className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded hover:bg-[#F0EEED] dark:hover:bg-[#3D3B3A] transition-colors">
            <GridIcon />
          </button>
        </div>
      </div>

      {/* Right Icons */}
      <div className="flex items-center gap-2 px-6">
        <button className="p-2 rounded-lg hover:bg-[#F0EEED] dark:hover:bg-[#3D3B3A] transition-colors">
          <CalendarIcon />
        </button>
        <button className="p-2 rounded-lg hover:bg-[#F0EEED] dark:hover:bg-[#3D3B3A] transition-colors">
          <SettingsIcon />
        </button>
        <button className="relative p-2 rounded-lg hover:bg-[#F0EEED] dark:hover:bg-[#3D3B3A] transition-colors">
          <svg
            className="w-5 h-5 text-[#706C6B] dark:text-[#C1A7A3]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
          <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full" />
        </button>
        {user && (
          <Avatar src={user.avatar} name={user.name} size="md" />
        )}
      </div>
    </div>
  );
};

// Overview Bar - Starts from sidebar edge
export const OverviewBar: React.FC<{
  title: string;
  location: string;
  locations: string[];
  onLocationChange: (location: string) => void;
  dateRange: { start: Date; end: Date };
  onDateRangeChange: (direction: "prev" | "next") => void;
  viewSwitcher?: React.ReactNode;
}> = ({
  title,
  location,
  locations,
  onLocationChange,
  dateRange,
  onDateRangeChange,
  viewSwitcher,
}) => {
  return (
    <div className="px-6 py-4 flex items-center justify-between">
      <h1 className="text-2xl font-bold text-[#191919] dark:text-[#F0EEED]">
        {title}
      </h1>
      <div className="flex items-center gap-4">
        <LocationSelector
          location={location}
          locations={locations}
          onChange={onLocationChange}
        />
        <DateRangePicker
          startDate={dateRange.start}
          endDate={dateRange.end}
          onNavigate={onDateRangeChange}
        />
        {viewSwitcher}
      </div>
    </div>
  );
};

// Keep the old component for backwards compatibility
export const SejenakHeader: React.FC<SejenakHeaderProps> = ({
  title,
  location,
  locations,
  onLocationChange,
  dateRange,
  onDateRangeChange,
  user,
}) => {
  return (
    <>
      <TopHeaderBar user={user} />
      <OverviewBar
        title={title}
        location={location}
        locations={locations}
        onLocationChange={onLocationChange}
        dateRange={dateRange}
        onDateRangeChange={onDateRangeChange}
      />
    </>
  );
};

