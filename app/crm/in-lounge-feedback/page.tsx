"use client";

import React, { useState, useEffect, useMemo } from "react";
import { SejenakDashboardLayout } from "@/components/layout/SejenakDashboardLayout";
import { Footer } from "@/components/layout";
import {
  Breadcrumbs,
  PageHeader,
  Tabs,
  LineChart,
  WordCloud,
  ImprovementSuggestion,
  FeedbackTable,
  Pagination,
} from "@/components/services";
import { DateRangePicker } from "@/components/ui/DateRangePicker";
import { SejenakStatCard } from "@/components/dashboard/SejenakStatCard";
import { ChartCard } from "@/components/dashboard/ChartCard";
import { DonutChart } from "@/components/dashboard/DonutChart";
import { navItems } from "@/config/navigation";
import { UsersIcon, SearchIcon } from "@/components/icons";
import { useReviews } from "@/hooks/useReviews";

export default function InLoungeFeedbackPage() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("darkMode");
      return saved === "true";
    }
    return false;
  });

  const [location, setLocation] = useState("Islamic Village");
  const [dateRange, setDateRange] = useState({
    start: new Date(2025, 0, 1),
    end: new Date(2025, 8, 9),
  });

  const [activeTab, setActiveTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch reviews from database
  const { reviews, loading: reviewsLoading, error: reviewsError, refetch } = useReviews(
    dateRange.start,
    dateRange.end,
    null // branchId - could be added later
  );

  // Apply dark mode class to HTML element and save to localStorage
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("darkMode", "true");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("darkMode", "false");
    }
  }, [isDarkMode]);

  const locations = ["Islamic Village", "Location 2", "Location 3"];

  const handleDateNavigate = (direction: "prev" | "next") => {
    // TODO: Implement date navigation
    console.log("Navigate", direction);
  };

  // Calculate stats from reviews
  const stats = useMemo(() => {
    if (!reviews || reviews.length === 0) {
      return {
        therapistScore: 0,
        cleanliness: 0,
        comfort: 0,
        wouldRecommend: 0,
        totalReviews: 0,
      };
    }

    const totalReviews = reviews.length;
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews;
    
    const cleanlinessRatings = reviews.filter(r => r.cleanliness_rating !== null).map(r => r.cleanliness_rating!);
    const avgCleanliness = cleanlinessRatings.length > 0
      ? (cleanlinessRatings.reduce((sum, r) => sum + r, 0) / cleanlinessRatings.length) * 20 // Convert to percentage
      : 0;

    const ambianceRatings = reviews.filter(r => r.ambiance_rating !== null).map(r => r.ambiance_rating!);
    const avgAmbiance = ambianceRatings.length > 0
      ? (ambianceRatings.reduce((sum, r) => sum + r, 0) / ambianceRatings.length) * 20 // Convert to percentage
      : 0;

    // Would recommend = percentage of 4-5 star ratings
    const recommendCount = reviews.filter(r => r.rating >= 4).length;
    const wouldRecommend = (recommendCount / totalReviews) * 100;

    return {
      therapistScore: Math.round(avgRating * 100) / 100,
      cleanliness: Math.round(avgCleanliness),
      comfort: Math.round(avgAmbiance),
      wouldRecommend: Math.round(wouldRecommend),
      totalReviews,
    };
  }, [reviews]);

  // Filter reviews by search query
  const filteredReviews = useMemo(() => {
    if (!searchQuery) return reviews;
    
    const query = searchQuery.toLowerCase();
    return reviews.filter((review) => {
      return (
        review.user_name?.toLowerCase().includes(query) ||
        review.treatment_name?.toLowerCase().includes(query) ||
        review.therapist_name?.toLowerCase().includes(query) ||
        review.comment?.toLowerCase().includes(query)
      );
    });
  }, [reviews, searchQuery]);

  // Pagination
  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredReviews.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedReviews = filteredReviews.slice(startIndex, endIndex);

  // Summary cards data (calculated from reviews)
  const summaryCards = useMemo(() => [
    {
      title: "Therapist Score",
      value: stats.therapistScore.toFixed(2),
      icon: <UsersIcon />,
      trend: [stats.therapistScore], // Simplified - could calculate monthly trends
      trendType: "bar" as const,
    },
    {
      title: "Cleanliness",
      value: `${stats.cleanliness}%`,
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      trend: [stats.cleanliness],
      trendType: "area" as const,
    },
    {
      title: "Comfort",
      value: `${stats.comfort}%`,
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
      ),
      trend: [stats.comfort],
      trendType: "bar" as const,
    },
    {
      title: "Would Recommend",
      value: `${stats.wouldRecommend}%`,
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
          />
        </svg>
      ),
      trend: [stats.wouldRecommend],
      trendType: "area" as const,
    },
  ], [stats]);

  // Therapist Score line chart data (monthly trends)
  const therapistScoreData = useMemo(() => {
    if (!reviews || reviews.length === 0) {
      return [
        { label: "Jan", value: 0 },
        { label: "Feb", value: 0 },
        { label: "Mar", value: 0 },
        { label: "Apr", value: 0 },
        { label: "May", value: 0 },
        { label: "Jun", value: 0 },
      ];
    }

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthlyRatings: { [key: number]: number[] } = {};

    reviews.forEach((review) => {
      const date = new Date(review.created_at);
      const month = date.getMonth();
      if (!monthlyRatings[month]) {
        monthlyRatings[month] = [];
      }
      monthlyRatings[month].push(review.rating);
    });

    // Calculate average for each month
    const monthlyAverages = monthNames.map((_, index) => {
      const ratings = monthlyRatings[index] || [];
      const avg = ratings.length > 0
        ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length
        : 0;
      return {
        label: monthNames[index],
        value: Math.round(avg * 100) / 100,
      };
    });

    // Return last 6 months
    return monthlyAverages.slice(-6);
  }, [reviews]);

  // Post Treatment Feel donut chart data (analyze comments for keywords)
  const postTreatmentFeelData = useMemo(() => {
    if (!reviews || reviews.length === 0) {
      return [
        { label: "Relax", value: 0, color: "#C1A7A3" },
        { label: "Fresh", value: 0, color: "#DCCAB7" },
        { label: "Energized", value: 0, color: "#706C6B" },
      ];
    }

    const relaxKeywords = ["relax", "relaxed", "relaxing", "calm", "peaceful", "serene", "tranquil", "tenang", "santai"];
    const freshKeywords = ["fresh", "refreshed", "clean", "cleanse", "renewed", "segar", "bersih"];
    const energizedKeywords = ["energized", "energy", "energetic", "vitality", "revitalized", "boost", "berenergi", "bersemangat"];

    let relaxCount = 0;
    let freshCount = 0;
    let energizedCount = 0;

    reviews.forEach((review) => {
      if (!review.comment) return;
      const comment = review.comment.toLowerCase();
      
      const hasRelax = relaxKeywords.some(keyword => comment.includes(keyword));
      const hasFresh = freshKeywords.some(keyword => comment.includes(keyword));
      const hasEnergized = energizedKeywords.some(keyword => comment.includes(keyword));

      if (hasRelax) relaxCount++;
      if (hasFresh) freshCount++;
      if (hasEnergized) energizedCount++;
    });

    return [
      { label: "Relax", value: relaxCount, color: "#C1A7A3" },
      { label: "Fresh", value: freshCount, color: "#DCCAB7" },
      { label: "Energized", value: energizedCount, color: "#706C6B" },
    ];
  }, [reviews]);

  // Word cloud data (extract common words from comments)
  const wordCloudData = useMemo(() => {
    if (!reviews || reviews.length === 0) {
      return [];
    }

    const wordCount: { [key: string]: number } = {};
    const stopWords = new Set([
      "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for", "of", "with", "by",
      "is", "are", "was", "were", "be", "been", "being", "have", "has", "had", "do", "does", "did",
      "will", "would", "should", "could", "may", "might", "must", "can", "this", "that", "these", "those",
      "i", "you", "he", "she", "it", "we", "they", "me", "him", "her", "us", "them",
      "yang", "dan", "atau", "dengan", "untuk", "dari", "pada", "ke", "di", "adalah", "akan", "sudah"
    ]);

    reviews.forEach((review) => {
      if (!review.comment) return;
      const words = review.comment
        .toLowerCase()
        .replace(/[^\w\s]/g, " ")
        .split(/\s+/)
        .filter(word => word.length > 3 && !stopWords.has(word));

      words.forEach((word) => {
        wordCount[word] = (wordCount[word] || 0) + 1;
      });
    });

    // Get top 12 words
    const sortedWords = Object.entries(wordCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 12)
      .map(([text, count]) => ({
        text: text.charAt(0).toUpperCase() + text.slice(1),
        weight: count,
      }));

    return sortedWords;
  }, [reviews]);

  // Improvement suggestions (analyze negative comments)
  const improvementSuggestions = useMemo(() => {
    if (!reviews || reviews.length === 0) {
      return [];
    }

    // Get reviews with rating <= 3 or negative keywords
    const negativeKeywords = [
      "lambat", "lama", "terlalu", "kurang", "tidak", "belum", "perlu", "harus",
      "slow", "long", "too", "not", "need", "should", "wait", "cold", "hot", "dingin", "panas"
    ];

    const suggestions: { [key: string]: number } = {};

    reviews.forEach((review) => {
      if (review.rating <= 3 && review.comment) {
        const comment = review.comment.toLowerCase();
        
        // Extract sentences with negative keywords
        const sentences = comment.split(/[.!?]/).filter(s => s.trim().length > 10);
        
        sentences.forEach((sentence) => {
          const hasNegative = negativeKeywords.some(keyword => sentence.includes(keyword));
          if (hasNegative) {
            const cleaned = sentence.trim();
            if (cleaned.length > 20 && cleaned.length < 200) {
              suggestions[cleaned] = (suggestions[cleaned] || 0) + 1;
            }
          }
        });
      }
    });

    // Get top 4 suggestions
    return Object.entries(suggestions)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 4)
      .map(([text, mentionCount], index) => ({
        id: String(index + 1),
        text: text.charAt(0).toUpperCase() + text.slice(1),
        mentionCount,
      }));
  }, [reviews]);

  const tabs = useMemo(() => [
    { id: "overview", label: "Overview" },
    { id: "responses", label: "Responses", count: filteredReviews.length },
  ], [filteredReviews.length]);

  return (
    <SejenakDashboardLayout
      navItems={navItems}
      headerTitle=""
      location={location}
      locations={locations}
      onLocationChange={setLocation}
      dateRange={dateRange}
      onDateRangeChange={(direction) => {
        console.log("Navigate", direction);
      }}
      isDarkMode={isDarkMode}
      onDarkModeToggle={() => {
        setIsDarkMode((prev) => !prev);
      }}
      customHeader={null}
      footer={<Footer />}
    >
      <div>
        {/* Breadcrumbs */}
        <Breadcrumbs
          items={[
            { label: "CRM", href: "/crm" },
            { label: "In Lounge Feedback" },
          ]}
        />

        {/* Page Header with Tabs and Date Range */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-[#191919] dark:text-[#F0EEED] mb-4">
              In Lounge Feedback
            </h1>
            <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
          </div>
          <DateRangePicker
            startDate={dateRange.start}
            endDate={dateRange.end}
            onNavigate={handleDateNavigate}
            onClick={() => {
              // TODO: Open date picker modal
              console.log("Open date picker");
            }}
          />
        </div>

        {activeTab === "overview" && (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              {summaryCards.map((card, index) => (
                <SejenakStatCard key={index} {...card} />
              ))}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Therapist Score Line Chart */}
              <ChartCard title="Therapist Score">
                <LineChart
                  data={therapistScoreData}
                  yAxisMin={0}
                  yAxisMax={5}
                />
              </ChartCard>

              {/* Post Treatment Feel Donut Chart */}
              <DonutChart
                data={postTreatmentFeelData}
                totalLabel="Total Reviews"
                totalValue={postTreatmentFeelData.reduce((sum, item) => sum + item.value, 0)}
                title="Post Treatment Feel"
              />
            </div>

            {/* Word Cloud and Improvement Suggestions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <WordCloud words={wordCloudData} title="Word Cloud" />
              <ImprovementSuggestion
                suggestions={improvementSuggestions}
                title="Improvement Suggestion"
              />
            </div>
          </>
        )}

        {activeTab === "responses" && (
          <div>
            {/* Search Bar */}
            <div className="relative flex-1 max-w-md mb-6">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#706C6B] dark:text-[#C1A7A3]">
                <SearchIcon />
              </div>
              <input
                type="text"
                placeholder="Search by customer, treatment, therapist, or comment"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1); // Reset to first page on search
                }}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-[#191919] text-[#191919] dark:text-[#F0EEED] placeholder-[#706C6B] focus:outline-none focus:ring-2 focus:ring-[#C1A7A3]"
              />
            </div>

            {/* Loading State */}
            {reviewsLoading && (
              <div className="bg-white dark:bg-[#191919] rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                <div className="flex items-center justify-center py-16 px-6 min-h-[400px]">
                  <div className="text-sm text-[#706C6B] dark:text-[#C1A7A3]">
                    Loading reviews...
                  </div>
                </div>
              </div>
            )}

            {/* Error State */}
            {reviewsError && !reviewsLoading && (
              <div className="bg-white dark:bg-[#191919] rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                <div className="flex flex-col items-center justify-center py-16 px-6 min-h-[400px]">
                  <p className="text-sm text-red-600 dark:text-red-400 mb-4">
                    Error: {reviewsError}
                  </p>
                  <button
                    onClick={() => refetch()}
                    className="px-4 py-2 bg-[#C1A7A3] text-white rounded-lg hover:bg-[#A8928E] transition-colors"
                  >
                    Retry
                  </button>
                </div>
              </div>
            )}

            {/* Reviews Table */}
            {!reviewsLoading && !reviewsError && (
              <>
                <FeedbackTable reviews={paginatedReviews} />
                
                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-6">
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      totalItems={filteredReviews.length}
                      itemsPerPage={itemsPerPage}
                      onPageChange={setCurrentPage}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </SejenakDashboardLayout>
  );
}

