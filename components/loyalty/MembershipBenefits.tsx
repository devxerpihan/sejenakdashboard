"use client";

import React from "react";
import { Membership } from "@/types/membership";
import { Check, Star, Gift, Calendar, TrendingUp } from "lucide-react";

interface MembershipBenefitsProps {
  membership: Membership;
}

export const MembershipBenefits: React.FC<MembershipBenefitsProps> = ({
  membership,
}) => {
  return (
    <div className="bg-white dark:bg-[#191919] rounded-lg border border-zinc-200 dark:border-zinc-800 p-6">
      <div className="flex items-center gap-3 mb-4">
        <div
          className="w-4 h-4 rounded-full"
          style={{ backgroundColor: membership.color }}
        />
        <h3 className="text-lg font-semibold text-[#191919] dark:text-[#F0EEED]">
          {membership.tier} Tier Benefits
        </h3>
      </div>

      <p className="text-sm text-[#706C6B] dark:text-[#C1A7A3] mb-6">
        {membership.description}
      </p>

      <div className="space-y-4">
        {/* Cashback */}
        <div className="flex items-start gap-3">
          <TrendingUp className="w-5 h-5 text-[#C1A7A3] dark:text-[#706C6B] mt-0.5 flex-shrink-0" />
          <div>
            <div className="text-sm font-medium text-[#191919] dark:text-[#F0EEED]">
              {membership.cashback}% Cashback (Points)
            </div>
            <div className="text-xs text-[#706C6B] dark:text-[#C1A7A3]">
              {membership.multiplier}x Multiplier • Example: 3000 points = Rp{((3000 * membership.multiplier / 1000) * (membership.cashback / 100) * 1000).toLocaleString("id-ID")}
            </div>
          </div>
        </div>

        {/* Stamp Program */}
        {membership.stampProgram && (
          <div className="flex items-start gap-3">
            <Calendar className="w-5 h-5 text-[#C1A7A3] dark:text-[#706C6B] mt-0.5 flex-shrink-0" />
            <div>
              <div className="text-sm font-medium text-[#191919] dark:text-[#F0EEED]">
                Stamp Program Access
              </div>
              {membership.doubleStampWeekday && (
                <div className="text-xs text-[#706C6B] dark:text-[#C1A7A3]">
                  Double stamp for weekday visits
                </div>
              )}
              {membership.doubleStampEvent && (
                <div className="text-xs text-[#706C6B] dark:text-[#C1A7A3]">
                  Access to double stamp events (Midweek Calm)
                </div>
              )}
            </div>
          </div>
        )}

        {/* Free Rewards */}
        {membership.freeRewards.length > 0 && (
          <div className="flex items-start gap-3">
            <Gift className="w-5 h-5 text-[#C1A7A3] dark:text-[#706C6B] mt-0.5 flex-shrink-0" />
            <div>
              <div className="text-sm font-medium text-[#191919] dark:text-[#F0EEED] mb-1">
                Free Rewards
              </div>
              <ul className="space-y-1">
                {membership.freeRewards.map((reward, index) => (
                  <li key={index} className="flex items-center gap-2 text-xs text-[#706C6B] dark:text-[#C1A7A3]">
                    <Check className="w-3 h-3" />
                    {reward}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Priority Booking */}
        {membership.priorityBooking && (
          <div className="flex items-start gap-3">
            <Star className="w-5 h-5 text-[#C1A7A3] dark:text-[#706C6B] mt-0.5 flex-shrink-0" />
            <div>
              <div className="text-sm font-medium text-[#191919] dark:text-[#F0EEED]">
                Priority Booking Slot
              </div>
              <div className="text-xs text-[#706C6B] dark:text-[#C1A7A3]">
                Get priority access to booking slots
              </div>
            </div>
          </div>
        )}

        {/* Upgrade/Maintain Requirements */}
        <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800">
          {membership.upgradeRequirement && (
            <div className="text-xs text-[#706C6B] dark:text-[#C1A7A3] mb-2">
              <span className="font-medium">Upgrade:</span> Total spending ≥ Rp{membership.upgradeRequirement.toLocaleString("id-ID")} in 12 months
            </div>
          )}
          {membership.maintainRequirement && (
            <div className="text-xs text-[#706C6B] dark:text-[#C1A7A3]">
              <span className="font-medium">Maintain:</span> Spending ≥ Rp{membership.maintainRequirement.toLocaleString("id-ID")} / 12 months
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

