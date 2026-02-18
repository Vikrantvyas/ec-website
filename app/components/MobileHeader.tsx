"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { FaFacebookF, FaInstagram, FaYoutube } from "react-icons/fa";
import { Menu, X } from "lucide-react";

export default function MobileHeader() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* ===== TOP BAR ===== */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-blue-600 md:hidden shadow">
        <div className="flex items-center justify-between px-4 h-14 text-white">
          
          {/* Hamburger */}
          <button
            onClick={() => setOpen(true)}
            aria-label="Open Menu"
          >
            <Menu size={24} />
          </button>

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

          {/* Empty space for balance */}
          <div className="w-6" />
        </div>
      </header>

      {/* ===== OVERLAY ===== */}
      <div
        className={`fixed inset-0 z-40 md:hidden transition ${
          open ? "visible" : "invisible"
        }`}
      >
        <div
          className={`absolute inset-0 bg-black transition-opacity ${
            open ? "opacity-50" : "opacity-0"
          }`}
          onClick={() => setOpen(false)}
        />

        {/* ===== DRAWER ===== */}
        <div
          className={`absolute left-0 top-0 h-full w-72 bg-white shadow-xl transform transition-transform duration-300 ${
            open ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {/* Drawer Header */}
          <div className="flex items-center justify-between p-4 border-b">
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

            <button onClick={() => setOpen(false)}>
              <X size={22} />
            </button>
          </div>

          {/* Menu Items */}
          <div className="p-4 space-y-4 text-base">
            <Link
              href="/"
              onClick={() => setOpen(false)}
              className="block hover:text-blue-600"
            >
              Home
            </Link>

            <Link
              href="/#courses"
              onClick={() => setOpen(false)}
              className="block hover:text-blue-600"
            >
              Courses
            </Link>

            <Link
              href="/#branches"
              onClick={() => setOpen(false)}
              className="block hover:text-blue-600"
            >
              Branches
            </Link>

            <Link
              href="/contact"
              onClick={() => setOpen(false)}
              className="block hover:text-blue-600"
            >
              Contact
            </Link>

            {/* Admin Login */}
            <Link
              href="/admin"
              onClick={() => setOpen(false)}
              className="block text-blue-600 font-medium"
            >
              Admin Login
            </Link>
          </div>

          {/* Social Icons */}
          <div className="mt-auto p-4 border-t flex gap-5">
            <a
              href="https://www.facebook.com/englishclubindore"
              target="_blank"
              className="text-[#1877F2] text-lg"
            >
              <FaFacebookF />
            </a>

            <a
              href="https://www.instagram.com/englishclubindore"
              target="_blank"
              className="text-[#E4405F] text-lg"
            >
              <FaInstagram />
            </a>

            <a
              href="https://www.youtube.com/@englishclubindore"
              target="_blank"
              className="text-[#FF0000] text-lg"
            >
              <FaYoutube />
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
