"use client";

import "./globals.css";
import { usePathname } from "next/navigation";

import MobileHeader from "./components/MobileHeader";
import DesktopHeader from "./components/DesktopHeader";
import MobileBottomNav from "./components/MobileBottomNav";
import StickyButtons from "./components/StickyButtons";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  return (
    <html lang="en">
      <body className="overflow-x-hidden">

        {!isAdmin && (
          <>
            <MobileHeader />
            <DesktopHeader />
          </>
        )}

        {children}

        {!isAdmin && (
          <>
            <MobileBottomNav />
            <StickyButtons />
          </>
        )}

      </body>
    </html>
  );
}