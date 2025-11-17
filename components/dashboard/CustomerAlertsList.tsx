"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import Link from "next/link";

export interface CustomerAlert {
  id: string;
  name: string;
  avatar?: string;
  cancelled: number;
  noShow: number;
  status: "flagged" | "at-risk";
}

interface CustomerAlertsListProps {
  customers: CustomerAlert[];
  title?: string;
  viewAllLink?: string;
}

export const CustomerAlertsList: React.FC<CustomerAlertsListProps> = ({
  customers,
  title = "Customer Alerts",
  viewAllLink = "/crm/customer",
}) => {
  const getStatusButtonClass = (status: CustomerAlert["status"]) => {
    switch (status) {
      case "flagged":
        return "bg-red-500 text-white";
      case "at-risk":
        return "bg-yellow-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const getStatusLabel = (status: CustomerAlert["status"]) => {
    switch (status) {
      case "flagged":
        return "Flagged";
      case "at-risk":
        return "At Risk";
      default:
        return status;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{title}</CardTitle>
          <Link
            href={viewAllLink}
            className="text-sm text-[#C1A7A3] dark:text-[#C1A7A3] hover:text-[#706C6B] dark:hover:text-[#F0EEED] transition-colors"
          >
            View All
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {customers.map((customer) => (
            <div
              key={customer.id}
              className="flex items-center justify-between p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-[#F0EEED] dark:hover:bg-[#3D3B3A]/50 transition-colors"
            >
              <div className="flex items-center gap-3 flex-1">
                <Avatar
                  src={customer.avatar}
                  name={customer.name}
                  size="md"
                />
                <div className="flex-1">
                  <p className="font-medium text-[#191919] dark:text-[#F0EEED] text-sm">
                    {customer.name}
                  </p>
                  <p className="text-xs text-[#706C6B] dark:text-[#C1A7A3]">
                    Cancelled: {customer.cancelled}, No show: {customer.noShow}
                  </p>
                </div>
              </div>
              <span
                className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusButtonClass(
                  customer.status
                )}`}
              >
                {getStatusLabel(customer.status)}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

