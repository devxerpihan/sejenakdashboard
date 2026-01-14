"use client";

import React, { useState, useEffect } from "react";
import { SejenakDashboardLayout } from "@/components/layout/SejenakDashboardLayout";
import { Footer } from "@/components/layout";
import { Breadcrumbs } from "@/components/services";
import { navItems } from "@/config/navigation";
import { ToastContainer } from "@/components/ui/Toast";
import { Dropdown } from "@/components/ui/Dropdown";
import { supabase } from "@/lib/supabase";
import { User, Search, Loader2, Mail, Smartphone, Eye, EyeOff, Save, Clock, Tag, Megaphone } from "lucide-react";

export default function NotificationSettingsPage() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("darkMode");
      return saved === "true";
    }
    return false;
  });

  const [location, setLocation] = useState("Islamic Village");
  const locations = ["Islamic Village", "Location 2", "Location 3"];

  // Push Notification State
  const [pushTitle, setPushTitle] = useState("");
  const [pushMessage, setPushMessage] = useState("");
  const [pushTargetType, setPushTargetType] = useState<"all" | "role" | "tier" | "user">("all");
  const [pushSelectedRole, setPushSelectedRole] = useState("customer");
  const [pushSelectedTier, setPushSelectedTier] = useState("Grace");
  const [pushSelectedUser, setPushSelectedUser] = useState<{ id: string; name: string; email: string } | null>(null);
  const [pushUserSearchQuery, setPushUserSearchQuery] = useState("");
  const [pushSearchResults, setPushSearchResults] = useState<any[]>([]);
  const [isPushSearching, setIsPushSearching] = useState(false);
  const [isPushSending, setIsPushSending] = useState(false);
  
  // Broadcast Type State
  const [broadcastType, setBroadcastType] = useState<"promo" | "treatment_update" | "booking_reminder">("promo");

  // Email Broadcast State
  const [emailApiKey, setEmailApiKey] = useState("");
  const [senderEmail, setSenderEmail] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [isSavingKey, setIsSavingKey] = useState(false);
  const [isSavingEmail, setIsSavingEmail] = useState(false);
  const [emailSubject, setEmailSubject] = useState("");
  const [emailContent, setEmailContent] = useState("");
  const [emailTargetType, setEmailTargetType] = useState<"all" | "role" | "tier" | "user">("all");
  const [emailSelectedRole, setEmailSelectedRole] = useState("customer");
  const [emailSelectedTier, setEmailSelectedTier] = useState("Grace");
  const [emailSelectedUser, setEmailSelectedUser] = useState<{ id: string; name: string; email: string } | null>(null);
  const [emailUserSearchQuery, setEmailUserSearchQuery] = useState("");
  const [emailSearchResults, setEmailSearchResults] = useState<any[]>([]);
  const [isEmailSearching, setIsEmailSearching] = useState(false);
  const [isEmailSending, setIsEmailSending] = useState(false);

  // Toast State
  const [toasts, setToasts] = useState<Array<{ id: string; message: string; type: "success" | "error" | "warning" | "info" }>>([]);

  const showToast = (message: string, type: "success" | "error" | "warning" | "info") => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("darkMode", "true");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("darkMode", "false");
    }
  }, [isDarkMode]);

  // Load Settings from database on mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        // Fetch API Key
        const apiKeyResponse = await fetch("/api/settings/update?key=sendgrid_api_key");
        if (apiKeyResponse.ok) {
          const data = await apiKeyResponse.json();
          if (data.value) {
            const val = typeof data.value === 'string' ? data.value : JSON.stringify(data.value);
            setEmailApiKey(val.replace(/^"|"$/g, '')); 
          }
        }

        // Fetch Sender Email
        const senderEmailResponse = await fetch("/api/settings/update?key=sendgrid_sender_email");
        if (senderEmailResponse.ok) {
          const data = await senderEmailResponse.json();
          if (data.value) {
            const val = typeof data.value === 'string' ? data.value : JSON.stringify(data.value);
            setSenderEmail(val.replace(/^"|"$/g, ''));
          }
        }
      } catch (err) {
        console.error("Failed to load settings", err);
      }
    };
    fetchSettings();
  }, []);

  const handleSaveApiKey = async () => {
    if (!emailApiKey.trim()) {
      showToast("Please enter an API Key", "error");
      return;
    }

    setIsSavingKey(true);
    try {
      const response = await fetch("/api/settings/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: "sendgrid_api_key",
          value: emailApiKey
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to save API key");
      }

      showToast("API Key saved successfully", "success");
    } catch (err: any) {
      console.error("Error saving API key:", err);
      showToast(err.message, "error");
    } finally {
      setIsSavingKey(false);
    }
  };

  const handleSaveSenderEmail = async () => {
    if (!senderEmail.trim()) {
      showToast("Please enter a sender email", "error");
      return;
    }

    setIsSavingEmail(true);
    try {
      const response = await fetch("/api/settings/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: "sendgrid_sender_email",
          value: senderEmail
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to save sender email");
      }

      showToast("Sender email saved successfully", "success");
    } catch (err: any) {
      console.error("Error saving sender email:", err);
      showToast(err.message, "error");
    } finally {
      setIsSavingEmail(false);
    }
  };

  // Search users debounce (Push)
  useEffect(() => {
    const searchUsers = async () => {
      if (pushUserSearchQuery.length < 2) {
        setPushSearchResults([]);
        return;
      }

      setIsPushSearching(true);
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("id, full_name, email, role")
          .or(`full_name.ilike.%${pushUserSearchQuery}%,email.ilike.%${pushUserSearchQuery}%`)
          .limit(5);

        if (error) throw error;
        setPushSearchResults(data || []);
      } catch (err) {
        console.error("Error searching users:", err);
      } finally {
        setIsPushSearching(false);
      }
    };

    const timer = setTimeout(searchUsers, 500);
    return () => clearTimeout(timer);
  }, [pushUserSearchQuery]);

  // Search users debounce (Email)
  useEffect(() => {
    const searchUsers = async () => {
      if (emailUserSearchQuery.length < 2) {
        setEmailSearchResults([]);
        return;
      }

      setIsEmailSearching(true);
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("id, full_name, email, role")
          .or(`full_name.ilike.%${emailUserSearchQuery}%,email.ilike.%${emailUserSearchQuery}%`)
          .limit(5);

        if (error) throw error;
        setEmailSearchResults(data || []);
      } catch (err) {
        console.error("Error searching users:", err);
      } finally {
        setIsEmailSearching(false);
      }
    };

    const timer = setTimeout(searchUsers, 500);
    return () => clearTimeout(timer);
  }, [emailUserSearchQuery]);

  const handleSendPush = async () => {
    if (!pushTitle.trim() || !pushMessage.trim()) {
      showToast("Please enter a title and message", "error");
      return;
    }

    if (pushTargetType === "user" && !pushSelectedUser) {
      showToast("Please select a user", "error");
      return;
    }

    let targetValue = null;
    if (pushTargetType === "role") targetValue = pushSelectedRole;
    if (pushTargetType === "tier") targetValue = pushSelectedTier;
    if (pushTargetType === "user") targetValue = pushSelectedUser?.id;

    setIsPushSending(true);
    try {
      const response = await fetch("/api/notifications/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: pushTitle,
          message: pushMessage,
          targetType: pushTargetType,
          targetValue,
          type: broadcastType,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send notification");
      }

      showToast(`Successfully sent to ${data.count} recipients`, "success");
      // Reset form
      setPushTitle("");
      setPushMessage("");
      setPushTargetType("all");
      setPushSelectedUser(null);
      setPushUserSearchQuery("");
    } catch (err: any) {
      console.error("Error sending push notification:", err);
      showToast(err.message || "Failed to send notification", "error");
    } finally {
      setIsPushSending(false);
    }
  };

  const handleSendEmail = async () => {
    if (!emailSubject.trim() || !emailContent.trim()) {
      showToast("Please enter a subject and content", "error");
      return;
    }

    if (emailTargetType === "user" && !emailSelectedUser) {
      showToast("Please select a user", "error");
      return;
    }

    let targetValue = null;
    if (emailTargetType === "role") targetValue = emailSelectedRole;
    if (emailTargetType === "tier") targetValue = emailSelectedTier;
    if (emailTargetType === "user") targetValue = emailSelectedUser?.id;

    setIsEmailSending(true);
    try {
      const response = await fetch("/api/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          apiKey: emailApiKey, 
          senderEmail: senderEmail,
          subject: emailSubject,
          content: emailContent,
          targetType: emailTargetType,
          targetValue,
          type: broadcastType,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send email");
      }

      showToast(`Successfully sent emails to ${data.count} recipients`, "success");
      // Reset form
      setEmailSubject("");
      setEmailContent("");
      setEmailTargetType("all");
      setEmailSelectedUser(null);
      setEmailUserSearchQuery("");
    } catch (err: any) {
      console.error("Error sending email:", err);
      showToast(err.message || "Failed to send email", "error");
    } finally {
      setIsEmailSending(false);
    }
  };

  const targetOptions = [
    { value: "all", label: "All Users" },
    { value: "role", label: "By Role" },
    { value: "tier", label: "By Member Tier" },
    { value: "user", label: "Specific User" },
  ];

  const roleOptions = [
    { value: "customer", label: "Customer" },
    { value: "therapist", label: "Therapist" },
    { value: "receptionist", label: "Receptionist" },
    { value: "cook_helper", label: "Cook Helper" },
    { value: "super_admin", label: "Super Admin" },
  ];

  const tierOptions = [
    { value: "Grace", label: "Grace" },
    { value: "Signature", label: "Signature" },
    { value: "Elite", label: "Elite" },
  ];

  const broadcastTypeOptions = [
    { value: "promo", label: "Promo & Offers" },
    { value: "treatment_update", label: "Treatment Updates" },
    { value: "booking_reminder", label: "Booking Reminder Configuration" },
  ];

  return (
    <SejenakDashboardLayout
      navItems={navItems}
      headerTitle=""
      location={location}
      locations={locations}
      onLocationChange={setLocation}
      dateRange={{ start: new Date(), end: new Date() }}
      onDateRangeChange={() => {}}
      isDarkMode={isDarkMode}
      onDarkModeToggle={() => setIsDarkMode((prev) => !prev)}
      customHeader={null}
      footer={<Footer />}
    >
      <div className="min-h-screen pb-20">
        <Breadcrumbs items={[{ label: "Settings", href: "/settings" }, { label: "Notifications" }]} />

        <div className="mb-6">
          <h1 className="text-3xl font-bold text-[#191919] dark:text-[#F0EEED]">Broadcast Center</h1>
          <p className="text-sm text-[#706C6B] dark:text-[#C1A7A3] mt-2">
            Manage your communication channels and broadcast messages to users.
          </p>
        </div>

        {/* Global Broadcast Type Selector */}
        <div className="mb-6 bg-white dark:bg-[#2A2A2A] rounded-lg border border-[#E5E7EB] dark:border-[#404040] p-6">
            <h2 className="text-lg font-semibold text-[#191919] dark:text-[#F0EEED] mb-4">Broadcast Type</h2>
            <div className="flex gap-4">
                <button
                    onClick={() => setBroadcastType("promo")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                        broadcastType === "promo"
                            ? "bg-[#C1A7A3] text-white border-[#C1A7A3]"
                            : "bg-transparent text-[#706C6B] dark:text-[#C1A7A3] border-[#E5E7EB] dark:border-[#404040] hover:bg-gray-50 dark:hover:bg-[#333333]"
                    }`}
                >
                    <Megaphone className="w-4 h-4" />
                    Promo
                </button>
                <button
                    onClick={() => setBroadcastType("treatment_update")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                        broadcastType === "treatment_update"
                            ? "bg-[#C1A7A3] text-white border-[#C1A7A3]"
                            : "bg-transparent text-[#706C6B] dark:text-[#C1A7A3] border-[#E5E7EB] dark:border-[#404040] hover:bg-gray-50 dark:hover:bg-[#333333]"
                    }`}
                >
                    <Tag className="w-4 h-4" />
                    Treatment Update
                </button>
                <button
                    onClick={() => setBroadcastType("booking_reminder")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                        broadcastType === "booking_reminder"
                            ? "bg-[#C1A7A3] text-white border-[#C1A7A3]"
                            : "bg-transparent text-[#706C6B] dark:text-[#C1A7A3] border-[#E5E7EB] dark:border-[#404040] hover:bg-gray-50 dark:hover:bg-[#333333]"
                    }`}
                >
                    <Clock className="w-4 h-4" />
                    Booking Reminders
                </button>
            </div>
            
            {broadcastType === "booking_reminder" && (
                <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-900/50">
                    <p className="text-sm text-blue-700 dark:text-blue-300 flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Booking reminders are automated messages triggered by appointment times. 
                        Configuring these will update the templates used for system-generated reminders.
                    </p>
                </div>
            )}
        </div>

        <div className="space-y-8">
          {/* Push Notification Section */}
          <div className="bg-white dark:bg-[#2A2A2A] rounded-lg border border-[#E5E7EB] dark:border-[#404040] p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-[#F3F4F6] dark:bg-[#333333] rounded-lg">
                <Smartphone className="w-6 h-6 text-[#191919] dark:text-[#F0EEED]" />
              </div>
              <h2 className="text-xl font-semibold text-[#191919] dark:text-[#F0EEED]">Push Notification</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-6">
                {/* Target Audience */}
                <div>
                  <label className="block text-sm font-medium text-[#191919] dark:text-[#F0EEED] mb-2">Target Audience</label>
                  <Dropdown
                    options={targetOptions}
                    value={pushTargetType}
                    onChange={(value) => setPushTargetType(value as any)}
                    className="w-full"
                  />
                </div>

                {/* Role/Tier/User Selection for Push */}
                {pushTargetType === "role" && (
                  <div>
                    <label className="block text-sm font-medium text-[#191919] dark:text-[#F0EEED] mb-2">Select Role</label>
                    <Dropdown
                      options={roleOptions}
                      value={pushSelectedRole}
                      onChange={setPushSelectedRole}
                      className="w-full"
                    />
                  </div>
                )}
                {pushTargetType === "tier" && (
                  <div>
                    <label className="block text-sm font-medium text-[#191919] dark:text-[#F0EEED] mb-2">Select Tier</label>
                    <Dropdown
                      options={tierOptions}
                      value={pushSelectedTier}
                      onChange={setPushSelectedTier}
                      className="w-full"
                    />
                  </div>
                )}
                {pushTargetType === "user" && (
                  <div className="relative">
                    <label className="block text-sm font-medium text-[#191919] dark:text-[#F0EEED] mb-2">Search User</label>
                    {pushSelectedUser ? (
                      <div className="flex items-center justify-between p-3 border border-[#E5E7EB] dark:border-[#404040] rounded-lg bg-gray-50 dark:bg-[#333333]">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#E5E7EB] dark:bg-[#404040] flex items-center justify-center">
                            <User className="w-4 h-4 text-[#706C6B] dark:text-[#C1A7A3]" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-[#191919] dark:text-[#F0EEED]">{pushSelectedUser.name || "Unnamed"}</p>
                            <p className="text-xs text-[#706C6B] dark:text-[#C1A7A3]">{pushSelectedUser.email}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setPushSelectedUser(null);
                            setPushUserSearchQuery("");
                          }}
                          className="text-xs text-red-500 hover:text-red-600"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Search className="h-4 w-4 text-[#C1A7A3]" />
                        </div>
                        <input
                          type="text"
                          placeholder="Search by name or email..."
                          value={pushUserSearchQuery}
                          onChange={(e) => setPushUserSearchQuery(e.target.value)}
                          className="w-full pl-10 px-4 py-2 rounded-lg border border-[#E5E7EB] dark:border-[#404040] bg-white dark:bg-[#1F1F1F] text-[#191919] dark:text-[#F0EEED] focus:outline-none focus:ring-2 focus:ring-[#C1A7A3]"
                        />
                        {isPushSearching && (
                          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                            <Loader2 className="h-4 w-4 text-[#C1A7A3] animate-spin" />
                          </div>
                        )}
                        {/* Search Results Dropdown */}
                        {!pushSelectedUser && pushSearchResults.length > 0 && (
                          <div className="absolute z-10 w-full mt-1 bg-white dark:bg-[#2A2A2A] border border-[#E5E7EB] dark:border-[#404040] rounded-lg shadow-lg max-h-60 overflow-y-auto">
                            {pushSearchResults.map((user) => (
                              <button
                                key={user.id}
                                onClick={() => {
                                  setPushSelectedUser({ id: user.id, name: user.full_name, email: user.email });
                                  setPushSearchResults([]);
                                }}
                                className="w-full text-left px-4 py-3 hover:bg-[#F9FAFB] dark:hover:bg-[#333333] transition-colors border-b border-[#E5E7EB] dark:border-[#404040] last:border-0"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-[#E5E7EB] dark:bg-[#404040] flex items-center justify-center">
                                    <User className="w-4 h-4 text-[#706C6B] dark:text-[#C1A7A3]" />
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-[#191919] dark:text-[#F0EEED]">{user.full_name || "Unnamed"}</p>
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs text-[#706C6B] dark:text-[#C1A7A3]">{user.email}</span>
                                      <span className="px-1.5 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-[10px] text-gray-600 dark:text-gray-400 capitalize">
                                        {user.role}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-[#191919] dark:text-[#F0EEED] mb-2">Notification Title</label>
                  <input
                    type="text"
                    value={pushTitle}
                    onChange={(e) => setPushTitle(e.target.value)}
                    placeholder="e.g., Special Weekend Offer!"
                    className="w-full px-4 py-2 rounded-lg border border-[#E5E7EB] dark:border-[#404040] bg-white dark:bg-[#1F1F1F] text-[#191919] dark:text-[#F0EEED] focus:outline-none focus:ring-2 focus:ring-[#C1A7A3]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#191919] dark:text-[#F0EEED] mb-2">Message Content</label>
                  <textarea
                    value={pushMessage}
                    onChange={(e) => setPushMessage(e.target.value)}
                    rows={4}
                    placeholder="Type your notification message here..."
                    className="w-full px-4 py-2 rounded-lg border border-[#E5E7EB] dark:border-[#404040] bg-white dark:bg-[#1F1F1F] text-[#191919] dark:text-[#F0EEED] focus:outline-none focus:ring-2 focus:ring-[#C1A7A3] resize-none"
                  />
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    onClick={handleSendPush}
                    disabled={isPushSending || !pushTitle || !pushMessage}
                    className="px-6 py-2 bg-[#C1A7A3] text-white rounded-lg hover:bg-[#A88F8B] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium"
                  >
                    {isPushSending ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        {broadcastType === "booking_reminder" ? "Update Template" : "Send Notification"}
                      </>
                    ) : (
                      broadcastType === "booking_reminder" ? "Update Template" : "Send Notification"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Email Broadcast Section */}
          <div className="bg-white dark:bg-[#2A2A2A] rounded-lg border border-[#E5E7EB] dark:border-[#404040] p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#F3F4F6] dark:bg-[#333333] rounded-lg">
                  <Mail className="w-6 h-6 text-[#191919] dark:text-[#F0EEED]" />
                </div>
                <h2 className="text-xl font-semibold text-[#191919] dark:text-[#F0EEED]">Email Broadcast</h2>
              </div>
              
              <div className="flex flex-col gap-2 items-end">
                {/* API Key Input */}
                <div className="relative group flex items-center gap-2">
                  <div className="relative">
                    <input
                      type={showApiKey ? "text" : "password"}
                      value={emailApiKey}
                      onChange={(e) => setEmailApiKey(e.target.value)}
                      placeholder="SendGrid API Key"
                      className="w-64 pl-4 pr-10 py-2 text-sm rounded-lg border border-[#E5E7EB] dark:border-[#404040] bg-white dark:bg-[#1F1F1F] text-[#191919] dark:text-[#F0EEED] focus:outline-none focus:ring-2 focus:ring-[#C1A7A3]"
                    />
                    <button
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-[#706C6B] dark:text-[#C1A7A3] hover:text-[#191919] dark:hover:text-[#F0EEED]"
                    >
                      {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <button
                    onClick={handleSaveApiKey}
                    disabled={isSavingKey}
                    className="p-2 text-[#C1A7A3] hover:text-[#A8928E] transition-colors"
                    title="Save API Key"
                  >
                    {isSavingKey ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-5 h-5" />}
                  </button>
                </div>

                {/* Sender Email Input */}
                <div className="relative group flex items-center gap-2">
                  <input
                    type="email"
                    value={senderEmail}
                    onChange={(e) => setSenderEmail(e.target.value)}
                    placeholder="Sender Email (e.g. noreply@sejenak.com)"
                    className="w-64 px-4 py-2 text-sm rounded-lg border border-[#E5E7EB] dark:border-[#404040] bg-white dark:bg-[#1F1F1F] text-[#191919] dark:text-[#F0EEED] focus:outline-none focus:ring-2 focus:ring-[#C1A7A3]"
                  />
                  <button
                    onClick={handleSaveSenderEmail}
                    disabled={isSavingEmail}
                    className="p-2 text-[#C1A7A3] hover:text-[#A8928E] transition-colors"
                    title="Save Sender Email"
                  >
                    {isSavingEmail ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-6">
                {/* Target Audience */}
                <div>
                  <label className="block text-sm font-medium text-[#191919] dark:text-[#F0EEED] mb-2">Target Audience</label>
                  <Dropdown
                    options={targetOptions}
                    value={emailTargetType}
                    onChange={(value) => setEmailTargetType(value as any)}
                    className="w-full"
                  />
                </div>

                {/* Role/Tier/User Selection for Email */}
                {emailTargetType === "role" && (
                  <div>
                    <label className="block text-sm font-medium text-[#191919] dark:text-[#F0EEED] mb-2">Select Role</label>
                    <Dropdown
                      options={roleOptions}
                      value={emailSelectedRole}
                      onChange={setEmailSelectedRole}
                      className="w-full"
                    />
                  </div>
                )}
                {emailTargetType === "tier" && (
                  <div>
                    <label className="block text-sm font-medium text-[#191919] dark:text-[#F0EEED] mb-2">Select Tier</label>
                    <Dropdown
                      options={tierOptions}
                      value={emailSelectedTier}
                      onChange={setEmailSelectedTier}
                      className="w-full"
                    />
                  </div>
                )}
                {emailTargetType === "user" && (
                  <div className="relative">
                    <label className="block text-sm font-medium text-[#191919] dark:text-[#F0EEED] mb-2">Search User</label>
                    {emailSelectedUser ? (
                      <div className="flex items-center justify-between p-3 border border-[#E5E7EB] dark:border-[#404040] rounded-lg bg-gray-50 dark:bg-[#333333]">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#E5E7EB] dark:bg-[#404040] flex items-center justify-center">
                            <User className="w-4 h-4 text-[#706C6B] dark:text-[#C1A7A3]" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-[#191919] dark:text-[#F0EEED]">{emailSelectedUser.name || "Unnamed"}</p>
                            <p className="text-xs text-[#706C6B] dark:text-[#C1A7A3]">{emailSelectedUser.email}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setEmailSelectedUser(null);
                            setEmailUserSearchQuery("");
                          }}
                          className="text-xs text-red-500 hover:text-red-600"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Search className="h-4 w-4 text-[#C1A7A3]" />
                        </div>
                        <input
                          type="text"
                          placeholder="Search by name or email..."
                          value={emailUserSearchQuery}
                          onChange={(e) => setEmailUserSearchQuery(e.target.value)}
                          className="w-full pl-10 px-4 py-2 rounded-lg border border-[#E5E7EB] dark:border-[#404040] bg-white dark:bg-[#1F1F1F] text-[#191919] dark:text-[#F0EEED] focus:outline-none focus:ring-2 focus:ring-[#C1A7A3]"
                        />
                        {isEmailSearching && (
                          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                            <Loader2 className="h-4 w-4 text-[#C1A7A3] animate-spin" />
                          </div>
                        )}
                        {/* Search Results Dropdown */}
                        {!emailSelectedUser && emailSearchResults.length > 0 && (
                          <div className="absolute z-10 w-full mt-1 bg-white dark:bg-[#2A2A2A] border border-[#E5E7EB] dark:border-[#404040] rounded-lg shadow-lg max-h-60 overflow-y-auto">
                            {emailSearchResults.map((user) => (
                              <button
                                key={user.id}
                                onClick={() => {
                                  setEmailSelectedUser({ id: user.id, name: user.full_name, email: user.email });
                                  setEmailSearchResults([]);
                                }}
                                className="w-full text-left px-4 py-3 hover:bg-[#F9FAFB] dark:hover:bg-[#333333] transition-colors border-b border-[#E5E7EB] dark:border-[#404040] last:border-0"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-[#E5E7EB] dark:bg-[#404040] flex items-center justify-center">
                                    <User className="w-4 h-4 text-[#706C6B] dark:text-[#C1A7A3]" />
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-[#191919] dark:text-[#F0EEED]">{user.full_name || "Unnamed"}</p>
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs text-[#706C6B] dark:text-[#C1A7A3]">{user.email}</span>
                                      <span className="px-1.5 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-[10px] text-gray-600 dark:text-gray-400 capitalize">
                                        {user.role}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-[#191919] dark:text-[#F0EEED] mb-2">Email Subject</label>
                  <input
                    type="text"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    placeholder="e.g., Exclusive Member Invitation"
                    className="w-full px-4 py-2 rounded-lg border border-[#E5E7EB] dark:border-[#404040] bg-white dark:bg-[#1F1F1F] text-[#191919] dark:text-[#F0EEED] focus:outline-none focus:ring-2 focus:ring-[#C1A7A3]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#191919] dark:text-[#F0EEED] mb-2">Email Content (HTML Supported)</label>
                  <textarea
                    value={emailContent}
                    onChange={(e) => setEmailContent(e.target.value)}
                    rows={8}
                    placeholder="<p>Dear Valued Member,</p><p>We are delighted to invite you...</p>"
                    className="w-full px-4 py-2 rounded-lg border border-[#E5E7EB] dark:border-[#404040] bg-white dark:bg-[#1F1F1F] text-[#191919] dark:text-[#F0EEED] focus:outline-none focus:ring-2 focus:ring-[#C1A7A3] resize-none font-mono text-sm"
                  />
                  <p className="text-xs text-[#706C6B] dark:text-[#C1A7A3] mt-2">
                    Tip: You can use basic HTML tags for formatting. The content will be wrapped in our standard template.
                  </p>
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    onClick={handleSendEmail}
                    disabled={isEmailSending || !emailSubject || !emailContent || !emailApiKey}
                    className="px-6 py-2 bg-[#C1A7A3] text-white rounded-lg hover:bg-[#A88F8B] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium"
                  >
                    {isEmailSending ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        {broadcastType === "booking_reminder" ? "Update Template" : "Send Email"}
                      </>
                    ) : (
                      broadcastType === "booking_reminder" ? "Update Template" : "Send Email"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </SejenakDashboardLayout>
  );
}
