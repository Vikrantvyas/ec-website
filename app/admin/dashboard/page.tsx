"use client";

import { useRouter } from "next/navigation";
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

export default function AdminDashboard() {

  const router = useRouter();

  const menu = [
    { name: "Lead", href: "/admin/lead", icon: UserRoundPlus },
    { name: "Lead List", href: "/admin/lead/list", icon: List },

    { name: "Admission", href: "/admin/admission", icon: GraduationCap },
    { name: "Admission 2", href: "/admin/admission2", icon: GraduationCap }, // ✅ added

    { name: "Enquiry", href: "/admin/enquiry", icon: UserPlus },
    { name: "Calling", href: "/admin/calling", icon: PhoneCall },

    { name: "Batches", href: "/admin/batches", icon: Layers },

    { name: "Students", href: "/admin/students", icon: Users },

    { name: "Attendance", href: "/admin/attendance", icon: CalendarCheck },
    { name: "New Attendance", href: "/admin/attendance2", icon: ClipboardList },

    { name: "Fees", href: "/admin/fees", icon: CreditCard },
    { name: "Receipt", href: "/admin/receipt", icon: ReceiptText },

    { name: "Reports", href: "/admin/reports", icon: FileBarChart },
    { name: "Masters", href: "/admin/masters", icon: Database },

    { name: "Roles", href: "/admin/roles", icon: ShieldCheck },
    { name: "Settings", href: "/admin/settings", icon: Settings },
  ];

  return (

    <div className="p-6">

      <h1 className="text-2xl font-semibold mb-6">
        Dashboard
      </h1>

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">

        {menu.map((item, index) => {

          const Icon = item.icon;

          return (

            <div
              key={index}
              onClick={() => router.push(item.href)}
              className="cursor-pointer bg-white rounded-xl shadow hover:shadow-md transition p-4 flex flex-col items-center justify-center text-center"
            >

              <Icon className="w-8 h-8 mb-2 text-blue-600" />

              <div className="text-sm font-medium">
                {item.name}
              </div>

            </div>

          );

        })}

      </div>

    </div>

  );

}
