// Point Rules Types

export interface PointRule {
  id: string;
  spendAmount: number; // in Rupiah
  pointEarned: number;
  expiry: number; // in months
  status: "Active" | "Inactive";
  welcomePoint?: number; // for new members
  // Advanced rule options
  category?: string; // Treatment category filter
  days?: string[]; // Days of week: ["Monday", "Tuesday", etc.] or specific dates
  treatments?: string[]; // Treatment IDs
  ruleType?: "general" | "category" | "treatment" | "day"; // Type of rule
  createdAt?: string;
  updatedAt?: string;
}

