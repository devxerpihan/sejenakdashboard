/**
 * Migration Script: Excel → Supabase (Profiles, Treatments, Bookings)
 * 
 * Run: node migration.js
 * Requires: SUPABASE_URL, SUPABASE_SERVICE_KEY in .env
 * 
 * Dependencies:
 * npm install xlsx dotenv
 */

const { createClient } = require('@supabase/supabase-js')
const XLSX = require('xlsx')
require('dotenv/config')

// Use same values as src/services/supabase.js
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://binrxbwaiufupxodujsw.supabase.co'
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJpbnJ4YndhaXVmdXB4b2R1anN3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODIzNDI4NCwiZXhwIjoyMDYzODEwMjg0fQ.hXp6BoW5ZNPbwsl90dr6pwA2YwHKSf29ig6zBQcsOzQ'
const EXCEL_FILE = './Sejenak Customer Data.xlsx' // Fixed: Correct file path
const BATCH_SIZE = 100 // Batch insert size for performance

// Validate environment variables
if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Error: SUPABASE_URL and SUPABASE_SERVICE_KEY must be set')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

// Read Excel with error handling
let customers = []
let transactions = []

try {
  const workbook = XLSX.readFile(EXCEL_FILE)
  
  // Check available sheet names
  const sheetNames = workbook.SheetNames
  console.log('📋 Available sheets:', sheetNames.join(', '))
  
  // Try to find customer and transaction sheets (flexible matching)
  const customerSheet = sheetNames.find(name => 
    name.toLowerCase().includes('customer') && !name.toLowerCase().includes('transaction')
  ) || sheetNames.find(name => name.toLowerCase().includes('customer'))
  
  const transactionSheet = sheetNames.find(name => 
    name.toLowerCase().includes('transaction') || name.toLowerCase().includes('booking')
  )
  
  if (!customerSheet) {
    throw new Error(`Customer sheet not found. Available sheets: ${sheetNames.join(', ')}`)
  }
  if (!transactionSheet) {
    throw new Error(`Transaction sheet not found. Available sheets: ${sheetNames.join(', ')}`)
  }
  
  customers = XLSX.utils.sheet_to_json(workbook.Sheets[customerSheet])
  transactions = XLSX.utils.sheet_to_json(workbook.Sheets[transactionSheet])
  
  console.log(`📊 Using sheets: "${customerSheet}" and "${transactionSheet}"`)
  
  console.log(`📊 Loaded ${customers.length} customers and ${transactions.length} transactions`)
} catch (error) {
  console.error(`❌ Error reading Excel file: ${error.message}`)
  process.exit(1)
}

// Cache maps
const customerMap = {}
const treatmentMap = {}

// Helper function to generate unique clerk_id
function generateClerkId(index) {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substr(2, 9)
  return `migrated_${timestamp}_${index}_${random}`
}

// Helper function to parse Indonesian Rupiah price format
// Input: "Rp. 337.500" or "Rp 337.500" or "337.500"
// Output: 337500 (number)
function parseRupiahPrice(priceStr) {
  if (!priceStr) return 0
  
  try {
    // Convert to string and remove currency symbols
    let cleaned = String(priceStr)
      .replace(/Rp\.?\s*/gi, '') // Remove "Rp." or "Rp" (case insensitive)
      .replace(/\./g, '') // Remove dots (thousand separators)
      .replace(/,/g, '') // Remove commas if any
      .trim()
    
    // Parse to number
    const price = parseFloat(cleaned)
    return isNaN(price) ? 0 : price
  } catch {
    return 0
  }
}

// Statistics
const stats = {
  profiles: { created: 0, skipped: 0, errors: 0 },
  treatments: { created: 0, matched: 0, errors: 0 },
  bookings: { created: 0, skipped: 0, errors: 0 }
}

