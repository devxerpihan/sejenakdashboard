"use client";

import React from "react";
import { PointRule } from "@/types/pointRule";
import { StatusBadge } from "@/components/services";

interface PointRulesTableProps {
  rules: PointRule[];
  onEdit?: (rule: PointRule) => void;
  onDelete?: (ruleId: string) => void;
}

export const PointRulesTable: React.FC<PointRulesTableProps> = ({
  rules,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="bg-white dark:bg-[#191919] rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-[#F0EEED] dark:bg-[#3D3B3A] border-b border-zinc-200 dark:border-zinc-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#706C6B] dark:text-[#C1A7A3] uppercase tracking-wider">
                Spend Amount (Rp)
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#706C6B] dark:text-[#C1A7A3] uppercase tracking-wider">
                Point Earned
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#706C6B] dark:text-[#C1A7A3] uppercase tracking-wider">
                Expiry (month)
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
            {rules.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-sm text-[#706C6B] dark:text-[#C1A7A3]">
                  No point rules found. Click "Add Rule" to create one.
                </td>
              </tr>
            ) : (
              rules.map((rule) => (
                <tr
                  key={rule.id}
                  className="hover:bg-[#F0EEED] dark:hover:bg-[#3D3B3A] transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-[#191919] dark:text-[#F0EEED]">
                      Rp{rule.spendAmount.toLocaleString("id-ID")}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-[#706C6B] dark:text-[#C1A7A3]">
                      {rule.pointEarned} points
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-[#706C6B] dark:text-[#C1A7A3]">
                      {rule.expiry} month{rule.expiry !== 1 ? "s" : ""}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge
                      status={rule.status === "Active" ? "active" : "inactive"}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {onEdit && (
                        <button
                          onClick={() => onEdit(rule)}
                          className="text-[#706C6B] dark:text-[#C1A7A3] hover:text-[#191919] dark:hover:text-[#F0EEED] transition-colors"
                          aria-label="Edit"
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
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                        </button>
                      )}
                      {onDelete && (
                        <button
                          onClick={() => onDelete(rule.id)}
                          className="text-[#706C6B] dark:text-[#C1A7A3] hover:text-red-500 dark:hover:text-red-400 transition-colors"
                          aria-label="Delete"
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
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};



