// Membership Page Types

export interface Membership {
  id: string;
  tier: "Grace" | "Signature" | "Elite";
  minPoints: number;
  multiplier: number;
  expiry: string; // e.g., "12 month"
  autoReward: string;
  // Benefits
  cashback: number; // percentage (3, 4, 5)
  stampProgram: boolean;
  doubleStampWeekday?: boolean; // Elite only
  doubleStampEvent?: boolean; // Signature+ only (Midweek Calm)
  priorityBooking?: boolean; // Elite only
  freeRewards: string[]; // Array of free rewards
  upgradeRequirement?: number; // Spending required to upgrade (in Rupiah)
  maintainRequirement?: number; // Spending required to maintain (in Rupiah, Elite only)
  description: string; // Tier description
  customerProfile: string; // Typical customer profile
  color: string; // Tier color
}

