// Treatment Page Types

export interface PricingVariant {
  id: string;
  name: string;
  weekday: number;
  weekend: number;
  holiday: number;
  weekdayEnabled: boolean;
  weekendEnabled: boolean;
  holidayEnabled: boolean;
}

export interface GreetingCard {
  greetingText?: string; // Text before customer name
  bodyText?: string;
  closingText?: string;
  signature?: string;
}

export interface CompletionCard {
  greetingText?: string;
  bodyText?: string;
  closingText?: string;
  signature?: string;
}

export interface TreatmentGuideStep {
  id?: string;
  stepNumber: number;
  title: string;
  description: string; // Required in database
  duration: number; // Required in database, must be > 0
  instructions?: string;
  tips?: string;
  advantages?: string;
  nextStepMessage?: string;
  isActive?: boolean;
}

export interface Treatment {
  id: string;
  name: string;
  category: string;
  duration: number; // in minutes
  price: number | string; // can be a number or "X prices" string
  status: "active" | "inactive";
  image?: string;
  description?: string;
  pricingVariants?: PricingVariant[];
  greetings?: string; // Legacy field, kept for backward compatibility
  treatmentGuide?: string;
  welcomeCard?: GreetingCard;
  completionCard?: CompletionCard;
  guideSteps?: TreatmentGuideStep[];
}

export interface TreatmentTableColumn {
  key: keyof Treatment | "actions";
  label: string;
  sortable?: boolean;
}

