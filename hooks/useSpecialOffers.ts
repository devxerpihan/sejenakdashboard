import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { SpecialOffer, CreateSpecialOfferInput, UpdateSpecialOfferInput } from "@/types/specialOffer";

export function useSpecialOffers() {
  const [specialOffers, setSpecialOffers] = useState<SpecialOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSpecialOffers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("special_offers")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      setSpecialOffers(data || []);
    } catch (err: any) {
      console.error("Error fetching special offers:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSpecialOffers();
  }, []);

  const createSpecialOffer = async (input: CreateSpecialOfferInput) => {
    try {
      const { data, error } = await supabase
        .from("special_offers")
        .insert([
          {
            title: input.title,
            description: input.description,
            image_url: input.image_url,
            is_active: input.is_active ?? true,
          },
        ])
        .select()
        .single();

      if (error) {
        throw error;
      }

      setSpecialOffers((prev) => [data, ...prev]);
      return data;
    } catch (err: any) {
      console.error("Error creating special offer:", err);
      throw err;
    }
  };

  const updateSpecialOffer = async (input: UpdateSpecialOfferInput) => {
    try {
      const { data, error } = await supabase
        .from("special_offers")
        .update({
          title: input.title,
          description: input.description,
          image_url: input.image_url,
          is_active: input.is_active,
        })
        .eq("id", input.id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      setSpecialOffers((prev) =>
        prev.map((offer) => (offer.id === input.id ? data : offer))
      );
      return data;
    } catch (err: any) {
      console.error("Error updating special offer:", err);
      throw err;
    }
  };

  const deleteSpecialOffer = async (id: string) => {
    try {
      const { error } = await supabase
        .from("special_offers")
        .delete()
        .eq("id", id);

      if (error) {
        throw error;
      }

      setSpecialOffers((prev) => prev.filter((offer) => offer.id !== id));
    } catch (err: any) {
      console.error("Error deleting special offer:", err);
      throw err;
    }
  };

  return {
    specialOffers,
    loading,
    error,
    createSpecialOffer,
    updateSpecialOffer,
    deleteSpecialOffer,
    refetch: fetchSpecialOffers,
  };
}
