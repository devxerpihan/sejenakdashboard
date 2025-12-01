"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useProfile } from "@/hooks/useProfile";

export interface Notification {
  id: string;
  recipient_id: string | null;
  recipient_role: string | null;
  title: string;
  message: string;
  type: string;
  data: Record<string, any> | null;
  is_read: boolean;
  priority: string | null;
  created_at: string;
}

export function useNotifications() {
  const { profile } = useProfile();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!profile) {
      setLoading(false);
      return;
    }

    async function fetchNotifications() {
      if (!profile) return;
      
      try {
        setLoading(true);
        setError(null);

        // Build query - check both recipient_id and recipient_role
        let query = supabase
          .from("notifications")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(50);

        // Filter by recipient_id if available, or by recipient_role
        if (profile.id && profile.role) {
          query = query.or(`recipient_id.eq.${profile.id},recipient_role.eq.${profile.role}`);
        } else if (profile.id) {
          query = query.eq("recipient_id", profile.id);
        } else if (profile.role) {
          query = query.eq("recipient_role", profile.role);
        }

        const { data, error: fetchError } = await query;

        if (fetchError) throw fetchError;

        setNotifications(data || []);
      } catch (err: any) {
        console.error("Error fetching notifications:", err);
        setError(err.message || "Failed to fetch notifications");
      } finally {
        setLoading(false);
      }
    }

    fetchNotifications();

    // Set up real-time subscription
    const channel = supabase
      .channel("notifications_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
          filter: profile?.id
            ? `recipient_id=eq.${profile.id}`
            : profile?.role
            ? `recipient_role=eq.${profile.role}`
            : undefined,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setNotifications((prev) => [payload.new as Notification, ...prev]);
          } else if (payload.eventType === "UPDATE") {
            setNotifications((prev) =>
              prev.map((n) => (n.id === payload.new.id ? (payload.new as Notification) : n))
            );
          } else if (payload.eventType === "DELETE") {
            setNotifications((prev) => prev.filter((n) => n.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile]);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const markAsRead = async (notificationId: string) => {
    try {
      const { error: updateError } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("id", notificationId);

      if (updateError) throw updateError;

      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n))
      );
    } catch (err: any) {
      console.error("Error marking notification as read:", err);
      throw err;
    }
  };

  const markAllAsRead = async () => {
    try {
      if (!profile) return;

      const unreadIds = notifications.filter((n) => !n.is_read).map((n) => n.id);
      if (unreadIds.length === 0) return;

      const { error: updateError } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .in("id", unreadIds);

      if (updateError) throw updateError;

      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch (err: any) {
      console.error("Error marking all notifications as read:", err);
      throw err;
    }
  };

  return {
    notifications,
    loading,
    error,
    unreadCount,
    markAsRead,
    markAllAsRead,
  };
}

