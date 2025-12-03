"use client";

import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Room, RoomFormData } from "@/types/room";
import { useBranches } from "@/hooks/useBranches";
import { Dropdown, DropdownOption } from "@/components/ui/Dropdown";

interface CreateRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (room: RoomFormData) => Promise<void>;
  room?: Room | null;
  onError?: (message: string) => void;
}

const ROOM_TYPES = [
  "treatment",
  "consultation",
  "relaxation",
];

const ROOM_STATUSES = ["available", "occupied", "maintenance", "cleaning"];

export const CreateRoomModal: React.FC<CreateRoomModalProps> = ({
  isOpen,
  onClose,
  onSave,
  room,
  onError,
}) => {
  const [formData, setFormData] = useState<RoomFormData>({
    name: "",
    branch_id: null,
    room_type: "",
    capacity: 1,
    amenities: [],
    status: "available",
  });
  const [amenitiesInput, setAmenitiesInput] = useState("");
  const [saving, setSaving] = useState(false);

  const { branches, loading: branchesLoading } = useBranches();

  // Reset form when modal opens/closes or room changes
  useEffect(() => {
    if (isOpen) {
      if (room) {
        setFormData({
          name: room.name || "",
          branch_id: room.branch_id || null,
          room_type: room.room_type || "",
          capacity: room.capacity || 1,
          amenities: room.amenities || [],
          status: room.status || "available",
        });
        setAmenitiesInput((room.amenities || []).join(", "));
      } else {
        setFormData({
          name: "",
          branch_id: null,
          room_type: "",
          capacity: 1,
          amenities: [],
          status: "available",
        });
        setAmenitiesInput("");
      }
      setSaving(false);
    }
  }, [isOpen, room]);

  const handleSave = async () => {
    if (!formData.name.trim()) {
      const errorMessage = "Please enter a room name";
      if (onError) {
        onError(errorMessage);
      } else {
        alert(errorMessage);
      }
      return;
    }

    if (!formData.room_type.trim()) {
      const errorMessage = "Please select a room type";
      if (onError) {
        onError(errorMessage);
      } else {
        alert(errorMessage);
      }
      return;
    }

    // Parse amenities from comma-separated string
    const amenities = amenitiesInput
      .split(",")
      .map((a) => a.trim())
      .filter((a) => a.length > 0);

    setSaving(true);
    try {
      await onSave({
        ...formData,
        amenities: amenities.length > 0 ? amenities : null,
      });
      onClose();
    } catch (err: any) {
      console.error("Error saving room:", err);
      const errorMessage = err.message || "Failed to save room";
      if (onError) {
        onError(errorMessage);
      } else {
        alert(errorMessage);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !saving && e.ctrlKey) {
      handleSave();
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

      {/* Modal Content */}
      <div className="relative w-full max-w-2xl bg-white dark:bg-[#191919] rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-200 dark:border-zinc-800 sticky top-0 bg-white dark:bg-[#191919] z-10">
          <h2 className="text-xl font-bold text-[#191919] dark:text-[#F0EEED]">
            {room ? "Edit Room" : "Create Room"}
          </h2>
          <button
            onClick={onClose}
            className="text-[#706C6B] dark:text-[#C1A7A3] hover:text-[#191919] dark:hover:text-[#F0EEED] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Room Name */}
          <div>
            <label className="block text-sm font-medium text-[#191919] dark:text-[#F0EEED] mb-2">
              Room Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g., Room 101"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              onKeyPress={handleKeyPress}
              className="w-full px-4 py-3 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-[#191919] text-[#191919] dark:text-[#F0EEED] placeholder-[#706C6B] focus:outline-none focus:ring-2 focus:ring-[#C1A7A3]"
              autoFocus
            />
          </div>

          {/* Branch */}
          <div>
            <label className="block text-sm font-medium text-[#191919] dark:text-[#F0EEED] mb-2">
              Branch
            </label>
            <Dropdown
              options={[
                { value: "", label: "All Branches" },
                ...branches.map((branch) => ({
                  value: branch.id,
                  label: branch.name,
                })),
              ]}
              value={formData.branch_id || ""}
              onChange={(value) =>
                setFormData({
                  ...formData,
                  branch_id: value || null,
                })
              }
              placeholder="All Branches"
              disabled={branchesLoading}
              className="w-full"
            />
          </div>

          {/* Room Type */}
          <div>
            <label className="block text-sm font-medium text-[#191919] dark:text-[#F0EEED] mb-2">
              Room Type <span className="text-red-500">*</span>
            </label>
            <Dropdown
              options={ROOM_TYPES.map((type) => ({
                value: type,
                label: type.charAt(0).toUpperCase() + type.slice(1),
              }))}
              value={formData.room_type}
              onChange={(value) =>
                setFormData({ ...formData, room_type: value })
              }
              placeholder="Select room type"
              className="w-full"
            />
          </div>

          {/* Capacity */}
          <div>
            <label className="block text-sm font-medium text-[#191919] dark:text-[#F0EEED] mb-2">
              Capacity
            </label>
            <input
              type="number"
              min="1"
              placeholder="1"
              value={formData.capacity || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  capacity: e.target.value ? parseInt(e.target.value) : null,
                })
              }
              className="w-full px-4 py-3 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-[#191919] text-[#191919] dark:text-[#F0EEED] placeholder-[#706C6B] focus:outline-none focus:ring-2 focus:ring-[#C1A7A3]"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-[#191919] dark:text-[#F0EEED] mb-2">
              Status
            </label>
            <Dropdown
              options={ROOM_STATUSES.map((status) => ({
                value: status,
                label: status.charAt(0).toUpperCase() + status.slice(1),
              }))}
              value={formData.status}
              onChange={(value) =>
                setFormData({ ...formData, status: value })
              }
              placeholder="Select status"
              className="w-full"
            />
          </div>

          {/* Amenities */}
          <div>
            <label className="block text-sm font-medium text-[#191919] dark:text-[#F0EEED] mb-2">
              Amenities (comma-separated)
            </label>
            <input
              type="text"
              placeholder="e.g., WiFi, TV, Air Conditioning"
              value={amenitiesInput}
              onChange={(e) => setAmenitiesInput(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-[#191919] text-[#191919] dark:text-[#F0EEED] placeholder-[#706C6B] focus:outline-none focus:ring-2 focus:ring-[#C1A7A3]"
            />
            <p className="text-xs text-[#706C6B] dark:text-[#C1A7A3] mt-1">
              Separate multiple amenities with commas
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-zinc-200 dark:border-zinc-800 sticky bottom-0 bg-white dark:bg-[#191919]">
          <button
            onClick={onClose}
            disabled={saving}
            className="px-6 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg text-sm font-medium text-[#191919] dark:text-[#F0EEED] hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !formData.name.trim() || !formData.room_type.trim()}
            className="px-6 py-2 bg-[#C1A7A3] text-white rounded-lg hover:bg-[#A88F8B] transition-colors disabled:opacity-50 text-sm font-medium"
          >
            {saving ? "Saving..." : room ? "Update" : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
};

