// Reward Page Types

export interface Reward {
  id: string;
  reward: string;
  method: "Stamp" | "Point";
  required: number; // points or stamps required
  claimType: string; // e.g., "Auto", "12 month"
  autoReward: string;
}

