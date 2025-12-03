"use client";

import React, { useState, useEffect } from "react";
import { SejenakDashboardLayout } from "@/components/layout/SejenakDashboardLayout";
import { Footer } from "@/components/layout";
import { Breadcrumbs } from "@/components/services";
import { navItems } from "@/config/navigation";

export default function ServicesPage() {
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
            { label: "Services" },
          ]}
        />

        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-[#191919] dark:text-[#F0EEED]">
            Services
          </h1>
          <p className="text-sm text-[#706C6B] dark:text-[#C1A7A3] mt-2">
            Manage your services, treatments, packages, and promotions
          </p>
        </div>

        {/* Services Content */}
        <div className="space-y-6">
          {/* Services Sections */}
          <div className="bg-white dark:bg-[#2A2A2A] rounded-lg border border-[#E5E7EB] dark:border-[#404040] p-6">
            <h2 className="text-xl font-semibold text-[#191919] dark:text-[#F0EEED] mb-4">
              Services Sections
            </h2>
            <div className="space-y-4">
              <div className="p-4 border border-[#E5E7EB] dark:border-[#404040] rounded-lg hover:bg-[#F9FAFB] dark:hover:bg-[#333333] transition-colors">
                <h3 className="font-medium text-[#191919] dark:text-[#F0EEED] mb-1">
                  Treatment
                </h3>
                <p className="text-sm text-[#706C6B] dark:text-[#C1A7A3]">
                  Manage treatments and their pricing
                </p>
                <a
                  href="/services/treatment"
                  className="text-sm text-[#C1A7A3] hover:text-[#A8928E] mt-2 inline-block"
                >
                  Manage treatments →
                </a>
              </div>

              <div className="p-4 border border-[#E5E7EB] dark:border-[#404040] rounded-lg hover:bg-[#F9FAFB] dark:hover:bg-[#333333] transition-colors">
                <h3 className="font-medium text-[#191919] dark:text-[#F0EEED] mb-1">
                  Category
                </h3>
                <p className="text-sm text-[#706C6B] dark:text-[#C1A7A3]">
                  Organize treatments by categories
                </p>
                <a
                  href="/services/category"
                  className="text-sm text-[#C1A7A3] hover:text-[#A8928E] mt-2 inline-block"
                >
                  Manage categories →
                </a>
              </div>

              <div className="p-4 border border-[#E5E7EB] dark:border-[#404040] rounded-lg hover:bg-[#F9FAFB] dark:hover:bg-[#333333] transition-colors">
                <h3 className="font-medium text-[#191919] dark:text-[#F0EEED] mb-1">
                  Bundle Package
                </h3>
                <p className="text-sm text-[#706C6B] dark:text-[#C1A7A3]">
                  Create and manage service bundles
                </p>
                <a
                  href="/services/bundle-package"
                  className="text-sm text-[#C1A7A3] hover:text-[#A8928E] mt-2 inline-block"
                >
                  Manage bundles →
                </a>
              </div>

              <div className="p-4 border border-[#E5E7EB] dark:border-[#404040] rounded-lg hover:bg-[#F9FAFB] dark:hover:bg-[#333333] transition-colors">
                <h3 className="font-medium text-[#191919] dark:text-[#F0EEED] mb-1">
                  Promo
                </h3>
                <p className="text-sm text-[#706C6B] dark:text-[#C1A7A3]">
                  Create and manage promotional offers
                </p>
                <a
                  href="/services/promo"
                  className="text-sm text-[#C1A7A3] hover:text-[#A8928E] mt-2 inline-block"
                >
                  Manage promos →
                </a>
              </div>

              <div className="p-4 border border-[#E5E7EB] dark:border-[#404040] rounded-lg hover:bg-[#F9FAFB] dark:hover:bg-[#333333] transition-colors">
                <h3 className="font-medium text-[#191919] dark:text-[#F0EEED] mb-1">
                  Discount
                </h3>
                <p className="text-sm text-[#706C6B] dark:text-[#C1A7A3]">
                  Manage discount rules and eligibility
                </p>
                <a
                  href="/services/discount"
                  className="text-sm text-[#C1A7A3] hover:text-[#A8928E] mt-2 inline-block"
                >
                  Manage discounts →
                </a>
              </div>

              <div className="p-4 border border-[#E5E7EB] dark:border-[#404040] rounded-lg hover:bg-[#F9FAFB] dark:hover:bg-[#333333] transition-colors">
                <h3 className="font-medium text-[#191919] dark:text-[#F0EEED] mb-1">
                  Room
                </h3>
                <p className="text-sm text-[#706C6B] dark:text-[#C1A7A3]">
                  Manage rooms and their configurations
                </p>
                <a
                  href="/services/room"
                  className="text-sm text-[#C1A7A3] hover:text-[#A8928E] mt-2 inline-block"
                >
                  Manage rooms →
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SejenakDashboardLayout>
  );
}

