// Promo Page Types

export interface Promo {
  id: string;
  code: string;
  amount: string; // Can be percentage like "20%" or currency like "Rp 200.000"
  quota: number;
  usageCount: number; // Number of times used
  validPeriod: {
    start: string; // Date string in DD/MM/YY format
    end: string; // Date string in DD/MM/YY format
  };
  targetting: string; // e.g., "All", "Bliss", "VIP"
  status: "active" | "expired";
}

