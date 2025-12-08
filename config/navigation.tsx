import React from "react";
import {
  DashboardIcon,
  AppointmentIcon,
  ServicesIcon,
  CRMIcon,
  LoyaltyIcon,
  StaffIcon,
  ReportsIcon,
  SettingsIcon,
} from "@/components/icons";
import { NavItem } from "@/types/sejenak";

const allNavItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: <DashboardIcon /> },
  { label: "Appointment", href: "/appointment", icon: <AppointmentIcon /> },
  {
    label: "Services",
    href: "/services",
    icon: <ServicesIcon />,
    children: [
      { label: "Treatment", href: "/services/treatment", icon: <ServicesIcon /> },
      { label: "Category", href: "/services/category", icon: <ServicesIcon /> },
      { label: "Bundle Package", href: "/services/bundle-package", icon: <ServicesIcon /> },
      { label: "Promo", href: "/services/promo", icon: <ServicesIcon /> },
      { label: "Discount", href: "/services/discount", icon: <ServicesIcon /> },
      { label: "Room", href: "/services/room", icon: <ServicesIcon /> },
    ],
  },
  {
    label: "CRM",
    href: "/crm",
    icon: <CRMIcon />,
    children: [
      { label: "Customer", href: "/crm/customer", icon: <CRMIcon /> },
      { label: "In Lounge Feedback", href: "/crm/in-lounge-feedback", icon: <CRMIcon /> },
    ],
  },
  {
    label: "Loyalty",
    href: "/loyalty",
    icon: <LoyaltyIcon />,
    children: [
      { label: "Overview", href: "/loyalty/overview", icon: <LoyaltyIcon /> },
      { label: "Membership", href: "/loyalty/membership", icon: <LoyaltyIcon /> },
      { label: "Point Rules", href: "/loyalty/point-rules", icon: <LoyaltyIcon /> },
      { label: "Reward", href: "/loyalty/reward", icon: <LoyaltyIcon /> },
      { label: "Stamp", href: "/loyalty/stamp", icon: <LoyaltyIcon /> },
      { label: "Gift Card", href: "/loyalty/gift-card", icon: <LoyaltyIcon /> },
      { label: "Special For You", href: "/loyalty/special-for-you", icon: <LoyaltyIcon /> },
    ],
  },
  { label: "Staff", href: "/staff", icon: <StaffIcon /> },
  {
    label: "Reports",
    href: "/reports",
    icon: <ReportsIcon />,
    children: [
      { label: "Sales", href: "/reports/sales", icon: <ReportsIcon /> },
      { label: "Transaction", href: "/reports/transaction", icon: <ReportsIcon /> },
      { label: "Shift", href: "/reports/shift", icon: <ReportsIcon /> },
    ],
  },
  {
    label: "Settings",
    href: "/settings",
    icon: <SettingsIcon />,
    children: [
      { label: "Notification", href: "/settings/notification", icon: <SettingsIcon /> },
      { label: "Account", href: "/settings/account", icon: <SettingsIcon /> },
      { label: "Preferences", href: "/settings/preferences", icon: <SettingsIcon /> },
    ],
  },
];

// Customer-only navigation items (only Dashboard)
const customerNavItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: <DashboardIcon /> },
];

/**
 * Get navigation items filtered by user role
 * @param role - User role from profile (customer, therapist, receptionist, cook_helper, super_admin)
 * @returns Filtered navigation items
 */
export function getNavItems(role?: string | null): NavItem[] {
  // Customers only see Dashboard
  if (role === "customer") {
    return customerNavItems;
  }
  
  // Only super_admin sees all items
  if (role === "super_admin") {
    return allNavItems;
  }
  
  // Other roles (therapist, receptionist, cook_helper) see limited items
  // For now, return empty array - you can customize this later
  // Or return a subset like: [Dashboard, Appointment]
  return [];
}

// Export all items for backward compatibility
export const navItems = allNavItems;

