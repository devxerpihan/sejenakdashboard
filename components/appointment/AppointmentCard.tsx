"use client";

import React from "react";
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
  return (
    <div
      className="p-2 rounded-lg text-xs shadow-sm border border-zinc-200 dark:border-zinc-800"
      style={{
        backgroundColor: appointment.color || "#FEF3C7",
        ...style,
      }}
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

