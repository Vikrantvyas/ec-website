"use client";

import { useState } from "react";

export default function MobileHeader() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* HEADER */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b md:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <span className="font-bold text-lg">English Club</span>

          <button
            onClick={() => setOpen(!open)}
            className="text-2xl"
            aria-label="Menu"
          >
            ⋮
          </button>
        </div>
      </header>

      {/* DROPDOWN MENU */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/30 md:hidden"
          onClick={() => setOpen(false)}
        >
          <div
            className="absolute top-14 right-4 bg-white rounded-xl shadow-lg w-48 p-3"
            onClick={(e) => e.stopPropagation()}
          >
            <a href="/" className="block py-2">Home</a>
            <a href="#courses" className="block py-2">Courses</a>
            <a href="#branches" className="block py-2">Branches</a>
            <a href="#contact" className="block py-2">Contact</a>
          </div>
        </div>
      )}
    </>
  );
}
