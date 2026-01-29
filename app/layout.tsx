import "./globals.css";
import type { Metadata } from "next";

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
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
