"use client";

import React, { useState, useEffect, useRef } from "react";
import { SejenakDashboardLayout } from "@/components/layout/SejenakDashboardLayout";
import { Footer } from "@/components/layout";
import {
  Breadcrumbs,
  PageHeader,
  FiltersBar,
  TreatmentTable,
  Pagination,
  EmptyState,
} from "@/components/services";
import { PlusIcon } from "@/components/icons";
import { navItems } from "@/config/navigation";
import { useTreatments } from "@/hooks/useTreatments";
import { useTreatmentCategories } from "@/hooks/useTreatmentCategories";
import { Treatment } from "@/types/treatment";
import { TreatmentForm, TreatmentFormRef } from "@/components/services/TreatmentForm";
import { supabase } from "@/lib/supabase";
import { ToastContainer } from "@/components/ui/Toast";

export default function TreatmentPage() {
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

  const [selectedCategory, setSelectedCategory] = useState("All Category");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<"list" | "create" | "edit">("list");
  const [selectedTreatment, setSelectedTreatment] = useState<Treatment | null>(null);
  const treatmentFormRef = useRef<TreatmentFormRef>(null);
  const [createStep, setCreateStep] = useState<1 | 2 | 3>(1); // Step 1: General Info, Step 2: Greetings, Step 3: Treatment Guide

  // Fetch treatments from database
  const { treatments: allTreatments, loading, error, refetch } = useTreatments();
  
  // Fetch categories from database
  const { categories: dbCategories } = useTreatmentCategories();

  // Loading state for save/delete operations
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  
  // Toast notifications
  const [toasts, setToasts] = useState<Array<{ id: string; message: string; type?: "success" | "error" | "warning" | "info" }>>([]);
  
  const showToast = (message: string, type: "success" | "error" | "warning" | "info" = "info") => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, type }]);
  };
  
  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

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

  // Build categories list with "All Category" option
  const categories = ["All Category", ...dbCategories];
  const treatmentCategories = dbCategories; // Categories for dropdown (excluding "All Category")

  // Filter treatments
  const filteredTreatments = allTreatments.filter((treatment) => {
    const matchesCategory =
      selectedCategory === "All Category" ||
      treatment.category === selectedCategory;
    const matchesSearch =
      searchQuery === "" ||
      treatment.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Pagination
  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredTreatments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedTreatments = filteredTreatments.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, searchQuery]);

  const locations = ["Islamic Village", "Location 2", "Location 3"];

  const handleCreateTreatment = () => {
    setSelectedTreatment(null);
    setViewMode("create");
    setCreateStep(1); // Reset to first step
  };

  const handleTreatmentClick = async (treatment: Treatment) => {
    try {
      // Fetch full treatment details including description, image, etc.
      const { data, error: fetchError } = await supabase
        .from("treatments")
        .select("id, name, category, duration, price, is_active, description, image_url")
        .eq("id", treatment.id)
        .single();

      if (fetchError) throw fetchError;

      // Fetch greetings from treatment_guides
      const { data: guideData, error: guideError } = await supabase
        .from("treatment_guides")
        .select("id, welcome_message, completion_message")
        .eq("treatment_id", treatment.id)
        .maybeSingle();

      // Parse greetings from messages
      let welcomeCard: any = undefined;
      let completionCard: any = undefined;

      if (guideData?.welcome_message) {
        const lines = guideData.welcome_message.split("\n").filter(Boolean);
        welcomeCard = {
          greetingText: lines[0] || "",
          bodyText: lines[1] || "",
          closingText: lines[2] || "",
          signature: lines[3] || "",
        };
      }

      if (guideData?.completion_message) {
        const lines = guideData.completion_message.split("\n").filter(Boolean);
        completionCard = {
          greetingText: lines[0] || "",
          bodyText: lines[1] || "",
          closingText: lines[2] || "",
          signature: lines[3] || "",
        };
      }

      // Fetch treatment guide steps
      let guideSteps: any[] = [];
      if (guideData?.id) {
        console.log("Fetching steps for guide ID:", guideData.id);
        const { data: stepsData, error: stepsError } = await supabase
          .from("treatment_steps")
          .select("id, step_number, title, description, duration, instructions, tips, advantages, next_step_message, is_active")
          .eq("treatment_guide_id", guideData.id)
          .order("step_number", { ascending: true });

        if (stepsError) {
          console.error("Error fetching treatment steps:", stepsError);
        } else {
          console.log("Fetched steps data:", stepsData);
          if (stepsData && stepsData.length > 0) {
            guideSteps = stepsData.map((step: any) => ({
              id: step.id,
              stepNumber: step.step_number,
              title: step.title,
              description: step.description || "",
              duration: step.duration || 1,
              instructions: step.instructions || undefined,
              tips: step.tips || undefined,
              advantages: step.advantages || undefined,
              nextStepMessage: step.next_step_message || undefined,
              isActive: step.is_active !== undefined ? step.is_active : true,
            }));
            console.log("Mapped guide steps:", guideSteps);
          }
        }
      } else {
        console.log("No guide data found for treatment:", treatment.id);
      }

      // Fetch pricing variants from treatment_pricing_variants table
      let pricingVariants: any[] = [];
      const { data: variantsData, error: variantsError } = await supabase
        .from("treatment_pricing_variants")
        .select("id, name, weekday_price, weekend_price, holiday_price, weekday_enabled, weekend_enabled, holiday_enabled")
        .eq("treatment_id", treatment.id)
        .order("name", { ascending: true });

      if (!variantsError && variantsData) {
        pricingVariants = variantsData.map((variant: any) => ({
          id: variant.id || `variant-${Date.now()}-${Math.random()}`,
          name: variant.name,
          weekday: variant.weekday_price || 0,
          weekend: variant.weekend_price || 0,
          holiday: variant.holiday_price || 0,
          weekdayEnabled: variant.weekday_enabled !== undefined ? variant.weekday_enabled : true,
          weekendEnabled: variant.weekend_enabled !== undefined ? variant.weekend_enabled : true,
          holidayEnabled: variant.holiday_enabled !== undefined ? variant.holiday_enabled : true,
        }));
      }

      // Map to Treatment type with all fields
      const fullTreatment: Treatment = {
        id: data.id,
        name: data.name,
        category: data.category || "Uncategorized",
        duration: data.duration || 0,
        price: data.price ? parseFloat(data.price) : 0,
        status: data.is_active ? "active" : "inactive",
        description: data.description || undefined,
        image: data.image_url || undefined,
        pricingVariants: pricingVariants.length > 0 ? pricingVariants : undefined,
        welcomeCard: welcomeCard,
        completionCard: completionCard,
        guideSteps: guideSteps.length > 0 ? guideSteps : undefined,
      };

      setSelectedTreatment(fullTreatment);
      setViewMode("edit");
    } catch (err: any) {
      console.error("Error fetching treatment details:", err);
      // Fallback to the treatment from the list if fetch fails
      setSelectedTreatment(treatment);
      setViewMode("edit");
    }
  };

  const handleSaveTreatment = async (treatment: Treatment) => {
    try {
      setSaving(true);
      console.log("Saving treatment with guideSteps:", treatment.guideSteps);

      // Map Treatment type to database schema
      const treatmentData: any = {
        name: treatment.name,
        category: treatment.category,
        duration: treatment.duration,
        price: typeof treatment.price === "number" ? treatment.price : 0,
        is_active: treatment.status === "active",
        description: treatment.description || null,
        image_url: treatment.image || null,
      };

      // Store greetings data as JSON (we'll use a text field or JSONB if available)
      // For now, storing as JSON string - can be migrated to JSONB column later
      if (treatment.welcomeCard || treatment.completionCard) {
        const greetingsData = {
          welcomeCard: treatment.welcomeCard || null,
          completionCard: treatment.completionCard || null,
        };
        // Store as JSON string in description or a custom field
        // Note: This assumes you'll add a greetings_data JSONB column to treatments table
        // For now, we'll store it separately in treatment_guides table
      }

      let treatmentId = treatment.id;
      let isNewTreatment = false;

      if (treatment.id && treatment.id.startsWith("treatment-")) {
        // New treatment - create
        isNewTreatment = true;
        const { data, error: insertError } = await supabase
          .from("treatments")
          .insert(treatmentData)
          .select()
          .single();

        if (insertError) throw insertError;
        treatmentId = data.id;
        
        // Update selectedTreatment with the new ID so subsequent steps can update it
        setSelectedTreatment({
          ...treatment,
          id: data.id,
        });

        // Save greetings to treatment_guides table
        if (treatment.welcomeCard || treatment.completionCard) {
          const welcomeMessage = treatment.welcomeCard
            ? `${treatment.welcomeCard.greetingText || ""}\n${treatment.welcomeCard.bodyText || ""}\n${treatment.welcomeCard.closingText || ""}\n${treatment.welcomeCard.signature || ""}`
            : null;
          const completionMessage = treatment.completionCard
            ? `${treatment.completionCard.greetingText || ""}\n${treatment.completionCard.bodyText || ""}\n${treatment.completionCard.closingText || ""}\n${treatment.completionCard.signature || ""}`
            : null;

          // Check if guide exists
          const { data: existingGuide } = await supabase
            .from("treatment_guides")
            .select("id")
            .eq("treatment_id", treatmentId)
            .single();

          let guideId: string | null = null;
          
          if (existingGuide) {
            // Update existing guide
            await supabase
              .from("treatment_guides")
              .update({
                welcome_message: welcomeMessage,
                completion_message: completionMessage,
              })
              .eq("id", existingGuide.id);
            guideId = existingGuide.id;
          } else {
            // Create new guide
            const { data: newGuide, error: guideError } = await supabase
              .from("treatment_guides")
              .insert({
                treatment_id: treatmentId,
                title: treatment.name,
                welcome_message: welcomeMessage,
                completion_message: completionMessage,
              })
              .select()
              .single();
            
            if (!guideError && newGuide) {
              guideId = newGuide.id;
            }
          }

          // Save treatment guide steps for new treatment
          if (treatment.guideSteps && treatment.guideSteps.length > 0 && guideId) {
            console.log("All guideSteps before filtering (new treatment):", treatment.guideSteps);
            const stepsToInsert = treatment.guideSteps
              .filter((step) => {
                const isValid = step.title && step.title.trim() && step.description && step.description.trim() && step.duration && step.duration > 0;
                if (!isValid) {
                  console.log("Filtered out step (new treatment):", step);
                }
                return isValid;
              })
              .map((step, index) => ({
                treatment_guide_id: guideId,
                step_number: Math.max(1, step.stepNumber || index + 1),
                title: step.title,
                description: step.description,
                duration: Math.max(1, step.duration || 1),
                instructions: step.instructions || null,
                tips: step.tips || null,
                advantages: step.advantages || null,
                next_step_message: step.nextStepMessage || null,
                is_active: step.isActive !== undefined ? step.isActive : true,
              }));

            if (stepsToInsert.length > 0) {
              console.log("Inserting steps for new treatment:", stepsToInsert);
              const { error: stepsError } = await supabase
                .from("treatment_steps")
                .insert(stepsToInsert);
              
              if (stepsError) {
                console.error("Error inserting treatment steps for new treatment:", stepsError);
                throw stepsError;
              } else {
                console.log("Successfully inserted", stepsToInsert.length, "steps for new treatment");
              }
            } else {
              const invalidSteps = treatment.guideSteps?.filter((step) => 
                !step.title || !step.title.trim() || !step.description || !step.description.trim() || !step.duration || step.duration <= 0
              ) || [];
              if (treatment.guideSteps && treatment.guideSteps.length > 0) {
                showToast(
                  `Cannot save: ${invalidSteps.length} step(s) are missing required fields (Title, Description, or Duration). Please fill in all required fields.`,
                  "error"
                );
                setSaving(false);
                return; // Don't redirect or continue saving
              }
            }
          }
        } else if (treatment.guideSteps && treatment.guideSteps.length > 0) {
          // If no greetings but has guide steps, create guide first
          const { data: newGuide, error: guideError } = await supabase
            .from("treatment_guides")
            .insert({
              treatment_id: treatmentId,
              title: treatment.name,
            })
            .select()
            .single();
          
          if (!guideError && newGuide) {
            console.log("All guideSteps before filtering (no greetings):", treatment.guideSteps);
            const stepsToInsert = treatment.guideSteps
              .filter((step) => {
                const isValid = step.title && step.title.trim() && step.description && step.description.trim() && step.duration && step.duration > 0;
                if (!isValid) {
                  console.log("Filtered out step (no greetings):", step);
                }
                return isValid;
              })
              .map((step, index) => ({
                treatment_guide_id: newGuide.id,
                step_number: Math.max(1, step.stepNumber || index + 1),
                title: step.title,
                description: step.description,
                duration: Math.max(1, step.duration || 1),
                instructions: step.instructions || null,
                tips: step.tips || null,
                advantages: step.advantages || null,
                next_step_message: step.nextStepMessage || null,
                is_active: step.isActive !== undefined ? step.isActive : true,
              }));

            if (stepsToInsert.length > 0) {
              console.log("Inserting steps (no greetings case):", stepsToInsert);
              const { error: stepsError } = await supabase
                .from("treatment_steps")
                .insert(stepsToInsert);
              
              if (stepsError) {
                console.error("Error inserting treatment steps (no greetings):", stepsError);
                throw stepsError;
              } else {
                console.log("Successfully inserted", stepsToInsert.length, "steps (no greetings)");
              }
            } else {
              const invalidSteps = treatment.guideSteps?.filter((step) => 
                !step.title || !step.title.trim() || !step.description || !step.description.trim() || !step.duration || step.duration <= 0
              ) || [];
              if (treatment.guideSteps && treatment.guideSteps.length > 0) {
                showToast(
                  `Cannot save: ${invalidSteps.length} step(s) are missing required fields (Title, Description, or Duration). Please fill in all required fields.`,
                  "error"
                );
                setSaving(false);
                return; // Don't redirect or continue saving
              }
            }
          } else if (guideError) {
            console.error("Error creating guide for steps (no greetings):", guideError);
          }
        }

        // Save pricing variants to treatment_pricing_variants table
        if (treatment.pricingVariants && treatment.pricingVariants.length > 0) {
          // First, delete existing pricing variants for this treatment
          await supabase
            .from("treatment_pricing_variants")
            .delete()
            .eq("treatment_id", treatmentId);

          // Insert new pricing variants
          const variantsToInsert = treatment.pricingVariants.map((variant) => ({
            treatment_id: treatmentId,
            name: variant.name,
            weekday_price: variant.weekdayEnabled ? variant.weekday : null,
            weekend_price: variant.weekendEnabled ? variant.weekend : null,
            holiday_price: variant.holidayEnabled ? variant.holiday : null,
            weekday_enabled: variant.weekdayEnabled,
            weekend_enabled: variant.weekendEnabled,
            holiday_enabled: variant.holidayEnabled,
          }));

          const { error: variantsError } = await supabase
            .from("treatment_pricing_variants")
            .insert(variantsToInsert);

          if (variantsError) {
            console.error("Error saving pricing variants:", variantsError);
            // Don't throw - pricing variants are optional
            showToast("Treatment saved, but pricing variants could not be saved.", "warning");
          }
        } else {
          // If no pricing variants, delete any existing ones
          await supabase
            .from("treatment_pricing_variants")
            .delete()
            .eq("treatment_id", treatmentId);
        }
      } else {
        // Existing treatment - update
        const { error: updateError } = await supabase
          .from("treatments")
          .update(treatmentData)
          .eq("id", treatment.id);

        if (updateError) throw updateError;

        // Update greetings in treatment_guides table
        if (treatment.welcomeCard || treatment.completionCard) {
          const welcomeMessage = treatment.welcomeCard
            ? `${treatment.welcomeCard.greetingText || ""}\n${treatment.welcomeCard.bodyText || ""}\n${treatment.welcomeCard.closingText || ""}\n${treatment.welcomeCard.signature || ""}`
            : null;
          const completionMessage = treatment.completionCard
            ? `${treatment.completionCard.greetingText || ""}\n${treatment.completionCard.bodyText || ""}\n${treatment.completionCard.closingText || ""}\n${treatment.completionCard.signature || ""}`
            : null;

          // Check if guide exists
          const { data: existingGuide } = await supabase
            .from("treatment_guides")
            .select("id")
            .eq("treatment_id", treatment.id)
            .single();

          if (existingGuide) {
            // Update existing guide
            await supabase
              .from("treatment_guides")
              .update({
                welcome_message: welcomeMessage,
                completion_message: completionMessage,
              })
              .eq("id", existingGuide.id);
          } else {
            // Create new guide
            const { data: newGuide, error: newGuideError } = await supabase
              .from("treatment_guides")
              .insert({
                treatment_id: treatment.id,
                title: treatment.name,
                welcome_message: welcomeMessage,
                completion_message: completionMessage,
              })
              .select()
              .single();
            
            if (newGuideError) {
              console.error("Error creating treatment guide:", newGuideError);
            }
          }
        }

        // Save pricing variants to treatment_pricing_variants table
        if (treatment.pricingVariants && treatment.pricingVariants.length > 0) {
          // First, delete existing pricing variants for this treatment
          await supabase
            .from("treatment_pricing_variants")
            .delete()
            .eq("treatment_id", treatment.id);

          // Insert new pricing variants
          const variantsToInsert = treatment.pricingVariants.map((variant) => ({
            treatment_id: treatment.id,
            name: variant.name,
            weekday_price: variant.weekdayEnabled ? variant.weekday : null,
            weekend_price: variant.weekendEnabled ? variant.weekend : null,
            holiday_price: variant.holidayEnabled ? variant.holiday : null,
            weekday_enabled: variant.weekdayEnabled,
            weekend_enabled: variant.weekendEnabled,
            holiday_enabled: variant.holidayEnabled,
          }));

          const { error: variantsError } = await supabase
            .from("treatment_pricing_variants")
            .insert(variantsToInsert);

          if (variantsError) {
            console.error("Error saving pricing variants:", variantsError);
            // Don't throw - pricing variants are optional
            showToast("Treatment saved, but pricing variants could not be saved.", "warning");
          }
        } else {
          // If no pricing variants, delete any existing ones
          await supabase
            .from("treatment_pricing_variants")
            .delete()
            .eq("treatment_id", treatment.id);
        }
        
        // Save treatment guide steps
        if (treatment.guideSteps && treatment.guideSteps.length > 0) {
          // First, get or create the treatment_guide_id
          let guideId: string | null = null;
          
          const { data: guide, error: guideFetchError } = await supabase
            .from("treatment_guides")
            .select("id")
            .eq("treatment_id", treatment.id)
            .maybeSingle();

          if (guide) {
            guideId = guide.id;
          } else if (!guideFetchError || guideFetchError.code === "PGRST116") {
            // Guide doesn't exist, create it
            const { data: newGuide, error: createError } = await supabase
              .from("treatment_guides")
              .insert({
                treatment_id: treatment.id,
                title: treatment.name,
              })
              .select()
              .single();
            
            if (!createError && newGuide) {
              guideId = newGuide.id;
            } else {
              console.error("Error creating treatment guide for steps:", createError);
            }
          }

          if (guideId) {
            // Delete existing steps
            await supabase
              .from("treatment_steps")
              .delete()
              .eq("treatment_guide_id", guideId);

            // Insert new steps - validate required fields
            console.log("All guideSteps before filtering:", treatment.guideSteps);
            const stepsToInsert = treatment.guideSteps
              .filter((step) => {
                const isValid = step.title && step.title.trim() && step.description && step.description.trim() && step.duration && step.duration > 0;
                if (!isValid) {
                  console.log("Filtered out step:", step, {
                    hasTitle: !!step.title,
                    hasDescription: !!step.description,
                    hasDuration: !!step.duration,
                    durationValid: step.duration > 0
                  });
                }
                return isValid;
              })
              .map((step, index) => ({
                treatment_guide_id: guideId,
                step_number: Math.max(1, step.stepNumber || index + 1),
                title: step.title,
                description: step.description,
                duration: Math.max(1, step.duration || 1),
                instructions: step.instructions || null,
                tips: step.tips || null,
                advantages: step.advantages || null,
                next_step_message: step.nextStepMessage || null,
                is_active: step.isActive !== undefined ? step.isActive : true,
              }));

            if (stepsToInsert.length > 0) {
              console.log("Inserting steps for existing treatment:", stepsToInsert);
              const { error: insertError } = await supabase
                .from("treatment_steps")
                .insert(stepsToInsert);
              
              if (insertError) {
                console.error("Error inserting treatment steps:", insertError);
                throw insertError;
              } else {
                console.log("Successfully saved", stepsToInsert.length, "treatment steps");
              }
            } else {
              const invalidSteps = treatment.guideSteps?.filter((step) => 
                !step.title || !step.title.trim() || !step.description || !step.description.trim() || !step.duration || step.duration <= 0
              ) || [];
              console.log("No valid steps to insert after filtering. Invalid steps:", invalidSteps);
              if (treatment.guideSteps && treatment.guideSteps.length > 0) {
                showToast(
                  `Cannot save: ${invalidSteps.length} step(s) are missing required fields (Title, Description, or Duration). Please fill in all required fields.`,
                  "error"
                );
                setSaving(false);
                return; // Don't redirect or continue saving
              }
            }
          } else {
            console.error("Could not get or create treatment guide ID for steps");
          }
        }
      }

      // Refetch treatments to get updated data
      await refetch();

      // Show success message
      showToast("Treatment saved successfully!", "success");

      // If in create mode with steps, move to next step or finish
      if (viewMode === "create") {
        // After saving, fetch the newly created treatment to get its ID
        if (treatment.id && treatment.id.startsWith("treatment-")) {
          // This was a new treatment, we need to get the saved treatment
          const savedTreatment = allTreatments.find((t) => t.name === treatment.name);
          if (savedTreatment) {
            setSelectedTreatment(savedTreatment);
          }
        }
        
        if (createStep < 3) {
          // Move to next step
          setCreateStep((prev) => (prev + 1) as 1 | 2 | 3);
        } else {
          // On last step, go back to list view
          setTimeout(() => {
            setViewMode("list");
            setSelectedTreatment(null);
            setCreateStep(1);
          }, 1000);
        }
      } else {
        // Edit mode - go back to list view
        setTimeout(() => {
          setViewMode("list");
          setSelectedTreatment(null);
        }, 1000);
      }
    } catch (err: any) {
      console.error("Error saving treatment:", err);
      showToast(`Failed to save treatment: ${err.message || "Unknown error"}`, "error");
      // Don't redirect on error
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTreatment = async () => {
    if (!selectedTreatment || selectedTreatment.id.startsWith("treatment-")) {
      // Can't delete a treatment that hasn't been saved yet
      setViewMode("list");
      setSelectedTreatment(null);
      return;
    }

    if (!confirm(`Are you sure you want to delete "${selectedTreatment.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      setDeleting(true);

      const { error: deleteError } = await supabase
        .from("treatments")
        .delete()
        .eq("id", selectedTreatment.id);

      if (deleteError) throw deleteError;

      // Refetch treatments to get updated data
      await refetch();

      // Show success message
      showToast("Treatment deleted successfully!", "success");

      // Go back to list view after a short delay
      setTimeout(() => {
        setViewMode("list");
        setSelectedTreatment(null);
      }, 1000);
    } catch (err: any) {
      console.error("Error deleting treatment:", err);
      showToast(`Failed to delete treatment: ${err.message || "Unknown error"}`, "error");
    } finally {
      setDeleting(false);
    }
  };

  const handleCancel = () => {
    setViewMode("list");
    setSelectedTreatment(null);
  };

  // Get breadcrumb items based on view mode
  const getBreadcrumbItems = () => {
    const handleTreatmentClick = (e: React.MouseEvent) => {
      e.preventDefault();
      if (viewMode !== "list") {
        setViewMode("list");
        setSelectedTreatment(null);
        setCreateStep(1);
      }
    };

    const base = [
      { label: "Services", href: "/services" },
      { 
        label: "Treatment", 
        onClick: handleTreatmentClick
      }
    ];
    if (viewMode === "create") {
      return [...base, { label: "Create Treatment" }];
    } else if (viewMode === "edit" && selectedTreatment) {
      return [...base, { label: selectedTreatment.name }];
    }
    return base;
  };

  // Step navigation handlers
  const handleNextStep = () => {
    if (createStep < 3) {
      setCreateStep((prev) => (prev + 1) as 1 | 2 | 3);
    }
  };

  const handlePreviousStep = () => {
    if (createStep > 1) {
      setCreateStep((prev) => (prev - 1) as 1 | 2 | 3);
    }
  };

  const handleSkipAndFinish = async () => {
    // Save with current data and finish
    if (treatmentFormRef.current) {
      treatmentFormRef.current.save();
    }
  };

  const handleSaveAndContinue = async () => {
    // Save current step data
    if (treatmentFormRef.current) {
      treatmentFormRef.current.save();
      // The save handler will automatically move to next step or finish
    }
  };

  // Get page title based on view mode
  const getPageTitle = () => {
    if (viewMode === "create") {
      return "Create Treatment";
    } else if (viewMode === "edit" && selectedTreatment) {
      return selectedTreatment.name;
    }
    return "Treatment";
  };

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
        <Breadcrumbs items={getBreadcrumbItems()} />

        {viewMode === "list" ? (
          <>
            {/* Page Header */}
            <PageHeader
              title="Treatment"
              actionButtons={[
                {
                  label: "Export / Import",
                  onClick: () => console.log("Export / Import"),
                  variant: "primary",
                },
                {
                  label: "Create Treatment",
                  onClick: handleCreateTreatment,
                  variant: "outline",
                  icon: <PlusIcon />,
                },
              ]}
            />

            {/* Filters */}
            <FiltersBar
              categories={categories}
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              searchPlaceholder="Q Treatment"
            />

            {/* Loading State */}
            {loading && (
              <div className="bg-white dark:bg-[#191919] rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                <div className="flex items-center justify-center py-16 px-6 min-h-[400px]">
                  <div className="text-sm text-[#706C6B] dark:text-[#C1A7A3]">
                    Loading treatments...
                  </div>
                </div>
              </div>
            )}

            {/* Error State */}
            {error && !loading && (
              <div className="bg-white dark:bg-[#191919] rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                <div className="flex flex-col items-center justify-center py-16 px-6 min-h-[400px]">
                  <p className="text-sm text-red-600 dark:text-red-400 mb-4">
                    Error: {error}
                  </p>
                  <button
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 bg-[#C1A7A3] text-white rounded-lg hover:bg-[#A8928E] transition-colors"
                  >
                    Retry
                  </button>
                </div>
              </div>
            )}

            {/* Treatment Table */}
            {!loading && !error && (
              <>
                {paginatedTreatments.length > 0 ? (
                  <>
                    <TreatmentTable
                      treatments={paginatedTreatments}
                      onTreatmentClick={handleTreatmentClick}
                    />
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      totalItems={filteredTreatments.length}
                      itemsPerPage={itemsPerPage}
                      onPageChange={setCurrentPage}
                    />
                  </>
                ) : (
                  <EmptyState message="No treatments found. Try adjusting your filters." />
                )}
              </>
            )}
          </>
        ) : viewMode === "create" ? (
          <>
            {/* Create Treatment - Step-based Wizard */}
            <div className="space-y-6">
              {/* Progress Indicator */}
              <div className="flex items-center justify-center">
                <div className="flex items-center w-full max-w-2xl">
                  {/* Step 1: General Info */}
                  <div className="flex items-center flex-1">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                          createStep >= 1
                            ? "bg-[#C1A7A3] text-white"
                            : "bg-zinc-200 dark:bg-zinc-700 text-zinc-500 dark:text-zinc-400"
                        }`}
                      >
                        1
                      </div>
                      <span
                        className={`mt-2 text-xs font-medium ${
                          createStep >= 1
                            ? "text-[#191919] dark:text-[#F0EEED]"
                            : "text-zinc-500 dark:text-zinc-400"
                        }`}
                      >
                        General Info
                      </span>
                    </div>
                    <div
                      className={`flex-1 h-0.5 mx-2 ${
                        createStep >= 2
                          ? "bg-[#C1A7A3]"
                          : "bg-zinc-200 dark:bg-zinc-700"
                      }`}
                    />
                  </div>

                  {/* Step 2: Greetings */}
                  <div className="flex items-center flex-1">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                          createStep >= 2
                            ? "bg-[#C1A7A3] text-white"
                            : "bg-zinc-200 dark:bg-zinc-700 text-zinc-500 dark:text-zinc-400"
                        }`}
                      >
                        2
                      </div>
                      <span
                        className={`mt-2 text-xs font-medium ${
                          createStep >= 2
                            ? "text-[#191919] dark:text-[#F0EEED]"
                            : "text-zinc-500 dark:text-zinc-400"
                        }`}
                      >
                        Greetings
                      </span>
                    </div>
                    <div
                      className={`flex-1 h-0.5 mx-2 ${
                        createStep >= 3
                          ? "bg-[#C1A7A3]"
                          : "bg-zinc-200 dark:bg-zinc-700"
                      }`}
                    />
                  </div>

                  {/* Step 3: Treatment Guide */}
                  <div className="flex items-center">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                          createStep >= 3
                            ? "bg-[#C1A7A3] text-white"
                            : "bg-zinc-200 dark:bg-zinc-700 text-zinc-500 dark:text-zinc-400"
                        }`}
                      >
                        3
                      </div>
                      <span
                        className={`mt-2 text-xs font-medium ${
                          createStep >= 3
                            ? "text-[#191919] dark:text-[#F0EEED]"
                            : "text-zinc-500 dark:text-zinc-400"
                        }`}
                      >
                        Treatment Guide
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step Content */}
              <TreatmentForm
                ref={treatmentFormRef}
                treatment={selectedTreatment || undefined}
                onSave={handleSaveTreatment}
                onDelete={undefined}
                onCancel={handleCancel}
                categories={treatmentCategories}
                stepMode={true}
                currentStep={createStep}
              />

              {/* Step Navigation Buttons */}
              <div className="flex items-center justify-between pt-6 border-t border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center gap-3">
                  {createStep > 1 && (
                    <button
                      onClick={handlePreviousStep}
                      disabled={saving}
                      className="px-6 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg text-sm font-medium text-[#191919] dark:text-[#F0EEED] hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50"
                    >
                      Back
                    </button>
                  )}
                  {createStep === 3 && (
                    <button
                      onClick={handleSkipAndFinish}
                      disabled={saving}
                      className="px-6 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg text-sm font-medium text-[#191919] dark:text-[#F0EEED] hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50"
                    >
                      Skip & Finish
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleCancel}
                    disabled={saving}
                    className="px-6 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg text-sm font-medium text-[#191919] dark:text-[#F0EEED] hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveAndContinue}
                    disabled={saving}
                    className="px-6 py-2 bg-[#C1A7A3] text-white rounded-lg hover:bg-[#A88F8B] transition-colors disabled:opacity-50 text-sm font-medium"
                  >
                    {saving
                      ? "Saving..."
                      : createStep === 3
                      ? "Save & Finish"
                      : "Save & Continue"}
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Page Header for Edit */}
            <PageHeader
              title={getPageTitle()}
              actionButtons={[
                {
                  label: deleting ? "Deleting..." : "Delete Treatment",
                  onClick: () => {
                    if (!saving && !deleting) {
                      handleDeleteTreatment();
                    }
                  },
                  variant: "secondary" as const,
                },
                {
                  label: saving ? "Saving..." : "Save Changes",
                  onClick: () => {
                    if (!saving && !deleting) {
                      treatmentFormRef.current?.save();
                    }
                  },
                  variant: "primary" as const,
                },
              ]}
            />

            {/* Treatment Form */}
            <TreatmentForm
              ref={treatmentFormRef}
              treatment={selectedTreatment || undefined}
              onSave={handleSaveTreatment}
              onDelete={handleDeleteTreatment}
              onCancel={handleCancel}
              categories={treatmentCategories}
            />
          </>
        )}
      </div>
      
      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </SejenakDashboardLayout>
  );
}

