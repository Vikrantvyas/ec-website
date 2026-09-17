"use client";

import "./globals.css";
import { usePathname } from "next/navigation";

import MobileHeader from "./components/MobileHeader";
import DesktopHeader from "./components/DesktopHeader";
import MobileBottomNav from "./components/MobileBottomNav";
import StickyButtons from "./components/StickyButtons";
import AltPointer from "./components/admin/common/AltPointer";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const isAdmin = pathname.startsWith("/admin");
  const isLanding = pathname === "/english-online" || pathname === "/test-landing";

  return (
    <html lang="en">
      <body
        className={`overflow-x-hidden ${isLanding ? "landing-body" : ""
          }`}
      >
        <AltPointer />
        {!isAdmin && !isLanding && (
          <>
            <MobileHeader />
            <DesktopHeader />
          </>
        )}

        {children}

        {!isAdmin && !isLanding && (
          <>
            <MobileBottomNav />
            <StickyButtons />
          </>
        )}

      </body>
    </html>
  );
}