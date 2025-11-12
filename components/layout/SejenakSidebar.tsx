"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NavItem } from "@/types/sejenak";
import { SortIcon, ChevronRightIcon } from "@/components/icons";

interface SejenakSidebarProps {
  navItems: NavItem[];
  isDarkMode: boolean;
  onDarkModeToggle: () => void;
}

export const SejenakSidebar: React.FC<SejenakSidebarProps> = ({
  navItems,
  isDarkMode,
  onDarkModeToggle,
}) => {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  // Initialize expanded items based on current pathname
  useEffect(() => {
    const findParentHref = (items: NavItem[], targetPath: string): string | null => {
      for (const item of items) {
        if (item.children) {
          for (const child of item.children) {
            if (child.href === targetPath) {
              return item.href;
            }
          }
          // Recursively check nested children if needed
          const parentHref = findParentHref(item.children, targetPath);
          if (parentHref) return item.href;
        }
      }
      return null;
    };

    const parentHref = findParentHref(navItems, pathname);
    if (parentHref) {
      setExpandedItems(new Set([parentHref]));
    }
  }, [pathname, navItems]);

  const toggleExpand = (href: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(href)) {
      newExpanded.delete(href);
    } else {
      newExpanded.add(href);
    }
    setExpandedItems(newExpanded);
  };

  const renderNavItem = (item: NavItem, level = 0) => {
    const isActive = pathname === item.href || (item.children && item.children.some(child => pathname === child.href));
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.has(item.href);
    const isSubItem = level > 0;

    return (
      <div key={item.href}>
        <div className="flex items-center">
          {hasChildren ? (
            <button
              onClick={() => {
                setIsMobileOpen(false);
                toggleExpand(item.href);
              }}
              className={`
                flex-1 flex items-center gap-3 px-4 py-2.5 rounded-lg
                text-sm font-medium transition-all duration-200
                      ${
                        isActive
                          ? "text-[#C1A7A3]"
                          : "text-[#706C6B] hover:bg-[#F0EEED] dark:text-[#C1A7A3] dark:hover:bg-[#3D3B3A]"
                      }
                ${level > 0 ? "ml-12" : ""}
              `}
            >
              {!isSubItem && <span className="flex-shrink-0">{item.icon}</span>}
              <span className="flex-1 text-left">{item.label}</span>
              <div className={`transition-transform ${isExpanded ? "rotate-90" : ""}`}>
                <ChevronRightIcon />
              </div>
            </button>
          ) : (
            <Link
              href={item.href}
              onClick={() => setIsMobileOpen(false)}
              className={`
                flex-1 flex items-center gap-3 px-4 py-2.5 rounded-lg
                text-sm font-medium transition-all duration-200
                      ${
                        isActive
                          ? "text-[#C1A7A3]"
                          : "text-[#706C6B] hover:bg-[#F0EEED] dark:text-[#C1A7A3] dark:hover:bg-[#3D3B3A]"
                      }
                ${level > 0 ? "ml-12" : ""}
              `}
            >
              {!isSubItem && <span className="flex-shrink-0">{item.icon}</span>}
              <span className="flex-1">{item.label}</span>
            </Link>
          )}
        </div>
        {hasChildren && isExpanded && (
          <div className="mt-1 space-y-1">
            {item.children!.map((child) => renderNavItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Mobile menu button */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white dark:bg-[#191919] border border-zinc-200 dark:border-zinc-800"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          {isMobileOpen ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          )}
        </svg>
      </button>

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static left-0 z-40
          w-64 bg-white dark:bg-[#191919] border-r border-zinc-200 dark:border-zinc-800
          transform transition-transform duration-200 ease-in-out
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          flex flex-col h-full
        `}
      >
        {/* Logo Section */}
        <div className="h-16 flex items-center px-3 mx-4 mt-4 rounded-lg border border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-3 w-full">
            <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
              <img 
                src="/images/logo minimalist.jpg" 
                alt="Sejenak Logo" 
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Fallback if image doesn't exist
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-[#191919] dark:text-[#F0EEED] truncate">
                Sejenak Beauty
              </p>
              <p className="text-xs text-[#706C6B] dark:text-[#C1A7A3] truncate">
                Islamic Village
              </p>
            </div>
            <button className="p-1.5 rounded-lg hover:bg-[#F0EEED] dark:hover:bg-[#3D3B3A] transition-colors">
              <SortIcon />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navItems.map((item) => renderNavItem(item))}
        </nav>

        {/* Dark Mode Toggle */}
        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800">
          <button
            onClick={onDarkModeToggle}
            className="w-full flex items-center justify-between px-4 py-2.5 rounded-lg bg-[#F0EEED] dark:bg-[#3D3B3A] hover:bg-[#DCCAB7] dark:hover:bg-[#5A5756] transition-colors"
          >
            <span className="text-sm font-medium text-[#191919] dark:text-[#F0EEED]">
              Dark Mode
            </span>
            <div
              className={`w-12 h-6 rounded-full transition-colors ${
                isDarkMode ? "bg-[#191919] dark:bg-[#F0EEED]" : "bg-[#C1A7A3]"
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white dark:bg-[#191919] transition-transform ${
                  isDarkMode ? "translate-x-6" : "translate-x-0.5"
                } mt-0.5`}
              />
            </div>
          </button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
    </>
  );
};

