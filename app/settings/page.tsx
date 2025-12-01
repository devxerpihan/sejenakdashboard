"use client";

import React, { useState, useEffect } from "react";
import { SejenakDashboardLayout } from "@/components/layout/SejenakDashboardLayout";
import { Footer } from "@/components/layout";
import { Breadcrumbs } from "@/components/services";
import { navItems } from "@/config/navigation";

export default function SettingsPage() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("darkMode");
      return saved === "true";
    }
    return false;
  });

  const [location, setLocation] = useState("Islamic Village");

  // Apply dark mode class to HTML element and save to localStorage
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("darkMode", "true");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("darkMode", "false");
    }
  }, [isDarkMode]);

  const locations = ["Islamic Village", "Location 2", "Location 3"];

  return (
    <SejenakDashboardLayout
      navItems={navItems}
      headerTitle=""
      location={location}
      locations={locations}
      onLocationChange={setLocation}
      dateRange={{
        start: new Date(),
        end: new Date(),
      }}
      onDateRangeChange={() => {}}
      isDarkMode={isDarkMode}
      onDarkModeToggle={() => {
        setIsDarkMode((prev) => !prev);
      }}
      customHeader={null}
      footer={<Footer />}
    >
      <div>
        {/* Breadcrumbs */}
        <Breadcrumbs
          items={[
            { label: "Settings" },
          ]}
        />

        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-[#191919] dark:text-[#F0EEED]">
            Settings
          </h1>
          <p className="text-sm text-[#706C6B] dark:text-[#C1A7A3] mt-2">
            Manage your account settings and preferences
          </p>
        </div>

        {/* Settings Content */}
        <div className="space-y-6">
          {/* Settings Sections */}
          <div className="bg-white dark:bg-[#2A2A2A] rounded-lg border border-[#E5E7EB] dark:border-[#404040] p-6">
            <h2 className="text-xl font-semibold text-[#191919] dark:text-[#F0EEED] mb-4">
              Settings Sections
            </h2>
            <div className="space-y-4">
              <div className="p-4 border border-[#E5E7EB] dark:border-[#404040] rounded-lg hover:bg-[#F9FAFB] dark:hover:bg-[#333333] transition-colors">
                <h3 className="font-medium text-[#191919] dark:text-[#F0EEED] mb-1">
                  Notification Settings
                </h3>
                <p className="text-sm text-[#706C6B] dark:text-[#C1A7A3]">
                  Configure your notification preferences
                </p>
                <a
                  href="/settings/notification"
                  className="text-sm text-[#C1A7A3] hover:text-[#A8928E] mt-2 inline-block"
                >
                  Manage notifications →
                </a>
              </div>

              <div className="p-4 border border-[#E5E7EB] dark:border-[#404040] rounded-lg hover:bg-[#F9FAFB] dark:hover:bg-[#333333] transition-colors">
                <h3 className="font-medium text-[#191919] dark:text-[#F0EEED] mb-1">
                  Account Settings
                </h3>
                <p className="text-sm text-[#706C6B] dark:text-[#C1A7A3]">
                  Manage your account information and security
                </p>
                <a
                  href="/settings/account"
                  className="text-sm text-[#C1A7A3] hover:text-[#A8928E] mt-2 inline-block"
                >
                  Manage account →
                </a>
              </div>

              <div className="p-4 border border-[#E5E7EB] dark:border-[#404040] rounded-lg hover:bg-[#F9FAFB] dark:hover:bg-[#333333] transition-colors">
                <h3 className="font-medium text-[#191919] dark:text-[#F0EEED] mb-1">
                  Preferences
                </h3>
                <p className="text-sm text-[#706C6B] dark:text-[#C1A7A3]">
                  Customize your dashboard preferences and display options
                </p>
                <a
                  href="/settings/preferences"
                  className="text-sm text-[#C1A7A3] hover:text-[#A8928E] mt-2 inline-block"
                >
                  Manage preferences →
                </a>
              </div>
            </div>
          </div>

          {/* Quick Settings */}
          <div className="bg-white dark:bg-[#2A2A2A] rounded-lg border border-[#E5E7EB] dark:border-[#404040] p-6">
            <h2 className="text-xl font-semibold text-[#191919] dark:text-[#F0EEED] mb-4">
              Quick Settings
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-[#191919] dark:text-[#F0EEED]">
                    Dark Mode
                  </h3>
                  <p className="text-sm text-[#706C6B] dark:text-[#C1A7A3]">
                    Toggle dark mode theme
                  </p>
                </div>
                <button
                  onClick={() => setIsDarkMode((prev) => !prev)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    isDarkMode ? "bg-[#C1A7A3]" : "bg-[#E5E7EB]"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      isDarkMode ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Placeholder Message */}
          <div className="bg-[#F9FAFB] dark:bg-[#1F1F1F] rounded-lg border border-[#E5E7EB] dark:border-[#404040] p-8 text-center">
            <p className="text-[#706C6B] dark:text-[#C1A7A3]">
              This is a placeholder settings page. More settings options will be added soon.
            </p>
          </div>
        </div>
      </div>
    </SejenakDashboardLayout>
  );
}

