// Bundle Package Types

export interface Bundle {
  id: string;
  name: string;
  items: string; // Comma-separated treatment names or JSON
  pricing: number;
  branch: string;
  status: "active" | "inactive";
  image?: string;
}






