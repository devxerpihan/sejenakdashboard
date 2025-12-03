"use client";

import React, { useState, useEffect } from "react";
import { SejenakDashboardLayout } from "@/components/layout/SejenakDashboardLayout";
import { Footer } from "@/components/layout";
import {
  Breadcrumbs,
  PageHeader,
  Pagination,
  EmptyState,
} from "@/components/services";
import { RoomTable } from "@/components/services/RoomTable";
import { CreateRoomModal } from "@/components/services/CreateRoomModal";
import { PlusIcon, SearchIcon } from "@/components/icons";
import { navItems } from "@/config/navigation";
import { Room, RoomFormData } from "@/types/room";
import { useRooms } from "@/hooks/useRooms";
import { useBranches } from "@/hooks/useBranches";
import { supabase } from "@/lib/supabase";
import { ToastContainer } from "@/components/ui/Toast";

export default function RoomPage() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("darkMode");
      return saved === "true";
    }
    return false;
  });

  const [location, setLocation] = useState("Islamic Village");
  const [dateRange, setDateRange] = useState({
    start: new Date(2025, 0, 1),
    end: new Date(2025, 8, 9),
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Get branches for filtering
  const { branches } = useBranches();
  const selectedBranch = location === "All Locations" 
    ? null 
    : branches.find((b) => b.name === location);
  const selectedBranchId = selectedBranch?.id || null;

  // Fetch rooms from database
  const { rooms: allRooms, loading, error, refetch } = useRooms(selectedBranchId);

  // Toast notifications
  const [toasts, setToasts] = useState<Array<{ id: string; message: string; type?: "success" | "error" | "warning" | "info" }>>([]);
  
  const showToast = (message: string, type: "success" | "error" | "warning" | "info" = "info") => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, type }]);
  };
  
  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  // Apply dark mode class to HTML element and save to localStorage
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("darkMode", "true");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("darkMode", "false");
    }
  }, [isDarkMode]);
    
  // Filter rooms
  const filteredRooms = allRooms.filter((room) => {
    const matchesSearch =
      searchQuery === "" ||
      room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      room.room_type?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  // Pagination
  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredRooms.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedRooms = filteredRooms.slice(startIndex, endIndex);

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const locations = branches.length > 0 
    ? ["All Locations", ...branches.map((b) => b.name)]
    : ["Islamic Village", "Location 2", "Location 3"];

  const handleCreateRoom = () => {
    setSelectedRoom(null);
    setCreateModalOpen(true);
  };

  const handleEditRoom = (room: Room) => {
    setSelectedRoom(room);
    setEditModalOpen(true);
  };

  const handleSaveRoom = async (roomData: RoomFormData) => {
    try {
      if (selectedRoom) {
        // Update existing room
        const { error: updateError } = await supabase
          .from("rooms")
          .update({
            name: roomData.name,
            branch_id: roomData.branch_id,
            room_type: roomData.room_type,
            capacity: roomData.capacity,
            amenities: roomData.amenities,
            status: roomData.status,
            updated_at: new Date().toISOString(),
          })
          .eq("id", selectedRoom.id);

        if (updateError) throw updateError;
        showToast("Room updated successfully!", "success");
      } else {
        // Create new room
        const { error: insertError } = await supabase
          .from("rooms")
          .insert({
            name: roomData.name,
            branch_id: roomData.branch_id,
            room_type: roomData.room_type,
            capacity: roomData.capacity,
            amenities: roomData.amenities,
            status: roomData.status,
          });

        if (insertError) throw insertError;
        showToast("Room created successfully!", "success");
      }

      await refetch();
      setEditModalOpen(false);
      setCreateModalOpen(false);
      setSelectedRoom(null);
    } catch (err: any) {
      console.error("Error saving room:", err);
      showToast(`Failed to save room: ${err.message || "Unknown error"}`, "error");
      throw err;
    }
  };

  const handleDeleteRoom = async (roomId: string) => {
    if (!confirm("Are you sure you want to delete this room? This action cannot be undone.")) {
      return;
    }

    try {
      setDeleting(true);
      const { error: deleteError } = await supabase
        .from("rooms")
        .delete()
        .eq("id", roomId);

      if (deleteError) throw deleteError;

      await refetch();
      showToast("Room deleted successfully!", "success");
    } catch (err: any) {
      console.error("Error deleting room:", err);
      showToast(`Failed to delete room: ${err.message || "Unknown error"}`, "error");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <SejenakDashboardLayout
      navItems={navItems}
      headerTitle=""
      location={location}
      locations={locations}
      onLocationChange={setLocation}
      dateRange={dateRange}
      onDateRangeChange={(direction) => {
        console.log("Navigate", direction);
      }}
      isDarkMode={isDarkMode}
      onDarkModeToggle={() => {
        setIsDarkMode((prev) => !prev);
      }}
      customHeader={null}
      footer={<Footer />}
    >
      <div>
        {/* Breadcrumbs */}
        <Breadcrumbs
          items={[
            { label: "Services", href: "/services" },
            { label: "Room" },
          ]}
        />

        {/* Page Header */}
        <PageHeader
          title="Room"
          actionButtons={[
            {
              label: "Create Room",
              onClick: handleCreateRoom,
              variant: "primary",
              icon: <PlusIcon />,
            },
          ]}
        />

        {/* Search Bar */}
        <div className="relative flex-1 max-w-md mb-6">
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#706C6B] dark:text-[#C1A7A3]">
            <SearchIcon />
          </div>
          <input
            type="text"
            placeholder="Search rooms..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-[#191919] text-[#191919] dark:text-[#F0EEED] placeholder-[#706C6B] focus:outline-none focus:ring-2 focus:ring-[#C1A7A3]"
          />
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12 text-[#706C6B] dark:text-[#C1A7A3]">
            Loading rooms...
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <p className="text-sm text-red-600 dark:text-red-400 mb-4">
              Error: {error}
            </p>
            <button
              onClick={() => refetch()}
              className="px-4 py-2 bg-[#C1A7A3] text-white rounded-lg hover:bg-[#A8928E] transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* Room Table */}
        {!loading && !error && (
          <>
            {paginatedRooms.length > 0 ? (
              <>
                <RoomTable
                  rooms={paginatedRooms}
                  onEdit={handleEditRoom}
                  onDelete={handleDeleteRoom}
                />

                {/* Pagination */}
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={filteredRooms.length}
                  itemsPerPage={itemsPerPage}
                  onPageChange={setCurrentPage}
                />
              </>
            ) : (
              <EmptyState message="No rooms found. Create a room to get started." />
            )}
          </>
        )}

        {/* Modals */}
        <CreateRoomModal
          isOpen={createModalOpen}
          onClose={() => {
            setCreateModalOpen(false);
            setSelectedRoom(null);
          }}
          onSave={handleSaveRoom}
          room={null}
          onError={(message) => showToast(message, "error")}
        />

        <CreateRoomModal
          isOpen={editModalOpen}
          onClose={() => {
            setEditModalOpen(false);
            setSelectedRoom(null);
          }}
          onSave={handleSaveRoom}
          room={selectedRoom}
          onError={(message) => showToast(message, "error")}
        />
      </div>
      
      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </SejenakDashboardLayout>
  );
}

