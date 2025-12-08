import * as XLSX from "xlsx";
import { supabase } from "@/lib/supabase";

// Define the interface for the Excel row
interface CustomerExcelRow {
  "Customer Name": string;
  Phone: string;
  Email: string;
  "Birth Date": string; // or Date
  "Member Since": string; // or Date
  Note: string;
}

// Helper to format date for Excel (YYYY-MM-DD)
const formatDateForExcel = (dateString: string | null): string => {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";
    return date.toISOString().split("T")[0]; // YYYY-MM-DD
  } catch (e) {
    return "";
  }
};

// Helper to parse date from Excel
const parseDateFromExcel = (dateVal: any): string | null => {
  if (!dateVal) return null;
  
  try {
    // Handle Excel serial date numbers
    if (typeof dateVal === 'number') {
      const excelEpoch = new Date(1900, 0, 1);
      const daysSinceEpoch = dateVal - 2; // Excel leap year bug
      const date = new Date(excelEpoch.getTime() + daysSinceEpoch * 24 * 60 * 60 * 1000);
      return date.toISOString().slice(0, 10);
    }
    
    // Handle string dates
    const date = new Date(dateVal);
    if (isNaN(date.getTime())) return null;
    return date.toISOString().slice(0, 10);
  } catch {
    return null;
  }
};

export const exportCustomersToExcel = async () => {
  try {
    // Fetch all customers with necessary fields
    const { data: profiles, error } = await supabase
      .from("profiles")
      .select("full_name, phone, email, date_of_birth, profile_data, notes, created_at")
      .eq("role", "customer")
      .order("full_name", { ascending: true });

    if (error) throw error;

    // Map to Excel format
    const excelData: CustomerExcelRow[] = (profiles || []).map((profile) => {
      // safely access profile_data
      const profileData = profile.profile_data as any || {};
      const memberSince = profileData.member_since || profile.created_at;

      return {
        "Customer Name": profile.full_name || "",
        Phone: profile.phone || "",
        Email: profile.email || "",
        "Birth Date": formatDateForExcel(profile.date_of_birth),
        "Member Since": formatDateForExcel(memberSince),
        Note: profile.notes || "",
      };
    });

    // Create worksheet and workbook
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Customer Data");

    // Generate filename with current date
    const date = new Date().toISOString().split("T")[0];
    const fileName = `Sejenak_Customers_${date}.xlsx`;

    // Save file
    XLSX.writeFile(workbook, fileName);
    return { success: true, count: excelData.length };
  } catch (error: any) {
    console.error("Export error:", error);
    return { success: false, error: error.message };
  }
};

export const importCustomersFromExcel = async (file: File) => {
  return new Promise<{ success: boolean; count?: number; error?: string }>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: "binary" });
        
        // Assume first sheet
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        // Parse to JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet) as any[];
        
        if (!jsonData || jsonData.length === 0) {
          resolve({ success: false, error: "No data found in Excel file" });
          return;
        }

        let processedCount = 0;
        let errorCount = 0;

        // Process each row
        // We will process sequentially to avoid overwhelming Supabase if many rows
        // For larger datasets, batching would be better
        for (const row of jsonData) {
          try {
            const name = row["Customer Name"];
            // Skip empty rows
            if (!name && !row["Email"] && !row["Phone"]) continue;

            const email = row["Email"] ? String(row["Email"]).trim() : null;
            const phone = row["Phone"] ? String(row["Phone"]).trim() : null;
            const fullName = name ? String(name).trim() : null;
            const note = row["Note"] ? String(row["Note"]).trim() : null;
            
            const birthDate = parseDateFromExcel(row["Birth Date"]);
            const memberSince = parseDateFromExcel(row["Member Since"]);

            // Check if customer exists
            let query = supabase.from("profiles").select("id, profile_data");
            
            if (email && phone) {
              query = query.or(`email.eq.${email},phone.eq.${phone}`);
            } else if (email) {
              query = query.eq("email", email);
            } else if (phone) {
              query = query.eq("phone", phone);
            } else if (fullName) {
               // Optional: Match by name if no contact info? 
               // Might be risky for common names, but following migration logic
               query = query.eq("full_name", fullName);
            } else {
              continue; // Can't identify
            }

            const { data: existing } = await query.maybeSingle();

            if (existing) {
              // Update existing
              await supabase
                .from("profiles")
                .update({
                  full_name: fullName || undefined, // Only update if provided
                  email: email || undefined,
                  phone: phone || undefined,
                  date_of_birth: birthDate || undefined,
                  notes: note || undefined,
                  // We update member_since in profile_data if provided
                  ...(memberSince ? { 
                      profile_data: { 
                        ...(existing.profile_data as object || {}), 
                        member_since: memberSince 
                      } 
                    } : {})
                })
                .eq("id", existing.id);
            } else {
              // Create new
              // Generate a pseudo-clerk_id
              const clerkId = `import_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
              
              await supabase.from("profiles").insert({
                clerk_id: clerkId,
                full_name: fullName || email || phone || "Unknown",
                email: email,
                phone: phone,
                date_of_birth: birthDate,
                notes: note,
                role: "customer",
                is_active: true,
                profile_data: memberSince ? { member_since: memberSince } : {}
              });
            }
            
            processedCount++;
          } catch (err) {
            console.error("Error processing row:", row, err);
            errorCount++;
          }
        }

        resolve({ success: true, count: processedCount });
      } catch (error: any) {
        console.error("Import parsing error:", error);
        resolve({ success: false, error: error.message });
      }
    };

    reader.onerror = (error) => {
      resolve({ success: false, error: "Failed to read file" });
    };

    reader.readAsBinaryString(file);
  });
};

