import {
  LayoutDashboard,
  UserPlus,
  Users,
  CalendarCheck,
  CreditCard,
  FileBarChart,
  Database,
  Settings,
  UserRoundPlus,
  GraduationCap,
  PhoneCall,
  ShieldCheck,
  List,
  Layers,
  ReceiptText,
  ClipboardList,
} from "lucide-react";

export const adminMenu = [
  // ✅ Fixed Dashboard route
  { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },

  { name: "Lead", href: "/admin/lead", icon: UserRoundPlus },
  { name: "Lead List", href: "/admin/lead/list", icon: List },

  { name: "Admission", href: "/admin/admission", icon: GraduationCap },
  { name: "Enquiry", href: "/admin/enquiry", icon: UserPlus },
  { name: "Calling", href: "/admin/calling", icon: PhoneCall },

  { name: "Batches", href: "/admin/batches", icon: Layers },

  { name: "Students", href: "/admin/students", icon: Users },
  { name: "Attendance", href: "/admin/attendance", icon: CalendarCheck },

  // ✅ New Attendance
  { name: "New Attendance", href: "/admin/attendance2", icon: ClipboardList },

  { name: "Fees", href: "/admin/fees", icon: CreditCard },

  { name: "Receipt", href: "/admin/receipt", icon: ReceiptText },

  { name: "Reports", href: "/admin/reports", icon: FileBarChart },
  { name: "Masters", href: "/admin/masters", icon: Database },
  { name: "Roles", href: "/admin/roles", icon: ShieldCheck },
  { name: "Settings", href: "/admin/settings", icon: Settings },
];