"use client";

import { useState } from "react";
import Link from "next/link";

export default function MobileHeader() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Top Bar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b md:hidden">
        <div className="flex items-center justify-between px-4 h-14">
          <span className="font-semibold text-lg">English Club</span>

          <button
            onClick={() => setOpen(!open)}
            className="text-2xl"
            aria-label="Menu"
          >
            ⋮
          </button>
        </div>
      </header>

      {/* Dropdown Menu */}
      {open && (
        <div className="fixed top-14 right-4 z-50 bg-white shadow-lg rounded-xl w-56 p-4 md:hidden">
          <ul className="space-y-3 text-sm">
            <li><Link href="/" onClick={() => setOpen(false)}>Home</Link></li>
            <li><Link href="/#courses" onClick={() => setOpen(false)}>Courses</Link></li>
            <li><Link href="/#branches" onClick={() => setOpen(false)}>Branches</Link></li>
            <li><Link href="/contact" onClick={() => setOpen(false)}>Contact</Link></li>
          </ul>

          {/* Social Icons */}
          <div className="flex gap-4 mt-4 border-t pt-4">
            {/* Facebook */}
            <a
              href="https://www.facebook.com/englishclubindore"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#1877F2]"
            >
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                <path d="M22.675 0h-21.35C.597 0 0 .597 0 1.326v21.348C0 23.403.597 24 1.326 24H12.82v-9.294H9.692V11.01h3.128V8.309c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24h-1.918c-1.504 0-1.796.716-1.796 1.765v2.313h3.587l-.467 3.696h-3.12V24h6.116C23.403 24 24 23.403 24 22.674V1.326C24 .597 23.403 0 22.675 0z"/>
              </svg>
            </a>

            {/* Instagram */}
            <a
              href="https://www.instagram.com/englishclubindore"
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="url(#igGradMobile)">
                <defs>
                  <linearGradient id="igGradMobile" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#feda75"/>
                    <stop offset="50%" stopColor="#d62976"/>
                    <stop offset="100%" stopColor="#962fbf"/>
                  </linearGradient>
                </defs>
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.343 3.608 1.318.975.975 1.256 2.242 1.318 3.608.058 1.266.07 1.646.07 4.84s-.012 3.574-.07 4.84c-.062 1.366-.343 2.633-1.318 3.608-.975.975-2.242 1.256-3.608 1.318-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.366-.062-2.633-.343-3.608-1.318-.975-.975-1.256-2.242-1.318-3.608C2.175 15.574 2.163 15.194 2.163 12s.012-3.574.07-4.84c.062-1.366.343-2.633 1.318-3.608C4.526 2.576 5.793 2.295 7.159 2.233 8.425 2.175 8.805 2.163 12 2.163z"/>
              </svg>
            </a>

            {/* YouTube */}
            <a
              href="https://www.youtube.com/@englishclubindore"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#FF0000]"
            >
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.498 6.186a2.999 2.999 0 0 0-2.112-2.117C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.386.524a2.999 2.999 0 0 0-2.112 2.117A31.8 31.8 0 0 0 0 12a31.8 31.8 0 0 0 .502 5.814 2.999 2.999 0 0 0 2.112 2.117c1.881.524 9.386.524 9.386.524s7.505 0 9.386-.524a2.999 2.999 0 0 0 2.112-2.117A31.8 31.8 0 0 0 24 12a31.8 31.8 0 0 0-.502-5.814z"/>
              </svg>
            </a>
          </div>
        </div>
      )}
    </>
  );
}
