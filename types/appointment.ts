// Appointment Page Types

export interface Appointment {
  id: string;
  treatmentName: string;
  patientName: string;
  startTime: string; // Format: "HH:mm"
  endTime: string; // Format: "HH:mm"
  room: string;
  therapistId: string;
  status?: "completed" | "check-in" | "pending" | "cancelled";
  color?: string; // Card background color
}

export interface Therapist {
  id: string;
  name: string;
  avatar?: string;
}

export type ViewMode = "day" | "week" | "therapist" | "room" | "all";

export interface TimeSlot {
  hour: number;
  minute: number;
  display: string; // Format: "HH:mm"
}