async function migrate() {
  console.log('🚀 Starting migration...\n')
  
  try {
    await migrateProfiles()
    await migrateTreatments()
    await migrateBookings()
    
    console.log('\n🎉 Migration completed successfully!')
    console.log('\n📊 Summary:')
    console.log(`   Profiles: ${stats.profiles.created} created, ${stats.profiles.skipped} skipped, ${stats.profiles.errors} errors`)
    console.log(`   Treatments: ${stats.treatments.created} created, ${stats.treatments.matched} matched, ${stats.treatments.errors} errors`)
    console.log(`   Bookings: ${stats.bookings.created} created, ${stats.bookings.skipped} skipped, ${stats.bookings.errors} errors`)
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message)
    process.exit(1)
  }
}

/* -------------------------------------------
 * 1️⃣ Migrate Customers → Profiles
 * ----------------------------------------- */
async function migrateProfiles() {
  console.log('📁 Importing customers into profiles...')

  const profilesToInsert = []
  
  for (let i = 0; i < customers.length; i++) {
    const c = customers[i]
    // Safe string conversion - handle numbers, nulls, undefined
    const name = c['Customer Name'] ? String(c['Customer Name']).trim() : null
    const email = c['Email'] ? String(c['Email']).trim() : null
    const phone = c['Phone'] ? String(c['Phone']).trim() : null

    if (!name && !email && !phone) {
      stats.profiles.skipped++
      continue
    }

    // Build query condition properly (fix SQL injection/error risk)
    let query = supabase.from('profiles').select('id')
    
    if (email && phone) {
      query = query.or(`email.eq.${email},phone.eq.${phone}`)
    } else if (email) {
      query = query.eq('email', email)
    } else if (phone) {
      query = query.eq('phone', phone)
    } else {
      // If no email or phone, try to match by name only
      query = query.eq('full_name', name)
    }

    const { data: existing } = await query.maybeSingle()

    if (existing) {
      // Map by name, email, or phone - whichever is available
      if (name) customerMap[name.toLowerCase()] = existing.id
      if (email) customerMap[email.toLowerCase()] = existing.id
      if (phone) customerMap[phone.toLowerCase()] = existing.id
      stats.profiles.skipped++
      continue
    }

    // Generate unique clerk_id for migrated customers
    const clerkId = generateClerkId(i)

    const profile = {
      clerk_id: clerkId,
      full_name: name || email || phone || 'Unknown Customer',
      email,
      phone,
      date_of_birth: c['Birth Date'] ? formatDate(c['Birth Date']) : null,
      role: 'customer',
      is_guest: false,
      is_active: true,
      profile_data: {
        member_since: c['Member Since'] ? formatDate(c['Member Since']) : null
      }
    }

    profilesToInsert.push(profile)

    // Batch insert
    if (profilesToInsert.length >= BATCH_SIZE || i === customers.length - 1) {
      const { data: inserted, error } = await supabase
        .from('profiles')
        .insert(profilesToInsert)
        .select('id, full_name')

      if (error) {
        console.error(`❌ Error inserting batch of profiles:`, error.message)
        stats.profiles.errors += profilesToInsert.length
      } else {
        inserted.forEach((p, idx) => {
          const originalIndex = i - profilesToInsert.length + idx + 1
          const originalCustomer = customers[originalIndex]
          if (!originalCustomer) return
          
          // Map by name, email, or phone - whichever is available
          const name = originalCustomer['Customer Name'] 
            ? String(originalCustomer['Customer Name']).trim() 
            : null
          const email = originalCustomer['Email'] 
            ? String(originalCustomer['Email']).trim() 
            : null
          const phone = originalCustomer['Phone'] 
            ? String(originalCustomer['Phone']).trim() 
            : null
          
          // Store in map using all available identifiers
          if (name) customerMap[name.toLowerCase()] = p.id
          if (email) customerMap[email.toLowerCase()] = p.id
          if (phone) customerMap[phone.toLowerCase()] = p.id
        })
        stats.profiles.created += inserted.length
      }
      
      profilesToInsert.length = 0 // Clear array
      process.stdout.write(`\r   Progress: ${i + 1}/${customers.length} customers processed`)
    }
  }

  console.log(`\n✅ Profiles: ${stats.profiles.created} created, ${stats.profiles.skipped} skipped`)
}

/* -------------------------------------------
 * 2️⃣ Migrate Treatments → Treatments Table
 * ----------------------------------------- */
