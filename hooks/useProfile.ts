"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { supabase, Profile } from "@/lib/supabase";

export function useProfile() {
  const { user, isLoaded } = useUser();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoaded || !user) {
      setLoading(false);
      return;
    }

    async function fetchOrCreateProfile() {
      // TypeScript guard: ensure user is not null
      if (!user) {
        setLoading(false);
        return;
      }

      // Store user.id in a variable to help TypeScript understand it's not null
      const userId = user.id;

      try {
        setLoading(true);
        setError(null);

        // Check if profile exists
        const { data: existingProfile, error: fetchError } = await supabase
          .from("profiles")
          .select("*")
          .eq("clerk_id", userId)
          .single();

        if (fetchError) {
          // PGRST116 is "not found" error - this is expected for new users
          if (fetchError.code === "PGRST116") {
            console.log("Profile not found, will create new one");
          } else {
            console.error("Error fetching profile:", fetchError);
            throw fetchError;
          }
        }

        if (existingProfile) {
          setProfile(existingProfile);
          setLoading(false);
          return;
        }

        // Create new profile if it doesn't exist
        const profileData = {
          clerk_id: userId,
          full_name: user.fullName || user.firstName || null,
          email: user.emailAddresses[0]?.emailAddress || null,
          avatar_url: user.imageUrl || null,
          role: "customer" as const, // Default role for new users
          is_active: true,
        };

        console.log("Creating profile with data:", { ...profileData, avatar_url: profileData.avatar_url ? "[URL]" : null });

        const { data: newProfile, error: createError } = await supabase
          .from("profiles")
          .insert(profileData)
          .select()
          .single();

        // Handle RLS error on member_points table (trigger issue)
        if (createError) {
          // If error is about member_points RLS, the profile might still be created
          if (createError.code === "42501" && createError.message?.includes("member_points")) {
            console.warn("Profile created but member_points insert failed due to RLS:", createError.message);
            
            // Try to fetch the profile that was just created
            const { data: createdProfile, error: fetchError } = await supabase
              .from("profiles")
              .select("*")
              .eq("clerk_id", userId)
              .single();
            
            if (createdProfile && !fetchError) {
              // Profile was created successfully, use it despite the trigger error
              console.log("Profile found after RLS error, using it");
              setProfile(createdProfile);
              setLoading(false);
              return;
            } else {
              // Profile wasn't created, throw the error
              console.error("Profile creation failed:", fetchError || createError);
              throw createError;
            }
          } else {
            // Other errors, throw normally
            console.error("Create profile error:", createError);
            throw createError;
          }
        }

        if (!newProfile) {
          throw new Error("Failed to create profile");
        }

        setProfile(newProfile);
      } catch (err: any) {
        // Better error logging - Supabase errors have specific structure
        let errorMessage = "Failed to load profile";
        let errorDetails: any = {};
        
        if (err) {
          // Try to extract all possible error properties
          errorDetails = {
            message: err.message,
            code: err.code,
            details: err.details,
            hint: err.hint,
            statusCode: err.statusCode,
            statusText: err.statusText,
            error: err.error,
            status: err.status,
          };
          
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
          
          // Extract readable error message
          if (err.code === "42501" && err.message?.includes("member_points")) {
            errorMessage = "Profile creation failed: The member_points table has Row Level Security (RLS) policies that are blocking the automatic creation of member records. Please contact your administrator to update the RLS policies on the member_points table to allow inserts from the create_member_record trigger.";
          } else if (err.code === "42501") {
            errorMessage = "Permission denied. Please check Row Level Security (RLS) policies.";
          } else {
            errorMessage = 
              err.message || 
              err.details || 
              err.hint || 
              (err.code === "23505" ? "Profile already exists" : null) ||
              (err.code ? `Database error (${err.code})` : null) ||
              (typeof err === "string" ? err : null) ||
              "Failed to load profile";
          }
        }
        
        console.error("Error fetching/creating profile:", errorDetails);
        console.error("Raw error:", err);
        
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    }

    fetchOrCreateProfile();
  }, [user, isLoaded]);

  return { profile, loading, error };
}

