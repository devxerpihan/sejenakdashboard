"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { SejenakDashboardLayout } from "@/components/layout/SejenakDashboardLayout";
import { Footer } from "@/components/layout";
import { getNavItems } from "@/config/navigation";
import { useProfile } from "@/hooks/useProfile";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { ChevronRight, ArrowLeft, Star, Download, Eye, FileText, CheckCircle } from "lucide-react";
import { useAppointment } from "@/hooks/useAppointment";
import { ConsentFormModal } from "@/components/appointment/ConsentFormModal";
import { SnapshotModal } from "@/components/appointment/SnapshotModal";
import { AppointmentStatusBadge } from "@/components/appointment/AppointmentStatusBadge";

export default function AppointmentDetailsPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const { profile } = useProfile();
  
  const { appointment, loading, error } = useAppointment(id);
  
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("darkMode");
      return saved === "true";
    }
    return false;
  });

  const [isConsentModalOpen, setIsConsentModalOpen] = useState(false);
  const [isSnapshotModalOpen, setIsSnapshotModalOpen] = useState(false);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("darkMode", "true");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("darkMode", "false");
    }
  }, [isDarkMode]);

  // Handle back navigation
  const handleBack = () => {
    router.back();
  };

  if (loading) {
    return (
      <SejenakDashboardLayout
        navItems={getNavItems(profile?.role)}
        headerTitle="Appointment"
        isDarkMode={isDarkMode}
        onDarkModeToggle={() => setIsDarkMode(!isDarkMode)}
        footer={<Footer />}
      >
        <div className="flex items-center justify-center h-screen">
          <div className="text-[#706C6B] dark:text-[#C1A7A3]">
            Loading appointment details...
          </div>
        </div>
      </SejenakDashboardLayout>
    );
  }

  if (error || !appointment) {
    return (
      <SejenakDashboardLayout
        navItems={getNavItems(profile?.role)}
        headerTitle="Appointment"
        isDarkMode={isDarkMode}
        onDarkModeToggle={() => setIsDarkMode(!isDarkMode)}
        footer={<Footer />}
      >
        <div className="flex flex-col items-center justify-center h-screen gap-4">
          <div className="text-red-500">
            {error || "Appointment not found"}
          </div>
          <Button onClick={handleBack} variant="outline">
            Go Back
          </Button>
        </div>
      </SejenakDashboardLayout>
    );
  }

  return (
    <SejenakDashboardLayout
      navItems={getNavItems(profile?.role)}
      headerTitle="Appointment"
      isDarkMode={isDarkMode}
      onDarkModeToggle={() => setIsDarkMode(!isDarkMode)}
      footer={<Footer />}
      customHeader={
        <div className="flex flex-col gap-4 p-6 bg-white dark:bg-[#191919] border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-2 text-sm text-[#706C6B] dark:text-[#C1A7A3]">
            <span 
              className="cursor-pointer hover:text-[#B68D40] dark:hover:text-[#D4B572]"
              onClick={() => router.push("/appointment")}
            >
              Appointment
            </span>
            <ChevronRight className="w-4 h-4" />
            <span className="font-medium text-[#191919] dark:text-[#F0EEED]">
              {appointment.patientName}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-[#191919] dark:text-[#F0EEED]">
              Appointment Details
            </h1>
            <Button 
              variant="outline" 
              className="text-red-500 border-red-200 hover:bg-red-50 dark:border-red-900/30 dark:hover:bg-red-900/10"
            >
              Cancel Appointment
            </Button>
          </div>
        </div>
      }
    >
      <div className="p-6 space-y-6">
        {/* Top Section: Profile and Booking Info */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Customer Profile Card */}
          <div className="bg-white dark:bg-[#191919] rounded-lg border border-zinc-200 dark:border-zinc-800 p-6 flex flex-col items-center">
            <Avatar 
              src={appointment.customerAvatar} 
              name={appointment.patientName} 
              className="w-24 h-24 mb-4 text-2xl"
            />
            <h2 className="text-xl font-semibold text-[#191919] dark:text-[#F0EEED] mb-1">
              {appointment.patientName}
            </h2>
            <p className="text-sm text-[#706C6B] dark:text-[#C1A7A3] mb-6">
              {appointment.customerEmail}
            </p>
            
            <div className="w-full flex justify-between px-8 mb-6">
              <div className="text-center">
                <p className="text-sm font-medium text-[#191919] dark:text-[#F0EEED]">
                  {appointment.membershipLevel}
                </p>
                <p className="text-xs text-[#706C6B] dark:text-[#C1A7A3]">
                  Member level
                </p>
              </div>
              <div className="h-full w-px bg-zinc-200 dark:bg-zinc-800 mx-4"></div>
              <div className="text-center">
                <p className="text-sm font-medium text-[#191919] dark:text-[#F0EEED]">
                  {appointment.totalVisits}
                </p>
                <p className="text-xs text-[#706C6B] dark:text-[#C1A7A3]">
                  Total visit
                </p>
              </div>
            </div>
            
            <Button className="w-full bg-[#D4B572] hover:bg-[#C2A360] text-white">
              See Full Profile
            </Button>
          </div>
          
          {/* Booking Information Card */}
          <div className="lg:col-span-2 bg-white dark:bg-[#191919] rounded-lg border border-zinc-200 dark:border-zinc-800 p-6">
            <h3 className="text-lg font-semibold text-[#191919] dark:text-[#F0EEED] mb-4">
              Booking Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-12 mb-6">
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <span className="text-sm text-[#706C6B] dark:text-[#C1A7A3]">Treatment</span>
                  <span className="text-sm font-medium text-[#191919] dark:text-[#F0EEED] col-span-2">
                    {appointment.treatmentName}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <span className="text-sm text-[#706C6B] dark:text-[#C1A7A3]">Price</span>
                  <span className="text-sm font-medium text-[#191919] dark:text-[#F0EEED] col-span-2">
                    {appointment.price}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <span className="text-sm text-[#706C6B] dark:text-[#C1A7A3]">Date</span>
                  <span className="text-sm font-medium text-[#191919] dark:text-[#F0EEED] col-span-2">
                    {appointment.bookingDate}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <span className="text-sm text-[#706C6B] dark:text-[#C1A7A3]">Time</span>
                  <span className="text-sm font-medium text-[#191919] dark:text-[#F0EEED] col-span-2">
                    {appointment.startTime} - {appointment.endTime}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <span className="text-sm text-[#706C6B] dark:text-[#C1A7A3]">Room</span>
                  <span className="text-sm font-medium text-[#191919] dark:text-[#F0EEED] col-span-2">
                    {appointment.room}
                  </span>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <span className="text-sm text-[#706C6B] dark:text-[#C1A7A3]">Booking by</span>
                  <span className="text-sm font-medium text-[#191919] dark:text-[#F0EEED] col-span-2">
                    {appointment.bookedBy}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <span className="text-sm text-[#706C6B] dark:text-[#C1A7A3]">Last update by</span>
                  <span className="text-sm font-medium text-[#191919] dark:text-[#F0EEED] col-span-2">
                    {appointment.lastUpdatedBy}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-4 items-center">
                  <span className="text-sm text-[#706C6B] dark:text-[#C1A7A3]">Consent Form</span>
                  <div className="col-span-2 flex items-center gap-2">
                    <span 
                      className={`px-2 py-0.5 rounded text-xs font-medium ${
                        appointment.consentFormStatus === 'submitted' 
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                          : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                      }`}
                    >
                      {appointment.consentForm}
                    </span>
                    <span 
                        className="text-xs text-[#706C6B] dark:text-[#C1A7A3] cursor-pointer hover:underline"
                        onClick={() => setIsConsentModalOpen(true)}
                    >
                        View
                    </span>
                    <span className="text-xs text-[#706C6B] dark:text-[#C1A7A3]">|</span>
                    <span className="text-xs text-[#706C6B] dark:text-[#C1A7A3] cursor-pointer hover:underline">Download</span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 items-center">
                  <span className="text-sm text-[#706C6B] dark:text-[#C1A7A3]">Snapshot</span>
                  <div className="col-span-2 flex items-center gap-2">
                    <span 
                      className={`px-2 py-0.5 rounded text-xs font-medium ${
                        appointment.snapshotStatus === 'taken' 
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                          : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                      }`}
                    >
                      {appointment.snapshot}
                    </span>
                    <span 
                        className="text-xs text-[#706C6B] dark:text-[#C1A7A3] cursor-pointer hover:underline"
                        onClick={() => setIsSnapshotModalOpen(true)}
                    >
                        View
                    </span>
                    <span className="text-xs text-[#706C6B] dark:text-[#C1A7A3]">|</span>
                    <span className="text-xs text-[#706C6B] dark:text-[#C1A7A3] cursor-pointer hover:underline">Download</span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 items-center">
                  <span className="text-sm text-[#706C6B] dark:text-[#C1A7A3]">Status Booking</span>
                  <div className="col-span-2">
                    {appointment.status && <AppointmentStatusBadge status={appointment.status} />}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-[#FEF3C7] dark:bg-[#3D3422] p-3 rounded border border-[#FCD34D] dark:border-[#785E22]">
              <p className="text-sm text-[#92400E] dark:text-[#FCD34D]">
                <span className="font-semibold">Note:</span> {appointment.note}
              </p>
            </div>
          </div>
        </div>
        
        {/* Scalp Condition and Hair Treatment Grid - Always show grid but with conditional content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Scalp Condition */}
          <div className="bg-white dark:bg-[#191919] rounded-lg border border-zinc-200 dark:border-zinc-800 p-6 flex flex-col h-full">
            <h3 className="text-lg font-semibold text-[#191919] dark:text-[#F0EEED] mb-4">
              Scalp Condition
            </h3>
            
            {appointment.scalpCondition ? (
              <>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-[#706C6B] dark:text-[#C1A7A3] mb-2">Before</p>
                    <div className="aspect-square bg-zinc-100 dark:bg-zinc-800 rounded-md overflow-hidden relative">
                       <div className="absolute inset-0 flex items-center justify-center text-zinc-400 dark:text-zinc-600">
                         <FileText className="w-8 h-8" />
                       </div>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-[#706C6B] dark:text-[#C1A7A3] mb-2">After</p>
                    <div className="aspect-square bg-zinc-100 dark:bg-zinc-800 rounded-md overflow-hidden relative">
                       <div className="absolute inset-0 flex items-center justify-center text-zinc-400 dark:text-zinc-600">
                         <FileText className="w-8 h-8" />
                       </div>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <span className="text-xs text-[#706C6B] dark:text-[#C1A7A3]">Result: </span>
                    <span className="text-sm font-medium text-[#191919] dark:text-[#F0EEED]">{appointment.scalpCondition.resultBefore}</span>
                  </div>
                  <div>
                    <span className="text-xs text-[#706C6B] dark:text-[#C1A7A3]">Result: </span>
                    <span className="text-sm font-medium text-[#191919] dark:text-[#F0EEED]">{appointment.scalpCondition.resultAfter}</span>
                  </div>
                </div>
                
                <div className="bg-[#FEF3C7] dark:bg-[#3D3422] p-3 rounded border border-[#FCD34D] dark:border-[#785E22]">
                  <p className="text-sm text-[#92400E] dark:text-[#FCD34D]">
                    <span className="font-semibold">Note:</span> {appointment.scalpCondition.note}
                  </p>
                </div>
              </>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center py-8">
                    <img src="/assets/No Shift Available.png" alt="No data yet" className="w-24 h-24 object-contain opacity-50 mb-3" />
                    <p className="text-sm text-[#706C6B] dark:text-[#C1A7A3]">No data yet</p>
                </div>
            )}
          </div>
          
          {/* Hair Treatment */}
          <div className="bg-white dark:bg-[#191919] rounded-lg border border-zinc-200 dark:border-zinc-800 p-6 flex flex-col h-full">
            <h3 className="text-lg font-semibold text-[#191919] dark:text-[#F0EEED] mb-4">
              Hair Treatment
            </h3>
            
            {appointment.hairTreatment ? (
              <>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-[#706C6B] dark:text-[#C1A7A3] mb-2">Before</p>
                    <div className="aspect-square bg-zinc-100 dark:bg-zinc-800 rounded-md overflow-hidden relative">
                       <div className="absolute inset-0 flex items-center justify-center text-zinc-400 dark:text-zinc-600">
                         <FileText className="w-8 h-8" />
                       </div>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-[#706C6B] dark:text-[#C1A7A3] mb-2">After</p>
                    <div className="aspect-square bg-zinc-100 dark:bg-zinc-800 rounded-md overflow-hidden relative">
                       <div className="absolute inset-0 flex items-center justify-center text-zinc-400 dark:text-zinc-600">
                         <FileText className="w-8 h-8" />
                       </div>
                    </div>
                  </div>
                </div>
                
                <div className="mb-4">
                  <span className="text-xs text-[#706C6B] dark:text-[#C1A7A3]">Type: </span>
                  <span className="text-sm font-medium text-[#191919] dark:text-[#F0EEED]">{appointment.hairTreatment.type}</span>
                </div>
                
                <div className="bg-[#FEF3C7] dark:bg-[#3D3422] p-3 rounded border border-[#FCD34D] dark:border-[#785E22]">
                  <p className="text-sm text-[#92400E] dark:text-[#FCD34D]">
                    <span className="font-semibold">Note:</span> {appointment.hairTreatment.note}
                  </p>
                </div>
              </>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center py-8">
                    <img src="/assets/No Shift Available.png" alt="No data yet" className="w-24 h-24 object-contain opacity-50 mb-3" />
                    <p className="text-sm text-[#706C6B] dark:text-[#C1A7A3]">No data yet</p>
                </div>
            )}
          </div>
        </div>
        
        {/* Reviews and Notes Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Therapist Note */}
          <div className="bg-white dark:bg-[#191919] rounded-lg border border-zinc-200 dark:border-zinc-800 p-6 flex flex-col h-full">
            <h3 className="text-lg font-semibold text-[#191919] dark:text-[#F0EEED] mb-4">
              Therapist Note
            </h3>
            
            {appointment.therapistNote ? (
              <>
                <div className="mb-2">
                  <p className="text-sm text-[#706C6B] dark:text-[#C1A7A3]">
                    From therapist: <span className="text-[#191919] dark:text-[#F0EEED]">{appointment.therapistNote.therapist}</span>
                  </p>
                </div>
                
                <div className="flex items-center justify-between mb-4">
                  <div className="text-xs text-[#706C6B] dark:text-[#C1A7A3]">
                    {appointment.therapistNote.date} • {appointment.therapistNote.treatment}
                  </div>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`w-4 h-4 ${i < appointment.therapistNote!.rating ? "text-[#D4B572] fill-[#D4B572]" : "text-gray-300"}`} 
                      />
                    ))}
                  </div>
                </div>
                
                <p className="text-sm text-[#191919] dark:text-[#F0EEED]">
                  {appointment.therapistNote.note}
                </p>
              </>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center py-8">
                    <img src="/assets/No Shift Available.png" alt="No data yet" className="w-24 h-24 object-contain opacity-50 mb-3" />
                    <p className="text-sm text-[#706C6B] dark:text-[#C1A7A3]">No data yet</p>
                </div>
            )}
          </div>
          
          {/* Customer Review */}
          <div className="bg-white dark:bg-[#191919] rounded-lg border border-zinc-200 dark:border-zinc-800 p-6 flex flex-col h-full">
            <h3 className="text-lg font-semibold text-[#191919] dark:text-[#F0EEED] mb-4">
              Customer Review
            </h3>
            
            {appointment.customerReview ? (
              <>
                <div className="flex items-center justify-between mb-4">
                  <div className="text-xs text-[#706C6B] dark:text-[#C1A7A3]">
                    {appointment.customerReview.date} • {appointment.customerReview.treatment}
                  </div>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`w-4 h-4 ${i < appointment.customerReview!.rating ? "text-[#D4B572] fill-[#D4B572]" : "text-gray-300"}`} 
                      />
                    ))}
                  </div>
                </div>
                
                <p className="text-sm text-[#191919] dark:text-[#F0EEED] mb-4">
                  {appointment.customerReview.review}
                </p>
                
                {appointment.customerReview.tip && (
                  <div className="inline-flex items-center px-2 py-1 rounded bg-green-100 dark:bg-green-900/30">
                    <span className="text-xs font-medium text-green-700 dark:text-green-400">
                      Tip: {appointment.customerReview.tip}
                    </span>
                  </div>
                )}
              </>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center py-8">
                    <img src="/assets/No Shift Available.png" alt="No data yet" className="w-24 h-24 object-contain opacity-50 mb-3" />
                    <p className="text-sm text-[#706C6B] dark:text-[#C1A7A3]">No data yet</p>
                </div>
            )}
          </div>
        </div>
        
        {/* In Lounge Feedback */}
        <div className="bg-white dark:bg-[#191919] rounded-lg border border-zinc-200 dark:border-zinc-800 p-6 flex flex-col min-h-[200px]">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-[#191919] dark:text-[#F0EEED]">
                In Lounge Feedback
              </h3>
              {appointment.feedback && (
                <Button variant="outline" className="flex items-center gap-2 text-xs">
                    <Download className="w-3 h-3" />
                    Download
                </Button>
              )}
            </div>
            
            {appointment.feedback ? (
                <div className="space-y-4">
                    <div>
                        <p className="text-xs text-[#706C6B] dark:text-[#C1A7A3]">Customer Name</p>
                        <p className="text-sm font-medium text-[#191919] dark:text-[#F0EEED]">{appointment.feedback.customerName}</p>
                    </div>
                    
                    <div>
                        <p className="text-xs text-[#706C6B] dark:text-[#C1A7A3]">Therapist Name</p>
                        <p className="text-sm font-medium text-[#191919] dark:text-[#F0EEED]">{appointment.feedback.therapistName}</p>
                    </div>
                    
                    <div>
                        <p className="text-xs text-[#706C6B] dark:text-[#C1A7A3]">Treatment Name</p>
                        <p className="text-sm font-medium text-[#191919] dark:text-[#F0EEED]">{appointment.feedback.treatmentName}</p>
                    </div>
                    
                    <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800">
                        <p className="text-xs text-[#706C6B] dark:text-[#C1A7A3] mb-2">Did the room and equipment look clean, neat, and hygienic when you arrived?</p>
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800">
                        <span className="text-lg">😍</span>
                        <span className="text-sm font-medium text-[#191919] dark:text-[#F0EEED]">{appointment.feedback.cleanliness}</span>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center py-8">
                    <img src="/assets/No Shift Available.png" alt="No data yet" className="w-24 h-24 object-contain opacity-50 mb-3" />
                    <p className="text-sm text-[#706C6B] dark:text-[#C1A7A3]">No data yet</p>
                </div>
            )}
        </div>
      </div>

      {/* Modals */}
      <ConsentFormModal 
        isOpen={isConsentModalOpen} 
        onClose={() => setIsConsentModalOpen(false)} 
        data={{
            customerName: appointment.patientName,
            date: appointment.bookingDate,
            treatmentType: appointment.treatmentName
        }}
      />
      
      <SnapshotModal 
        isOpen={isSnapshotModalOpen} 
        onClose={() => setIsSnapshotModalOpen(false)} 
        // We'll need a real snapshot URL later, for now we can rely on what's in appointment object if we add it
        imageUrl={undefined} 
      />
    </SejenakDashboardLayout>
  );
}
