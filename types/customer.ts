// Customer Page Types

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  memberLevel: "Grace" | "Signature" | "Elite";
  appointmentCount: number;
  status: "active" | "at-risk" | "flagged" | "blocked";
  avatar?: string;
}

export type CustomerStatus = "all" | "active" | "at-risk" | "flagged" | "blocked";

