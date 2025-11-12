"use client";

import React, { useMemo } from "react";
import { Appointment, Therapist, TimeSlot } from "@/types/appointment";
import { TimeAxis } from "./TimeAxis";
import { TherapistHeader } from "./TherapistHeader";
import { AppointmentCard } from "./AppointmentCard";
import { CurrentTimeIndicator } from "./CurrentTimeIndicator";

interface AppointmentScheduleProps {
  appointments: Appointment[];
  therapists: Therapist[];
  startHour?: number;
  endHour?: number;
  hourHeight?: number; // Height in pixels for each hour
}

export const AppointmentSchedule: React.FC<AppointmentScheduleProps> = ({
  appointments,
  therapists,
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
    return appointments.filter((apt) => apt.therapistId === therapistId);
  };

  // Get current time for indicator
  const currentTime = useMemo(() => new Date(), []);

  const totalHeight = (endHour - startHour + 1) * hourHeight;

  return (
    <div className="flex flex-col bg-white dark:bg-[#191919] rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden">
      {/* Therapist Headers */}
      <div className="flex border-b border-zinc-200 dark:border-zinc-800">
        <div className="w-20 flex-shrink-0 border-r border-zinc-200 dark:border-zinc-800" /> {/* Spacer for time axis */}
        {therapists.map((therapist) => (
          <div key={therapist.id} className="flex-1 min-w-0">
            <TherapistHeader therapist={therapist} />
          </div>
        ))}
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
            columnCount={therapists.length}
          />

          {/* Horizontal grid lines - span across all columns */}
          {timeSlots.map((slot, index) => (
            <div
              key={`grid-line-${index}`}
              className="absolute left-0 right-0 border-b border-zinc-200 dark:border-zinc-800 z-0 pointer-events-none"
              style={{ 
                top: `${index * hourHeight}px`,
                height: '0px',
                borderBottomWidth: '1px'
              }}
            />
          ))}
          {/* Final border at the very bottom */}
          <div
            className="absolute left-0 right-0 bottom-0 border-b border-zinc-200 dark:border-zinc-800 z-0 pointer-events-none"
            style={{ borderBottomWidth: '1px' }}
          />

          {/* Therapist Columns */}
          <div className="flex absolute inset-0">
            {therapists.map((therapist) => (
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
                      className="absolute left-1 right-1 z-10"
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
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

