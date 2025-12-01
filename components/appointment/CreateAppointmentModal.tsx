"use client";

import React, { useState, useEffect, useMemo } from "react";
import { X, Plus, Trash2, Calendar } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Dropdown } from "@/components/ui/Dropdown";
import { ToastContainer } from "@/components/ui/Toast";
import { useTreatments } from "@/hooks/useTreatments";
import { useAppointmentTherapists } from "@/hooks/useAppointmentTherapists";
import { useBranches } from "@/hooks/useBranches";
import { Treatment } from "@/types/treatment";
import { Therapist } from "@/types/appointment";

interface ServiceBundle {
  id: string;
  serviceId: string;
  serviceName: string;
  therapistId: string;
  therapistName: string;
  time: string; // HH:mm format
  roomId: string;
  roomName: string;
  addOns: string[]; // Array of treatment IDs
  addOnNames: string[]; // Array of treatment names
  price: number;
  originalPrice: number;
  isSaved?: boolean; // Track if bundle is saved/completed
}

interface CustomerData {
  id?: string;
  name: string;
  email: string;
  phone: string;
  birthDate: string; // DD-MM-YYYY format
  address: string;
}

interface BookingDate {
  date: string; // YYYY-MM-DD format
}

interface CreateAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  branchId: string | null;
  onSuccess?: () => void;
}

