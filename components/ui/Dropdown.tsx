"use client";

import React, { useState, useEffect, useRef } from "react";

export interface DropdownOption {
  value: string;
  label: string;
}

interface DropdownProps {
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export const Dropdown: React.FC<DropdownProps> = ({
  options,
  value,
  onChange,
  placeholder = "Select an option",
  className = "",
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Close dropdown on Escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  const selectedOption = options.find((opt) => opt.value === value);
  const displayText = selectedOption ? selectedOption.label : placeholder;

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          flex items-center gap-2 px-4 py-2 rounded-lg border 
          bg-white dark:bg-[#191919] 
          text-[#191919] dark:text-[#F0EEED] 
          border-zinc-300 dark:border-zinc-700
          hover:bg-[#F0EEED] dark:hover:bg-[#3D3B3A] 
          transition-colors
          min-w-[150px] justify-between
          focus:outline-none focus:ring-2 focus:ring-[#C1A7A3]
          ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
        `}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className={selectedOption ? "" : "text-[#706C6B] dark:text-[#C1A7A3]"}>
          {displayText}
        </span>
        <svg
          className={`w-4 h-4 text-[#706C6B] dark:text-[#C1A7A3] transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-full bg-white dark:bg-[#191919] border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-lg z-50 overflow-hidden">
          <div className="max-h-60 overflow-y-auto">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelect(option.value)}
                className={`
                  w-full px-4 py-2 text-left text-sm 
                  transition-colors
                  ${
                    option.value === value
                      ? "bg-[#C1A7A3] text-white"
                      : "text-[#191919] dark:text-[#F0EEED] hover:bg-[#F0EEED] dark:hover:bg-[#3D3B3A]"
                  }
                `}
                role="option"
                aria-selected={option.value === value}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

