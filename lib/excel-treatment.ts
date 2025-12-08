import * as XLSX from 'xlsx';
import { Treatment, PricingVariant } from '@/types/treatment';

export interface TreatmentExcelRow {
  'Internal Variant ID'?: string;
  'Service Name': string;
  'Category': string;
  'Variant': string;
  'Is Weekday Active': boolean;
  'Weekday Price': number;
  'Is Weekend Active': boolean;
  'Weekend Price': number;
  'Is Holiday Active': boolean;
  'Holiday Price': number;
  'Duration'?: number; // Optional column we might add/support
}

export const exportTreatmentsToExcel = (treatments: Treatment[]): void => {
  const rows: TreatmentExcelRow[] = [];

  treatments.forEach((treatment) => {
    if (treatment.pricingVariants && treatment.pricingVariants.length > 0) {
      treatment.pricingVariants.forEach((variant) => {
        rows.push({
          'Internal Variant ID': variant.id,
          'Service Name': treatment.name,
          'Category': treatment.category,
          'Variant': variant.name,
          'Is Weekday Active': variant.weekdayEnabled,
          'Weekday Price': variant.weekday,
          'Is Weekend Active': variant.weekendEnabled,
          'Weekend Price': variant.weekend,
          'Is Holiday Active': variant.holidayEnabled,
          'Holiday Price': variant.holiday,
          'Duration': treatment.duration,
        });
      });
    } else {
      // Handle treatments without explicit variants (treat as single Standard variant)
      rows.push({
        'Internal Variant ID': '', // No variant ID
        'Service Name': treatment.name,
        'Category': treatment.category,
        'Variant': 'Standard',
        'Is Weekday Active': true,
        'Weekday Price': typeof treatment.price === 'number' ? treatment.price : 0,
        'Is Weekend Active': true,
        'Weekend Price': typeof treatment.price === 'number' ? treatment.price : 0,
        'Is Holiday Active': false,
        'Holiday Price': 0,
        'Duration': treatment.duration,
      });
    }
  });

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Treatments');
  
  // Generate filename with date
  const date = new Date().toISOString().split('T')[0];
  XLSX.writeFile(workbook, `Treatments_${date}.xlsx`);
};

export const parseTreatmentsFromExcel = async (file: File): Promise<Map<string, {
  name: string;
  category: string;
  variants: Partial<PricingVariant>[];
  duration?: number;
}>> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json<TreatmentExcelRow>(worksheet);

        const groupedTreatments = new Map<string, {
          name: string;
          category: string;
          variants: Partial<PricingVariant>[];
          duration?: number;
        }>();

        jsonData.forEach((row) => {
          const serviceName = row['Service Name'];
          if (!serviceName) return;

          if (!groupedTreatments.has(serviceName)) {
            groupedTreatments.set(serviceName, {
              name: serviceName,
              category: row['Category'] || 'Uncategorized',
              variants: [],
              duration: row['Duration'] || 60, // Default duration if missing
            });
          }

          const treatmentGroup = groupedTreatments.get(serviceName)!;
          
          // If Duration is present in any row for this treatment, update it (last wins or first wins)
          if (row['Duration']) {
             treatmentGroup.duration = row['Duration'];
          }

          // Create variant object
          const variant: Partial<PricingVariant> = {
            id: row['Internal Variant ID'] || undefined,
            name: row['Variant'],
            weekday: row['Weekday Price'] || 0,
            weekend: row['Weekend Price'] || 0,
            holiday: row['Holiday Price'] || 0,
            weekdayEnabled: row['Is Weekday Active'],
            weekendEnabled: row['Is Weekend Active'],
            holidayEnabled: row['Is Holiday Active'],
          };

          treatmentGroup.variants.push(variant);
        });

        resolve(groupedTreatments);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
};

