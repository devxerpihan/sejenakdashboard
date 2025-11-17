"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { AppointmentStatusBadge } from "@/components/appointment/AppointmentStatusBadge";
import { Pagination } from "@/components/services/Pagination";
import Link from "next/link";

export interface DashboardAppointment {
  id: string;
  customerName: string;
  customerAvatar?: string;
  therapistName: string;
  therapistAvatar?: string;
  date: string; // Format: "DD MMM YYYY - HH:mm AM/PM"
  treatment: string;
  status: "completed" | "check-in" | "pending" | "cancelled" | "confirmed" | "schedule";
}

interface AllAppointmentsTableProps {
  appointments: DashboardAppointment[];
  title?: string;
  viewAllLink?: string;
}

export const AllAppointmentsTable: React.FC<AllAppointmentsTableProps> = ({
  appointments,
  title = "All Appointments",
  viewAllLink = "/appointment",
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(appointments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedAppointments = appointments.slice(startIndex, endIndex);

  const getStatusBadge = (status: DashboardAppointment["status"]) => {
    // Map dashboard statuses to appointment statuses
    const statusMap: Record<string, "completed" | "check-in" | "pending" | "cancelled"> = {
      completed: "completed",
      "check-in": "check-in",
      pending: "pending",
      cancelled: "cancelled",
      confirmed: "check-in", // Map confirmed to check-in for badge
      schedule: "pending", // Map schedule to pending for badge
    };

    const mappedStatus = statusMap[status] || "pending";
    return <AppointmentStatusBadge status={mappedStatus} />;
  };

  const getStatusButtonClass = (status: DashboardAppointment["status"]) => {
    switch (status) {
      case "confirmed":
      case "completed":
        return "bg-green-500 text-white";
      case "cancelled":
        return "bg-red-500 text-white";
      case "schedule":
      case "pending":
        return "bg-blue-500 text-white";
      case "check-in":
        return "bg-blue-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const getStatusLabel = (status: DashboardAppointment["status"]) => {
    switch (status) {
      case "confirmed":
        return "Confirmed";
      case "schedule":
        return "Schedule";
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{title}</CardTitle>
          <Link
            href={viewAllLink}
            className="text-sm text-[#C1A7A3] dark:text-[#C1A7A3] hover:text-[#706C6B] dark:hover:text-[#F0EEED] transition-colors"
          >
            View All
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#F0EEED] dark:bg-[#3D3B3A] border-b border-zinc-200 dark:border-zinc-800">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#706C6B] dark:text-[#C1A7A3] uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#706C6B] dark:text-[#C1A7A3] uppercase tracking-wider">
                  Therapist
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#706C6B] dark:text-[#C1A7A3] uppercase tracking-wider">
                  Date & Time
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#706C6B] dark:text-[#C1A7A3] uppercase tracking-wider">
                  Treatment
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#706C6B] dark:text-[#C1A7A3] uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {paginatedAppointments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-sm text-[#706C6B] dark:text-[#C1A7A3]">
                    No appointments found
                  </td>
                </tr>
              ) : (
                paginatedAppointments.map((appointment) => (
                <tr
                  key={appointment.id}
                  className="hover:bg-[#F0EEED] dark:hover:bg-[#3D3B3A] transition-colors"
                >
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Avatar
                        src={appointment.customerAvatar}
                        name={appointment.customerName}
                        size="sm"
                      />
                      <span className="text-sm font-medium text-[#191919] dark:text-[#F0EEED]">
                        {appointment.customerName}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Avatar
                        src={appointment.therapistAvatar}
                        name={appointment.therapistName}
                        size="sm"
                      />
                      <span className="text-sm text-[#706C6B] dark:text-[#C1A7A3]">
                        {appointment.therapistName}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="text-sm text-[#706C6B] dark:text-[#C1A7A3]">
                      {appointment.date}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-[#706C6B] dark:text-[#C1A7A3]">
                      {appointment.treatment}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusButtonClass(
                        appointment.status
                      )}`}
                    >
                      {getStatusLabel(appointment.status)}
                    </span>
                  </td>
                </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {appointments.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={appointments.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
          />
        )}
      </CardContent>
    </Card>
  );
};

