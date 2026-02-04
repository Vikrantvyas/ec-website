"use client";

import Link from "next/link";
import { FaFacebookF, FaInstagram, FaYoutube } from "react-icons/fa";

export default function DesktopHeader() {
  return (
    <header className="hidden md:block fixed top-0 left-0 right-0 z-40 bg-blue-600">
      <div className="max-w-6xl mx-auto px-6 h-12 flex items-center justify-between text-white">
        
        {/* Logo / Name */}
        <Link href="/" className="text-lg font-semibold">
          English Club
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-6">
          <Link href="/#courses" className="text-sm hover:opacity-90">
            Courses
          </Link>
          <Link href="/#branches" className="text-sm hover:opacity-90">
            Branches
          </Link>
          <Link href="/contact" className="text-sm hover:opacity-90">
            Contact
          </Link>

          {/* Social Icons */}
          <div className="flex gap-4 items-center">
            <a
              href="https://www.facebook.com/englishclubindore"
              target="_blank"
              aria-label="Facebook"
              className="text-[#1877F2]"
            >
              <FaFacebookF />
            </a>

            <a
              href="https://www.instagram.com/englishclubindore"
              target="_blank"
              aria-label="Instagram"
              className="text-[#E4405F]"
            >
              <FaInstagram />
            </a>

            <a
              href="https://www.youtube.com/@englishclubindore"
              target="_blank"
              aria-label="YouTube"
              className="text-[#FF0000]"
            >
              <FaYoutube />
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
