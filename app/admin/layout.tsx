"use client";

import { ReactNode, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
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
  Menu,
  X,
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
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    const checkAuth = async () => {
      if (isLoginPage) {
        setLoading(false);
        return;
      }

      const { data } = await supabase.auth.getSession();

      if (!data.session) {
        router.push("/admin/login");
      } else {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router, isLoginPage]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/admin/login");
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <p className="text-gray-500">Checking authentication...</p>
      </div>
    );
  }

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen overflow-hidden">

      {/* ===== DESKTOP SIDEBAR ===== */}
      <aside className="hidden md:flex w-16 bg-[#0a1f44] flex-col items-center py-6 space-y-6 shadow-xl">

        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className="group relative flex items-center justify-center"
            >
              <div
                className={`p-3 rounded-lg transition ${
                  isActive ? "bg-[#163d7a]" : "hover:bg-[#163d7a]"
                }`}
              >
                <Icon size={20} className="text-white" />
              </div>

              <span className="absolute left-16 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap shadow">
                {item.name}
              </span>
            </Link>
          );
        })}

        <div className="mt-auto group relative">
          <button
            onClick={handleLogout}
            className="p-3 rounded-lg bg-red-600 hover:bg-red-700 transition"
          >
            <LogOut size={20} className="text-white" />
          </button>

          <span className="absolute left-16 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap shadow">
            Logout
          </span>
        </div>
      </aside>

      {/* ===== MOBILE DRAWER ===== */}
      <div
        className={`fixed inset-0 z-40 md:hidden transition ${
          mobileOpen ? "visible" : "invisible"
        }`}
      >
        {/* Overlay */}
        <div
          className={`absolute inset-0 bg-black transition-opacity ${
            mobileOpen ? "opacity-50" : "opacity-0"
          }`}
          onClick={() => setMobileOpen(false)}
        />

        {/* Drawer */}
        <div
          className={`absolute left-0 top-0 h-full w-72 bg-white shadow-xl transform transition-transform duration-300 ${
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="font-semibold">Menu</h2>
            <button onClick={() => setMobileOpen(false)}>
              <X size={22} />
            </button>
          </div>

          <div className="p-4 space-y-4">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 p-2 rounded-lg ${
                    isActive ? "bg-gray-200" : "hover:bg-gray-100"
                  }`}
                >
                  <Icon size={18} />
                  <span>{item.name}</span>
                </Link>
              );
            })}

            <button
              onClick={handleLogout}
              className="flex items-center gap-3 p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 w-full"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* ===== MAIN CONTENT AREA ===== */}
      <div className="flex flex-col flex-1">

        {/* Mobile Top Bar */}
        <div className="md:hidden flex items-center justify-between bg-[#0a1f44] text-white px-4 py-3 shadow">
          <button onClick={() => setMobileOpen(true)}>
            <Menu size={24} />
          </button>
          <span className="font-semibold">Admin Panel</span>
          <div />
        </div>

        {/* Content */}
        <main className="flex-1 bg-gray-100 p-4 md:p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
