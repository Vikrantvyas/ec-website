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
  Globe,
  UserRoundPlus,
  GraduationCap,
  ChevronRight,
} from "lucide-react";

const menuItems = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Lead", href: "/admin/lead", icon: UserRoundPlus },
  { name: "Admission", href: "/admin/admission", icon: GraduationCap },
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
      <div className="min-h-screen flex items-center justify-center bg-white">
        Checking authentication...
      </div>
    );
  }

  if (isLoginPage) return <>{children}</>;

  const currentPathName =
    pathname.split("/")[2]?.charAt(0).toUpperCase() +
    pathname.split("/")[2]?.slice(1);

  return (
    <div className="fixed inset-0 flex bg-white">

      {/* ICON BAR DESKTOP */}
      <aside className="hidden md:flex w-14 bg-[#0a1f44] flex-col items-center py-3 space-y-3">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);

          return (
            <Link key={item.href} href={item.href} className="group relative">
              <div
                className={`p-2 rounded-md transition ${
                  isActive ? "bg-[#163d7a]" : "hover:bg-[#163d7a]"
                }`}
              >
                <Icon size={18} className="text-white" />
              </div>

              <span className="absolute left-12 top-1/2 -translate-y-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap z-[999] pointer-events-none">
                {item.name}
              </span>
            </Link>
          );
        })}

        <button onClick={handleLogout} className="mt-2">
          <div className="p-2 rounded-md bg-red-600 hover:bg-red-700 transition">
            <LogOut size={16} className="text-white" />
          </div>
        </button>
      </aside>

      {/* PAGE AREA */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* DESKTOP HEADER */}
        <div className="hidden md:flex items-center justify-between px-6 h-12 bg-[#0a1f44] text-white">
          
          {/* BREADCRUMB */}
          <div className="flex items-center text-sm font-semibold gap-2">
            <span>Admin Panel</span>
            {pathname !== "/admin" && (
              <>
                <ChevronRight size={14} />
                <span>{currentPathName}</span>
              </>
            )}
          </div>

          <div className="flex items-center gap-6 text-sm">
            <Link
              href="/"
              className="flex items-center gap-2 hover:text-gray-300 transition"
            >
              <Globe size={16} />
              View Website
            </Link>

            <button
              onClick={handleLogout}
              className="hover:text-red-300 transition"
            >
              Logout
            </button>
          </div>
        </div>

        {/* MOBILE TOP BAR */}
        <div className="md:hidden flex items-center justify-between px-4 h-14 bg-[#0a1f44] text-white">
          <button onClick={() => setMobileOpen(true)}>
            <Menu size={22} />
          </button>

          <div className="flex items-center text-sm font-semibold gap-2">
            <span>Admin</span>
            {pathname !== "/admin" && (
              <>
                <ChevronRight size={14} />
                <span>{currentPathName}</span>
              </>
            )}
          </div>

          <div />
        </div>

        <main className="flex-1 overflow-auto">
          <div className="px-4 py-4">{children}</div>
        </main>
      </div>

      {/* MOBILE DRAWER */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute left-0 top-0 h-full w-72 bg-white shadow-xl flex flex-col">

            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="font-semibold">Menu</h2>
              <button onClick={() => setMobileOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-100"
                  >
                    <Icon size={16} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}

              <Link
                href="/"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-100"
              >
                <Globe size={16} />
                View Website
              </Link>

              <button
                onClick={handleLogout}
                className="flex items-center gap-3 p-2 rounded-md bg-red-100 text-red-600 w-full"
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}