"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { Room } from "@/types/room";

export function useRooms(branchId?: string | null): {
  rooms: Room[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
} {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRooms = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from("rooms")
        .select("*")
        .order("name", { ascending: true });

      if (branchId) {
        query = query.eq("branch_id", branchId);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      setRooms((data || []) as Room[]);
    } catch (err: any) {
      console.error("Error fetching rooms:", err);
      setError(err.message || "Failed to fetch rooms");
    } finally {
      setLoading(false);
    }
  }, [branchId]);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  return { rooms, loading, error, refetch: fetchRooms };
}

