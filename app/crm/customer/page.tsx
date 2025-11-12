"use client";

import React, { useState, useEffect, useMemo } from "react";
import { SejenakDashboardLayout } from "@/components/layout/SejenakDashboardLayout";
import { Footer } from "@/components/layout";
import {
  Breadcrumbs,
  PageHeader,
  CustomerTable,
  StatusFilterTabs,
  Pagination,
} from "@/components/services";
import { SearchIcon } from "@/components/icons";
import { Dropdown } from "@/components/ui/Dropdown";
import { navItems } from "@/config/navigation";
import { Customer, CustomerStatus } from "@/types/customer";

export default function CustomerPage() {
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
  const [selectedStatus, setSelectedStatus] = useState<CustomerStatus>("all");
  const [selectedMemberLevel, setSelectedMemberLevel] = useState("All");
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

  // Sample customers data based on the image
  const allCustomers: Customer[] = [
    {
      id: "1",
      name: "Grace Wallen",
      email: "gracewallen@gmail.com",
      phone: "+1234567890",
      memberLevel: "Bliss",
      appointmentCount: 20,
      status: "active",
    },
    {
      id: "2",
      name: "Grace Wallen",
      email: "gracewallen@gmail.com",
      phone: "+1234567890",
      memberLevel: "Silver",
      appointmentCount: 0,
      status: "flagged",
    },
    {
      id: "3",
      name: "Patricia",
      email: "patricia@gmail.com",
      phone: "+1234567891",
      memberLevel: "Bliss",
      appointmentCount: 0,
      status: "blocked",
    },
    {
      id: "4",
      name: "Grace Wallen",
      email: "gracewallen@gmail.com",
      phone: "+1234567890",
      memberLevel: "VIP",
      appointmentCount: 0,
      status: "at-risk",
    },
    {
      id: "5",
      name: "Margot Kim",
      email: "margotkim@gmail.com",
      phone: "+1234567892",
      memberLevel: "VIP",
      appointmentCount: 70,
      status: "active",
    },
    {
      id: "6",
      name: "Sarah Johnson",
      email: "sarah.johnson@gmail.com",
      phone: "+1234567893",
      memberLevel: "Gold",
      appointmentCount: 45,
      status: "active",
    },
    {
      id: "7",
      name: "Emily Davis",
      email: "emily.davis@gmail.com",
      phone: "+1234567894",
      memberLevel: "Bliss",
      appointmentCount: 12,
      status: "at-risk",
    },
    {
      id: "8",
      name: "Michael Brown",
      email: "michael.brown@gmail.com",
      phone: "+1234567895",
      memberLevel: "Silver",
      appointmentCount: 5,
      status: "flagged",
    },
    {
      id: "9",
      name: "Jessica Wilson",
      email: "jessica.wilson@gmail.com",
      phone: "+1234567896",
      memberLevel: "VIP",
      appointmentCount: 30,
      status: "active",
    },
    {
      id: "10",
      name: "David Martinez",
      email: "david.martinez@gmail.com",
      phone: "+1234567897",
      memberLevel: "Bliss",
      appointmentCount: 0,
      status: "blocked",
    },
    // Add more customers to reach 200 total
    // Using deterministic values based on index to avoid hydration errors
    ...Array.from({ length: 190 }, (_, i) => {
      const index = i + 11;
      // Deterministic selection based on index
      const memberLevels: ("Bliss" | "Silver" | "VIP" | "Gold")[] = [
        "Bliss",
        "Silver",
        "VIP",
        "Gold",
      ];
      const statuses: ("active" | "at-risk" | "flagged" | "blocked")[] = [
        "active",
        "at-risk",
        "flagged",
        "blocked",
      ];
      return {
        id: `${index}`,
        name: `Customer ${index}`,
        email: `customer${index}@gmail.com`,
        phone: `+1234567${String(index).padStart(3, "0")}`,
        memberLevel: memberLevels[index % 4],
        appointmentCount: (index * 7) % 100, // Deterministic calculation
        status: statuses[index % 4],
      };
    }),
  ];

  // Calculate status counts
  const statusCounts = useMemo(() => {
    return {
      all: allCustomers.length,
      active: allCustomers.filter((c) => c.status === "active").length,
      "at-risk": allCustomers.filter((c) => c.status === "at-risk").length,
      flagged: allCustomers.filter((c) => c.status === "flagged").length,
      blocked: allCustomers.filter((c) => c.status === "blocked").length,
    };
  }, [allCustomers]);

  // Filter customers
  const filteredCustomers = useMemo(() => {
    return allCustomers.filter((customer) => {
      const matchesStatus =
        selectedStatus === "all" || customer.status === selectedStatus;
      const matchesMemberLevel =
        selectedMemberLevel === "All" ||
        customer.memberLevel === selectedMemberLevel;
      const matchesSearch =
        searchQuery === "" ||
        customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (customer.phone &&
          customer.phone.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesStatus && matchesMemberLevel && matchesSearch;
    });
  }, [allCustomers, selectedStatus, selectedMemberLevel, searchQuery]);

  // Pagination
  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedCustomers = filteredCustomers.slice(startIndex, endIndex);

  const locations = ["Islamic Village", "Location 2", "Location 3"];
  const memberLevels = ["All", "Bliss", "Silver", "VIP", "Gold"];

  const handleExportImport = () => {
    console.log("Export / Import");
    // TODO: Implement export/import functionality
  };

  const handleCustomerAction = (customerId: string) => {
    console.log("Customer action:", customerId);
    // TODO: Implement customer action menu
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
            { label: "CRM", href: "/crm" },
            { label: "Customer" },
          ]}
        />

        {/* Page Header */}
        <PageHeader
          title="Customer"
          actionButtons={[
            {
              label: "Export / Import",
              onClick: handleExportImport,
              variant: "primary",
            },
          ]}
        />

        {/* Status Filter Tabs */}
        <StatusFilterTabs
          selectedStatus={selectedStatus}
          onStatusChange={setSelectedStatus}
          counts={statusCounts}
        />

        {/* Search and Member Level Filter */}
        <div className="flex items-center gap-4 mb-6">
          {/* Member Level Dropdown */}
          <Dropdown
            options={[
              { value: "All", label: "Member level" },
              ...memberLevels.slice(1).map((level) => ({
                value: level,
                label: level,
              })),
            ]}
            value={selectedMemberLevel}
            onChange={setSelectedMemberLevel}
            placeholder="Member level"
          />

          {/* Search Bar */}
          <div className="relative flex-1 max-w-md">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#706C6B] dark:text-[#C1A7A3]">
              <SearchIcon />
            </div>
            <input
              type="text"
              placeholder="Name, email, phone"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-[#191919] text-[#191919] dark:text-[#F0EEED] placeholder-[#706C6B] focus:outline-none focus:ring-2 focus:ring-[#C1A7A3]"
            />
          </div>
        </div>

        {/* Customer Table */}
        <CustomerTable
          customers={paginatedCustomers}
          onActionClick={handleCustomerAction}
        />

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredCustomers.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
        />
      </div>
    </SejenakDashboardLayout>
  );
}

