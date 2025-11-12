# Sejenak Beauty Dashboard - Component Structure

## Overview
This document outlines the complete component structure for the Sejenak Beauty Islamic Village dashboard based on the provided design.

## Layout Structure

### 1. Sidebar Component (`components/layout/SejenakSidebar.tsx`)
**Features:**
- Logo section with "Sejenak BEAUTY LOUNGE" branding
  - Stylized 'S' in a circle
  - Text: "Sejenak Beauty Islamic Village"
  - Sort/expand icon (up-down arrows)
- Navigation menu with nested items support:
  - Dashboard (active state)
  - Appointment
  - Services (with submenu indicator)
  - CRM (with submenu indicator)
  - Loyalty (with submenu indicator)
  - Staff
  - Reports (with submenu indicator)
  - Settings (with submenu indicator)
- Dark Mode toggle at bottom

**Props:**
```typescript
interface SejenakSidebarProps {
  navItems: NavItem[];
  isDarkMode: boolean;
  onDarkModeToggle: () => void;
}
```

### 2. Enhanced Header Component (`components/layout/SejenakHeader.tsx`)
**Features:**
- Top bar with:
  - Search bar (left) with magnifying glass icon
  - Grid/expand icon
  - Calendar icon
  - Settings icon
  - Notifications bell
  - User avatar
- Below search bar:
  - "Overview Dashboard" title
  - Location selector: "Sejenak Islamic Village" with building icon
  - Date range picker: "01/01/2025 - 09/09/2025" with left/right navigation arrows

**Props:**
```typescript
interface SejenakHeaderProps {
  title: string;
  location: string;
  dateRange: { start: Date; end: Date };
  onDateRangeChange: (direction: 'prev' | 'next') => void;
  user: User;
}
```

## Dashboard Components

### 3. Stat Cards with Mini Charts (`components/dashboard/SejenakStatCard.tsx`)
**Features:**
- Icon (calendar-like)
- Title (Therapist, Customer, Appointment, Revenue)
- Large numerical value
- Mini trend chart (bar chart or area chart)
- 4 cards in a row:
  1. Therapist: 30
  2. Customer: 500
  3. Appointment: 745
  4. Revenue: 597.000.000

**Props:**
```typescript
interface SejenakStatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend: number[];
  trendType: 'bar' | 'area';
}
```

### 4. Appointment Summary Cards (`components/dashboard/AppointmentSummary.tsx`)
**Features:**
- Three cards showing:
  - All Appointments: 745 (blue dot)
  - Cancelled: 67 (orange dot)
  - Completed: 745 (red dot)

**Props:**
```typescript
interface AppointmentSummaryProps {
  all: number;
  cancelled: number;
  completed: number;
}
```

### 5. Stacked Bar Chart (`components/dashboard/StackedBarChart.tsx`)
**Features:**
- Monthly stacked bar chart
- Shows "Completed" (red) and "Canceled" (light red) appointments
- X-axis: Months (Jan - Sep)
- Y-axis: 0 to 5K (5000)
- Title: "Appointment Statistics"

**Props:**
```typescript
interface StackedBarChartProps {
  data: {
    month: string;
    completed: number;
    cancelled: number;
  }[];
  title?: string;
}
```

### 6. Donut Chart Component (`components/dashboard/DonutChart.tsx`)
**Features:**
- Large donut chart
- Center label: "Total Customer 569"
- Segments with colors:
  - Red: 214 (Hair)
  - Light red: 150 (Nail)
  - Pink: 121 (Body)
- Used for:
  - Top Category section
  - Top Treatment by Category section

**Props:**
```typescript
interface DonutChartProps {
  data: {
    label: string;
    value: number;
    color: string;
  }[];
  totalLabel: string;
  totalValue: number;
  title?: string;
}
```

### 7. Top Therapist List (`components/dashboard/TopTherapistList.tsx`)
**Features:**
- List of therapist cards
- Each card shows:
  - Avatar (circular image)
  - Name
  - Booking count
