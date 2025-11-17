"use client";

import React, { useMemo } from "react";
import { Appointment, Therapist, TimeSlot } from "@/types/appointment";
import { TimeAxis } from "./TimeAxis";
import { TherapistHeader } from "./TherapistHeader";
import { RoomHeader } from "./RoomHeader";
import { DayHeader } from "./DayHeader";
import { AppointmentCard } from "./AppointmentCard";
import { CurrentTimeIndicator } from "./CurrentTimeIndicator";

interface Room {
  id: string;
  name: string;
}

interface DayColumn {
  date: Date;
  dateStr: string; // YYYY-MM-DD format
}

interface AppointmentScheduleProps {
  appointments: Appointment[];
  therapists: Therapist[];
  rooms?: Room[];
  viewType?: "therapist" | "room" | "day" | "week";
  dateRange?: { start: Date; end: Date };
  startHour?: number;
  endHour?: number;
  hourHeight?: number; // Height in pixels for each hour
}

export const AppointmentSchedule: React.FC<AppointmentScheduleProps> = ({
  appointments,
  therapists,
  rooms = [],
  viewType = "therapist",
  dateRange,
  startHour = 8,
  endHour = 14,
  hourHeight = 80,
}) => {
  // Generate time slots
  const timeSlots: TimeSlot[] = useMemo(() => {
    const slots: TimeSlot[] = [];
    // Generate slots from startHour to endHour (inclusive)
    for (let hour = startHour; hour <= endHour; hour++) {
      slots.push({
        hour,
        minute: 0,
        display: `${hour.toString().padStart(2, "0")}:00`,
      });
    }
    return slots;
  }, [startHour, endHour]);

  // Calculate appointment positions
  const getAppointmentPosition = (appointment: Appointment) => {
    const [apptStartHour, apptStartMinute] = appointment.startTime.split(":").map(Number);
    const [apptEndHour, apptEndMinute] = appointment.endTime.split(":").map(Number);
    
    const startMinutes = (apptStartHour - startHour) * 60 + apptStartMinute;
    const endMinutes = (apptEndHour - startHour) * 60 + apptEndMinute;
    const duration = endMinutes - startMinutes;
    
    const top = (startMinutes / 60) * hourHeight;
    const height = (duration / 60) * hourHeight;
    
    return { top, height };
  };

  // Get appointments for a specific therapist
  const getAppointmentsForTherapist = (therapistId: string) => {
    if (therapistId === "__unassigned__") {
      // Return appointments without therapist_id
      return appointments.filter((apt) => !apt.therapistId || apt.therapistId === "");
    }
    return appointments.filter((apt) => apt.therapistId === therapistId);
  };

  // Get appointments for a specific room
  const getAppointmentsForRoom = (roomId: string) => {
    if (roomId === "__unassigned__") {
      // Return appointments without room_id
      return appointments.filter((apt) => !apt.roomId || apt.roomId === undefined);
    }
    return appointments.filter((apt) => apt.roomId === roomId);
  };

  // Get appointments for a specific day
  const getAppointmentsForDay = (dateStr: string) => {
    return appointments.filter((apt) => {
      if (!apt.bookingDate) return false;
      const aptDateStr = apt.bookingDate.split("T")[0];
      return aptDateStr === dateStr;
    });
  };

  // Generate day columns for week view
  const dayColumns = useMemo(() => {
    if (viewType !== "week" && viewType !== "day" || !dateRange) {
      return [];
    }

    const days: DayColumn[] = [];
    const current = new Date(dateRange.start);
    const end = new Date(dateRange.end);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    while (current <= end) {
      const dateStr = current.toISOString().split("T")[0];
      days.push({
        date: new Date(current),
        dateStr,
      });
      current.setDate(current.getDate() + 1);
    }

    return days;
  }, [viewType, dateRange]);

  // Get current time for indicator
  const currentTime = useMemo(() => new Date(), []);

  const totalHeight = (endHour - startHour + 1) * hourHeight;
  
  // Determine columns based on view type
  let columns: any[] = [];
  let columnCount = 0;
  
  if (viewType === "week") {
    columns = dayColumns;
    columnCount = dayColumns.length;
  } else if (viewType === "day") {
    columns = dayColumns; // Single day column
    columnCount = dayColumns.length;
  } else if (viewType === "room") {
    columns = rooms;
    columnCount = rooms.length;
  } else {
    columns = therapists;
    columnCount = therapists.length;
  }

  // Show empty state if no columns
  if (columnCount === 0) {
    return (
      <div className="flex flex-col bg-white dark:bg-[#191919] rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        {/* Headers - Empty */}
        <div className="flex border-b border-zinc-200 dark:border-zinc-800">
          <div className="w-20 flex-shrink-0 border-r border-zinc-200 dark:border-zinc-800" /> {/* Spacer for time axis */}
          <div className="flex-1 p-4 text-center text-[#706C6B] dark:text-[#C1A7A3]">
            {viewType === "room" 
              ? "No rooms with appointments in this date range"
              : "No therapists with appointments in this date range"}
          </div>
        </div>
        {/* Schedule Grid - Empty */}
        <div className="flex overflow-auto" style={{ maxHeight: '70vh' }}>
          <div className="flex-shrink-0 w-20 border-r border-zinc-200 dark:border-zinc-800">
            <TimeAxis timeSlots={timeSlots} hourHeight={hourHeight} />
          </div>
          <div className="flex-1 relative" style={{ minHeight: `${totalHeight}px` }}>
            {/* Empty schedule grid */}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-white dark:bg-[#191919] rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden">
      {/* Headers - Day, Therapist, or Room */}
      <div className="flex border-b border-zinc-200 dark:border-zinc-800">
        <div className="w-20 flex-shrink-0 border-r border-zinc-200 dark:border-zinc-800" /> {/* Spacer for time axis */}
        {viewType === "week" || viewType === "day" ? (
          dayColumns.length > 0 ? (
            dayColumns.map((day) => {
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              const dayDate = new Date(day.date);
              dayDate.setHours(0, 0, 0, 0);
              const isToday = dayDate.getTime() === today.getTime();
              
              return (
                <div key={day.dateStr} className="flex-1 min-w-0">
                  <DayHeader date={day.date} isToday={isToday} />
                </div>
              );
            })
          ) : (
            <div className="flex-1 p-4 text-center text-[#706C6B] dark:text-[#C1A7A3]">
              No days in date range
            </div>
          )
        ) : viewType === "room" ? (
          rooms.length > 0 ? (
            rooms.map((room) => (
              <div key={room.id} className="flex-1 min-w-0">
                <RoomHeader room={room} />
              </div>
            ))
          ) : (
            <div className="flex-1 p-4 text-center text-[#706C6B] dark:text-[#C1A7A3]">
              No rooms with appointments
            </div>
          )
        ) : (
          therapists.length > 0 ? (
            therapists.map((therapist) => (
              <div key={therapist.id} className="flex-1 min-w-0">
                <TherapistHeader therapist={therapist} />
              </div>
            ))
          ) : (
            <div className="flex-1 p-4 text-center text-[#706C6B] dark:text-[#C1A7A3]">
              No therapists with appointments
            </div>
          )
        )}
      </div>

      {/* Schedule Grid */}
      <div className="flex overflow-auto" style={{ maxHeight: '70vh' }}>
        {/* Time Axis */}
        <div className="flex-shrink-0 w-20 border-r border-zinc-200 dark:border-zinc-800">
          <TimeAxis timeSlots={timeSlots} hourHeight={hourHeight} />
        </div>

        {/* Appointment Columns */}
        <div className="flex-1 relative" style={{ minHeight: `${totalHeight}px` }}>
          {/* Current Time Indicator */}
          <CurrentTimeIndicator
            currentTime={currentTime}
            startHour={startHour}
            hourHeight={hourHeight}
            columnCount={columnCount}
          />

          {/* Horizontal grid lines - span across all columns */}
          {timeSlots.map((slot, index) => (
            <div
              key={`grid-line-${index}`}
              className="absolute left-0 right-0 border-b border-zinc-200 dark:border-zinc-800 z-0 pointer-events-none"
              style={{ 
                top: `${index * hourHeight}px`,
                height: '1px',
                borderBottomWidth: '1px'
              }}
            />
          ))}
          {/* Final border at the very bottom */}
          <div
            className="absolute left-0 right-0 bottom-0 border-b border-zinc-200 dark:border-zinc-800 z-0 pointer-events-none"
            style={{ borderBottomWidth: '1px' }}
          />

          {/* Columns - Day, Therapist, or Room */}
          <div className="flex absolute inset-0">
            {viewType === "week" || viewType === "day" ? (
              dayColumns.map((day) => (
                <div
                  key={day.dateStr}
                  className="flex-1 border-r border-zinc-200 dark:border-zinc-800 last:border-r-0 relative"
                  style={{ height: `${totalHeight}px` }}
                >
                  {/* Appointments for this day */}
                  {getAppointmentsForDay(day.dateStr).map((appointment) => {
                    const { top, height } = getAppointmentPosition(appointment);
                    return (
                      <div
                        key={appointment.id}
                        className="absolute left-1 right-1 z-20"
                        style={{ 
                          top: `${top}px`, 
                          height: `${height}px`,
                          minHeight: `${height}px`
                        }}
                      >
                        <AppointmentCard appointment={appointment} />
                      </div>
                    );
                  })}
                </div>
              ))
            ) : viewType === "room" ? (
              rooms.map((room) => (
                <div
                  key={room.id}
                  className="flex-1 border-r border-zinc-200 dark:border-zinc-800 last:border-r-0 relative"
                  style={{ height: `${totalHeight}px` }}
                >
                  {/* Appointments for this room */}
                  {getAppointmentsForRoom(room.id).map((appointment) => {
                    const { top, height } = getAppointmentPosition(appointment);
                    return (
                      <div
                        key={appointment.id}
                        className="absolute left-1 right-1 z-20"
                        style={{ 
                          top: `${top}px`, 
                          height: `${height}px`,
                          minHeight: `${height}px`
                        }}
                      >
                        <AppointmentCard appointment={appointment} />
                      </div>
                    );
                  })}
                </div>
              ))
            ) : (
              therapists.map((therapist) => (
                <div
                  key={therapist.id}
                  className="flex-1 border-r border-zinc-200 dark:border-zinc-800 last:border-r-0 relative"
                  style={{ height: `${totalHeight}px` }}
                >
                  {/* Appointments for this therapist */}
                  {getAppointmentsForTherapist(therapist.id).map((appointment) => {
                    const { top, height } = getAppointmentPosition(appointment);
                    return (
                      <div
                        key={appointment.id}
                        className="absolute left-1 right-1 z-20"
                        style={{ 
                          top: `${top}px`, 
                          height: `${height}px`,
                          minHeight: `${height}px`
                        }}
                      >
                        <AppointmentCard appointment={appointment} />
                      </div>
                    );
                  })}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