export const CreateAppointmentModal: React.FC<CreateAppointmentModalProps> = ({
  isOpen,
  onClose,
  branchId,
  onSuccess,
}) => {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [customer, setCustomer] = useState<CustomerData>({
    name: "",
    email: "",
    phone: "",
    birthDate: "",
    address: "",
  });
  const [bookingDate, setBookingDate] = useState<string>(""); // YYYY-MM-DD format
  const [serviceBundles, setServiceBundles] = useState<ServiceBundle[]>([]);
  const [selectedDiscount, setSelectedDiscount] = useState<string>("");
  const [selectedPromo, setSelectedPromo] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [customers, setCustomers] = useState<any[]>([]);
  const [rooms, setRooms] = useState<{ id: string; name: string }[]>([]);
  const [searchCustomerQuery, setSearchCustomerQuery] = useState("");
  const [showCustomerSearch, setShowCustomerSearch] = useState(false);
  const [editingBundleId, setEditingBundleId] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Array<{ id: string; message: string; type?: "success" | "error" | "warning" | "info" }>>([]);

  const showToast = (message: string, type: "success" | "error" | "warning" | "info" = "info") => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const { treatments, loading: treatmentsLoading } = useTreatments();
  const { therapists, loading: therapistsLoading } = useAppointmentTherapists(branchId);
  const { branches } = useBranches();

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(1);
      setCustomer({ name: "", email: "", phone: "", birthDate: "", address: "" });
      setBookingDate("");
      setServiceBundles([]);
      setSelectedDiscount("");
      setSelectedPromo("");
      setPaymentMethod("");
      setSearchCustomerQuery("");
      setShowCustomerSearch(false);
      setEditingBundleId(null);
      setSaving(false);
      setToasts([]);
    }
  }, [isOpen]);

  // Fetch customers
  useEffect(() => {
    if (isOpen && searchCustomerQuery.length > 0) {
      fetchCustomers();
    }
  }, [isOpen, searchCustomerQuery]);

  // Fetch rooms
  useEffect(() => {
    if (isOpen) {
      fetchRooms();
    }
  }, [isOpen, branchId]);

  const fetchCustomers = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, email, phone, date_of_birth, address")
        .eq("role", "customer")
        .ilike("full_name", `%${searchCustomerQuery}%`)
        .limit(10);

      if (error) throw error;
      setCustomers(data || []);
    } catch (err) {
      console.error("Error fetching customers:", err);
    }
  };

  const fetchRooms = async () => {
    try {
      // Build query - if branchId exists, filter by it, otherwise get all active available rooms
      let query = supabase
        .from("rooms")
        .select("id, name")
        .eq("is_active", true)
        .eq("status", "available") // Only show available rooms for new appointments
        .order("name", { ascending: true });

      // If branchId is provided, filter by it, otherwise get all rooms (for single branch scenario)
      if (branchId) {
        query = query.eq("branch_id", branchId);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching rooms:", error);
        throw error;
      }
      
      setRooms(data || []);
      
      if (data && data.length === 0) {
        console.warn("No available rooms found", branchId ? `for branch: ${branchId}` : "");
      }
    } catch (err) {
      console.error("Error fetching rooms:", err);
      setRooms([]);
      showToast("Failed to load rooms. Please try again.", "error");
    }
  };

  const handleCustomerSelect = (customerData: any) => {
    setCustomer({
      id: customerData.id,
      name: customerData.full_name || "",
      email: customerData.email || "",
      phone: customerData.phone || "",
      birthDate: customerData.date_of_birth
        ? new Date(customerData.date_of_birth).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          }).replace(/\//g, "-")
        : "",
      address: customerData.address || "",
    });
    setShowCustomerSearch(false);
    setSearchCustomerQuery("");
  };

  const handleAddService = () => {
    const newBundle: ServiceBundle = {
      id: `bundle-${Date.now()}`,
      serviceId: "",
      serviceName: "",
      therapistId: "",
      therapistName: "",
      time: "",
      roomId: "",
      roomName: "",
      addOns: [],
      addOnNames: [],
      price: 0,
      originalPrice: 0,
      isSaved: false,
    };
    setServiceBundles([...serviceBundles, newBundle]);
  };

  const handleSaveBundle = (bundleId: string) => {
    const bundle = serviceBundles.find((b) => b.id === bundleId);
    if (bundle && bundle.serviceId && bundle.therapistId && bundle.time && bundle.roomId) {
      setServiceBundles((prev) =>
        prev.map((b) => (b.id === bundleId ? { ...b, isSaved: true } : b))
      );
      setEditingBundleId(null);
      showToast("Service saved successfully!", "success");
    } else {
      showToast("Please fill in all required fields (Service, Therapist, Time, Room)", "error");
    }
  };

  const handleEditBundle = (bundleId: string) => {
    setEditingBundleId(bundleId);
    setServiceBundles((prev) =>
      prev.map((b) => (b.id === bundleId ? { ...b, isSaved: false } : b))
    );
  };

  const handleUpdateService = (bundleId: string, updates: Partial<ServiceBundle>) => {
    setServiceBundles((prev) =>
      prev.map((bundle) => {
        if (bundle.id === bundleId) {
          const updated = { ...bundle, ...updates };
          
          // Calculate price when service is selected
          if (updates.serviceId) {
            const treatment = treatments.find((t) => t.id === updates.serviceId);
            if (treatment) {
              const price = typeof treatment.price === "number" ? treatment.price : 0;
              updated.price = price;
              updated.originalPrice = price;
              
              // Add add-on prices
              if (updated.addOns.length > 0) {
                const addOnPrice = updated.addOns.reduce((sum, addOnId) => {
                  const addOnTreatment = treatments.find((t) => t.id === addOnId);
                  return sum + (typeof addOnTreatment?.price === "number" ? addOnTreatment.price : 0);
                }, 0);
                updated.price += addOnPrice;
                updated.originalPrice += addOnPrice;
              }
            }
          }
          
          // Update price when add-ons change
          if (updates.addOns !== undefined) {
            const basePrice = typeof bundle.originalPrice === "number" ? bundle.originalPrice : 0;
            const addOnPrice = updates.addOns.reduce((sum, addOnId) => {
              const addOnTreatment = treatments.find((t) => t.id === addOnId);
              return sum + (typeof addOnTreatment?.price === "number" ? addOnTreatment.price : 0);
            }, 0);
            updated.price = basePrice + addOnPrice;
            updated.originalPrice = basePrice + addOnPrice;
          }
          
          return updated;
        }
        return bundle;
      })
    );
  };

  const handleRemoveService = (bundleId: string) => {
    setServiceBundles((prev) => prev.filter((b) => b.id !== bundleId));
  };

  const handleAddAddOn = (bundleId: string, addOnId: string) => {
    const bundle = serviceBundles.find((b) => b.id === bundleId);
    if (bundle && !bundle.addOns.includes(addOnId)) {
      const addOnTreatment = treatments.find((t) => t.id === addOnId);
      handleUpdateService(bundleId, {
        addOns: [...bundle.addOns, addOnId],
        addOnNames: [...bundle.addOnNames, addOnTreatment?.name || ""],
      });
    }
  };

  const handleRemoveAddOn = (bundleId: string, addOnId: string) => {
    const bundle = serviceBundles.find((b) => b.id === bundleId);
    if (bundle) {
      const index = bundle.addOns.indexOf(addOnId);
      if (index > -1) {
        const newAddOns = [...bundle.addOns];
        const newAddOnNames = [...bundle.addOnNames];
        newAddOns.splice(index, 1);
        newAddOnNames.splice(index, 1);
        handleUpdateService(bundleId, {
          addOns: newAddOns,
          addOnNames: newAddOnNames,
        });
      }
    }
  };

  // Calculate totals (only for saved bundles)
  const { subtotal, discountAmount, total } = useMemo(() => {
    const savedBundles = serviceBundles.filter((b) => b.isSaved);
    const sub = savedBundles.reduce((sum, bundle) => sum + bundle.price, 0);
    // TODO: Calculate discount and promo amounts
    const discount = 0;
    const tot = sub - discount;
    return { subtotal: sub, discountAmount: discount, total: tot };
  }, [serviceBundles, selectedDiscount, selectedPromo]);

  const canProceedToStep2 = customer.name && customer.email && customer.phone && bookingDate;
  const canProceedToStep3 = serviceBundles.length > 0 && serviceBundles.every(
    (b) => b.isSaved && b.serviceId && b.therapistId && b.time && b.roomId
  );
  const canCreateAppointment = paymentMethod !== "" && (customer.id || (customer.name && customer.email));

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep((prev) => (prev + 1) as 1 | 2 | 3);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as 1 | 2 | 3);
    }
  };

  const handleSave = async () => {
    // Validate required fields
    if (!canCreateAppointment) {
      showToast("Please fill in all required fields", "error");
      return;
    }

    if (!bookingDate) {
      showToast("Please select a booking date", "error");
      return;
    }

    // Create bookings for each saved service bundle
    const savedBundles = serviceBundles.filter((b) => b.isSaved);
    if (savedBundles.length === 0) {
      showToast("Please save at least one service bundle", "error");
      return;
    }

    try {
      setSaving(true);

      console.log("Creating appointment with:", {
        customer,
        bookingDate,
        savedBundles: savedBundles.length,
        branchId,
      });

      // Create or get customer
      let customerId = customer.id;
      if (!customerId) {
        // Create new customer profile
        // Note: We need a clerk_id for profiles, but for walk-in customers we might need a different approach
        // For now, we'll try to find by email or create without clerk_id
        const { data: existingCustomer, error: findError } = await supabase
          .from("profiles")
          .select("id")
          .eq("email", customer.email)
          .eq("role", "customer")
          .maybeSingle();

        if (findError && findError.code !== "PGRST116") {
          console.error("Error finding customer:", findError);
          throw new Error(`Failed to find customer: ${findError.message}`);
        }

        if (existingCustomer) {
          customerId = existingCustomer.id;
          // Update customer info
          const { error: updateError } = await supabase
            .from("profiles")
            .update({
              full_name: customer.name,
              phone: customer.phone,
              date_of_birth: customer.birthDate
                ? new Date(
                    customer.birthDate.split("-").reverse().join("-")
                  ).toISOString()
                : null,
              address: customer.address || null,
            })
            .eq("id", customerId);

          if (updateError) {
            console.error("Error updating customer:", updateError);
            // Don't throw - customer exists, update is optional
          }
        } else {
          // For now, we'll require an existing customer
          // In a real app, you'd create a customer record differently
          throw new Error("Customer not found. Please select an existing customer.");
        }
      }

      if (!customerId) {
        throw new Error("Customer ID is required");
      }

      console.log("Customer ID:", customerId);

      // Create bookings for each saved service bundle
      const bookingPromises = savedBundles.map(async (bundle, index) => {
        console.log(`Creating booking ${index + 1}/${savedBundles.length}:`, bundle);
        
        const treatment = treatments.find((t) => t.id === bundle.serviceId);
        if (!treatment) {
          throw new Error(`Treatment not found: ${bundle.serviceId}`);
        }

        // Parse booking time
        const [hours, minutes] = bundle.time.split(":");
        const bookingTime = `${hours}:${minutes}:00`;

        // Calculate duration (treatment duration + add-ons duration)
        const addOnDuration = bundle.addOns.reduce((sum, addOnId) => {
          const addOnTreatment = treatments.find((t) => t.id === addOnId);
          return sum + (addOnTreatment?.duration || 0);
        }, 0);
        const duration = treatment.duration + addOnDuration;

        const bookingData = {
          user_id: customerId,
          treatment_id: bundle.serviceId,
          therapist_id: bundle.therapistId,
          branch_id: branchId, // Can be null if only one branch
          room_id: bundle.roomId,
          booking_date: bookingDate,
          booking_time: bookingTime,
          duration: duration,
          total_price: bundle.price,
          status: "pending",
        };

        console.log("Booking data:", bookingData);

        // Create booking
        const { data: booking, error: bookingError } = await supabase
          .from("bookings")
          .insert(bookingData)
          .select()
          .single();

        if (bookingError) {
          console.error("Booking insert error:", bookingError);
          throw new Error(`Failed to create booking: ${bookingError.message || JSON.stringify(bookingError)}`);
        }

        console.log("Booking created:", booking);
        return booking;
      });

      const results = await Promise.all(bookingPromises);
      console.log("All bookings created:", results);

      showToast(`Appointment created successfully! ${results.length} booking(s) created.`, "success");
      
      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
          handleClose();
        }, 1000);
      } else {
        handleClose();
      }
    } catch (err: any) {
      console.error("Error creating appointment:", err);
      const errorMessage = `Failed to create appointment: ${err.message || "Unknown error"}`;
      showToast(errorMessage, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    if (saving) return;
    setCurrentStep(1);
    setCustomer({ name: "", email: "", phone: "", birthDate: "", address: "" });
    setBookingDate("");
    setServiceBundles([]);
    setSelectedDiscount("");
    setSelectedPromo("");
    setPaymentMethod("");
    setSearchCustomerQuery("");
    setShowCustomerSearch(false);
    onClose();
  };

  if (!isOpen) return null;

  const treatmentOptions = treatments
    .filter((t) => t.status === "active")
    .map((t) => ({ value: t.id, label: t.name }));

  const therapistOptions = therapists.map((t) => ({
    value: t.id,
    label: t.name,
  }));

  const roomOptions = rooms.map((r) => ({
    value: r.id,
    label: r.name,
  }));

  // Generate time slots (8:00 to 20:00, every 30 minutes)
  const timeSlots = [];
  for (let hour = 8; hour < 20; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const timeStr = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
      timeSlots.push({ value: timeStr, label: timeStr });
    }
  }

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/20 backdrop-blur-[2px]"
          onClick={handleClose}
        />

        {/* Modal Content */}
        <div className="relative w-full max-w-4xl max-h-[90vh] bg-white dark:bg-[#191919] rounded-lg shadow-xl flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-zinc-200 dark:border-zinc-800 flex-shrink-0">
            <h2 className="text-xl font-bold text-[#191919] dark:text-[#F0EEED]">
              Create Appointment
            </h2>
            <button
              onClick={handleClose}
              disabled={saving}
              className="text-[#706C6B] dark:text-[#C1A7A3] hover:text-[#191919] dark:hover:text-[#F0EEED] transition-colors disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Progress Indicator */}
          <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex-shrink-0">
            <div className="flex items-center w-full max-w-2xl mx-auto">
              {/* Step 1: Customer */}
              <div className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                      currentStep >= 1
                        ? "bg-[#C1A7A3] text-white"
                        : "bg-zinc-200 dark:bg-zinc-700 text-zinc-500 dark:text-zinc-400"
                    }`}
                  >
                    1
                  </div>
                  <span
                    className={`mt-2 text-xs font-medium ${
                      currentStep >= 1
                        ? "text-[#191919] dark:text-[#F0EEED]"
                        : "text-zinc-500 dark:text-zinc-400"
                    }`}
                  >
                    Customer
                  </span>
                </div>
                <div
                  className={`flex-1 h-0.5 mx-2 ${
                    currentStep >= 2
                      ? "bg-[#C1A7A3]"
                      : "bg-zinc-200 dark:bg-zinc-700"
                  }`}
                />
              </div>

              {/* Step 2: Services */}
              <div className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                      currentStep >= 2
                        ? "bg-[#C1A7A3] text-white"
                        : "bg-zinc-200 dark:bg-zinc-700 text-zinc-500 dark:text-zinc-400"
                    }`}
                  >
                    2
                  </div>
                  <span
                    className={`mt-2 text-xs font-medium ${
                      currentStep >= 2
                        ? "text-[#191919] dark:text-[#F0EEED]"
                        : "text-zinc-500 dark:text-zinc-400"
                    }`}
                  >
                    Services
                  </span>
                </div>
                <div
                  className={`flex-1 h-0.5 mx-2 ${
                    currentStep >= 3
                      ? "bg-[#C1A7A3]"
                      : "bg-zinc-200 dark:bg-zinc-700"
                  }`}
                />
              </div>

              {/* Step 3: Payment */}
              <div className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                      currentStep >= 3
                        ? "bg-[#C1A7A3] text-white"
                        : "bg-zinc-200 dark:bg-zinc-700 text-zinc-500 dark:text-zinc-400"
                    }`}
                  >
                    3
                  </div>
                  <span
                    className={`mt-2 text-xs font-medium ${
                      currentStep >= 3
                        ? "text-[#191919] dark:text-[#F0EEED]"
                        : "text-zinc-500 dark:text-zinc-400"
                    }`}
                  >
                    Payment
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Step Content - Scrollable */}
          <div className="flex-1 overflow-y-auto p-6">
          {currentStep === 1 && (
            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-[#191919] dark:text-[#F0EEED] mb-4">
                Customer Information
              </h3>
              
              <div className="relative">
                <Input
                  label="Customer Name"
                  placeholder="Jane Doe"
                  value={customer.name}
                  onChange={(e) => {
                    setCustomer({ ...customer, name: e.target.value });
                    setSearchCustomerQuery(e.target.value);
                    setShowCustomerSearch(e.target.value.length > 0);
                  }}
                />
                {showCustomerSearch && customers.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white dark:bg-[#191919] border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {customers.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => handleCustomerSelect(c)}
                        className="w-full px-4 py-2 text-left hover:bg-[#F0EEED] dark:hover:bg-[#3D3B3A] text-[#191919] dark:text-[#F0EEED]"
                      >
                        <div className="font-medium">{c.full_name}</div>
                        {c.email && (
                          <div className="text-sm text-[#706C6B] dark:text-[#C1A7A3]">
                            {c.email}
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <Input
                label="Email"
                type="email"
                placeholder="example@gmail.com"
                value={customer.email}
                onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
              />

              <Input
                label="Phone"
                placeholder="+62 81xxxxxxxxxx"
                value={customer.phone}
                onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
              />

              <div className="relative">
                <Input
                  label="Birth Date"
                  type="date"
                  placeholder="DD-MM-YYYY"
                  value={
                    customer.birthDate
                      ? (() => {
                          try {
                            const [day, month, year] = customer.birthDate.split("-");
                            return `${year}-${month}-${day}`;
                          } catch {
                            return "";
                          }
                        })()
                      : ""
                  }
                  onChange={(e) => {
                    const date = e.target.value;
                    if (date) {
                      const [year, month, day] = date.split("-");
                      setCustomer({ ...customer, birthDate: `${day}-${month}-${year}` });
                    } else {
                      setCustomer({ ...customer, birthDate: "" });
                    }
                  }}
                />
                <Calendar className="absolute right-4 top-9 w-5 h-5 text-[#706C6B] dark:text-[#C1A7A3] pointer-events-none" />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Address
                </label>
                <textarea
                  value={customer.address || ""}
                  onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
                  placeholder="Enter customer address"
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-lg border bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 border-zinc-300 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:border-transparent transition-all duration-200"
                />
              </div>

              <div className="relative">
                <Input
                  label="Booking Date"
                  type="date"
                  placeholder="Select Date"
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  required
                />
                <Calendar className="absolute right-4 top-9 w-5 h-5 text-[#706C6B] dark:text-[#C1A7A3] pointer-events-none" />
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-[#191919] dark:text-[#F0EEED] mb-4">
                Service Information
              </h3>

              {serviceBundles.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <button
                    onClick={handleAddService}
                    className="flex items-center gap-2 px-4 py-2 rounded-full border-2 border-dashed border-[#C1A7A3] text-[#C1A7A3] hover:bg-[#C1A7A3] hover:text-white transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                    <span>ADD SERVICE</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-8">
                  {serviceBundles.map((bundle) => {
                    const isComplete = bundle.serviceId && bundle.therapistId && bundle.time && bundle.roomId;
                    const isEditing = editingBundleId === bundle.id;
                    // Show form if: not complete OR not saved OR currently editing
                    // Show summary if: complete AND saved AND not currently editing
                    const showForm = !isComplete || !bundle.isSaved || isEditing;

                    return (
                      <div
                        key={bundle.id}
                        className="p-6 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-[#191919]"
                      >
                        {!showForm && isComplete && bundle.isSaved ? (
                          <div className="space-y-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="font-semibold text-lg text-[#191919] dark:text-[#F0EEED] mb-3">
                                  {bundle.serviceName}
                                </div>
                                <div className="text-sm text-[#706C6B] dark:text-[#C1A7A3] space-y-1">
                                  <div>
                                    Therapist <span className="text-[#191919] dark:text-[#F0EEED] font-medium">{bundle.therapistName}</span> At <span className="text-[#191919] dark:text-[#F0EEED] font-medium">{bundle.time}</span>
                                  </div>
                                  <div>
                                    Room <span className="text-[#191919] dark:text-[#F0EEED] font-semibold">{bundle.roomName}</span>
                                  </div>
                                  {bundle.addOnNames.length > 0 && (
                                    <div>
                                      Add on <span className="text-[#191919] dark:text-[#F0EEED] font-medium">{bundle.addOnNames.join(", ")}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="ml-4 flex flex-col items-end gap-2">
                                <div className="text-right">
                                  <div className="text-lg font-semibold text-[#191919] dark:text-[#F0EEED]">
                                    Rp {bundle.price.toLocaleString("id-ID")}
                                  </div>
                                  {bundle.originalPrice > bundle.price && (
                                    <div className="text-sm text-[#706C6B] dark:text-[#C1A7A3] line-through">
                                      Rp {bundle.originalPrice.toLocaleString("id-ID")}
                                    </div>
                                  )}
                                </div>
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => handleEditBundle(bundle.id)}
                                    className="px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg text-sm font-medium text-[#191919] dark:text-[#F0EEED] hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => handleRemoveService(bundle.id)}
                                    className="p-2 rounded-full border-2 border-dashed border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-colors"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : (
                        <div className="space-y-6">
                          {/* Service */}
                          <div>
                            <label className="block text-sm font-medium text-[#191919] dark:text-[#F0EEED] mb-2">
                              Service
                            </label>
                            <Dropdown
                              options={treatmentOptions}
                              value={bundle.serviceId}
                              onChange={(value) => {
                                const treatment = treatments.find((t) => t.id === value);
                                handleUpdateService(bundle.id, {
                                  serviceId: value,
                                  serviceName: treatment?.name || "",
                                });
                              }}
                              placeholder="Select Service"
                            />
                          </div>

                          {/* Therapist, At, Room in grid */}
                          <div className="grid grid-cols-3 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-[#191919] dark:text-[#F0EEED] mb-2">
                                Therapist
                              </label>
                              <Dropdown
                                options={therapistOptions}
                                value={bundle.therapistId}
                                onChange={(value) => {
                                  const therapist = therapists.find((t) => t.id === value);
                                  handleUpdateService(bundle.id, {
                                    therapistId: value,
                                    therapistName: therapist?.name || "",
                                  });
                                }}
                                placeholder="Select Therapist"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-[#191919] dark:text-[#F0EEED] mb-2">
                                At
                              </label>
                              <Dropdown
                                options={timeSlots}
                                value={bundle.time}
                                onChange={(value) => handleUpdateService(bundle.id, { time: value })}
                                placeholder="Select Time"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-[#191919] dark:text-[#F0EEED] mb-2">
                                Room
                              </label>
                              <Dropdown
                                options={roomOptions}
                                value={bundle.roomId}
                                onChange={(value) => {
                                  const room = rooms.find((r) => r.id === value);
                                  handleUpdateService(bundle.id, {
                                    roomId: value,
                                    roomName: room?.name || "",
                                  });
                                }}
                                placeholder="Select Room"
                              />
                            </div>
                          </div>

                          {/* Add On */}
                          <div>
                            <label className="block text-sm font-medium text-[#191919] dark:text-[#F0EEED] mb-2">
                              Add On
                            </label>
                            <div className="flex flex-wrap items-center gap-2 p-3 bg-white dark:bg-[#191919] border border-zinc-200 dark:border-zinc-800 rounded-lg min-h-[48px]">
                              {bundle.addOnNames.map((name, idx) => (
                                <span
                                  key={idx}
                                  className="px-3 py-1.5 bg-[#F0EEED] dark:bg-[#3D3B3A] text-[#191919] dark:text-[#F0EEED] rounded-full text-sm flex items-center gap-2"
                                >
                                  {name}
                                  <button
                                    onClick={() => handleRemoveAddOn(bundle.id, bundle.addOns[idx])}
                                    className="text-[#706C6B] dark:text-[#C1A7A3] hover:text-red-500 transition-colors"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </span>
                              ))}
                              {treatmentOptions.filter(
                                (opt) => !bundle.addOns.includes(opt.value) && opt.value !== bundle.serviceId
                              ).length > 0 && (
                                <Dropdown
                                  options={treatmentOptions.filter(
                                    (opt) => !bundle.addOns.includes(opt.value) && opt.value !== bundle.serviceId
                                  )}
                                  value=""
                                  onChange={(value) => handleAddAddOn(bundle.id, value)}
                                  placeholder="+ Add Add-on"
                                  className="min-w-[150px]"
                                />
                              )}
                            </div>
                          </div>

                          {/* Save Button */}
                          <div className="flex justify-end pt-4 border-t border-zinc-200 dark:border-zinc-800 mt-6">
                            <button
                              onClick={() => handleSaveBundle(bundle.id)}
                              disabled={!isComplete}
                              className="px-6 py-2 bg-[#C1A7A3] text-white rounded-lg hover:bg-[#A88F8B] transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                            >
                              Save
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                  })}

                  <div className="flex justify-center">
                    <button
                      onClick={handleAddService}
                      className="flex items-center gap-2 px-4 py-2 rounded-full border-2 border-dashed border-[#C1A7A3] text-[#C1A7A3] hover:bg-[#C1A7A3] hover:text-white transition-colors"
                    >
                      <Plus className="w-5 h-5" />
                      <span>ADD SERVICE</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-[#191919] dark:text-[#F0EEED] mb-4">
                Payment & Summary
              </h3>

              <div className="space-y-2">
                {serviceBundles.map((bundle) => (
                  <div key={bundle.id} className="text-[#191919] dark:text-[#F0EEED]">
                    <div className="font-medium">{bundle.serviceName}</div>
                    {bundle.addOnNames.map((name, idx) => (
                      <div key={idx} className="text-sm text-[#706C6B] dark:text-[#C1A7A3]">
                        + {name}
                      </div>
                    ))}
                    <div className="text-right">Rp {bundle.price.toLocaleString("id-ID")}</div>
                  </div>
                ))}
                {discountAmount > 0 && (
                  <div className="flex justify-between text-[#191919] dark:text-[#F0EEED]">
                    <span>Discount</span>
                    <span>- Rp {discountAmount.toLocaleString("id-ID")}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-semibold text-[#191919] dark:text-[#F0EEED] pt-2 border-t border-zinc-200 dark:border-zinc-800">
                  <span>Order Total</span>
                  <span>Rp {total.toLocaleString("id-ID")}</span>
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-[#191919] dark:text-[#F0EEED] mb-2">
                  Payment Method
                </label>
                <Dropdown
                  options={[
                    { value: "cash", label: "Cash" },
                    { value: "card", label: "Card" },
                    { value: "transfer", label: "Bank Transfer" },
                  ]}
                  value={paymentMethod}
                  onChange={setPaymentMethod}
                  placeholder="Select Payment Method"
                />
              </div>
            </div>
          )}
          </div>

          {/* Step Navigation Buttons */}
          <div className="flex items-center justify-between p-6 border-t border-zinc-200 dark:border-zinc-800 flex-shrink-0">
            <div className="flex items-center gap-3">
              {currentStep > 1 && (
                <button
                  onClick={handleBack}
                  disabled={saving}
                  className="px-6 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg text-sm font-medium text-[#191919] dark:text-[#F0EEED] hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50"
                >
                  Back
                </button>
              )}
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleClose}
                disabled={saving}
                className="px-6 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg text-sm font-medium text-[#191919] dark:text-[#F0EEED] hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              {currentStep < 3 ? (
                <button
                  onClick={handleNext}
                  disabled={
                    saving ||
                    (currentStep === 1 && !canProceedToStep2) ||
                    (currentStep === 2 && !canProceedToStep3)
                  }
                  className="px-6 py-2 bg-[#C1A7A3] text-white rounded-lg hover:bg-[#A88F8B] transition-colors disabled:opacity-50 text-sm font-medium"
                >
                  Save & Continue
                </button>
              ) : (
                <button
                  onClick={handleSave}
                  disabled={!canCreateAppointment || saving}
                  className="px-6 py-2 bg-[#C1A7A3] text-white rounded-lg hover:bg-[#A88F8B] transition-colors disabled:opacity-50 text-sm font-medium"
                >
                  {saving ? "Creating..." : "Create Appointment"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </>
  );
};