async function migrateTreatments() {
  console.log('💆 Checking and importing treatments...')

  const uniqueTreatments = [
    ...new Set(transactions.map(t => t['Treatment'] ? String(t['Treatment']).trim() : null).filter(Boolean))
  ]

  // Load existing treatments
  const { data: existingTreatments } = await supabase
    .from('treatments')
    .select('id, name')

  for (const t of existingTreatments || []) {
    treatmentMap[t.name.toLowerCase()] = t.id
  }

  // Helper: categorize and estimate
  const categorize = (name) => {
    const lower = name.toLowerCase()
    if (lower.includes('massage') || lower.includes('reflex')) return { category: 'massage', duration: 90 }
    if (lower.includes('body')) return { category: 'body', duration: 60 }
    if (lower.includes('facial') || lower.includes('skin')) return { category: 'facial', duration: 60 }
    if (lower.includes('head spa')) return { category: 'head_spa', duration: 45 }
    if (lower.includes('hair') || lower.includes('scalp')) return { category: 'hair', duration: 60 }
    if (lower.includes('nail') || lower.includes('manicure') || lower.includes('pedicure')) return { category: 'nail', duration: 45 }
    if (lower.includes('pilates') || lower.includes('stretch')) return { category: 'pilates', duration: 60 }
    if (lower.includes('kid') || lower.includes('child')) return { category: 'kids', duration: 45 }
    if (lower.includes('package')) return { category: 'package', duration: 120 }
    return { category: 'facial', duration: 60 }
  }

  // Compute average price per treatment
  const priceMap = {}
  for (const t of transactions) {
    const name = t['Treatment'] ? String(t['Treatment']).trim() : null
    if (!name) continue
    const priceStr = t['Total Price Per Appointment'] ? String(t['Total Price Per Appointment']) : null
    const price = parseRupiahPrice(priceStr)
    if (!price) continue
    if (!priceMap[name]) priceMap[name] = []
    priceMap[name].push(price)
  }

  const treatmentsToInsert = []

  for (const name of uniqueTreatments) {
    const normalized = name.toLowerCase().trim()

    // Try exact match
    let existingId = treatmentMap[normalized]

    // Try partial fuzzy match (if not exact)
    if (!existingId) {
      const fuzzy = Object.keys(treatmentMap).find(
        tName => tName.includes(normalized) || normalized.includes(tName)
      )
      if (fuzzy) existingId = treatmentMap[fuzzy]
    }

    // If found, use it
    if (existingId) {
      treatmentMap[normalized] = existingId
      stats.treatments.matched++
      continue
    }

    const avgPrice =
      priceMap[name] && priceMap[name].length
        ? priceMap[name].reduce((a, b) => a + b, 0) / priceMap[name].length
        : 0

    const { category, duration } = categorize(name)

    // Fix: Store price as number, not string
    const treatment = {
      name,
      category,
      duration,
      price: Math.round(avgPrice * 100) / 100, // Round to 2 decimal places as number
      is_active: true
    }

    treatmentsToInsert.push(treatment)
  }

  // Batch insert new treatments
  if (treatmentsToInsert.length > 0) {
    for (let i = 0; i < treatmentsToInsert.length; i += BATCH_SIZE) {
      const batch = treatmentsToInsert.slice(i, i + BATCH_SIZE)
      
      const { data: inserted, error } = await supabase
        .from('treatments')
        .insert(batch)
        .select('id, name')

      if (error) {
        console.error(`❌ Treatment insert error:`, error.message)
        stats.treatments.errors += batch.length
      } else {
        inserted.forEach(t => {
          treatmentMap[t.name.toLowerCase()] = t.id
        })
        stats.treatments.created += inserted.length
      }
    }
  }

  console.log(`✅ Treatments: ${stats.treatments.created} created, ${stats.treatments.matched} matched`)
}

/* -------------------------------------------
 * 3️⃣ Migrate Bookings → Bookings Table
 * ----------------------------------------- */
