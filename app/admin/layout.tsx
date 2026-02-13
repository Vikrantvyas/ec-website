"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  UserPlus,
  Users,
  CalendarCheck,
  CreditCard,
  FileBarChart,
  Database,
  Settings,
  LogOut,
} from "lucide-react";

const menuItems = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Enquiry", href: "/admin/enquiry", icon: UserPlus },
  { name: "Students", href: "/admin/students", icon: Users },
  { name: "Attendance", href: "/admin/attendance", icon: CalendarCheck },
  { name: "Fees", href: "/admin/fees", icon: CreditCard },
  { name: "Reports", href: "/admin/reports", icon: FileBarChart },
  { name: "Masters", href: "/admin/masters", icon: Database },
  { name: "Settings", href: "/admin/settings", icon: Settings },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen">

      {/* NAVY SIDEBAR */}
      <aside className="w-16 bg-[#0b1f4d] flex flex-col items-center py-6 space-y-6 shadow-2xl">

        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link key={item.href} href={item.href}>
              <div
                className={`p-3 rounded-lg transition ${
                  isActive
                    ? "bg-[#1e40af]"
                    : "hover:bg-[#1e40af]"
                }`}
              >
                <Icon size={20} className="text-white" />
              </div>
            </Link>
          );
        })}

        <div className="mt-auto">
          <button className="p-3 rounded-lg bg-red-600 hover:bg-red-700 transition">
            <LogOut size={20} className="text-white" />
          </button>
        </div>
      </aside>

      <main className="flex-1 bg-gray-100 p-6">
        {children}
      </main>
    </div>
  );
}
