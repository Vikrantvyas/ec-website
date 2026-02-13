import "./globals.css";
import type { Metadata } from "next";

import MobileHeader from "./components/MobileHeader";
import DesktopHeader from "./components/DesktopHeader";
import MobileBottomNav from "./components/MobileBottomNav";
import StickyButtons from "./components/StickyButtons";

export const metadata: Metadata = {
  title: "English Club Indore",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="overflow-x-hidden">

        {/* PUBLIC HEADER */}
        <MobileHeader />
        <DesktopHeader />

        {children}

        {/* PUBLIC FOOTER ITEMS */}
        <MobileBottomNav />
        <StickyButtons />

      </body>
    </html>
  );
}
