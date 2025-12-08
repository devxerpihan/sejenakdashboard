"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Appointment } from "@/types/appointment";
import { AppointmentStatusBadge } from "./AppointmentStatusBadge";

interface AppointmentCardProps {
  appointment: Appointment;
  style?: React.CSSProperties;
}

export const AppointmentCard: React.FC<AppointmentCardProps> = ({
  appointment,
  style,
}) => {
  const router = useRouter();

  return (
    <div
      className="p-2 rounded-lg text-xs shadow-sm border border-zinc-200 dark:border-zinc-800 cursor-pointer hover:opacity-90 transition-opacity"
      style={{
        backgroundColor: appointment.color || "#FEF3C7",
        ...style,
      }}
      onClick={() => router.push(`/appointment/${appointment.id}`)}
    >
      <p className="font-semibold text-[#191919] dark:text-[#F0EEED] mb-1">
        {appointment.treatmentName}
      </p>
      <p className="text-[#706C6B] dark:text-[#C1A7A3] mb-1">
        {appointment.patientName}
      </p>
      <p className="text-[#706C6B] dark:text-[#C1A7A3] mb-2">
        {appointment.startTime} - {appointment.endTime} at {appointment.room}
      </p>
      {appointment.status && (
        <AppointmentStatusBadge status={appointment.status} />
      )}
    </div>
  );
};

