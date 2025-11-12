"use client";

import React from "react";
import { Staff } from "@/types/staff";
import { RoleBadge } from "./RoleBadge";
import { StatusBadge } from "./StatusBadge";
import { Avatar } from "@/components/ui/Avatar";

interface StaffTableProps {
  staff: Staff[];
  onActionClick?: (staffId: string) => void;
}

export const StaffTable: React.FC<StaffTableProps> = ({
  staff,
  onActionClick,
}) => {
  return (
    <div className="bg-white dark:bg-[#191919] rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-[#F0EEED] dark:bg-[#3D3B3A] border-b border-zinc-200 dark:border-zinc-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#706C6B] dark:text-[#C1A7A3] uppercase tracking-wider">
                Name
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
            {staff.map((member) => (
              <tr
                key={member.id}
                className="hover:bg-[#F0EEED] dark:hover:bg-[#3D3B3A] transition-colors"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    <Avatar
                      src={member.avatar}
                      name={member.name}
                      size="sm"
                    />
                    <div className="text-sm font-medium text-[#191919] dark:text-[#F0EEED]">
                      {member.name}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-[#706C6B] dark:text-[#C1A7A3]">
                    {member.email}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <RoleBadge role={member.role} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-[#706C6B] dark:text-[#C1A7A3]">
                    {member.branch}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <StatusBadge status={member.status} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() =>
                      onActionClick && onActionClick(member.id)
                    }
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
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

