"use client";

import "./globals.css";
import { usePathname } from "next/navigation";
import Script from "next/script";


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
  const isLanding =
    pathname === "/english-online" ||
    pathname === "/test-landing" ||
    pathname === "/enquiry";

  return (
    <html lang="en">
      <body
        className={`overflow-x-hidden ${isLanding ? "landing-body" : ""
          }`}
      >
        <Script
          id="meta-pixel"
          strategy="afterInteractive"
        >
          {`
    !function(f,b,e,v,n,t,s)
    {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};
    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
    n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t,s)}(window, document,'script',
    'https://connect.facebook.net/en_US/fbevents.js');

    fbq('init', '1807110330222570');
    fbq('track', 'PageView');
  `}
        </Script>
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