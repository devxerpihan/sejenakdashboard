export interface SpecialOffer {
  id: string;
  title: string;
  description: string;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateSpecialOfferInput {
  title: string;
  description: string;
  image_url?: string | null;
  is_active?: boolean;
}

export interface UpdateSpecialOfferInput extends Partial<CreateSpecialOfferInput> {
  id: string;
}
