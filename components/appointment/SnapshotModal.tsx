"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Download } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface SnapshotModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl?: string;
}

export const SnapshotModal: React.FC<SnapshotModalProps> = ({
  isOpen,
  onClose,
  imageUrl,
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-0 bg-white dark:bg-[#191919] z-50 overflow-hidden flex flex-col shadow-xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
              <h2 className="text-lg font-semibold text-[#191919] dark:text-[#F0EEED]">
                Snapshot
              </h2>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="gap-2">
                  <Download className="w-4 h-4" />
                  Download
                </Button>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-[#706C6B] dark:text-[#C1A7A3]" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-zinc-50 dark:bg-zinc-900">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt="Snapshot"
                  className="max-w-full max-h-[85vh] object-contain rounded-md shadow-lg"
                />
              ) : (
                <div className="text-zinc-400 dark:text-zinc-600 flex flex-col items-center">
                  <div className="w-24 h-24 mb-4 bg-zinc-200 dark:bg-zinc-800 rounded-full flex items-center justify-center">
                    <span className="text-4xl">📷</span>
                  </div>
                  <p>No snapshot available</p>
                </div>
              )}
            </div>
          </motion.div>
      )}
    </AnimatePresence>
  );
};

