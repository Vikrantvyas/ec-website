"use client";

import Link from "next/link";
import Image from "next/image";
import { FaFacebookF, FaInstagram, FaYoutube } from "react-icons/fa";

export default function DesktopHeader() {
  return (
    <header className="hidden md:block fixed top-0 left-0 right-0 z-40 bg-blue-600">
      <div className="max-w-6xl mx-auto px-6 h-12 flex items-center justify-between text-white">
        
        {/* Logo + Name */}
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/home/logo.jpg"
            alt="English Club Logo"
            width={28}
            height={28}
            className="rounded-sm"
          />
          <span className="text-lg font-semibold">
            English Club
          </span>
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
          <div className="flex gap-3 items-center">
            {/* Facebook (white bg fix) */}
            <a
              href="https://www.facebook.com/englishclubindore"
              target="_blank"
              aria-label="Facebook"
              className="w-7 h-7 flex items-center justify-center rounded-full bg-white text-[#1877F2]"
            >
              <FaFacebookF size={14} />
            </a>

            {/* Instagram */}
            <a
              href="https://www.instagram.com/englishclubindore"
              target="_blank"
              aria-label="Instagram"
              className="text-[#E4405F]"
            >
              <FaInstagram />
            </a>

            {/* YouTube */}
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
