"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import Link from "next/link";

export interface TopCustomer {
  id: string;
  name: string;
  avatar?: string;
  totalPaid: number;
  appointments: number;
}

interface TopCustomerListProps {
  customers: TopCustomer[];
  title?: string;
  viewAllLink?: string;
}

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("id-ID", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const TopCustomerList: React.FC<TopCustomerListProps> = ({
  customers,
  title = "Top Customer",
  viewAllLink = "/crm/customer",
}) => {
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
                    Total Paid: {formatCurrency(customer.totalPaid)}
                  </p>
                </div>
              </div>
              <button className="px-3 py-1 rounded text-xs font-medium bg-[#C1A7A3] text-white hover:bg-[#706C6B] transition-colors">
                {customer.appointments} Appointments
              </button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

