"use client";

import React, { useState, useEffect } from "react";
import { SejenakDashboardLayout } from "@/components/layout/SejenakDashboardLayout";
import { Footer } from "@/components/layout";
import {
  Breadcrumbs,
  PageHeader,
  DiscountTable,
  Pagination,
} from "@/components/services";
import { PlusIcon, SearchIcon } from "@/components/icons";
import { navItems } from "@/config/navigation";
import { Discount } from "@/types/discount";

export default function DiscountPage() {
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

  // Sample discounts data based on the image
  const allDiscounts: Discount[] = [
    {
      id: "1",
      name: "Soft Opening",
      amount: "20%",
      validPeriod: {
        start: "01/10/25",
        end: "31/10/25",
      },
      eligibility: "All Services",
      status: "active",
    },
    {
      id: "2",
      name: "Grand Opening",
      amount: "Rp 200.000",
      validPeriod: {
        start: "01/10/25",
        end: "31/10/25",
      },
      eligibility: "2 Categories",
      status: "expired",
    },
    {
      id: "3",
      name: "Anniversary",
      amount: "Rp 150.000",
      validPeriod: {
        start: "01/10/25",
        end: "31/10/25",
      },
      eligibility: "3 Treatments",
      status: "expired",
    },
    {
      id: "4",
      name: "Independence Day",
      amount: "15%",
      validPeriod: {
        start: "01/10/25",
        end: "31/10/25",
      },
      eligibility: "2 Categories",
      status: "expired",
    },
    {
      id: "5",
      name: "Womans Day",
      amount: "Rp 200.000",
      validPeriod: {
        start: "01/10/25",
        end: "31/10/25",
      },
      eligibility: "All Services",
      status: "active",
    },
    {
      id: "6",
      name: "New Year Sale",
      amount: "25%",
      validPeriod: {
        start: "01/11/25",
        end: "30/11/25",
      },
      eligibility: "All Services",
      status: "active",
    },
    {
      id: "7",
      name: "Summer Special",
      amount: "Rp 300.000",
      validPeriod: {
        start: "01/09/25",
        end: "30/09/25",
      },
      eligibility: "3 Treatments",
      status: "expired",
    },
    {
      id: "8",
      name: "Holiday Package",
      amount: "20%",
      validPeriod: {
        start: "01/12/25",
        end: "31/12/25",
      },
      eligibility: "2 Categories",
      status: "active",
    },
    {
      id: "9",
      name: "Birthday Special",
      amount: "Rp 250.000",
      validPeriod: {
        start: "01/08/25",
        end: "31/08/25",
      },
      eligibility: "All Services",
      status: "expired",
    },
    {
      id: "10",
      name: "Flash Sale",
      amount: "30%",
      validPeriod: {
        start: "01/10/25",
        end: "31/10/25",
      },
      eligibility: "3 Treatments",
      status: "active",
    },
    {
      id: "11",
      name: "Loyalty Reward",
      amount: "15%",
      validPeriod: {
        start: "01/10/25",
        end: "31/12/25",
      },
      eligibility: "All Services",
      status: "active",
    },
    {
      id: "12",
      name: "VIP Exclusive",
      amount: "Rp 400.000",
      validPeriod: {
        start: "01/07/25",
        end: "31/07/25",
      },
      eligibility: "2 Categories",
      status: "expired",
    },
    {
      id: "13",
      name: "Weekend Deal",
      amount: "10%",
      validPeriod: {
        start: "01/10/25",
        end: "31/10/25",
      },
      eligibility: "All Services",
      status: "active",
    },
    {
      id: "14",
      name: "Early Bird",
      amount: "Rp 100.000",
      validPeriod: {
        start: "01/09/25",
        end: "30/09/25",
      },
      eligibility: "3 Treatments",
      status: "expired",
    },
  ];

  // Filter discounts
  const filteredDiscounts = allDiscounts.filter((discount) => {
    const matchesSearch =
      searchQuery === "" ||
      discount.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  // Pagination
  const itemsPerPage = 5;
  const totalPages = Math.ceil(filteredDiscounts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedDiscounts = filteredDiscounts.slice(startIndex, endIndex);

  const locations = ["Islamic Village", "Location 2", "Location 3"];

  const handleCreateDiscount = () => {
    console.log("Create discount");
    // TODO: Implement create discount functionality
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
            { label: "Discount" },
          ]}
        />

        {/* Page Header */}
        <PageHeader
          title="Discount"
          actionButtons={[
            {
              label: "Create Discount",
              onClick: handleCreateDiscount,
              variant: "outline",
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
            placeholder="Discount name"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-[#191919] text-[#191919] dark:text-[#F0EEED] placeholder-[#706C6B] focus:outline-none focus:ring-2 focus:ring-[#C1A7A3]"
          />
        </div>

        {/* Discount Table */}
        <DiscountTable discounts={paginatedDiscounts} />

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredDiscounts.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
        />
      </div>
    </SejenakDashboardLayout>
  );
}

