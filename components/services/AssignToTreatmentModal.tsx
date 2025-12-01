"use client";

import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Treatment } from "@/types/treatment";

interface AssignToTreatmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  categoryName: string;
  onSave: () => void;
  onError?: (message: string) => void;
}

export const AssignToTreatmentModal: React.FC<AssignToTreatmentModalProps> = ({
  isOpen,
  onClose,
  categoryName,
  onSave,
  onError,
}) => {
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTreatments, setSelectedTreatments] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);

  // Fetch treatments
  useEffect(() => {
    if (isOpen) {
      fetchTreatments();
    }
  }, [isOpen]);

  const fetchTreatments = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from("treatments")
        .select("id, name, category, image_url, duration, price, is_active")
        .order("name", { ascending: true });

      if (error) {
        // Log the full error structure for debugging
        console.error("Supabase error:", error);
        console.error("Error details:", {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        });
        throw error;
      }

      const mappedTreatments: Treatment[] = (data || []).map((t: any) => ({
        id: t.id,
        name: t.name,
        category: t.category || "",
        image: t.image_url || undefined,
        duration: t.duration || 0,
        price: t.price || 0,
        status: t.is_active ? "active" : "inactive",
      }));

      setTreatments(mappedTreatments);

      // Pre-select treatments that already have this category
      const alreadyAssigned = mappedTreatments
        .filter((t) => t.category === categoryName)
        .map((t) => t.id);
      setSelectedTreatments(new Set(alreadyAssigned));
    } catch (err: any) {
      console.error("Error fetching treatments:", err);
      
      // Extract error message from various possible error structures
      let errorMessage = "Failed to fetch treatments";
      
      if (err) {
        // Try to stringify the error to see all properties
        try {
          const errorString = JSON.stringify(err, (key, value) => {
            if (value instanceof Error) {
              return {
                name: value.name,
                message: value.message,
                stack: value.stack,
              };
            }
            return value;
          });
          console.error("Error JSON:", errorString);
        } catch (e) {
          console.error("Could not stringify error:", e);
        }
        
        // Extract readable error message from Supabase error structure
        errorMessage = 
          err.message || 
          err.details || 
          err.hint || 
          (err.code === "42501" ? "Permission denied. Please check Row Level Security (RLS) policies." : null) ||
          (err.code === "PGRST116" ? "No rows found" : null) ||
          (err.code ? `Database error (${err.code})` : null) ||
          (typeof err === "string" ? err : null) ||
          (Object.keys(err).length === 0 ? "Unknown error: Empty error object received" : null) ||
          "Failed to fetch treatments";
      }
      
      setError(errorMessage);
      if (onError) {
        onError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const filteredTreatments = treatments.filter((treatment) =>
    treatment.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleToggleTreatment = (treatmentId: string) => {
    setSelectedTreatments((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(treatmentId)) {
        newSet.delete(treatmentId);
      } else {
        newSet.add(treatmentId);
      }
      return newSet;
    });
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      // Update all selected treatments to have this category
      const updates = Array.from(selectedTreatments).map((treatmentId) =>
        supabase
          .from("treatments")
          .update({ category: categoryName })
          .eq("id", treatmentId)
      );

      // Remove category from unselected treatments that had this category
      const unselectedTreatments = treatments
        .filter(
          (t) =>
            !selectedTreatments.has(t.id) && t.category === categoryName
        )
        .map((t) => t.id);

      const removals = unselectedTreatments.map((treatmentId) =>
        supabase
          .from("treatments")
          .update({ category: null })
          .eq("id", treatmentId)
      );

      await Promise.all([...updates, ...removals]);

      onSave();
      setSelectedTreatments(new Set());
      onClose();
    } catch (err: any) {
      console.error("Error assigning category:", err);
      const errorMessage = `Failed to assign category: ${err.message || "Unknown error"}`;
      if (onError) {
        onError(errorMessage);
      } else {
        alert(errorMessage);
      }
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/20 backdrop-blur-[2px]"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-2xl bg-white dark:bg-[#191919] rounded-lg shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-200 dark:border-zinc-800">
          <h2 className="text-xl font-bold text-[#191919] dark:text-[#F0EEED]">
            Assign To Treatment
          </h2>
          <button
            onClick={onClose}
            className="text-[#706C6B] dark:text-[#C1A7A3] hover:text-[#191919] dark:hover:text-[#F0EEED] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="p-6 border-b border-zinc-200 dark:border-zinc-800">
          <div className="relative">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#706C6B] dark:text-[#C1A7A3]">
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
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Treatment"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-[#191919] text-[#191919] dark:text-[#F0EEED] placeholder-[#706C6B] focus:outline-none focus:ring-2 focus:ring-[#C1A7A3]"
            />
          </div>
        </div>

        {/* Treatment List */}
        <div className="p-6 max-h-96 overflow-y-auto">
          <h3 className="text-sm font-medium text-[#191919] dark:text-[#F0EEED] mb-4">
            Treatment Details
          </h3>

          {loading ? (
            <div className="text-center py-8 text-[#706C6B] dark:text-[#C1A7A3]">
              Loading treatments...
            </div>
          ) : error ? (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <p className="text-sm text-red-600 dark:text-red-400 mb-2">
                {error}
              </p>
              <button
                onClick={fetchTreatments}
                className="text-xs text-red-600 dark:text-red-400 hover:underline"
              >
                Try again
              </button>
            </div>
          ) : filteredTreatments.length === 0 ? (
            <div className="text-center py-8 text-[#706C6B] dark:text-[#C1A7A3]">
              No treatments found
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTreatments.map((treatment) => (
                <div
                  key={treatment.id}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-[#F0EEED] dark:hover:bg-[#3D3B3A] transition-colors cursor-pointer"
                  onClick={() => handleToggleTreatment(treatment.id)}
                >
                  {/* Treatment Image */}
                  {treatment.image ? (
                    <img
                      src={treatment.image}
                      alt={treatment.name}
                      className="w-12 h-12 rounded object-cover flex-shrink-0"
                      onError={(e) => {
                        // Fallback to placeholder if image fails to load
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const placeholder = target.nextElementSibling as HTMLDivElement;
                        if (placeholder) placeholder.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div 
                    className={`w-12 h-12 bg-zinc-200 dark:bg-zinc-700 rounded flex-shrink-0 ${treatment.image ? 'hidden' : 'flex'}`}
                  />
                  
                  {/* Treatment name */}
                  <div className="flex-1 text-sm font-medium text-[#191919] dark:text-[#F0EEED]">
                    {treatment.name}
                  </div>

                  {/* Checkbox */}
                  <input
                    type="checkbox"
                    checked={selectedTreatments.has(treatment.id)}
                    onChange={() => handleToggleTreatment(treatment.id)}
                    onClick={(e) => e.stopPropagation()}
                    className="w-5 h-5 rounded border-zinc-300 dark:border-zinc-700 text-[#C1A7A3] focus:ring-[#C1A7A3] focus:ring-2"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-zinc-200 dark:border-zinc-800">
          <button
            onClick={onClose}
            disabled={saving}
            className="px-6 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg text-sm font-medium text-[#191919] dark:text-[#F0EEED] hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-[#C1A7A3] text-white rounded-lg hover:bg-[#A88F8B] transition-colors disabled:opacity-50 text-sm font-medium"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