async function migrateBookings() {
  console.log('📅 Importing bookings...')

  const bookingsToInsert = []

  for (let i = 0; i < transactions.length; i++) {
    const t = transactions[i]
    // Safe string conversion
    const customerName = t['Customer'] ? String(t['Customer']).trim() : null
    const user_id = customerName ? customerMap[customerName.toLowerCase()] : null

    if (!user_id) {
      stats.bookings.skipped++
      continue
    }

    const booking_date = formatDate(t['Date'])
    const booking_time = parseTime(t['Start'])
    const duration = computeDuration(t['Start'], t['End'])
    
    // Parse price from Indonesian Rupiah format (e.g., "Rp. 337.500")
    const priceStr = t['Total Price Per Appointment'] ? String(t['Total Price Per Appointment']) : null
    const total_price = parseRupiahPrice(priceStr)
    const payment_amount = total_price // Same as total_price for completed bookings

    if (!booking_date) {
      console.warn(`⚠️ Booking skipped — invalid date for ${customerName}`)
      stats.bookings.skipped++
      continue
    }

    const treatmentName = t['Treatment'] ? String(t['Treatment']).trim() : null
    const treatment_id = treatmentName ? treatmentMap[treatmentName.toLowerCase()] : null

    // Fix: Store special_requests as JSONB object, not string
    const specialRequests = {}
    if (t['Room']) specialRequests.room = String(t['Room'])
    if (t['Therapist']) specialRequests.therapist = String(t['Therapist'])

    // Convert booking_date to timestamp for payment_date
    const payment_date = booking_date ? new Date(`${booking_date}T00:00:00Z`).toISOString() : null

    const booking = {
      user_id,
      booking_date,
      booking_time,
      duration,
      total_price,
      payment_amount,
      payment_status: 'paid',
      payment_date,
      status: 'completed',
      treatment_id,
      special_requests: Object.keys(specialRequests).length > 0 ? specialRequests : null
    }

    bookingsToInsert.push(booking)

    // Batch insert
    if (bookingsToInsert.length >= BATCH_SIZE || i === transactions.length - 1) {
      const { error } = await supabase.from('bookings').insert(bookingsToInsert)

      if (error) {
        console.error(`❌ Error inserting batch of bookings:`, error.message)
        stats.bookings.errors += bookingsToInsert.length
      } else {
        stats.bookings.created += bookingsToInsert.length
      }

      bookingsToInsert.length = 0 // Clear array
      process.stdout.write(`\r   Progress: ${i + 1}/${transactions.length} bookings processed`)
    }
  }

  console.log(`\n✅ Bookings: ${stats.bookings.created} created, ${stats.bookings.skipped} skipped`)
}

/* -------------------------------------------
 * Helper Functions
 * ----------------------------------------- */
function formatDate(d) {
  if (!d) return null
  
  try {
    // Handle Excel serial date numbers (e.g., 44927)
    if (typeof d === 'number') {
      // Excel epoch starts on January 1, 1900
      const excelEpoch = new Date(1900, 0, 1)
      const daysSinceEpoch = d - 2 // Excel has a bug: it thinks 1900 was a leap year
      const date = new Date(excelEpoch.getTime() + daysSinceEpoch * 24 * 60 * 60 * 1000)
      return date.toISOString().slice(0, 10)
    }
    
    // Handle date strings
    const date = new Date(d)
    if (isNaN(date.getTime())) return null
    return date.toISOString().slice(0, 10)
  } catch {
    return null
  }
}

function parseTime(str) {
  if (!str) return '00:00'
  
  // Handle Excel time serial numbers (fraction of day)
  if (typeof str === 'number') {
    const totalSeconds = Math.floor(str * 24 * 60 * 60)
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
  }
  
  // Handle time strings
  const time = str.toString().match(/(\d{1,2}):?(\d{2})/)
  if (!time) return '00:00'
  const [_, h, m] = time
  return `${h.padStart(2, '0')}:${m.padStart(2, '0')}`
}

function computeDuration(start, end) {
  try {
    const [h1, m1] = parseTime(start).split(':').map(Number)
    const [h2, m2] = parseTime(end).split(':').map(Number)
    const duration = (h2 * 60 + m2) - (h1 * 60 + m1)
    return duration > 0 ? duration : 60 // Default to 60 if invalid
  } catch {
    return 60
  }
}

// Run migration
migrate().catch(error => {
  console.error('Fatal error:', error)
  process.exit(1)
})