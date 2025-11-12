// Sejenak Beauty Dashboard Types

export interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  children?: NavItem[];
}

export interface StatCardData {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend: number[];
  trendType: "bar" | "area";
}

export interface AppointmentData {
  month: string;
  completed: number;
  cancelled: number;
}

export interface DonutChartData {
  label: string;
  value: number;
  color: string;
}

export interface Therapist {
  id: string;
  name: string;
  avatar?: string;
  bookings: number;
}

