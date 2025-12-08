"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Download, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface ConsentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  data?: any; // Replace with proper type when available
}

export const ConsentFormModal: React.FC<ConsentFormModalProps> = ({
  isOpen,
  onClose,
  data,
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-0 bg-white dark:bg-[#191919] z-50 overflow-hidden flex flex-col shadow-xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
              <h2 className="text-lg font-semibold text-[#191919] dark:text-[#F0EEED]">
                Consent Form
              </h2>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="gap-2">
                  <Download className="w-4 h-4" />
                  Download
                </Button>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-[#706C6B] dark:text-[#C1A7A3]" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8">
              <div className="max-w-3xl mx-auto border border-[#B68D40] rounded-lg p-1 bg-white dark:bg-[#191919]">
                  <div className="border border-dashed border-[#B68D40] rounded-md p-6 md:p-10 space-y-8">
                    
                    {/* Header Image */}
                    <div className="w-full rounded overflow-hidden mb-8">
                        <img 
                          src="/assets/Header consent form.png" 
                          alt="Formulir Persetujuan Layanan" 
                          className="w-full h-auto object-cover"
                        />
                    </div>

                    {/* Booking Information */}
                    <div>
                        <h3 className="font-semibold text-[#191919] dark:text-[#F0EEED] mb-4">Booking Information</h3>
                        <div className="grid grid-cols-[150px_1fr] gap-y-2 text-sm">
                            <span className="text-[#706C6B] dark:text-[#C1A7A3]">Customer Name</span>
                            <span className="font-medium text-[#191919] dark:text-[#F0EEED]">: {data?.customerName || "-"}</span>
                            
                            <span className="text-[#706C6B] dark:text-[#C1A7A3]">Treatment Date</span>
                            <span className="font-medium text-[#191919] dark:text-[#F0EEED]">: {data?.date || "-"}</span>
                            
                            <span className="text-[#706C6B] dark:text-[#C1A7A3]">Treatment Type</span>
                            <span className="font-medium text-[#191919] dark:text-[#F0EEED]">: {data?.treatmentType || "-"}</span>
                        </div>
                    </div>

                    {/* Health & Medical Conditions */}
                    <div>
                        <h3 className="font-semibold text-[#191919] dark:text-[#F0EEED] mb-4">Health & Medical Conditions</h3>
                        <div className="grid grid-cols-[150px_1fr] gap-y-2 text-sm">
                            <span className="text-[#706C6B] dark:text-[#C1A7A3]">Medical condition</span>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 rounded bg-[#D4B572] flex items-center justify-center text-white"><Check className="w-3 h-3" /></div>
                                    <span className="text-[#191919] dark:text-[#F0EEED]">On period</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 rounded bg-[#D4B572] flex items-center justify-center text-white"><Check className="w-3 h-3" /></div>
                                    <span className="text-[#191919] dark:text-[#F0EEED]">Taking regular medication</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 rounded bg-[#D4B572] flex items-center justify-center text-white"><Check className="w-3 h-3" /></div>
                                    <span className="text-[#191919] dark:text-[#F0EEED]">Skin issues</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Focus Area & Comfort */}
                    <div>
                        <h3 className="font-semibold text-[#191919] dark:text-[#F0EEED] mb-4">Focus Area & Comfort</h3>
                        <div className="grid grid-cols-[150px_1fr] gap-y-4 text-sm">
                            <span className="text-[#706C6B] dark:text-[#C1A7A3]">Body part to focus on</span>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 rounded bg-[#D4B572] flex items-center justify-center text-white"><Check className="w-3 h-3" /></div>
                                    <span className="text-[#191919] dark:text-[#F0EEED]">Head</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 rounded bg-[#D4B572] flex items-center justify-center text-white"><Check className="w-3 h-3" /></div>
                                    <span className="text-[#191919] dark:text-[#F0EEED]">Back</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 rounded bg-[#D4B572] flex items-center justify-center text-white"><Check className="w-3 h-3" /></div>
                                    <span className="text-[#191919] dark:text-[#F0EEED]">Right Arm</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 rounded bg-[#D4B572] flex items-center justify-center text-white"><Check className="w-3 h-3" /></div>
                                    <span className="text-[#191919] dark:text-[#F0EEED]">Left Arm</span>
                                </div>
                            </div>

                            <span className="text-[#706C6B] dark:text-[#C1A7A3]">Preferred massage pressure</span>
                            <span className="font-medium text-[#191919] dark:text-[#F0EEED]">: Soft</span>

                            <span className="text-[#706C6B] dark:text-[#C1A7A3]">Body parts you do NOT want to be touched</span>
                            <span className="font-medium text-[#191919] dark:text-[#F0EEED]">: Stomach</span>
                        </div>
                    </div>

                    {/* Aroma & Room Temperature */}
                    <div>
                        <h3 className="font-semibold text-[#191919] dark:text-[#F0EEED] mb-4">Aroma & Room Temperature</h3>
                         <div className="grid grid-cols-[150px_1fr] gap-y-2 text-sm">
                            <span className="text-[#706C6B] dark:text-[#C1A7A3]">Body parts you do NOT want to be touched</span>
                            <span className="font-medium text-[#191919] dark:text-[#F0EEED] flex items-center gap-2">: 🧴 Sweet Rose</span>

                            <span className="text-[#706C6B] dark:text-[#C1A7A3]">Room Temperature Preference</span>
                            <span className="font-medium text-[#191919] dark:text-[#F0EEED]">: Cool</span>
                        </div>
                    </div>

                    {/* Welcome Drink */}
                    <div>
                        <h3 className="font-semibold text-[#191919] dark:text-[#F0EEED] mb-4">Welcome Drink</h3>
                        <div className="grid grid-cols-[150px_1fr] gap-y-2 text-sm">
                            <span className="text-[#706C6B] dark:text-[#C1A7A3]">Type</span>
                            <span className="font-medium text-[#191919] dark:text-[#F0EEED] flex items-center gap-2">: 🍹 Ice</span>
                        </div>
                    </div>

                    {/* Treatment Consent */}
                    <div>
                        <h3 className="font-semibold text-[#191919] dark:text-[#F0EEED] mb-4">Treatment Consent</h3>
                        <div className="space-y-3 text-sm">
                            {[
                                "I confirm that the health information and preferences I provided above are true and accurate",
                                "I understand that the treatment is not a substitute for medical care",
                                "I give my consent to the therapist to perform the treatment according to the standard operating procedures (SOP), and I will communicate if I feel any discomfort",
                                "I understand that the results of each treatment may vary from person to person"
                            ].map((text, i) => (
                                <div key={i} className="flex gap-3">
                                    <div className="w-4 h-4 rounded bg-[#D4B572] flex-shrink-0 flex items-center justify-center text-white mt-0.5"><Check className="w-3 h-3" /></div>
                                    <span className="text-[#706C6B] dark:text-[#C1A7A3]">{text}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Privacy Agreement */}
                    <div>
                        <h3 className="font-semibold text-[#191919] dark:text-[#F0EEED] mb-4">Privacy Agreement</h3>
                        <div className="flex gap-3 text-sm">
                            <div className="w-4 h-4 rounded bg-[#D4B572] flex-shrink-0 flex items-center justify-center text-white mt-0.5"><Check className="w-3 h-3" /></div>
                            <span className="text-[#706C6B] dark:text-[#C1A7A3]">I give permission to Sejenak to securely store my data, to be used solely for service and internal operational purposes</span>
                        </div>
                    </div>

                    {/* Signature */}
                    <div>
                        <h3 className="font-semibold text-[#191919] dark:text-[#F0EEED] mb-4">Signature</h3>
                        <div className="border border-zinc-200 dark:border-zinc-700 rounded-lg w-64 h-32 flex items-center justify-center">
                            {/* Placeholder signature */}
                            <span className="font-script text-4xl text-zinc-400">Signed</span>
                        </div>
                    </div>

                  </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

