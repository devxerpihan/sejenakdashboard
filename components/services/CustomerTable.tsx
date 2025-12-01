"use client";

import React, { useState, useRef, useEffect } from "react";
import { Customer } from "@/types/customer";
import { CustomerStatusBadge } from "./CustomerStatusBadge";
import { Avatar } from "@/components/ui/Avatar";

interface CustomerTableProps {
  customers: Customer[];
  onCustomerClick?: (customer: Customer) => void;
  onActionClick?: (action: "view" | "edit" | "block", customer: Customer) => void;
}

export const CustomerTable: React.FC<CustomerTableProps> = ({
  customers,
  onCustomerClick,
  onActionClick,
}) => {
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState<{ x: number; y: number } | null>(null);
  const dropdownRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const buttonRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});


  const handleActionClick = (e: React.MouseEvent, customer: Customer) => {
    e.stopPropagation();
    const button = buttonRefs.current[customer.id];
    if (button) {
      const rect = button.getBoundingClientRect();
      setDropdownPosition({
        x: rect.right - 128, // 128px is the dropdown width (w-32)
        y: rect.bottom + 4, // 4px is mt-1
      });
    }
    setOpenDropdownId(openDropdownId === customer.id ? null : customer.id);
  };


  return (
    <div className="bg-white dark:bg-[#191919] rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-visible">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-[#F0EEED] dark:bg-[#3D3B3A] border-b border-zinc-200 dark:border-zinc-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#706C6B] dark:text-[#C1A7A3] uppercase tracking-wider">
                Customer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#706C6B] dark:text-[#C1A7A3] uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#706C6B] dark:text-[#C1A7A3] uppercase tracking-wider">
                Member Level
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#706C6B] dark:text-[#C1A7A3] uppercase tracking-wider">
                Appointment
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#706C6B] dark:text-[#C1A7A3] uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#706C6B] dark:text-[#C1A7A3] uppercase tracking-wider">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {customers.map((customer) => (
              <tr
                key={customer.id}
                onClick={() => onCustomerClick && onCustomerClick(customer)}
                className={`hover:bg-[#F0EEED] dark:hover:bg-[#3D3B3A] transition-colors ${
                  onCustomerClick ? "cursor-pointer" : ""
                }`}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    <Avatar
                      src={customer.avatar}
                      name={customer.name}
                      size="sm"
                    />
                    <div className="text-sm font-medium text-[#191919] dark:text-[#F0EEED]">
                      {customer.name}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-[#706C6B] dark:text-[#C1A7A3]">
                    {customer.email}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-[#706C6B] dark:text-[#C1A7A3]">
                    {customer.memberLevel}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-[#706C6B] dark:text-[#C1A7A3]">
                    {customer.appointmentCount}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <CustomerStatusBadge status={customer.status} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                  <div className="relative" ref={(el) => { dropdownRefs.current[customer.id] = el; }}>
                    <button
                      ref={(el) => { buttonRefs.current[customer.id] = el; }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleActionClick(e, customer);
                      }}
                      className="text-[#706C6B] dark:text-[#C1A7A3] hover:text-[#191919] dark:hover:text-[#F0EEED] transition-colors"
                      aria-label="Actions"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                        />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Dropdown Menu - Fixed Position */}
      {openDropdownId && dropdownPosition && (
        <>
          <div
            className="fixed inset-0 z-[99]"
            onClick={() => {
              setOpenDropdownId(null);
              setDropdownPosition(null);
            }}
          />
          <div
            className="fixed w-32 bg-white dark:bg-[#191919] border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-lg z-[100] overflow-hidden"
            style={{
              left: `${dropdownPosition.x}px`,
              top: `${dropdownPosition.y}px`,
            }}
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
          >
            {customers
              .filter((c) => c.id === openDropdownId)
              .map((customer) => (
                <React.Fragment key={customer.id}>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      console.log("View clicked for customer:", customer.id);
                      setOpenDropdownId(null);
                      setDropdownPosition(null);
                      if (onActionClick) {
                        console.log("Calling onActionClick with view");
                        onActionClick("view", customer);
                      } else {
                        console.log("onActionClick is not defined");
                      }
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-[#191919] dark:text-[#F0EEED] hover:bg-[#F0EEED] dark:hover:bg-[#3D3B3A] transition-colors"
                  >
                    View
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      console.log("Edit clicked for customer:", customer.id);
                      setOpenDropdownId(null);
                      setDropdownPosition(null);
                      if (onActionClick) {
                        console.log("Calling onActionClick with edit");
                        onActionClick("edit", customer);
                      } else {
                        console.log("onActionClick is not defined");
                      }
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-[#191919] dark:text-[#F0EEED] hover:bg-[#F0EEED] dark:hover:bg-[#3D3B3A] transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      console.log("Block clicked for customer:", customer.id);
                      setOpenDropdownId(null);
                      setDropdownPosition(null);
                      if (onActionClick) {
                        console.log("Calling onActionClick with block");
                        onActionClick("block", customer);
                      } else {
                        console.log("onActionClick is not defined");
                      }
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-[#F0EEED] dark:hover:bg-[#3D3B3A] transition-colors border-t border-zinc-200 dark:border-zinc-800"
                  >
                    Block
                  </button>
                </React.Fragment>
              ))}
          </div>
        </>
      )}
    </div>
  );
};

