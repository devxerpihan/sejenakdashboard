"use client";

import React from "react";
import { X, AlertTriangle } from "lucide-react";

interface ResetLoyaltyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isResetting?: boolean;
}

export const ResetLoyaltyModal: React.FC<ResetLoyaltyModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isResetting = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/20 backdrop-blur-[2px]"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white dark:bg-[#191919] rounded-lg shadow-xl w-full max-w-md overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
          <h2 className="text-xl font-semibold text-[#191919] dark:text-[#F0EEED]">
            Reset Loyalty Program
          </h2>
          <button
            onClick={onClose}
            className="text-[#706C6B] dark:text-[#C1A7A3] hover:text-[#191919] dark:hover:text-[#F0EEED] transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="space-y-4">
            {/* Question */}
            <p className="text-base text-[#191919] dark:text-[#F0EEED]">
              Are you sure you want to reset your loyalty program?
            </p>

            {/* Warning Box */}
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-500 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700 dark:text-red-400">
                This action will delete all loyalty data and members will lose their points
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-zinc-200 dark:border-zinc-800">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-[#8B7355] dark:text-[#C1A7A3] bg-white dark:bg-[#191919] border border-[#8B7355] dark:border-[#C1A7A3] rounded-md hover:bg-zinc-50 dark:hover:bg-[#3D3B3A] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isResetting}
            className="px-4 py-2 text-sm font-medium text-white bg-red-500 dark:bg-red-600 rounded-md hover:bg-red-600 dark:hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isResetting ? "Resetting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
};

