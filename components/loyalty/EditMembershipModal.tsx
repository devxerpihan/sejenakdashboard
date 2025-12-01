"use client";

import React, { useState, useEffect } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import { Membership } from "@/types/membership";
import { Dropdown } from "@/components/ui/Dropdown";

interface EditMembershipModalProps {
  isOpen: boolean;
  onClose: () => void;
  membership: Membership;
  onSave: (updatedMembership: Membership) => void;
}

export const EditMembershipModal: React.FC<EditMembershipModalProps> = ({
  isOpen,
  onClose,
  membership,
  onSave,
}) => {
  // Calculate spending in Rupiah (1 point = Rp1,000)
  const spendingInRupiah = membership.minPoints * 1000;
  // Extract number from expiry string (e.g., "12 month" -> 12)
  const expiryMonths = parseInt(membership.expiry.split(" ")[0]) || 12;

  // Default auto reward options
  const defaultAutoRewards = [
    "Free Herbal Tea",
    "Free Sejenak Quick Hairwash",
    "Exclusive Elite Ritual Box",
    "Welcome voucher",
  ];

  const [formData, setFormData] = useState({
    spending: spendingInRupiah.toLocaleString("id-ID"),
    expiry: expiryMonths.toString(),
    multiplier: membership.multiplier.toString(),
    autoReward: membership.autoReward,
    cashback: membership.cashback.toString(),
    stampProgram: membership.stampProgram,
    doubleStampWeekday: membership.doubleStampWeekday || false,
    doubleStampEvent: membership.doubleStampEvent || false,
    priorityBooking: membership.priorityBooking || false,
    freeRewards: membership.freeRewards || [],
    upgradeRequirement: membership.upgradeRequirement ? (membership.upgradeRequirement / 1000000).toString() : "",
    maintainRequirement: membership.maintainRequirement ? (membership.maintainRequirement / 1000000).toString() : "",
    description: membership.description || "",
    customerProfile: membership.customerProfile || "",
  });

  const [autoRewardOptions, setAutoRewardOptions] = useState<string[]>(() => {
    // Initialize with default options, ensuring current value is included
    const options = [...defaultAutoRewards];
    if (!options.includes(membership.autoReward)) {
      options.push(membership.autoReward);
    }
    return options;
  });

  const [newAutoReward, setNewAutoReward] = useState("");

  useEffect(() => {
    if (isOpen) {
      const spendingInRupiah = membership.minPoints * 1000;
      const expiryMonths = parseInt(membership.expiry.split(" ")[0]) || 12;
      setFormData({
        spending: spendingInRupiah.toLocaleString("id-ID"),
        expiry: expiryMonths.toString(),
        multiplier: membership.multiplier.toString(),
        autoReward: membership.autoReward,
        cashback: membership.cashback.toString(),
        stampProgram: membership.stampProgram,
        doubleStampWeekday: membership.doubleStampWeekday || false,
        doubleStampEvent: membership.doubleStampEvent || false,
        priorityBooking: membership.priorityBooking || false,
        freeRewards: membership.freeRewards || [],
        upgradeRequirement: membership.upgradeRequirement ? (membership.upgradeRequirement / 1000000).toString() : "",
        maintainRequirement: membership.maintainRequirement ? (membership.maintainRequirement / 1000000).toString() : "",
        description: membership.description || "",
        customerProfile: membership.customerProfile || "",
      });
      // Update auto reward options to include current value
      setAutoRewardOptions((prev) => {
        if (!prev.includes(membership.autoReward)) {
          return [...prev, membership.autoReward];
        }
        return prev;
      });
    }
  }, [isOpen, membership]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    // Convert spending back to points (remove dots, divide by 1000)
    const spendingValue = parseInt(formData.spending.replace(/\./g, "")) || 0;
    const minPoints = Math.floor(spendingValue / 1000);

    const updatedMembership: Membership = {
      ...membership,
      minPoints,
      multiplier: parseFloat(formData.multiplier),
      expiry: `${formData.expiry} month`,
      autoReward: formData.autoReward,
      cashback: parseInt(formData.cashback),
      stampProgram: formData.stampProgram,
      doubleStampWeekday: formData.doubleStampWeekday,
      doubleStampEvent: formData.doubleStampEvent,
      priorityBooking: formData.priorityBooking,
      freeRewards: formData.freeRewards,
      upgradeRequirement: formData.upgradeRequirement ? parseFloat(formData.upgradeRequirement) * 1000000 : undefined,
      maintainRequirement: formData.maintainRequirement ? parseFloat(formData.maintainRequirement) * 1000000 : undefined,
      description: formData.description,
      customerProfile: formData.customerProfile,
    };

    onSave(updatedMembership);
    onClose();
  };

  const multiplierOptions = [
    { value: "1", label: "1x" },
    { value: "1.25", label: "1.25x" },
    { value: "1.5", label: "1.5x" },
  ];

  const handleAddAutoReward = () => {
    if (newAutoReward.trim() && !autoRewardOptions.includes(newAutoReward.trim())) {
      setAutoRewardOptions([...autoRewardOptions, newAutoReward.trim()]);
      setNewAutoReward("");
    }
  };

  const handleRemoveAutoReward = (reward: string) => {
    // Don't allow removing if it's the currently selected reward
    if (reward === formData.autoReward) {
      return;
    }
    setAutoRewardOptions(autoRewardOptions.filter((r) => r !== reward));
  };

  const autoRewardDropdownOptions = autoRewardOptions.map((reward) => ({
    value: reward,
    label: reward,
  }));

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/20 backdrop-blur-[2px]"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white dark:bg-[#191919] rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
          <h2 className="text-xl font-semibold text-[#191919] dark:text-[#F0EEED]">
            Edit Membership
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
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="grid grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              {/* Tier */}
              <div>
                <label className="block text-sm font-medium text-[#706C6B] dark:text-[#C1A7A3] mb-2">
                  Tier
                </label>
                <input
                  type="text"
                  value={membership.tier}
                  readOnly
                  className="w-full px-3 py-2 bg-zinc-100 dark:bg-[#3D3B3A] border border-zinc-300 dark:border-zinc-700 rounded-md text-[#191919] dark:text-[#F0EEED] cursor-not-allowed"
                />
              </div>

              {/* Spending (RP) */}
              <div>
                <label className="block text-sm font-medium text-[#706C6B] dark:text-[#C1A7A3] mb-2">
                  Spending (RP)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.spending}
                    onChange={(e) => {
                      // Allow only numbers and dots
                      const value = e.target.value.replace(/[^\d.]/g, "");
                      // Format with dots as thousand separators
                      const numValue = value.replace(/\./g, "");
                      if (numValue === "" || !isNaN(Number(numValue))) {
                        const formatted = numValue
                          ? parseInt(numValue).toLocaleString("id-ID")
                          : "";
                        handleChange("spending", formatted);
                      }
                    }}
                    placeholder="0"
                    className="w-full px-3 py-2 bg-white dark:bg-[#191919] border border-zinc-300 dark:border-zinc-700 rounded-md text-[#191919] dark:text-[#F0EEED] focus:outline-none focus:ring-2 focus:ring-[#C1A7A3] dark:focus:ring-[#706C6B]"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#706C6B] dark:text-[#C1A7A3]">
                    /
                  </span>
                </div>
              </div>

              {/* Expiry (month) */}
              <div>
                <label className="block text-sm font-medium text-[#706C6B] dark:text-[#C1A7A3] mb-2">
                  Expiry (month)
                </label>
                <input
                  type="number"
                  value={formData.expiry}
                  onChange={(e) => handleChange("expiry", e.target.value)}
                  min="1"
                  className="w-full px-3 py-2 bg-white dark:bg-[#191919] border border-zinc-300 dark:border-zinc-700 rounded-md text-[#191919] dark:text-[#F0EEED] focus:outline-none focus:ring-2 focus:ring-[#C1A7A3] dark:focus:ring-[#706C6B]"
                />
              </div>

              {/* Cashback (%) */}
              <div>
                <label className="block text-sm font-medium text-[#706C6B] dark:text-[#C1A7A3] mb-2">
                  Cashback (%)
                </label>
                <input
                  type="number"
                  value={formData.cashback}
                  onChange={(e) => handleChange("cashback", e.target.value)}
                  min="0"
                  max="100"
                  step="0.1"
                  className="w-full px-3 py-2 bg-white dark:bg-[#191919] border border-zinc-300 dark:border-zinc-700 rounded-md text-[#191919] dark:text-[#F0EEED] focus:outline-none focus:ring-2 focus:ring-[#C1A7A3] dark:focus:ring-[#706C6B]"
                />
              </div>

              {/* Upgrade Requirement (Million RP) */}
              {membership.tier !== "Elite" && (
                <div>
                  <label className="block text-sm font-medium text-[#706C6B] dark:text-[#C1A7A3] mb-2">
                    Upgrade Requirement (Million RP)
                  </label>
                  <input
                    type="number"
                    value={formData.upgradeRequirement}
                    onChange={(e) => handleChange("upgradeRequirement", e.target.value)}
                    min="0"
                    step="0.1"
                    placeholder="e.g., 3 for Rp3,000,000"
                    className="w-full px-3 py-2 bg-white dark:bg-[#191919] border border-zinc-300 dark:border-zinc-700 rounded-md text-[#191919] dark:text-[#F0EEED] focus:outline-none focus:ring-2 focus:ring-[#C1A7A3] dark:focus:ring-[#706C6B]"
                  />
                </div>
              )}

              {/* Maintain Requirement (Million RP) - Elite only */}
              {membership.tier === "Elite" && (
                <div>
                  <label className="block text-sm font-medium text-[#706C6B] dark:text-[#C1A7A3] mb-2">
                    Maintain Requirement (Million RP)
                  </label>
                  <input
                    type="number"
                    value={formData.maintainRequirement}
                    onChange={(e) => handleChange("maintainRequirement", e.target.value)}
                    min="0"
                    step="0.1"
                    placeholder="e.g., 12 for Rp12,000,000"
                    className="w-full px-3 py-2 bg-white dark:bg-[#191919] border border-zinc-300 dark:border-zinc-700 rounded-md text-[#191919] dark:text-[#F0EEED] focus:outline-none focus:ring-2 focus:ring-[#C1A7A3] dark:focus:ring-[#706C6B]"
                  />
                </div>
              )}

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-[#706C6B] dark:text-[#C1A7A3] mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 bg-white dark:bg-[#191919] border border-zinc-300 dark:border-zinc-700 rounded-md text-[#191919] dark:text-[#F0EEED] focus:outline-none focus:ring-2 focus:ring-[#C1A7A3] dark:focus:ring-[#706C6B]"
                />
              </div>

              {/* Customer Profile */}
              <div>
                <label className="block text-sm font-medium text-[#706C6B] dark:text-[#C1A7A3] mb-2">
                  Customer Profile
                </label>
                <input
                  type="text"
                  value={formData.customerProfile}
                  onChange={(e) => handleChange("customerProfile", e.target.value)}
                  placeholder="e.g., Rutin tiap minggu"
                  className="w-full px-3 py-2 bg-white dark:bg-[#191919] border border-zinc-300 dark:border-zinc-700 rounded-md text-[#191919] dark:text-[#F0EEED] focus:outline-none focus:ring-2 focus:ring-[#C1A7A3] dark:focus:ring-[#706C6B]"
                />
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              {/* Multiplier */}
              <div>
                <label className="block text-sm font-medium text-[#706C6B] dark:text-[#C1A7A3] mb-2">
                  Multiplier
                </label>
                <Dropdown
                  options={multiplierOptions}
                  value={formData.multiplier}
                  onChange={(value) => handleChange("multiplier", value)}
                  placeholder="Select multiplier"
                />
              </div>

              {/* Auto Reward */}
              <div>
                <label className="block text-sm font-medium text-[#706C6B] dark:text-[#C1A7A3] mb-2">
                  Auto Reward
                </label>
                <div className="space-y-2">
                  <Dropdown
                    options={autoRewardDropdownOptions}
                    value={formData.autoReward}
                    onChange={(value) => handleChange("autoReward", value)}
                    placeholder="Select or type auto reward"
                  />
                  
                  {/* Add new auto reward */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newAutoReward}
                      onChange={(e) => setNewAutoReward(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddAutoReward();
                        }
                      }}
                      placeholder="Add new reward..."
                      className="flex-1 px-3 py-2 text-sm bg-white dark:bg-[#191919] border border-zinc-300 dark:border-zinc-700 rounded-md text-[#191919] dark:text-[#F0EEED] focus:outline-none focus:ring-2 focus:ring-[#C1A7A3] dark:focus:ring-[#706C6B]"
                    />
                    <button
                      type="button"
                      onClick={handleAddAutoReward}
                      disabled={!newAutoReward.trim() || autoRewardOptions.includes(newAutoReward.trim())}
                      className="px-3 py-2 text-sm font-medium text-white bg-[#C1A7A3] dark:bg-[#706C6B] rounded-md hover:bg-[#A8928F] dark:hover:bg-[#5A4F4D] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Add new auto reward"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Manage auto rewards list */}
                  <div className="mt-3">
                    <label className="block text-xs font-medium text-[#706C6B] dark:text-[#C1A7A3] mb-2">
                      Available Auto Rewards
                    </label>
                    <div className="max-h-32 overflow-y-auto space-y-1">
                      {autoRewardOptions.map((reward) => (
                        <div
                          key={reward}
                          className="flex items-center justify-between px-2 py-1.5 text-sm bg-zinc-50 dark:bg-[#3D3B3A] rounded border border-zinc-200 dark:border-zinc-700"
                        >
                          <span className="text-[#191919] dark:text-[#F0EEED]">{reward}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveAutoReward(reward)}
                            disabled={reward === formData.autoReward}
                            className="text-[#706C6B] dark:text-[#C1A7A3] hover:text-red-500 dark:hover:text-red-400 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                            title={reward === formData.autoReward ? "Cannot remove selected reward" : "Remove reward"}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Benefits Section */}
              <div className="col-span-2 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                <h3 className="text-sm font-semibold text-[#191919] dark:text-[#F0EEED] mb-4">
                  Benefits
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {/* Stamp Program */}
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="stampProgram"
                      checked={formData.stampProgram}
                      onChange={(e) => setFormData((prev) => ({ ...prev, stampProgram: e.target.checked }))}
                      className="w-4 h-4 text-[#C1A7A3] border-zinc-300 rounded focus:ring-[#C1A7A3]"
                    />
                    <label htmlFor="stampProgram" className="text-sm text-[#191919] dark:text-[#F0EEED]">
                      Stamp Program Access
                    </label>
                  </div>

                  {/* Double Stamp Weekday */}
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="doubleStampWeekday"
                      checked={formData.doubleStampWeekday}
                      onChange={(e) => setFormData((prev) => ({ ...prev, doubleStampWeekday: e.target.checked }))}
                      disabled={!formData.stampProgram}
                      className="w-4 h-4 text-[#C1A7A3] border-zinc-300 rounded focus:ring-[#C1A7A3] disabled:opacity-50"
                    />
                    <label htmlFor="doubleStampWeekday" className="text-sm text-[#191919] dark:text-[#F0EEED]">
                      Double Stamp (Weekday)
                    </label>
                  </div>

                  {/* Double Stamp Event */}
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="doubleStampEvent"
                      checked={formData.doubleStampEvent}
                      onChange={(e) => setFormData((prev) => ({ ...prev, doubleStampEvent: e.target.checked }))}
                      disabled={!formData.stampProgram}
                      className="w-4 h-4 text-[#C1A7A3] border-zinc-300 rounded focus:ring-[#C1A7A3] disabled:opacity-50"
                    />
                    <label htmlFor="doubleStampEvent" className="text-sm text-[#191919] dark:text-[#F0EEED]">
                      Double Stamp Event (Midweek Calm)
                    </label>
                  </div>

                  {/* Priority Booking */}
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="priorityBooking"
                      checked={formData.priorityBooking}
                      onChange={(e) => setFormData((prev) => ({ ...prev, priorityBooking: e.target.checked }))}
                      className="w-4 h-4 text-[#C1A7A3] border-zinc-300 rounded focus:ring-[#C1A7A3]"
                    />
                    <label htmlFor="priorityBooking" className="text-sm text-[#191919] dark:text-[#F0EEED]">
                      Priority Booking Slot
                    </label>
                  </div>
                </div>

                {/* Free Rewards */}
                <div className="mt-4">
                  <label className="block text-sm font-medium text-[#706C6B] dark:text-[#C1A7A3] mb-2">
                    Free Rewards
                  </label>
                  <div className="space-y-2">
                    {formData.freeRewards.map((reward, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={reward}
                          onChange={(e) => {
                            const newRewards = [...formData.freeRewards];
                            newRewards[index] = e.target.value;
                            setFormData((prev) => ({ ...prev, freeRewards: newRewards }));
                          }}
                          className="flex-1 px-3 py-2 text-sm bg-white dark:bg-[#191919] border border-zinc-300 dark:border-zinc-700 rounded-md text-[#191919] dark:text-[#F0EEED] focus:outline-none focus:ring-2 focus:ring-[#C1A7A3] dark:focus:ring-[#706C6B]"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const newRewards = formData.freeRewards.filter((_, i) => i !== index);
                            setFormData((prev) => ({ ...prev, freeRewards: newRewards }));
                          }}
                          className="p-2 text-[#706C6B] dark:text-[#C1A7A3] hover:text-red-500 dark:hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        setFormData((prev) => ({ ...prev, freeRewards: [...prev.freeRewards, ""] }));
                      }}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-[#706C6B] dark:text-[#C1A7A3] border border-zinc-300 dark:border-zinc-700 rounded-md hover:bg-zinc-50 dark:hover:bg-[#3D3B3A] transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Add Free Reward
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-zinc-200 dark:border-zinc-800">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-[#706C6B] dark:text-[#C1A7A3] bg-white dark:bg-[#191919] border border-zinc-300 dark:border-zinc-700 rounded-md hover:bg-zinc-50 dark:hover:bg-[#3D3B3A] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm font-medium text-white bg-[#C1A7A3] dark:bg-[#706C6B] rounded-md hover:bg-[#A8928F] dark:hover:bg-[#5A4F4D] transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

