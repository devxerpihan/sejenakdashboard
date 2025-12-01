"use client";

import React, { useState, useRef, useEffect } from "react";
import { Plus, X } from "lucide-react";
import { Dropdown } from "@/components/ui/Dropdown";

interface DropdownWithCRUDProps {
  options: Array<{ value: string; label: string }>;
  value: string;
  onChange: (value: string) => void;
  onAddOption: (newOption: string) => void;
  onRemoveOption?: (optionValue: string) => void;
  placeholder?: string;
  label?: string;
  allowRemove?: boolean;
}

export const DropdownWithCRUD: React.FC<DropdownWithCRUDProps> = ({
  options,
  value,
  onChange,
  onAddOption,
  onRemoveOption,
  placeholder = "Select option",
  label,
  allowRemove = false,
}) => {
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newOptionValue, setNewOptionValue] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isAddingNew && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isAddingNew]);

  const handleAddNew = () => {
    if (newOptionValue.trim()) {
      onAddOption(newOptionValue.trim());
      onChange(newOptionValue.trim());
      setNewOptionValue("");
      setIsAddingNew(false);
    }
  };

  const handleRemove = (optionValue: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onRemoveOption) {
      onRemoveOption(optionValue);
      if (value === optionValue) {
        onChange("");
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleAddNew();
    } else if (e.key === "Escape") {
      setIsAddingNew(false);
      setNewOptionValue("");
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      {label && (
        <label className="block text-sm font-medium text-[#706C6B] dark:text-[#C1A7A3] mb-2">
          {label}
        </label>
      )}
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <Dropdown
            options={options}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
          />
        </div>
        <button
          type="button"
          onClick={() => setIsAddingNew(true)}
          className="p-2 text-[#706C6B] dark:text-[#C1A7A3] hover:text-[#C1A7A3] dark:hover:text-[#F0EEED] hover:bg-zinc-100 dark:hover:bg-[#3D3B3A] rounded-md transition-colors"
          title="Add new option"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Add New Option Input */}
      {isAddingNew && (
        <div className="mt-2 p-3 bg-white dark:bg-[#191919] border border-zinc-300 dark:border-zinc-700 rounded-md shadow-lg">
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={newOptionValue}
              onChange={(e) => setNewOptionValue(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Enter new option"
              className="flex-1 px-3 py-2 bg-white dark:bg-[#191919] border border-zinc-300 dark:border-zinc-700 rounded-md text-[#191919] dark:text-[#F0EEED] focus:outline-none focus:ring-2 focus:ring-[#C1A7A3] dark:focus:ring-[#706C6B] text-sm"
            />
            <button
              type="button"
              onClick={handleAddNew}
              className="px-3 py-2 text-sm font-medium text-white bg-[#C1A7A3] dark:bg-[#706C6B] rounded-md hover:bg-[#A8928F] dark:hover:bg-[#5A4F4D] transition-colors"
            >
              Add
            </button>
            <button
              type="button"
              onClick={() => {
                setIsAddingNew(false);
                setNewOptionValue("");
              }}
              className="px-3 py-2 text-sm font-medium text-[#706C6B] dark:text-[#C1A7A3] bg-white dark:bg-[#191919] border border-zinc-300 dark:border-zinc-700 rounded-md hover:bg-zinc-50 dark:hover:bg-[#3D3B3A] transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Options List with Remove Buttons */}
      {allowRemove && options.length > 0 && (
        <div className="mt-2 space-y-1 max-h-32 overflow-y-auto">
          {options.map((option) => (
            <div
              key={option.value}
              className="flex items-center justify-between px-3 py-2 bg-zinc-50 dark:bg-[#3D3B3A] rounded-md"
            >
              <span className="text-sm text-[#191919] dark:text-[#F0EEED]">{option.label}</span>
              {onRemoveOption && (
                <button
                  type="button"
                  onClick={(e) => handleRemove(option.value, e)}
                  className="p-1 text-red-500 hover:text-red-600 transition-colors"
                  title="Remove option"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

