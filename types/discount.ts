// Discount Page Types

export interface Discount {
  id: string;
  name: string; // e.g., "Soft Opening", "Grand Opening"
  amount: string; // Can be percentage like "20%" or currency like "Rp 200.000"
  validPeriod: {
    start: string; // Date string in DD/MM/YY format
    end: string; // Date string in DD/MM/YY format
  };
  eligibility: string; // e.g., "All Services", "2 Categories", "3 Treatments"
  status: "active" | "expired";
}

