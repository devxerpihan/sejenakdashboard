"use client";

import React from "react";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";

interface HeaderProps {
  title?: string;
  user?: {
    name: string;
    email?: string;
    avatar?: string;
  };
  actions?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({
  title = "Dashboard",
  user,
  actions,
}) => {
  return (
    <header className="sticky top-0 z-30 h-16 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm border-b border-zinc-200 dark:border-zinc-800">
      <div className="flex items-center justify-between h-full px-6">
        <div>
          <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
            {title}
          </h1>
        </div>

        <div className="flex items-center gap-4">
          {actions}

          {/* Notifications */}
          <button className="relative p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
            <svg
              className="w-5 h-5 text-zinc-600 dark:text-zinc-400"
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

          {/* User menu */}
          {user && (
            <div className="flex items-center gap-3">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                  {user.name}
                </p>
                {user.email && (
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {user.email}
                  </p>
                )}
              </div>
              <Avatar src={user.avatar} name={user.name} size="md" />
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

