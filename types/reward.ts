// Reward Page Types

export interface Reward {
  id: string;
  reward: string;
  method: "Stamp" | "Point";
  required: number; // points or stamps required
  claimType: string; // e.g., "Auto", "12 month"
  autoReward?: string;
  minPoint?: number;
  expiry?: number; // in months
  multiplier?: string; // e.g., "1x", "1.25x", "1.5x"
  image?: string;
  category?: string; // Service, Discount, Product
  totalPoints?: number; // Total points for the reward
  quota?: number; // Maximum number of redemptions allowed
  usageCount?: number; // Number of times this reward has been used
  status?: "Active" | "Expired";
  createdAt?: string;
  updatedAt?: string;
}

