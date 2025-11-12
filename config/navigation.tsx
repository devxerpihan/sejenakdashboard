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

export const navItems: NavItem[] = [
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

