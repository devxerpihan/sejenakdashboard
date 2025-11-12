"use client";

import React, { useState, useEffect } from "react";
import { SejenakDashboardLayout } from "@/components/layout/SejenakDashboardLayout";
import { Footer } from "@/components/layout";
import {
  Breadcrumbs,
  PageHeader,
  PromoTable,
  Pagination,
} from "@/components/services";
import { PlusIcon, SearchIcon } from "@/components/icons";
import { navItems } from "@/config/navigation";
import { Promo } from "@/types/promo";

export default function PromoPage() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("darkMode");
      return saved === "true";
    }
    return false;
  });

  const [location, setLocation] = useState("Islamic Village");
  const [dateRange, setDateRange] = useState({
    start: new Date(2025, 0, 1),
    end: new Date(2025, 8, 9),
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

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

  // Sample promos data based on the image
  const allPromos: Promo[] = [
    {
      id: "1",
      code: "AUTOSEP25",
      amount: "20%",
      quota: 100,
      usageCount: 15,
      validPeriod: {
        start: "01/10/25",
        end: "31/10/25",
      },
      targetting: "All",
      status: "active",
    },
    {
      id: "2",
      code: "BDAYSJNK",
      amount: "Rp 200.000",
      quota: 50,
      usageCount: 50,
      validPeriod: {
        start: "01/10/25",
        end: "31/10/25",
      },
      targetting: "Bliss",
      status: "expired",
    },
    {
      id: "3",
      code: "ANNIV10",
      amount: "Rp 200.000",
      quota: 50,
      usageCount: 50,
      validPeriod: {
        start: "01/10/25",
        end: "31/10/25",
      },
      targetting: "VIP",
      status: "expired",
    },
    {
      id: "4",
      code: "GLOW25",
      amount: "Rp 150.000",
      quota: 75,
      usageCount: 75,
      validPeriod: {
        start: "01/10/25",
        end: "31/10/25",
      },
      targetting: "VIP",
      status: "expired",
    },
    {
      id: "5",
      code: "WEEKENDSPA",
      amount: "15%",
      quota: 75,
      usageCount: 75,
      validPeriod: {
        start: "01/10/25",
        end: "31/10/25",
      },
      targetting: "VIP",
      status: "active",
    },
    {
      id: "6",
      code: "SUMMER20",
      amount: "20%",
      quota: 100,
      usageCount: 45,
      validPeriod: {
        start: "01/11/25",
        end: "30/11/25",
      },
      targetting: "All",
      status: "active",
    },
    {
      id: "7",
      code: "NEWYEAR50",
      amount: "Rp 500.000",
      quota: 30,
      usageCount: 30,
      validPeriod: {
        start: "01/12/24",
        end: "31/12/24",
      },
      targetting: "VIP",
      status: "expired",
    },
    {
      id: "8",
      code: "WELCOME10",
      amount: "10%",
      quota: 200,
      usageCount: 120,
      validPeriod: {
        start: "01/10/25",
        end: "31/12/25",
      },
      targetting: "All",
      status: "active",
    },
    {
      id: "9",
      code: "BLISSVIP",
      amount: "Rp 300.000",
      quota: 40,
      usageCount: 25,
      validPeriod: {
        start: "01/10/25",
        end: "31/10/25",
      },
      targetting: "Bliss",
      status: "active",
    },
    {
      id: "10",
      code: "FREESPA",
      amount: "Rp 100.000",
      quota: 60,
      usageCount: 60,
      validPeriod: {
        start: "01/09/25",
        end: "30/09/25",
      },
      targetting: "All",
      status: "expired",
    },
    {
      id: "11",
      code: "HAIRDAY",
      amount: "25%",
      quota: 80,
      usageCount: 35,
      validPeriod: {
        start: "01/10/25",
        end: "31/10/25",
      },
      targetting: "VIP",
      status: "active",
    },
    {
      id: "12",
      code: "BIRTHDAY",
      amount: "Rp 250.000",
      quota: 50,
      usageCount: 50,
      validPeriod: {
        start: "01/08/25",
        end: "31/08/25",
      },
      targetting: "Bliss",
      status: "expired",
    },
    {
      id: "13",
      code: "FLASH30",
      amount: "30%",
      quota: 25,
      usageCount: 12,
      validPeriod: {
        start: "01/10/25",
        end: "31/10/25",
      },
      targetting: "VIP",
      status: "active",
    },
    {
      id: "14",
      code: "LOYALTY15",
      amount: "15%",
      quota: 150,
      usageCount: 90,
      validPeriod: {
        start: "01/10/25",
        end: "31/12/25",
      },
      targetting: "All",
      status: "active",
    },
  ];

  // Filter promos
  const filteredPromos = allPromos.filter((promo) => {
    const matchesSearch =
      searchQuery === "" ||
      promo.code.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  // Pagination
  const itemsPerPage = 5;
  const totalPages = Math.ceil(filteredPromos.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedPromos = filteredPromos.slice(startIndex, endIndex);

  const locations = ["Islamic Village", "Location 2", "Location 3"];

  const handleCreatePromo = () => {
    console.log("Create promo");
    // TODO: Implement create promo functionality
  };

  return (
    <SejenakDashboardLayout
      navItems={navItems}
      headerTitle=""
      location={location}
      locations={locations}
      onLocationChange={setLocation}
      dateRange={dateRange}
      onDateRangeChange={(direction) => {
        console.log("Navigate", direction);
      }}
      user={{
        name: "John Doe",
        email: "john@example.com",
        avatar: undefined,
      }}
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
            { label: "Services", href: "/services" },
            { label: "Promo" },
          ]}
        />

        {/* Page Header */}
        <PageHeader
          title="Promo"
          actionButtons={[
            {
              label: "Create Promo",
              onClick: handleCreatePromo,
              variant: "primary",
              icon: <PlusIcon />,
            },
          ]}
        />

        {/* Search Bar */}
        <div className="relative flex-1 max-w-md mb-6">
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#706C6B] dark:text-[#C1A7A3]">
            <SearchIcon />
          </div>
          <input
            type="text"
            placeholder="Promo code"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-[#191919] text-[#191919] dark:text-[#F0EEED] placeholder-[#706C6B] focus:outline-none focus:ring-2 focus:ring-[#C1A7A3]"
          />
        </div>

        {/* Promo Table */}
        <PromoTable promos={paginatedPromos} />

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredPromos.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
        />
      </div>
    </SejenakDashboardLayout>
  );
}

