"use client";

import React from "react";
import { Reward } from "@/types/reward";
import { StatusBadge } from "./StatusBadge";

interface RewardTableProps {
  rewards: Reward[];
  onActionClick?: (rewardId: string) => void;
  onRowClick?: (reward: Reward) => void;
}

export const RewardTable: React.FC<RewardTableProps> = ({
  rewards,
  onActionClick,
  onRowClick,
}) => {
  return (
    <div className="bg-white dark:bg-[#191919] rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-[#F0EEED] dark:bg-[#3D3B3A] border-b border-zinc-200 dark:border-zinc-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#706C6B] dark:text-[#C1A7A3] uppercase tracking-wider">
                Image
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#706C6B] dark:text-[#C1A7A3] uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#706C6B] dark:text-[#C1A7A3] uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#706C6B] dark:text-[#C1A7A3] uppercase tracking-wider">
                Total Points
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#706C6B] dark:text-[#C1A7A3] uppercase tracking-wider">
                Quota
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#706C6B] dark:text-[#C1A7A3] uppercase tracking-wider">
                Usage Count
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#706C6B] dark:text-[#C1A7A3] uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {rewards.map((reward) => (
              <tr
                key={reward.id}
                onClick={() => onRowClick && onRowClick(reward)}
                className="hover:bg-[#F0EEED] dark:hover:bg-[#3D3B3A] transition-colors cursor-pointer"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  {reward.image ? (
                    <img
                      src={reward.image}
                      alt={reward.reward}
                      className="w-20 h-14 object-cover rounded-md"
                    />
                  ) : (
                    <div className="w-20 h-14 bg-zinc-200 dark:bg-zinc-700 rounded-md flex items-center justify-center">
                      <svg
                        className="w-6 h-6 text-zinc-400 dark:text-zinc-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-[#191919] dark:text-[#F0EEED]">
                    {reward.reward}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-[#706C6B] dark:text-[#C1A7A3]">
                    {reward.category || "N/A"}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-[#706C6B] dark:text-[#C1A7A3]">
                    {reward.totalPoints ?? reward.required}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-[#706C6B] dark:text-[#C1A7A3]">
                    {reward.quota ?? "Unlimited"}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-[#706C6B] dark:text-[#C1A7A3]">
                    {reward.usageCount ?? 0}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <StatusBadge
                    status={reward.status === "Active" ? "active" : reward.status === "Expired" ? "inactive" : "active"}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

