"use client";

import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Dropdown } from "@/components/ui/Dropdown";

interface EditStaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  staff: {
    id: string;
    name: string;
    email: string;
    phone: string;
    birthDate: string;
    address: string;
    city: string;
    registeredDate: string;
    role: string;
    branch: string;
    status: "active" | "inactive";
  };
  onSave: () => void;
}

export const EditStaffModal: React.FC<EditStaffModalProps> = ({
  isOpen,
  onClose,
  staff,
  onSave,
}) => {
  const [formData, setFormData] = useState({
    name: staff.name,
    email: staff.email,
    phone: staff.phone,
    birthDate: staff.birthDate,
    address: staff.address,
    city: staff.city,
    role: staff.role,
    branch: staff.branch,
    status: staff.status,
  });
  const [saving, setSaving] = useState(false);
  const [branches, setBranches] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: staff.name,
        email: staff.email,
        phone: staff.phone,
        birthDate: staff.birthDate,
        address: staff.address,
        city: staff.city,
        role: staff.role,
        branch: staff.branch,
        status: staff.status,
      });
      fetchBranches();
    }
  }, [isOpen, staff]);

  const fetchBranches = async () => {
    try {
      const { data, error } = await supabase
        .from("branches")
        .select("id, name")
        .order("name");

      if (error) throw error;
      setBranches(data || []);
    } catch (err) {
      console.error("Error fetching branches:", err);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      // Format birth date from DD/MM/YYYY to YYYY-MM-DD
      let formattedBirthDate = null;
      if (formData.birthDate) {
        const [day, month, year] = formData.birthDate.split("/");
        formattedBirthDate = `${year}-${month}-${day}`;
      }

      // Extract phone number (remove +62 prefix)
      const phoneNumber = formData.phone.replace(/^\+62/, "");

      // Update profile
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          full_name: formData.name,
          email: formData.email,
          phone: phoneNumber,
          date_of_birth: formattedBirthDate,
          address: formData.address,
          role: formData.role,
        })
        .eq("id", staff.id);

      if (profileError) throw profileError;

      // Update therapist branch if role is customer (for backward compatibility)
      if (formData.role === "customer") {
        const selectedBranch = branches.find((b) => b.name === formData.branch);
        if (selectedBranch) {
          // Check if therapist record exists
          const { data: therapist } = await supabase
            .from("therapists")
            .select("id")
            .eq("profile_id", staff.id)
            .single();

          if (therapist) {
            // Update existing therapist
            const { error: therapistError } = await supabase
              .from("therapists")
              .update({
                branch_id: selectedBranch.id,
                is_active: formData.status === "active",
              })
              .eq("id", therapist.id);

            if (therapistError) throw therapistError;
          } else {
            // Create new therapist record
            const { error: therapistError } = await supabase
              .from("therapists")
              .insert({
                profile_id: staff.id,
                branch_id: selectedBranch.id,
                is_active: formData.status === "active",
              });

            if (therapistError) throw therapistError;
          }
        }
      }

      onSave();
    } catch (err: any) {
      console.error("Error saving staff:", err);
      alert("Failed to save staff: " + (err.message || "Unknown error"));
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
            Edit Staff
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
          <div className="grid grid-cols-2 gap-6">
            {/* Name */}
            <div className="col-span-2">
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
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#706C6B] dark:text-[#C1A7A3]">
                  +62
                </span>
                <input
                  type="text"
                  value={formData.phone.replace(/^\+62/, "")}
                  onChange={(e) => handleChange("phone", `+62${e.target.value}`)}
                  className="w-full pl-12 pr-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-[#191919] text-[#191919] dark:text-[#F0EEED] focus:outline-none focus:ring-2 focus:ring-[#C1A7A3]"
                />
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-[#706C6B] dark:text-[#C1A7A3] mb-2">
                Address
              </label>
              <textarea
                value={formData.address}
                onChange={(e) => handleChange("address", e.target.value)}
                rows={3}
                className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-[#191919] text-[#191919] dark:text-[#F0EEED] focus:outline-none focus:ring-2 focus:ring-[#C1A7A3] resize-none"
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
                  value={staff.registeredDate}
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

            {/* Role */}
            <div>
              <label className="block text-sm font-medium text-[#706C6B] dark:text-[#C1A7A3] mb-2">
                Role
              </label>
              <Dropdown
                options={[
                  { value: "customer", label: "Customer" },
                  { value: "receptionist", label: "Receptionist" },
                  { value: "cook_helper", label: "Cook Helper" },
                  { value: "spa_attendant", label: "Spa Attendant" },
                ]}
                value={formData.role}
                onChange={(value) => handleChange("role", value)}
                placeholder="Select role"
              />
            </div>

            {/* Branch (only for customers) */}
            {formData.role === "customer" && (
              <div>
                <label className="block text-sm font-medium text-[#706C6B] dark:text-[#C1A7A3] mb-2">
                  Branch
                </label>
                <Dropdown
                  options={branches.map((b) => ({ value: b.name, label: b.name }))}
                  value={formData.branch}
                  onChange={(value) => handleChange("branch", value)}
                  placeholder="Select branch"
                />
              </div>
            )}

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-[#706C6B] dark:text-[#C1A7A3] mb-2">
                Status
              </label>
              <Dropdown
                options={[
                  { value: "active", label: "Active" },
                  { value: "inactive", label: "Inactive" },
                ]}
                value={formData.status}
                onChange={(value) => handleChange("status", value as "active" | "inactive")}
                placeholder="Select status"
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

