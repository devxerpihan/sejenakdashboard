"use client";

import React, { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";
import { Treatment } from "@/types/treatment";
import { TreatmentForm, TreatmentFormRef } from "@/components/services/TreatmentForm";
import { supabase } from "@/lib/supabase";
import { ToastContainer } from "@/components/ui/Toast";

interface CreateTreatmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: string[];
  onSuccess?: () => void;
  onError?: (message: string) => void;
}

export const CreateTreatmentModal: React.FC<CreateTreatmentModalProps> = ({
  isOpen,
  onClose,
  categories,
  onSuccess,
  onError,
}) => {
  const [createStep, setCreateStep] = useState<1 | 2 | 3>(1);
  const [selectedTreatment, setSelectedTreatment] = useState<Treatment | null>(null);
  const treatmentFormRef = useRef<TreatmentFormRef>(null);
  const [saving, setSaving] = useState(false);
  const [toasts, setToasts] = useState<Array<{ id: string; message: string; type?: "success" | "error" | "warning" | "info" }>>([]);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setCreateStep(1);
      setSelectedTreatment(null);
      setSaving(false);
      setToasts([]);
    }
  }, [isOpen]);

  const showToast = (message: string, type: "success" | "error" | "warning" | "info" = "info") => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
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

      let treatmentId = treatment.id;
      let isNewTreatment = false;

      // Check if this is a new treatment (has temporary ID or no ID)
      if (!treatment.id || treatment.id.startsWith("treatment-")) {
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
                return; // Don't continue saving
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
                return; // Don't continue saving
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
        // Existing treatment - update (shouldn't happen in create modal, but handle it)
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
                return; // Don't continue saving
              }
            }
          } else {
            console.error("Could not get or create treatment guide ID for steps");
          }
        }
      }

      // Show success message
      showToast("Treatment saved successfully!", "success");

      // Move to next step or finish
      if (createStep < 3) {
        // Move to next step
        setCreateStep((prev) => (prev + 1) as 1 | 2 | 3);
      } else {
        // On last step, close modal and call onSuccess
        setTimeout(() => {
          if (onSuccess) {
            onSuccess();
          }
          onClose();
        }, 1000);
      }
    } catch (err: any) {
      console.error("Error saving treatment:", err);
      const errorMessage = `Failed to save treatment: ${err.message || "Unknown error"}`;
      showToast(errorMessage, "error");
      if (onError) {
        onError(errorMessage);
      }
    } finally {
      setSaving(false);
    }
  };

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

  const handleCancel = () => {
    if (saving) return;
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/20 backdrop-blur-[2px]"
          onClick={handleCancel}
        />

        {/* Modal Content */}
        <div className="relative w-full max-w-4xl max-h-[90vh] bg-white dark:bg-[#191919] rounded-lg shadow-xl flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-zinc-200 dark:border-zinc-800 flex-shrink-0">
            <h2 className="text-xl font-bold text-[#191919] dark:text-[#F0EEED]">
              Create Treatment
            </h2>
            <button
              onClick={handleCancel}
              disabled={saving}
              className="text-[#706C6B] dark:text-[#C1A7A3] hover:text-[#191919] dark:hover:text-[#F0EEED] transition-colors disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Progress Indicator */}
          <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex-shrink-0">
            <div className="flex items-center w-full max-w-2xl mx-auto">
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

          {/* Step Content - Scrollable */}
          <div className="flex-1 overflow-y-auto p-6">
            <TreatmentForm
              ref={treatmentFormRef}
              treatment={selectedTreatment || undefined}
              onSave={handleSaveTreatment}
              onDelete={undefined}
              onCancel={handleCancel}
              categories={categories}
              stepMode={true}
              currentStep={createStep}
            />
          </div>

          {/* Step Navigation Buttons */}
          <div className="flex items-center justify-between p-6 border-t border-zinc-200 dark:border-zinc-800 flex-shrink-0">
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
      </div>

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </>
  );
};

