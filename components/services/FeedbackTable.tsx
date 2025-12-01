"use client";

import React from "react";
import { Review } from "@/hooks/useReviews";
import { Avatar } from "@/components/ui/Avatar";

interface FeedbackTableProps {
  reviews: Review[];
  onReviewClick?: (review: Review) => void;
}

export const FeedbackTable: React.FC<FeedbackTableProps> = ({
  reviews,
  onReviewClick,
}) => {
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`w-4 h-4 ${
              star <= rating
                ? "text-yellow-400 fill-current"
                : "text-zinc-300 dark:text-zinc-700"
            }`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
        <span className="ml-2 text-sm text-[#706C6B] dark:text-[#C1A7A3]">
          {rating}
        </span>
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-[#191919] rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-[#F0EEED] dark:bg-[#3D3B3A] border-b border-zinc-200 dark:border-zinc-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#706C6B] dark:text-[#C1A7A3] uppercase tracking-wider">
                Customer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#706C6B] dark:text-[#C1A7A3] uppercase tracking-wider">
                Treatment
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#706C6B] dark:text-[#C1A7A3] uppercase tracking-wider">
                Therapist
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#706C6B] dark:text-[#C1A7A3] uppercase tracking-wider">
                Rating
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#706C6B] dark:text-[#C1A7A3] uppercase tracking-wider">
                Cleanliness
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#706C6B] dark:text-[#C1A7A3] uppercase tracking-wider">
                Ambiance
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#706C6B] dark:text-[#C1A7A3] uppercase tracking-wider">
                Comment
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#706C6B] dark:text-[#C1A7A3] uppercase tracking-wider">
                Date
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {reviews.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-8 text-center text-sm text-[#706C6B] dark:text-[#C1A7A3]">
                  No reviews found
                </td>
              </tr>
            ) : (
              reviews.map((review) => (
                <tr
                  key={review.id}
                  onClick={() => onReviewClick && onReviewClick(review)}
                  className={`hover:bg-[#F0EEED] dark:hover:bg-[#3D3B3A] transition-colors ${
                    onReviewClick ? "cursor-pointer" : ""
                  }`}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <Avatar
                        name={review.user_name || "Unknown"}
                        size="sm"
                      />
                      <div className="text-sm font-medium text-[#191919] dark:text-[#F0EEED]">
                        {review.user_name || "Unknown"}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-[#706C6B] dark:text-[#C1A7A3]">
                      {review.treatment_name || "-"}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-[#706C6B] dark:text-[#C1A7A3]">
                      {review.therapist_name || "-"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {renderStars(review.rating)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {review.cleanliness_rating ? (
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <svg
                            key={star}
                            className={`w-3 h-3 ${
                              star <= review.cleanliness_rating!
                                ? "text-yellow-400 fill-current"
                                : "text-zinc-300 dark:text-zinc-700"
                            }`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                    ) : (
                      <span className="text-sm text-[#706C6B] dark:text-[#C1A7A3]">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {review.ambiance_rating ? (
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <svg
                            key={star}
                            className={`w-3 h-3 ${
                              star <= review.ambiance_rating!
                                ? "text-yellow-400 fill-current"
                                : "text-zinc-300 dark:text-zinc-700"
                            }`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                    ) : (
                      <span className="text-sm text-[#706C6B] dark:text-[#C1A7A3]">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-[#706C6B] dark:text-[#C1A7A3] max-w-xs truncate">
                      {review.comment || "-"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-[#706C6B] dark:text-[#C1A7A3]">
                      {formatDate(review.booking_date || review.created_at)}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

