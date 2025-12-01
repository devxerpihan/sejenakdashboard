"use client";

import React, { useState, useRef } from "react";
import { Staff } from "@/types/staff";
import { Avatar } from "@/components/ui/Avatar";

interface StaffTableProps {
  staff: Staff[];
  onStaffClick?: (staff: Staff) => void;
  onActionClick?: (action: "view" | "edit" | "setInactive", staff: Staff) => void;
}

export const StaffTable: React.FC<StaffTableProps> = ({
  staff,
  onStaffClick,
  onActionClick,
}) => {
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState<{ x: number; y: number } | null>(null);
  const dropdownRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const buttonRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});

  const handleActionClick = (e: React.MouseEvent, staffMember: Staff) => {
    e.stopPropagation();
    const button = buttonRefs.current[staffMember.id];
    if (button) {
      const rect = button.getBoundingClientRect();
      setDropdownPosition({
        x: rect.right - 128, // 128px is the dropdown width (w-32)
        y: rect.bottom + 4, // 4px is mt-1
      });
    }
    setOpenDropdownId(openDropdownId === staffMember.id ? null : staffMember.id);
  };

  return (
    <div className="bg-white dark:bg-[#191919] rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-visible">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-[#F0EEED] dark:bg-[#3D3B3A] border-b border-zinc-200 dark:border-zinc-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#706C6B] dark:text-[#C1A7A3] uppercase tracking-wider">
                Staff
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#706C6B] dark:text-[#C1A7A3] uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#706C6B] dark:text-[#C1A7A3] uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#706C6B] dark:text-[#C1A7A3] uppercase tracking-wider">
                Branch
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
            {staff.map((staffMember) => (
              <tr
                key={staffMember.id}
                onClick={() => onStaffClick && onStaffClick(staffMember)}
                className={`hover:bg-[#F0EEED] dark:hover:bg-[#3D3B3A] transition-colors ${
                  onStaffClick ? "cursor-pointer" : ""
                }`}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    <Avatar
                      src={staffMember.avatar}
                      name={staffMember.name}
                      size="sm"
                    />
                    <div className="text-sm font-medium text-[#191919] dark:text-[#F0EEED]">
                      {staffMember.name}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-[#706C6B] dark:text-[#C1A7A3]">
                    {staffMember.email}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-[#706C6B] dark:text-[#C1A7A3]">
                    {staffMember.role}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-[#706C6B] dark:text-[#C1A7A3]">
                    {staffMember.branch}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      staffMember.status === "active"
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                        : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                    }`}
                  >
                    {staffMember.status === "active" ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                  <div className="relative" ref={(el) => { dropdownRefs.current[staffMember.id] = el; }}>
                    <button
                      ref={(el) => { buttonRefs.current[staffMember.id] = el; }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleActionClick(e, staffMember);
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
            {staff
              .filter((s) => s.id === openDropdownId)
              .map((staffMember) => (
                <React.Fragment key={staffMember.id}>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setOpenDropdownId(null);
                      setDropdownPosition(null);
                      if (onActionClick) {
                        onActionClick("view", staffMember);
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
                      setOpenDropdownId(null);
                      setDropdownPosition(null);
                      if (onActionClick) {
                        onActionClick("edit", staffMember);
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
                      setOpenDropdownId(null);
                      setDropdownPosition(null);
                      if (onActionClick) {
                        onActionClick("setInactive", staffMember);
                      }
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-[#F0EEED] dark:hover:bg-[#3D3B3A] transition-colors border-t border-zinc-200 dark:border-zinc-800"
                  >
                    Set Inactive
                  </button>
                </React.Fragment>
              ))}
          </div>
        </>
      )}
    </div>
  );
};
