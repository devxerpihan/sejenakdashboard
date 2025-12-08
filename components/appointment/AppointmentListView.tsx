"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Appointment } from "@/types/appointment";
import { AppointmentStatusBadge } from "./AppointmentStatusBadge";
import { Avatar } from "@/components/ui/Avatar";
import { Pagination } from "@/components/services/Pagination";

interface AppointmentListViewProps {
  appointments: Appointment[];
  loading?: boolean;
}

export const AppointmentListView: React.FC<AppointmentListViewProps> = ({
  appointments,
  loading = false,
}) => {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const totalPages = Math.ceil(appointments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedAppointments = appointments.slice(startIndex, endIndex);

  // Format date and time
  const formatDateTime = (bookingDate: string, startTime: string, endTime: string) => {
    try {
      const date = new Date(bookingDate);
      const dateStr = date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      });
      
      // Format time
      const [startHour, startMin] = startTime.split(":");
      const [endHour, endMin] = endTime.split(":");
      const startHour12 = parseInt(startHour) % 12 || 12;
      const endHour12 = parseInt(endHour) % 12 || 12;
      const startAmpm = parseInt(startHour) >= 12 ? "PM" : "AM";
      const endAmpm = parseInt(endHour) >= 12 ? "PM" : "AM";
      
      return {
        date: dateStr,
        time: `${startHour12}:${startMin} ${startAmpm} - ${endHour12}:${endMin} ${endAmpm}`,
      };
    } catch {
      return {
        date: bookingDate,
        time: `${startTime} - ${endTime}`,
      };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-[#706C6B] dark:text-[#C1A7A3]">
          Loading appointments...
        </div>
      </div>
    );
  }

  if (appointments.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-[#706C6B] dark:text-[#C1A7A3]">
          No appointments found for the selected date range.
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#191919] rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden">
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-[#F0EEED] dark:bg-[#3D3B3A] border-b border-zinc-200 dark:border-zinc-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-[#191919] dark:text-[#F0EEED] uppercase tracking-wider">
                Date & Time
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-[#191919] dark:text-[#F0EEED] uppercase tracking-wider">
                Patient
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-[#191919] dark:text-[#F0EEED] uppercase tracking-wider">
                Treatment
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-[#191919] dark:text-[#F0EEED] uppercase tracking-wider">
                Room
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-[#191919] dark:text-[#F0EEED] uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {paginatedAppointments.map((appointment) => {
              const { date, time } = formatDateTime(
                appointment.bookingDate,
                appointment.startTime,
                appointment.endTime
              );
              
              return (
                <tr
                  key={appointment.id}
                  className="hover:bg-[#F0EEED] dark:hover:bg-[#3D3B3A] transition-colors cursor-pointer"
                  onClick={() => router.push(`/appointment/${appointment.id}`)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-[#191919] dark:text-[#F0EEED]">
                      <div className="font-medium">{date}</div>
                      <div className="text-xs text-[#706C6B] dark:text-[#C1A7A3] mt-1">
                        {time}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8 rounded-full bg-[#C1A7A3] dark:bg-[#706C6B] flex items-center justify-center text-white text-xs font-medium">
                        {appointment.patientName.charAt(0).toUpperCase()}
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-[#191919] dark:text-[#F0EEED]">
                          {appointment.patientName}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-[#191919] dark:text-[#F0EEED]">
                      {appointment.treatmentName}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-[#706C6B] dark:text-[#C1A7A3]">
                      {appointment.room}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {appointment.status && (
                      <AppointmentStatusBadge status={appointment.status} />
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-zinc-200 dark:border-zinc-800">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={appointments.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </div>
  );
};

