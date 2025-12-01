"use client";

import React, { useState, useRef, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { SejenakDashboardLayout } from "@/components/layout/SejenakDashboardLayout";
import { Footer } from "@/components/layout";
import { Breadcrumbs } from "@/components/services";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { ToastContainer } from "@/components/ui/Toast";
import { getNavItems } from "@/config/navigation";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/lib/supabase";

export default function AccountSettingsPage() {
  const { user } = useUser();
  const router = useRouter();
  const { profile, loading: profileLoading } = useProfile();
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("darkMode");
      return saved === "true";
    }
    return false;
  });

  const [location, setLocation] = useState("Islamic Village");
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [toasts, setToasts] = useState<Array<{ id: string; message: string; type?: "success" | "error" | "warning" | "info" }>>([]);

  const showToast = (message: string, type: "success" | "error" | "warning" | "info" = "info") => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const locations = ["Islamic Village", "Location 2", "Location 3"];

  // Set preview from current avatar
  useEffect(() => {
    const avatarUrl = profile?.avatar_url || user?.imageUrl || null;
    setPreview(avatarUrl);
  }, [profile, user]);

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

  const handleFileSelect = (file: File) => {
    if (file && file.type.startsWith("image/")) {
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        showToast("File size must be less than 10MB", "error");
        return;
      }

      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      showToast("Please select a valid image file", "error");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    setPreview(profile?.avatar_url || user?.imageUrl || null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !user || !profile) {
      return;
    }

    setUploading(true);

    try {
      let finalImageUrl = profile.avatar_url || user.imageUrl || null;

      // Upload image to Supabase storage via server-side API route (bypasses RLS)
      const formData = new FormData();
      formData.append("file", selectedFile);

      const uploadResponse = await fetch("/api/upload-avatar", {
        method: "POST",
        body: formData,
      });

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to upload image: ${uploadResponse.statusText}`);
      }

      const uploadData = await uploadResponse.json();
      finalImageUrl = uploadData.url;

      // Update Clerk user profile image via server-side API route
      try {
        const clerkResponse = await fetch("/api/update-clerk-avatar", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ imageUrl: finalImageUrl }),
        });

        if (!clerkResponse.ok) {
          console.warn("Failed to update Clerk profile image, continuing with Supabase update");
        }
      } catch (clerkError: any) {
        console.warn("Error updating Clerk profile image:", clerkError);
        // Continue with Supabase update even if Clerk update fails
      }

      // Update Supabase profiles table (this is the primary source used by the app)
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: finalImageUrl })
        .eq("id", profile.id);

      if (updateError) {
        throw new Error(`Failed to update profile: ${updateError.message}`);
      }

      // Reset state
      setSelectedFile(null);
      showToast("Profile picture updated successfully!", "success");
      
      // Reload the page to reflect changes after a short delay
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err: any) {
      console.error("Error uploading profile picture:", err);
      showToast(`Failed to upload profile picture: ${err.message || "Unknown error"}`, "error");
    } finally {
      setUploading(false);
    }
  };

  const currentAvatarUrl = profile?.avatar_url || user?.imageUrl || null;
  const userName = profile?.full_name || user?.fullName || user?.firstName || "User";
  const userEmail = profile?.email || (user?.emailAddresses && user.emailAddresses[0]?.emailAddress) || "";

  return (
    <SejenakDashboardLayout
      navItems={getNavItems(profile?.role)}
      headerTitle="Account Settings"
      location={location}
      locations={locations}
      onLocationChange={setLocation}
      dateRange={{
        start: new Date(),
        end: new Date(),
      }}
      onDateRangeChange={() => {}}
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
            { label: "Settings", href: "/settings" },
            { label: "Account" },
          ]}
        />

        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-[#191919] dark:text-[#F0EEED]">
            Account Settings
          </h1>
          <p className="text-sm text-[#706C6B] dark:text-[#C1A7A3] mt-2">
            Manage your account information and profile picture
          </p>
        </div>

        {/* Account Settings Content */}
        <div className="space-y-6">
          {/* Profile Picture Section */}
          <div className="bg-white dark:bg-[#2A2A2A] rounded-lg border border-[#E5E7EB] dark:border-[#404040] p-6">
            <h2 className="text-xl font-semibold text-[#191919] dark:text-[#F0EEED] mb-4">
              Profile Picture
            </h2>
            
            <div className="flex flex-col md:flex-row gap-6 items-start">
              {/* Current Avatar Preview */}
              <div className="flex-shrink-0">
                <div className="relative">
                  <Avatar
                    src={preview || undefined}
                    name={userName}
                    size="lg"
                    className="h-32 w-32"
                  />
                  {selectedFile && (
                    <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-medium">New</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Upload Controls */}
              <div className="flex-1 space-y-4">
                <div>
                  <p className="text-sm text-[#706C6B] dark:text-[#C1A7A3] mb-2">
                    Upload a new profile picture. Recommended size: 400x400px. Max file size: 10MB.
                  </p>
                  
                  <div className="flex gap-3">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      variant="outline"
                    >
                      Choose File
                    </Button>
                    {selectedFile && (
                      <Button
                        onClick={handleRemoveImage}
                        variant="outline"
                      >
                        Remove
                      </Button>
                    )}
                  </div>

                  {selectedFile && (
                    <div className="mt-4">
                      <Button
                        onClick={handleUpload}
                        disabled={uploading}
                        className="w-full md:w-auto"
                      >
                        {uploading ? "Uploading..." : "Save Profile Picture"}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Account Information Section */}
          <div className="bg-white dark:bg-[#2A2A2A] rounded-lg border border-[#E5E7EB] dark:border-[#404040] p-6">
            <h2 className="text-xl font-semibold text-[#191919] dark:text-[#F0EEED] mb-4">
              Account Information
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#191919] dark:text-[#F0EEED] mb-1">
                  Name
                </label>
                <p className="text-sm text-[#706C6B] dark:text-[#C1A7A3]">
                  {userName}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#191919] dark:text-[#F0EEED] mb-1">
                  Email
                </label>
                <p className="text-sm text-[#706C6B] dark:text-[#C1A7A3]">
                  {userEmail || "Not set"}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#191919] dark:text-[#F0EEED] mb-1">
                  Role
                </label>
                <p className="text-sm text-[#706C6B] dark:text-[#C1A7A3]">
                  {profile?.role || "Not set"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </SejenakDashboardLayout>
  );
}

