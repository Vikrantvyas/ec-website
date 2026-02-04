import "./globals.css";
import type { Metadata } from "next";

/* 🧩 COMMON LAYOUT COMPONENTS */
import MobileHeader from "./components/MobileHeader";
import DesktopHeader from "./components/DesktopHeader";
import MobileBottomNav from "./components/MobileBottomNav";
import StickyButtons from "./components/StickyButtons";

export const metadata: Metadata = {
  title: "English Club Indore | Spoken English & Computer Institute",
  description:
    "English Club Indore offers Spoken English, Computer Courses, Tally, CPCT & Interview Preparation. Classes running since 2010. 3 branches in Indore.",
  keywords: [
    "English Club Indore",
    "Spoken English Institute in Indore",
    "Computer Institute in Indore",
    "Tally Classes Indore",
    "CPCT Coaching Indore",
  ],
  openGraph: {
    title: "English Club Indore",
    description:
      "Spoken English & Computer Training Institute in Indore. Since 2010. 3 Branches.",
    type: "website",
    locale: "en_IN",
  },
  other: {
    "google-site-verification":
      "MlfOkOjZrAru1A96SnPncnm1xZ5abgkAZdGz-F1NwTk",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="overflow-x-hidden">
      <body className="overflow-x-hidden">
        {/* 📱 Mobile fixed header (WhatsApp style) */}
        <MobileHeader />

        {/* 💻 Desktop fixed header */}
        <DesktopHeader />

        {/* 🧠 All page content */}
        {children}

        {/* 📱 Mobile bottom navigation */}
        <MobileBottomNav />

        {/* 💬 Floating Call & WhatsApp */}
        <StickyButtons />
      </body>
    </html>
  );
}
