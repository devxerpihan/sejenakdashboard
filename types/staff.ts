// Staff Page Types

export interface Staff {
  id: string;
  name: string;
  email: string;
  role: "Therapist" | "Receptionist" | "Cook Helper" | "Spa Attendant";
  branch: string;
  status: "active" | "inactive";
  avatar?: string;
}

export type StaffRole = "all" | "Therapist" | "Receptionist" | "Cook Helper" | "Spa Attendant";

