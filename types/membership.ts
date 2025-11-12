// Membership Page Types

export interface Membership {
  id: string;
  tier: "Silver" | "Gold" | "Platinum";
  minPoints: number;
  multiplier: number;
  expiry: string; // e.g., "12 month"
  autoReward: string;
}

