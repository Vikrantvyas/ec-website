"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { FaFacebookF, FaInstagram, FaYoutube } from "react-icons/fa";

export default function DesktopHeader() {
  const [showLogin, setShowLogin] = useState(false);
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setShowLogin(false);
    router.push("/admin"); // login ke baad admin dashboard
  };

  return (
    <>
      <header className="hidden md:block fixed top-0 left-0 right-0 z-40 bg-blue-600">
        <div className="max-w-6xl mx-auto px-6 h-12 flex items-center justify-between text-white">

          {/* Logo */}
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

          {/* Menu */}
          <div className="flex items-center gap-6">
            <Link href="/" className="text-sm hover:opacity-90">
              Home
            </Link>

            <Link href="/#courses" className="text-sm hover:opacity-90">
              Courses
            </Link>

            <Link href="/#branches" className="text-sm hover:opacity-90">
              Branches
            </Link>

            <Link href="/contact" className="text-sm hover:opacity-90">
              Contact
            </Link>

            {/* Login Button */}
            <button
              onClick={() => setShowLogin(true)}
              className="bg-white text-blue-600 text-sm px-3 py-1 rounded hover:bg-gray-200 transition"
            >
              Login
            </button>

            {/* Social Icons */}
            <div className="flex gap-3 items-center">
              <a
                href="https://www.facebook.com/englishclubindore"
                target="_blank"
                className="w-7 h-7 flex items-center justify-center rounded-full bg-white text-[#1877F2]"
              >
                <FaFacebookF size={14} />
              </a>

              <a
                href="https://www.instagram.com/englishclubindore"
                target="_blank"
                className="w-7 h-7 flex items-center justify-center rounded-full bg-white text-[#E4405F]"
              >
                <FaInstagram size={14} />
              </a>

              <a
                href="https://www.youtube.com/@englishclubindore"
                target="_blank"
                className="w-7 h-7 flex items-center justify-center rounded-full bg-white text-[#FF0000]"
              >
                <FaYoutube size={14} />
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* LOGIN MODAL */}
      {showLogin && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-80 p-6 rounded-xl shadow-xl">
            <h2 className="text-xl font-semibold mb-4 text-center">
              Admin Login
            </h2>

            <form onSubmit={handleLogin} className="space-y-3">
              <input
                type="email"
                placeholder="Email"
                className="w-full border px-3 py-2 rounded"
                required
              />

              <input
                type="password"
                placeholder="Password"
                className="w-full border px-3 py-2 rounded"
                required
              />

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
              >
                Login
              </button>

              <button
                type="button"
                onClick={() => setShowLogin(false)}
                className="w-full text-sm text-gray-500 mt-2"
              >
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
