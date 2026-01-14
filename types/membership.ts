export interface Membership {
  id: string;
  name: string; // "Grace" | "Signature" | "Elite" in DB, mapped from 'name'
  tier: "Grace" | "Signature" | "Elite"; // Kept for compatibility, likely same as name
  minPoints: number; // min_points
  multiplier: number;
  expiry: string; // e.g., "12 month"
  autoReward: string; // auto_reward
  cashback: number; // percentage (3, 4, 5)
  stampProgram: boolean; // stamp_program
  doubleStampWeekday: boolean; // double_stamp_weekday
  doubleStampEvent: boolean; // double_stamp_event
  priorityBooking: boolean; // priority_booking
  freeRewards: string[]; // free_rewards
  upgradeRequirement: number | null; // upgrade_requirement
  maintainRequirement: number | null; // maintain_requirement
  description: string;
  customerProfile: string; // customer_profile
  color: string;
  isActive: boolean; // is_active
  sortOrder: number; // sort_order
}

export type MembershipInsert = Omit<Membership, 'id' | 'tier'> & { tier?: string }; // tier is derived or same as name