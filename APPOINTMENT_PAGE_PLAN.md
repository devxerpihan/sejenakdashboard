# Appointment Page - Implementation Plan

## Overview
The appointment page displays a schedule grid showing appointments for multiple therapists across time slots, with a current time indicator and various view options.

## Layout Structure

```
┌─────────────────────────────────────────────────────────────┐
│ TopHeaderBar (Full Width)                                   │
│ [Logo] [Toggle] [Search] [Icons] [New Appointment] [Views] │
├──────────┬──────────────────────────────────────────────────┤
│ Sidebar  │ OverviewBar                                      │
│          │ [Title] [Location] [DateRange] [ViewSwitcher]   │
│          ├──────────────────────────────────────────────────┤
│          │ AppointmentSchedule                              │
│          │ ┌──────┬─────────┬─────────┬─────────┐         │
│          │ │ Time │ Therapist Headers                      │
│          │ │ Axis ├─────────┼─────────┼─────────┤         │
│          │ │ 08:00│ [Avatar]│ [Avatar]│ [Avatar]│         │
│          │ │ 09:00│ Name    │ Name    │ Name    │         │
│          │ │ 10:00├─────────┼─────────┼─────────┤         │
│          │ │ 11:00│ [Card]  │ [Card]  │ [Card]  │         │
│          │ │ 12:00│         │         │         │         │
│          │ │ 13:00│         │         │         │         │
│          │ │ 14:00│         │         │         │         │
│          │ └──────┴─────────┴─────────┴─────────┘         │
│          ├──────────────────────────────────────────────────┤
│          │ Footer                                           │
│          │ © 2025 Sejenak Beauty Lounge                    │
└──────────┴──────────────────────────────────────────────────┘
```

## Components Created

### 1. **AppointmentSchedule** (`components/appointment/AppointmentSchedule.tsx`)
- Main container for the schedule grid
- Manages time slots, therapist columns, and appointment positioning
- Includes current time indicator overlay
- Props:
  - `appointments: Appointment[]`
  - `therapists: Therapist[]`
  - `startHour?: number` (default: 8)
  - `endHour?: number` (default: 14)
  - `hourHeight?: number` (default: 80px)

### 2. **AppointmentCard** (`components/appointment/AppointmentCard.tsx`)
- Individual appointment card displayed in the grid
- Shows treatment name, patient name, time, room, and status badge
- Customizable background color per appointment
- Props:
  - `appointment: Appointment`
  - `style?: React.CSSProperties`

### 3. **TimeAxis** (`components/appointment/TimeAxis.tsx`)
- Left column displaying time slots (08:00, 09:00, etc.)
- Fixed width, scrollable with schedule
- Props:
  - `timeSlots: TimeSlot[]`
  - `hourHeight: number`

### 4. **TherapistHeader** (`components/appointment/TherapistHeader.tsx`)
- Header row for each therapist column
- Displays avatar and name
- Props:
  - `therapist: Therapist`

### 5. **CurrentTimeIndicator** (`components/appointment/CurrentTimeIndicator.tsx`)
- Red horizontal line showing current time
- Positioned absolutely over the schedule
- Includes red dot on the left edge
- Props:
  - `currentTime: Date`
  - `startHour: number`
  - `hourHeight: number`
  - `columnCount: number`

### 6. **AppointmentStatusBadge** (`components/appointment/AppointmentStatusBadge.tsx`)
- Status badge for appointments (Completed, Check In, Pending, Cancelled)
- Color-coded badges
- Props:
  - `status: "completed" | "check-in" | "pending" | "cancelled"`

### 7. **ViewSwitcher** (`components/appointment/ViewSwitcher.tsx`)
- Buttons to switch between Day, Week, Therapist, Room, and All views
- Active view highlighted with background
- Props:
  - `currentView: ViewMode`
  - `onViewChange: (view: ViewMode) => void`

### 8. **Footer** (`components/appointment/Footer.tsx`)
- Simple footer with copyright text
- Displays: "2025 © Sejenak Beauty Lounge, All Rights Reserved"

## Types (`types/appointment.ts`)

```typescript
interface Appointment {
  id: string;
  treatmentName: string;
  patientName: string;
  startTime: string; // "HH:mm"
  endTime: string; // "HH:mm"
  room: string;
  therapistId: string;
  status?: "completed" | "check-in" | "pending" | "cancelled";
  color?: string; // Card background color
}

interface Therapist {
  id: string;
  name: string;
  avatar?: string;
}

type ViewMode = "day" | "week" | "therapist" | "room" | "all";

interface TimeSlot {
  hour: number;
  minute: number;
  display: string; // "HH:mm"
}
```

## Page Route (`app/appointment/page.tsx`)

- Uses `SejenakDashboardLayout` wrapper
- Manages state for:
  - Dark mode
  - Current view (Day/Week/Therapist/Room/All)
  - Location
  - Date range
- Provides sample data for therapists and appointments
- Integrates all components

## Key Features

1. **Time-based Grid Layout**
   - Time slots from 08:00 to 14:00 (configurable)
   - Each hour = 80px height (configurable)
   - Vertical scrolling for schedule

2. **Therapist Columns**
   - Dynamic number of columns based on therapists array
   - Each column shows appointments for that therapist
   - Horizontal scrolling if many therapists

3. **Appointment Positioning**
   - Calculated based on start/end time
   - Absolute positioning within therapist column
   - Supports overlapping appointments

4. **Current Time Indicator**
   - Red line at current time position
   - Updates based on actual time
   - Visible across all columns

5. **Status Badges**
   - Completed: Green badge
   - Check In: Blue badge
   - Pending: Yellow badge
   - Cancelled: Red badge

6. **View Switcher**
   - Day, Week, Therapist, Room, All options
   - Active view highlighted
   - Integrated into OverviewBar

7. **Header Enhancements**
   - "New Appointment" button with plus icon
   - List and Grid view toggle buttons
   - Notification bell with red dot

## Styling

- Uses custom color palette (beige, rose, taupe)
- Zinc borders for consistency
- Dark mode support throughout
- Responsive design with overflow handling
- Custom appointment card colors (light orange, purple, green, red)

## Positioning & Layout Details

1. **TopHeaderBar**: Full width, fixed at top
2. **Sidebar**: Fixed width (256px), below header
3. **OverviewBar**: Starts from sidebar edge, no background/border
4. **AppointmentSchedule**: Full width, scrollable, with fixed time axis
5. **Footer**: Full width at bottom, outside main padding

## Sample Data

The page includes sample data matching the design:
- 5 therapists (Abril Lewis, Allan Hicks, etc.)
- 16 appointments with various colors and statuses
- Time range: 08:00 - 14:00
- Multiple appointments per therapist

## Next Steps (Future Enhancements)

1. Implement view mode functionality (Day/Week/Therapist/Room/All)
2. Add appointment creation modal/form
3. Add appointment editing/dragging
4. Add filtering by status, room, or therapist
5. Add real-time updates
6. Add appointment details modal on click
7. Implement date navigation properly
8. Add export/print functionality

