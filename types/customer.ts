// Customer Page Types

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  memberLevel: "Bliss" | "Silver" | "VIP" | "Gold";
  appointmentCount: number;
  status: "active" | "at-risk" | "flagged" | "blocked";
  avatar?: string;
}

export type CustomerStatus = "all" | "active" | "at-risk" | "flagged" | "blocked";

