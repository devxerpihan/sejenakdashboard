"use client";

import React, { useState, useEffect, useImperativeHandle, forwardRef } from "react";
import { Treatment, PricingVariant, GreetingCard, CompletionCard, TreatmentGuideStep } from "@/types/treatment";
import { Tabs } from "./Tabs";
import { ImageUpload } from "./ImageUpload";
import { PricingRulesTable } from "./PricingRulesTable";
import { Input } from "@/components/ui/Input";
import { Dropdown } from "@/components/ui/Dropdown";
import { Button } from "@/components/ui/Button";
import { PlusIcon } from "@/components/icons";

interface TreatmentFormProps {
  treatment?: Treatment;
  onSave: (treatment: Treatment) => void;
  onDelete?: () => void;
  onCancel: () => void;
  categories: string[];
  stepMode?: boolean; // If true, shows step-by-step wizard instead of tabs
  currentStep?: 1 | 2 | 3; // Current step when in step mode
}

export interface TreatmentFormRef {
  save: () => void;
}

export const TreatmentForm = forwardRef<TreatmentFormRef, TreatmentFormProps>(({
  treatment,
  onSave,
  onDelete,
  onCancel,
  categories,
  stepMode = false,
  currentStep = 1,
}, ref) => {
  const [activeTab, setActiveTab] = useState("general");
  
  // In step mode, sync activeTab with currentStep
  useEffect(() => {
    if (stepMode) {
      if (currentStep === 1) setActiveTab("general");
      else if (currentStep === 2) setActiveTab("greetings");
      else if (currentStep === 3) setActiveTab("guide");
    }
  }, [stepMode, currentStep]);
  const [formData, setFormData] = useState<Partial<Treatment>>({
    name: treatment?.name || "",
    category: treatment?.category || categories[0] || "",
    duration: treatment?.duration || 0,
    description: treatment?.description || "",
    status: treatment?.status || "active",
    image: treatment?.image || "",
    greetings: treatment?.greetings || "",
    treatmentGuide: treatment?.treatmentGuide || "",
    pricingVariants: treatment?.pricingVariants || [],
  });

  const [pricingVariants, setPricingVariants] = useState<PricingVariant[]>(
    treatment?.pricingVariants || []
  );
  const [weekdayEnabled, setWeekdayEnabled] = useState(true);
  const [weekendEnabled, setWeekendEnabled] = useState(true);
  const [holidayEnabled, setHolidayEnabled] = useState(true);
  const [imageFile, setImageFile] = useState<File | null>(null);

  // Greeting card states
  const [welcomeCardExpanded, setWelcomeCardExpanded] = useState(true);
  const [completionCardExpanded, setCompletionCardExpanded] = useState(false);
  const [welcomeCard, setWelcomeCard] = useState<GreetingCard>(
    treatment?.welcomeCard || {
      greetingText: "Welcome",
      bodyText: "Thank you for choosing Sejenak as your space for self-care. May every visit bring you calm and healing.",
      closingText: "Warm Regards,",
      signature: "Sejenak Team",
    }
  );
  const [completionCard, setCompletionCard] = useState<CompletionCard>(
    treatment?.completionCard || {
      greetingText: "",
      bodyText: "",
      closingText: "",
      signature: "",
    }
  );

  // Treatment guide steps
  const [guideSteps, setGuideSteps] = useState<TreatmentGuideStep[]>(
    treatment?.guideSteps || []
  );
  const [expandedStep, setExpandedStep] = useState<string | null>(null);

  useEffect(() => {
    if (treatment) {
      setFormData({
        name: treatment.name,
        category: treatment.category,
        duration: treatment.duration,
        description: treatment.description || "",
        status: treatment.status,
        image: treatment.image || "",
        greetings: treatment.greetings || "",
        treatmentGuide: treatment.treatmentGuide || "",
        pricingVariants: treatment.pricingVariants || [],
        welcomeCard: treatment.welcomeCard,
        completionCard: treatment.completionCard,
      });
      setPricingVariants(treatment.pricingVariants || []);
      if (treatment.welcomeCard) {
        setWelcomeCard(treatment.welcomeCard);
      }
      if (treatment.completionCard) {
        setCompletionCard(treatment.completionCard);
      }
      if (treatment.guideSteps) {
        setGuideSteps(treatment.guideSteps);
      }
    }
  }, [treatment]);

  const handleInputChange = (
    field: keyof Treatment,
    value: string | number
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageChange = (file: File | null) => {
    setImageFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    } else {
      setFormData((prev) => ({ ...prev, image: "" }));
    }
  };

  const handleVariantChange = (variant: PricingVariant) => {
    setPricingVariants((prev) =>
      prev.map((v) => (v.id === variant.id ? variant : v))
    );
  };

  const handleVariantDelete = (variantId: string) => {
    setPricingVariants((prev) => prev.filter((v) => v.id !== variantId));
  };

  const handleAddVariant = () => {
    const variantNames = ["Short", "Medium", "Long", "Very Long"];
    const existingNames = pricingVariants.map((v) => v.name);
    const nextName = variantNames.find((name) => !existingNames.includes(name)) || `Variant ${pricingVariants.length + 1}`;

    const newVariant: PricingVariant = {
      id: `variant-${Date.now()}`,
      name: nextName,
      weekday: 0,
      weekend: 0,
      holiday: 0,
      weekdayEnabled: true,
      weekendEnabled: true,
      holidayEnabled: true,
    };
    setPricingVariants((prev) => [...prev, newVariant]);
  };

  const handleSave = () => {
    const treatmentData: Treatment = {
      id: treatment?.id || `treatment-${Date.now()}`,
      name: formData.name || "",
      category: formData.category || "",
      duration: formData.duration || 0,
      price: pricingVariants.length > 0 ? `${pricingVariants.length} prices` : 0,
      status: formData.status || "active",
      image: formData.image,
      description: formData.description,
        pricingVariants: pricingVariants,
        greetings: formData.greetings,
        treatmentGuide: formData.treatmentGuide,
        welcomeCard: welcomeCard,
        completionCard: completionCard,
        guideSteps: guideSteps,
      };
      onSave(treatmentData);
  };

  // Expose save method to parent via ref
  useImperativeHandle(ref, () => ({
    save: () => {
      const treatmentData: Treatment = {
        id: treatment?.id || `treatment-${Date.now()}`,
        name: formData.name || "",
        category: formData.category || "",
        duration: formData.duration || 0,
        price: pricingVariants.length > 0 ? `${pricingVariants.length} prices` : 0,
        status: formData.status || "active",
        image: formData.image,
        description: formData.description,
        pricingVariants: pricingVariants,
        greetings: formData.greetings,
        treatmentGuide: formData.treatmentGuide,
        welcomeCard: welcomeCard,
        completionCard: completionCard,
        guideSteps: guideSteps,
      };
      onSave(treatmentData);
    },
  }), [treatment, formData, pricingVariants, welcomeCard, completionCard, guideSteps, onSave]);

  const categoryOptions = categories.map((cat) => ({
    value: cat,
    label: cat,
  }));

  const statusOptions = [
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
  ];

  const tabs = [
    { id: "general", label: "General Info" },
    { id: "greetings", label: "Greetings" },
    { id: "guide", label: "Treatment Guide" },
  ];

  return (
    <div className="space-y-6">
      {/* Tabs - Only show in non-step mode */}
      {!stepMode && (
        <Tabs
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      )}
      
      {/* Step Title - Only show in step mode */}
      {stepMode && (
        <h2 className="text-2xl font-bold text-[#191919] dark:text-[#F0EEED]">
          {currentStep === 1 && "General Info"}
          {currentStep === 2 && "Greetings"}
          {currentStep === 3 && "Treatment Guide"}
        </h2>
      )}

      {/* Tab Content */}
      {activeTab === "general" && (
        <div className="space-y-6">
          {/* Image Upload */}
          <ImageUpload
            imageUrl={formData.image}
            onImageChange={handleImageChange}
          />

          {/* Name */}
          <Input
            label="Name"
            value={formData.name || ""}
            onChange={(e) => handleInputChange("name", e.target.value)}
            placeholder="Enter treatment name"
          />

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
              Category
            </label>
            <Dropdown
              options={categoryOptions}
              value={formData.category || ""}
              onChange={(value) => handleInputChange("category", value)}
              placeholder="Select category"
            />
          </div>

          {/* Duration */}
          <Input
            label="Duration (minutes)"
            type="number"
            value={formData.duration?.toString() || "0"}
            onChange={(e) =>
              handleInputChange("duration", parseInt(e.target.value, 10) || 0)
            }
            placeholder="Enter duration in minutes"
          />

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
              Description
            </label>
            <textarea
              value={formData.description || ""}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Enter treatment description"
              rows={4}
              className="w-full px-4 py-2.5 rounded-lg border bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 border-zinc-300 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:border-transparent transition-all duration-200"
            />
          </div>

          {/* Pricing Rules */}
          <PricingRulesTable
            variants={pricingVariants}
            onVariantChange={handleVariantChange}
            onVariantDelete={handleVariantDelete}
            onAddVariant={handleAddVariant}
            onToggleWeekday={() => setWeekdayEnabled(!weekdayEnabled)}
            onToggleWeekend={() => setWeekendEnabled(!weekendEnabled)}
            onToggleHoliday={() => setHolidayEnabled(!holidayEnabled)}
            weekdayEnabled={weekdayEnabled}
            weekendEnabled={weekendEnabled}
            holidayEnabled={holidayEnabled}
          />

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
              Status
            </label>
            <Dropdown
              options={statusOptions}
              value={formData.status || "active"}
              onChange={(value) => handleInputChange("status", value)}
              placeholder="Select status"
            />
          </div>
        </div>
      )}

      {activeTab === "greetings" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column: Input Fields */}
            <div className="space-y-6">
              {/* Welcome Card Section */}
              <div className="bg-white dark:bg-[#191919] rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                <button
                  onClick={() => setWelcomeCardExpanded(!welcomeCardExpanded)}
                  className="w-full flex items-center justify-between px-6 py-4 bg-[#F0EEED] dark:bg-[#3D3B3A] hover:bg-[#E8E4E2] dark:hover:bg-[#4A4746] transition-colors"
                >
                  <span className="text-sm font-medium text-[#191919] dark:text-[#F0EEED]">
                    Welcome Card
                  </span>
                  <svg
                    className={`w-5 h-5 text-[#706C6B] dark:text-[#C1A7A3] transition-transform ${
                      welcomeCardExpanded ? "rotate-90" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>

                {welcomeCardExpanded && (
                  <div className="p-6 space-y-4">
                    {/* Greeting Text */}
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                        Greeting Text (before name)
                      </label>
                      <Input
                        value={welcomeCard.greetingText || ""}
                        onChange={(e) =>
                          setWelcomeCard({
                            ...welcomeCard,
                            greetingText: e.target.value,
                          })
                        }
                        placeholder="Welcome"
                      />
                      <p className="mt-1 text-xs text-[#706C6B] dark:text-[#C1A7A3]">
                        The customer's name will be filled in automatically using{" "}
                        <code className="bg-zinc-100 dark:bg-zinc-800 px-1 py-0.5 rounded">
                          {"{{customer_name}}"}
                        </code>
                      </p>
                    </div>

                    {/* Body Text */}
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                        Body Text
                      </label>
                      <textarea
                        value={welcomeCard.bodyText || ""}
                        onChange={(e) =>
                          setWelcomeCard({
                            ...welcomeCard,
                            bodyText: e.target.value,
                          })
                        }
                        placeholder="Enter body text"
                        rows={4}
                        className="w-full px-4 py-2.5 rounded-lg border bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 border-zinc-300 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:border-transparent transition-all duration-200"
                      />
                    </div>

                    {/* Closing Text */}
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                        Closing Text
                      </label>
                      <Input
                        value={welcomeCard.closingText || ""}
                        onChange={(e) =>
                          setWelcomeCard({
                            ...welcomeCard,
                            closingText: e.target.value,
                          })
                        }
                        placeholder="Warm Regards,"
                      />
                    </div>

                    {/* Signature */}
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                        Signature
                      </label>
                      <Input
                        value={welcomeCard.signature || ""}
                        onChange={(e) =>
                          setWelcomeCard({
                            ...welcomeCard,
                            signature: e.target.value,
                          })
                        }
                        placeholder="Sejenak Team"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Completion Card Section */}
              <div className="bg-white dark:bg-[#191919] rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                <button
                  onClick={() => setCompletionCardExpanded(!completionCardExpanded)}
                  className="w-full flex items-center justify-between px-6 py-4 bg-[#F0EEED] dark:bg-[#3D3B3A] hover:bg-[#E8E4E2] dark:hover:bg-[#4A4746] transition-colors"
                >
                  <span className="text-sm font-medium text-[#191919] dark:text-[#F0EEED]">
                    Completion Card
                  </span>
                  <svg
                    className={`w-5 h-5 text-[#706C6B] dark:text-[#C1A7A3] transition-transform ${
                      completionCardExpanded ? "rotate-90" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>

                {completionCardExpanded && (
                  <div className="p-6 space-y-4">
                    {/* Greeting Text */}
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                        Greeting Text (before name)
                      </label>
                      <Input
                        value={completionCard.greetingText || ""}
                        onChange={(e) =>
                          setCompletionCard({
                            ...completionCard,
                            greetingText: e.target.value,
                          })
                        }
                        placeholder="Thank you"
                      />
                      <p className="mt-1 text-xs text-[#706C6B] dark:text-[#C1A7A3]">
                        The customer's name will be filled in automatically using{" "}
                        <code className="bg-zinc-100 dark:bg-zinc-800 px-1 py-0.5 rounded">
                          {"{{customer_name}}"}
                        </code>
                      </p>
                    </div>

                    {/* Body Text */}
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                        Body Text
                      </label>
                      <textarea
                        value={completionCard.bodyText || ""}
                        onChange={(e) =>
                          setCompletionCard({
                            ...completionCard,
                            bodyText: e.target.value,
                          })
                        }
                        placeholder="Enter body text"
                        rows={4}
                        className="w-full px-4 py-2.5 rounded-lg border bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 border-zinc-300 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:border-transparent transition-all duration-200"
                      />
                    </div>

                    {/* Closing Text */}
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                        Closing Text
                      </label>
                      <Input
                        value={completionCard.closingText || ""}
                        onChange={(e) =>
                          setCompletionCard({
                            ...completionCard,
                            closingText: e.target.value,
                          })
                        }
                        placeholder="Warm Regards,"
                      />
                    </div>

                    {/* Signature */}
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                        Signature
                      </label>
                      <Input
                        value={completionCard.signature || ""}
                        onChange={(e) =>
                          setCompletionCard({
                            ...completionCard,
                            signature: e.target.value,
                          })
                        }
                        placeholder="Sejenak Team"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Preview */}
            <div className="space-y-6">
              <div className="bg-white dark:bg-[#191919] rounded-lg border border-zinc-200 dark:border-zinc-800 p-6">
                <h3 className="text-sm font-medium text-[#191919] dark:text-[#F0EEED] mb-4">
                  Preview
                </h3>
                <div className="border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-lg p-4 bg-zinc-50 dark:bg-zinc-900">
                  {/* Preview Card */}
                  <div className="bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20 rounded-lg p-8 relative overflow-hidden">
                    {/* Decorative Pattern Background */}
                    <div className="absolute inset-0 opacity-5">
                      <svg
                        className="w-full h-full"
                        viewBox="0 0 100 100"
                        preserveAspectRatio="none"
                      >
                        <path
                          d="M0,0 L100,0 L100,100 L0,100 Z"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        />
                        <circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" strokeWidth="1" />
                        <path
                          d="M20,50 Q50,20 80,50 Q50,80 20,50"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1"
                        />
                      </svg>
                    </div>

                    {/* Card Content */}
                    <div className="relative z-10 text-center space-y-4">
                      {/* Logo */}
                      <div className="mb-6">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#C1A7A3] text-white text-2xl font-bold">
                          S
                        </div>
                      </div>

                      {/* Greeting with Customer Name */}
                      <h2 className="text-2xl font-semibold text-zinc-800 dark:text-zinc-200">
                        {welcomeCard.greetingText || "Welcome"}
                        {welcomeCard.greetingText && ", "}
                        <span className="text-[#C1A7A3]">Nanda Anindya</span>!
                      </h2>

                      {/* Body Text */}
                      <p className="text-base text-zinc-700 dark:text-zinc-300 leading-relaxed">
                        {welcomeCard.bodyText ||
                          "Thank you for choosing Sejenak as your space for self-care. May every visit bring you calm and healing."}
                      </p>

                      {/* Closing and Signature */}
                      <div className="pt-4 space-y-2">
                        <p className="text-sm text-zinc-600 dark:text-zinc-400">
                          {welcomeCard.closingText || "Warm Regards,"}
                        </p>
                        <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                          {welcomeCard.signature || "Sejenak Team"}
                        </p>
                      </div>

                      {/* SEE Button */}
                      <div className="pt-6">
                        <button className="px-6 py-2 bg-[#C1A7A3] text-white rounded-lg hover:bg-[#A88F8B] transition-colors text-sm font-medium">
                          SEE →
                        </button>
                      </div>
                    </div>

                    {/* Decorative Border */}
                    <div className="absolute inset-0 border-2 border-pink-200 dark:border-pink-800 rounded-lg pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "guide" && (
        <div className="space-y-4">
          {/* Steps List */}
          <div className="space-y-2">
            {guideSteps.map((step, index) => (
              <div
                key={step.id || index}
                className="bg-white dark:bg-[#191919] rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden"
              >
                <button
                  onClick={() =>
                    setExpandedStep(
                      expandedStep === step.id || (!step.id && expandedStep === `step-${index}`)
                        ? null
                        : step.id || `step-${index}`
                    )
                  }
                  className="w-full flex items-center justify-between px-6 py-4 bg-[#F0EEED] dark:bg-[#3D3B3A] hover:bg-[#E8E4E2] dark:hover:bg-[#4A4746] transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#DCCAB7] dark:bg-[#C1A7A3] text-[#191919] dark:text-white text-sm font-medium">
                      {step.stepNumber || index + 1}
                    </div>
                    <span className="text-sm font-medium text-[#191919] dark:text-[#F0EEED]">
                      {step.stepNumber || index + 1} {step.title || `Step ${step.stepNumber || index + 1}`}
                    </span>
                  </div>
                  <svg
                    className={`w-5 h-5 text-[#191919] dark:text-[#F0EEED] transition-transform ${
                      expandedStep === step.id || (!step.id && expandedStep === `step-${index}`)
                        ? "rotate-90"
                        : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>

                {(expandedStep === step.id || (!step.id && expandedStep === `step-${index}`)) && (
                  <div className="p-6 border-t border-zinc-200 dark:border-zinc-800 space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      {/* Step Number */}
                      <div>
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                          Step Number
                        </label>
                        <Input
                          type="number"
                          min="1"
                          value={step.stepNumber?.toString() || ""}
                          onChange={(e) => {
                            const updatedSteps = [...guideSteps];
                            updatedSteps[index] = {
                              ...step,
                              stepNumber: Math.max(1, parseInt(e.target.value, 10) || 1),
                            };
                            setGuideSteps(updatedSteps);
                          }}
                          placeholder="1"
                        />
                      </div>

                      {/* Step Title */}
                      <div>
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                          Step Title <span className="text-red-500">*</span>
                        </label>
                        <Input
                          value={step.title || ""}
                          onChange={(e) => {
                            const updatedSteps = [...guideSteps];
                            updatedSteps[index] = {
                              ...step,
                              title: e.target.value,
                            };
                            setGuideSteps(updatedSteps);
                          }}
                          placeholder="Enter step title"
                        />
                      </div>

                      {/* Duration */}
                      <div>
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                          Duration (minutes) <span className="text-red-500">*</span>
                        </label>
                        <Input
                          type="number"
                          min="1"
                          value={step.duration?.toString() || ""}
                          onChange={(e) => {
                            const updatedSteps = [...guideSteps];
                            updatedSteps[index] = {
                              ...step,
                              duration: Math.max(1, parseInt(e.target.value, 10) || 1),
                            };
                            setGuideSteps(updatedSteps);
                          }}
                          placeholder="10"
                        />
                      </div>
                    </div>

                    {/* Description - Required */}
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                        Description <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        value={step.description || ""}
                        onChange={(e) => {
                          const updatedSteps = [...guideSteps];
                          updatedSteps[index] = {
                            ...step,
                            description: e.target.value,
                          };
                          setGuideSteps(updatedSteps);
                        }}
                        placeholder="Enter step description"
                        rows={3}
                        className="w-full px-4 py-2.5 rounded-lg border bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 border-zinc-300 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:border-transparent transition-all duration-200"
                      />
                    </div>

                    {/* Instructions */}
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                        Instructions
                      </label>
                      <textarea
                        value={step.instructions || ""}
                        onChange={(e) => {
                          const updatedSteps = [...guideSteps];
                          updatedSteps[index] = {
                            ...step,
                            instructions: e.target.value,
                          };
                          setGuideSteps(updatedSteps);
                        }}
                        placeholder="Enter step instructions"
                        rows={3}
                        className="w-full px-4 py-2.5 rounded-lg border bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 border-zinc-300 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:border-transparent transition-all duration-200"
                      />
                    </div>

                    {/* Tips */}
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                        Tips
                      </label>
                      <textarea
                        value={step.tips || ""}
                        onChange={(e) => {
                          const updatedSteps = [...guideSteps];
                          updatedSteps[index] = {
                            ...step,
                            tips: e.target.value,
                          };
                          setGuideSteps(updatedSteps);
                        }}
                        placeholder="Enter helpful tips"
                        rows={2}
                        className="w-full px-4 py-2.5 rounded-lg border bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 border-zinc-300 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:border-transparent transition-all duration-200"
                      />
                    </div>

                    {/* Advantages */}
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                        Advantages
                      </label>
                      <textarea
                        value={step.advantages || ""}
                        onChange={(e) => {
                          const updatedSteps = [...guideSteps];
                          updatedSteps[index] = {
                            ...step,
                            advantages: e.target.value,
                          };
                          setGuideSteps(updatedSteps);
                        }}
                        placeholder="Enter advantages of this step"
                        rows={2}
                        className="w-full px-4 py-2.5 rounded-lg border bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 border-zinc-300 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:border-transparent transition-all duration-200"
                      />
                    </div>

                    {/* Next Step Message */}
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                        Next Step Message
                      </label>
                      <Input
                        value={step.nextStepMessage || ""}
                        onChange={(e) => {
                          const updatedSteps = [...guideSteps];
                          updatedSteps[index] = {
                            ...step,
                            nextStepMessage: e.target.value,
                          };
                          setGuideSteps(updatedSteps);
                        }}
                        placeholder="Message to show before next step"
                      />
                    </div>

                    {/* Delete Button */}
                    <div className="flex justify-end mt-4">
                      <button
                        onClick={() => {
                          const updatedSteps = guideSteps.filter((_, i) => i !== index);
                          // Renumber steps
                          updatedSteps.forEach((s, i) => {
                            s.stepNumber = i + 1;
                          });
                          setGuideSteps(updatedSteps);
                          setExpandedStep(null);
                        }}
                        className="px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      >
                        Delete Step
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Add Step Button */}
          <button
            onClick={() => {
              const newStep: TreatmentGuideStep = {
                stepNumber: guideSteps.length + 1,
                title: "",
                description: "",
                duration: 1,
                isActive: true,
              };
              setGuideSteps([...guideSteps, newStep]);
              setExpandedStep(`step-${guideSteps.length}`);
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-lg text-sm font-medium text-[#706C6B] dark:text-[#C1A7A3] hover:border-[#C1A7A3] hover:text-[#C1A7A3] dark:hover:border-[#C1A7A3] dark:hover:text-[#C1A7A3] transition-colors"
          >
            <PlusIcon />
            Add Step
          </button>
        </div>
      )}
    </div>
  );
});

TreatmentForm.displayName = "TreatmentForm";

