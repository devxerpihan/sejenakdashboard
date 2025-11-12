"use client";

import React from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

interface DashboardLayoutProps {
  children: React.ReactNode;
  navItems: NavItem[];
  headerTitle?: string;
  headerActions?: React.ReactNode;
  user?: {
    name: string;
    email?: string;
    avatar?: string;
  };
  logo?: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  navItems,
  headerTitle,
  headerActions,
  user,
  logo,
}) => {
  return (
    <div className="flex h-screen bg-zinc-50 dark:bg-zinc-950 overflow-hidden">
      <Sidebar navItems={navItems} logo={logo} />
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
        <Header
          title={headerTitle}
          user={user}
          actions={headerActions}
        />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

