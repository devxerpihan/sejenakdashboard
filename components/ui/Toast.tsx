"use client";

import React, { useEffect, useState } from "react";

export interface ToastProps {
  message: string;
  type?: "success" | "error" | "warning" | "info";
  duration?: number;
  onClose?: () => void;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  type = "info",
  duration = 5000,
  onClose,
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => onClose?.(), 300); // Wait for fade out animation
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const typeStyles = {
    success: "bg-green-600 dark:bg-green-700 text-white",
    error: "bg-red-600 dark:bg-red-700 text-white",
    warning: "bg-yellow-600 dark:bg-yellow-700 text-white",
    info: "bg-[#C1A7A3] dark:bg-[#A88F8B] text-white",
  };

  if (!isVisible) return null;

  return (
    <div
      className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-lg ${
        typeStyles[type]
      } transition-all duration-300 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
      }`}
    >
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm font-medium">{message}</p>
        <button
          onClick={() => {
            setIsVisible(false);
            setTimeout(() => onClose?.(), 300);
          }}
          className="ml-4 text-white hover:text-gray-200 transition-colors"
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
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

interface ToastContainerProps {
  toasts: Array<{ id: string; message: string; type?: "success" | "error" | "warning" | "info" }>;
  onRemove: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({
  toasts,
  onRemove,
}) => {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => onRemove(toast.id)}
        />
      ))}
    </div>
  );
};