- Example data:
  - Cindy Caroline: 258 Bookings
  - Emily Carter: 125 Bookings
  - Agatha Carter: 115 Bookings

**Props:**
```typescript
interface TopTherapistListProps {
  therapists: {
    id: string;
    name: string;
    avatar?: string;
    bookings: number;
  }[];
  title?: string;
}
```

### 8. Date Range Picker (`components/ui/DateRangePicker.tsx`)
**Features:**
- Display format: "01/01/2025 - 09/09/2025"
- Left/right arrow navigation
- Click to open calendar picker

**Props:**
```typescript
interface DateRangePickerProps {
  startDate: Date;
  endDate: Date;
  onChange: (start: Date, end: Date) => void;
  onNavigate: (direction: 'prev' | 'next') => void;
}
```

### 9. Location Selector (`components/ui/LocationSelector.tsx`)
**Features:**
- Display location name
- Building icon
- Dropdown to select different locations

**Props:**
```typescript
interface LocationSelectorProps {
  location: string;
  locations: string[];
  onChange: (location: string) => void;
}
```

## Page Layout Structure

### Main Dashboard Page (`app/page.tsx`)
**Layout:**
```
┌─────────────────────────────────────────────────────────┐
│ Sidebar │ Header (Search, Icons, User)                  │
│         ├───────────────────────────────────────────────┤
│         │ Title: Overview Dashboard                     │
│         │ Location | Date Range                         │
│         ├───────────────────────────────────────────────┤
│         │ [Stat Card] [Stat Card] [Stat Card] [Stat Card]│
│         ├───────────────────────────────────────────────┤
│         │ Appointment Statistics                         │
│         │ [Summary Cards: All | Cancelled | Completed] │
│         │ [Stacked Bar Chart: Monthly Appointments]     │
│         │                                               │
│         │ Top Category │ Top Treatment by Category      │
│         │ [Donut Chart]│ [Donut Chart]                 │
│         ├───────────────────────────────────────────────┤
│         │ Top Therapist                                 │
│         │ [Therapist Cards with Avatars]                │
└─────────────────────────────────────────────────────────┘
```

## Component Dependencies

### New Icons Needed (`components/icons.tsx`)
- CalendarIcon
- BuildingIcon
- SearchIcon
- GridIcon
- ChevronRightIcon (for submenu)
- ChevronLeftIcon / ChevronRightIcon (for date navigation)
- SortIcon (up-down arrows)

### Color Scheme
- Primary: Red tones (#EF4444, #F87171, #FCA5A5)
- Background: White/Light gray
- Text: Dark gray/Black
- Accent: Blue for "All Appointments" dot

## Data Types

```typescript
// types/sejenak.ts
export interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  children?: NavItem[];
}

export interface StatCardData {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend: number[];
  trendType: 'bar' | 'area';
}

export interface AppointmentData {
  month: string;
  completed: number;
  cancelled: number;
}

export interface DonutChartData {
  label: string;
  value: number;
  color: string;
}

export interface Therapist {
  id: string;
  name: string;
  avatar?: string;
  bookings: number;
}
```

## Implementation Order

1. ✅ Create structure document (this file)
2. ⏳ Add new icons to icons.tsx
3. ⏳ Create DateRangePicker component
4. ⏳ Create LocationSelector component
5. ⏳ Enhance Sidebar with logo, nested menus, dark mode
6. ⏳ Enhance Header with search, date range, location
7. ⏳ Create SejenakStatCard with mini charts
8. ⏳ Create AppointmentSummary component
9. ⏳ Create StackedBarChart component
10. ⏳ Create DonutChart component
11. ⏳ Create TopTherapistList component
12. ⏳ Update main dashboard page with all components
13. ⏳ Add sample data matching the design
14. ⏳ Test and refine styling

