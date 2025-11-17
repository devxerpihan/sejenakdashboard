import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://binrxbwaiufupxodujsw.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJpbnJ4YndhaXVmdXB4b2R1anN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgyMzQyODQsImV4cCI6MjA2MzgxMDI4NH0.Y86vmMAw38cgdmDgPBTHgu64fkm4rldmD1A4IoZMlgU";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Profile {
  id: string;
  clerk_id: string;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
  role: 'customer' | 'therapist' | 'receptionist' | 'cook_helper' | 'super_admin' | null;
  date_of_birth: string | null;
  gender: 'male' | 'female' | 'other' | null;
  address: string | null;
  phone: string | null;
  is_active: boolean | null;
  created_at: string | null;
  updated_at: string | null;
}


