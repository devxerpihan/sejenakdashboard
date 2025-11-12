// Treatment Page Types

export interface Treatment {
  id: string;
  name: string;
  category: string;
  duration: number; // in minutes
  price: number | string; // can be a number or "X prices" string
  status: "active" | "inactive";
}

export interface TreatmentTableColumn {
  key: keyof Treatment | "actions";
  label: string;
  sortable?: boolean;
}

