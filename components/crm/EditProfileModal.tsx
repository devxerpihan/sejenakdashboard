"use client";

import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Dropdown } from "@/components/ui/Dropdown";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: {
    id: string;
    name: string;
    email: string;
    phone: string;
    birthDate: string;
    address: string;
    city: string;
    registeredDate: string;
    memberStatus: string;
    role?: string;
  };
  onSave: () => void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  customer,
  onSave,
}) => {
  const [formData, setFormData] = useState({
    name: customer.name,
    email: customer.email,
    phone: customer.phone,
    birthDate: customer.birthDate,
    address: customer.address,
    city: customer.city,
    memberStatus: customer.memberStatus,
    role: customer.role || "customer",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        birthDate: customer.birthDate,
        address: customer.address,
        city: customer.city,
        memberStatus: customer.memberStatus,
        role: customer.role || "customer",
      });
    }
  }, [isOpen, customer]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      // Format birth date from DD/MM/YYYY to YYYY-MM-DD
      let formattedBirthDate = null;
      if (formData.birthDate && formData.birthDate.includes("/")) {
        const [day, month, year] = formData.birthDate.split("/");
        formattedBirthDate = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
      }

      // Extract phone number (remove +62 prefix if present)
      const phoneNumber = formData.phone.replace(/^\+62/, "");

      const updateData: any = {
        full_name: formData.name,
        email: formData.email,
        phone: phoneNumber,
        address: formData.address,
        role: formData.role,
      };

      if (formattedBirthDate) {
        updateData.date_of_birth = formattedBirthDate;
      }

      const { error } = await supabase
        .from("profiles")
        .update(updateData)
        .eq("id", customer.id);

      if (error) throw error;

      onSave();
      onClose();
    } catch (err: any) {
      console.error("Error updating profile:", err);
      alert("Failed to update profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/20 backdrop-blur-[2px]"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white dark:bg-[#191919] rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-200 dark:border-zinc-800">
          <h2 className="text-xl font-semibold text-[#191919] dark:text-[#F0EEED]">
            Edit Profile
          </h2>
          <button
            onClick={onClose}
            className="text-[#706C6B] dark:text-[#C1A7A3] hover:text-[#191919] dark:hover:text-[#F0EEED] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <h3 className="text-lg font-semibold text-[#191919] dark:text-[#F0EEED] mb-6">
            Details Profile
          </h3>

          <div className="grid grid-cols-2 gap-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-[#706C6B] dark:text-[#C1A7A3] mb-2">
                Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-[#191919] text-[#191919] dark:text-[#F0EEED] focus:outline-none focus:ring-2 focus:ring-[#C1A7A3]"
              />
            </div>

            {/* Birth Date */}
            <div>
              <label className="block text-sm font-medium text-[#706C6B] dark:text-[#C1A7A3] mb-2">
                Birth Date
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.birthDate}
                  onChange={(e) => handleChange("birthDate", e.target.value)}
                  placeholder="DD/MM/YYYY"
                  className="w-full px-4 py-2 pr-10 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-[#191919] text-[#191919] dark:text-[#F0EEED] focus:outline-none focus:ring-2 focus:ring-[#C1A7A3]"
                />
                <svg
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#706C6B] dark:text-[#C1A7A3]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-[#706C6B] dark:text-[#C1A7A3] mb-2">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-[#191919] text-[#191919] dark:text-[#F0EEED] focus:outline-none focus:ring-2 focus:ring-[#C1A7A3]"
              />
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-sm font-medium text-[#706C6B] dark:text-[#C1A7A3] mb-2">
                Phone Number
              </label>
              <div className="flex">
                <span className="px-4 py-2 rounded-l-lg border border-r-0 border-zinc-300 dark:border-zinc-700 bg-[#F0EEED] dark:bg-[#3D3B3A] text-[#191919] dark:text-[#F0EEED]">
                  +62
                </span>
                <input
                  type="text"
                  value={formData.phone.replace(/^\+62/, "")}
                  onChange={(e) => handleChange("phone", `+62${e.target.value}`)}
                  className="flex-1 px-4 py-2 rounded-r-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-[#191919] text-[#191919] dark:text-[#F0EEED] focus:outline-none focus:ring-2 focus:ring-[#C1A7A3]"
                />
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-[#706C6B] dark:text-[#C1A7A3] mb-2">
                Address
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => handleChange("address", e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-[#191919] text-[#191919] dark:text-[#F0EEED] focus:outline-none focus:ring-2 focus:ring-[#C1A7A3]"
              />
            </div>

            {/* City */}
            <div>
              <label className="block text-sm font-medium text-[#706C6B] dark:text-[#C1A7A3] mb-2">
                City
              </label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => handleChange("city", e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-[#191919] text-[#191919] dark:text-[#F0EEED] focus:outline-none focus:ring-2 focus:ring-[#C1A7A3]"
              />
            </div>

            {/* Registered Date (Read-only) */}
            <div>
              <label className="block text-sm font-medium text-[#706C6B] dark:text-[#C1A7A3] mb-2">
                Registered Date
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={customer.registeredDate}
                  disabled
                  className="w-full px-4 py-2 pr-10 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-[#F0EEED] dark:bg-[#3D3B3A] text-[#706C6B] dark:text-[#C1A7A3] cursor-not-allowed"
                />
                <svg
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#706C6B] dark:text-[#C1A7A3]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
            </div>

            {/* Member Status */}
            <div>
              <label className="block text-sm font-medium text-[#706C6B] dark:text-[#C1A7A3] mb-2">
                Member Status
              </label>
              <Dropdown
                options={[
                  { value: "Active", label: "Active" },
                  { value: "Inactive", label: "Inactive" },
                  { value: "Blocked", label: "Blocked" },
                ]}
                value={formData.memberStatus}
                onChange={(value) => handleChange("memberStatus", value)}
                placeholder="Select member status"
              />
            </div>

            {/* Role */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-[#706C6B] dark:text-[#C1A7A3] mb-2">
                Role
              </label>
              <Dropdown
                options={[
                  { value: "customer", label: "Customer" },
                  { value: "therapist", label: "Therapist" },
                  { value: "receptionist", label: "Receptionist" },
                  { value: "cook_helper", label: "Cook Helper" },
                ]}
                value={formData.role}
                onChange={(value) => handleChange("role", value)}
                placeholder="Select role"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-4 p-6 border-t border-zinc-200 dark:border-zinc-800">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-[#191919] text-[#191919] dark:text-[#F0EEED] hover:bg-[#F0EEED] dark:hover:bg-[#3D3B3A] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 rounded-lg bg-[#C1A7A3] text-white hover:bg-[#A88F8B] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

