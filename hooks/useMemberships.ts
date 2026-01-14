import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Membership } from '@/types/membership';

export function useMemberships() {
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMemberships = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('member_tiers')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) throw error;

      const formattedMemberships: Membership[] = (data || []).map((item) => ({
        id: item.id,
        name: item.name,
        tier: item.name as "Grace" | "Signature" | "Elite", // Assuming name matches tier logic
        minPoints: item.min_points,
        multiplier: item.multiplier,
        expiry: item.expiry,
        autoReward: item.auto_reward,
        cashback: item.cashback,
        stampProgram: item.stamp_program,
        doubleStampWeekday: item.double_stamp_weekday,
        doubleStampEvent: item.double_stamp_event,
        priorityBooking: item.priority_booking,
        freeRewards: item.free_rewards || [],
        upgradeRequirement: item.upgrade_requirement,
        maintainRequirement: item.maintain_requirement,
        description: item.description,
        customerProfile: item.customer_profile,
        color: item.color,
        isActive: item.is_active,
        sortOrder: item.sort_order,
      }));

      setMemberships(formattedMemberships);
    } catch (err: any) {
      console.error('Error fetching memberships:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateMembership = async (id: string, updates: Partial<Membership>) => {
    try {
      const dbUpdates: any = {};
      if (updates.name) dbUpdates.name = updates.name;
      if (updates.minPoints !== undefined) dbUpdates.min_points = updates.minPoints;
      if (updates.multiplier !== undefined) dbUpdates.multiplier = updates.multiplier;
      if (updates.expiry) dbUpdates.expiry = updates.expiry;
      if (updates.autoReward) dbUpdates.auto_reward = updates.autoReward;
      if (updates.cashback !== undefined) dbUpdates.cashback = updates.cashback;
      if (updates.stampProgram !== undefined) dbUpdates.stamp_program = updates.stampProgram;
      if (updates.doubleStampWeekday !== undefined) dbUpdates.double_stamp_weekday = updates.doubleStampWeekday;
      if (updates.doubleStampEvent !== undefined) dbUpdates.double_stamp_event = updates.doubleStampEvent;
      if (updates.priorityBooking !== undefined) dbUpdates.priority_booking = updates.priorityBooking;
      if (updates.freeRewards) dbUpdates.free_rewards = updates.freeRewards;
      if (updates.upgradeRequirement !== undefined) dbUpdates.upgrade_requirement = updates.upgradeRequirement;
      if (updates.maintainRequirement !== undefined) dbUpdates.maintain_requirement = updates.maintainRequirement;
      if (updates.description) dbUpdates.description = updates.description;
      if (updates.customerProfile) dbUpdates.customer_profile = updates.customerProfile;
      if (updates.color) dbUpdates.color = updates.color;
      if (updates.isActive !== undefined) dbUpdates.is_active = updates.isActive;
      if (updates.sortOrder !== undefined) dbUpdates.sort_order = updates.sortOrder;

      const { error } = await supabase
        .from('member_tiers')
        .update(dbUpdates)
        .eq('id', id);

      if (error) throw error;

      await fetchMemberships();
      return { success: true };
    } catch (err: any) {
      console.error('Error updating membership:', err);
      return { success: false, error: err.message };
    }
  };

  useEffect(() => {
    fetchMemberships();
  }, []);

  return {
    memberships,
    loading,
    error,
    fetchMemberships,
    updateMembership,
  };
}


