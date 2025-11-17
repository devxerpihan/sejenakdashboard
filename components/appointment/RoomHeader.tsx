"use client";

import React from "react";

interface Room {
  id: string;
  name: string;
}

interface RoomHeaderProps {
  room: Room;
}

export const RoomHeader: React.FC<RoomHeaderProps> = ({ room }) => {
  return (
    <div className="p-3 border-b border-zinc-200 dark:border-zinc-800 bg-[#F0EEED] dark:bg-[#3D3B3A]">
      <p className="text-sm font-semibold text-[#191919] dark:text-[#F0EEED] truncate">
        {room.name}
      </p>
    </div>
  );
};

