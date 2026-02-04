"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { FaFacebookF, FaInstagram, FaYoutube } from "react-icons/fa";

export default function MobileHeader() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Top Bar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-blue-600 md:hidden">
        <div className="flex items-center justify-between px-4 h-14 text-white">
          
          {/* Logo + Name */}
          <div className="flex items-center gap-2">
            <Image
              src="/home/logo.jpg"
              alt="English Club Logo"
              width={26}
              height={26}
              className="rounded-sm"
            />
            <span className="font-semibold text-lg">
              English Club
            </span>
          </div>

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
            <li>
              <Link href="/" onClick={() => setOpen(false)}>
                Home
              </Link>
            </li>
            <li>
              <Link href="/#courses" onClick={() => setOpen(false)}>
                Courses
              </Link>
            </li>
            <li>
              <Link href="/#branches" onClick={() => setOpen(false)}>
                Branches
              </Link>
            </li>
            <li>
              <Link href="/contact" onClick={() => setOpen(false)}>
                Contact
              </Link>
            </li>
          </ul>

          {/* Social Icons */}
          <div className="flex gap-4 mt-4 border-t pt-4">
            {/* Facebook (white bg fix) */}
            <a
              href="https://www.facebook.com/englishclubindore"
              target="_blank"
              aria-label="Facebook"
              className="w-8 h-8 flex items-center justify-center rounded-full bg-white text-[#1877F2]"
            >
              <FaFacebookF />
            </a>

            {/* Instagram */}
            <a
              href="https://www.instagram.com/englishclubindore"
              target="_blank"
              aria-label="Instagram"
              className="text-[#E4405F] text-lg"
            >
              <FaInstagram />
            </a>

            {/* YouTube */}
            <a
              href="https://www.youtube.com/@englishclubindore"
              target="_blank"
              aria-label="YouTube"
              className="text-[#FF0000] text-lg"
            >
              <FaYoutube />
            </a>
          </div>
        </div>
      )}
    </>
  );
}
