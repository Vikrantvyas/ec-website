"use client";

import { useState, useEffect, useRef } from "react";

type Option = {
  label: string;
  value: string;
};

type Props = {
  label: string;
  value: string;
  options: Option[];
  onChange: (val: string) => void;
};

export default function BottomSheetSelect({
  label,
  value,
  options,
  onChange,
}: Props) {
  const [open, setOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  /* Detect Screen Size */
  useEffect(() => {
    const checkScreen = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkScreen();
    window.addEventListener("resize", checkScreen);
    return () => window.removeEventListener("resize", checkScreen);
  }, []);

  /* Lock Scroll on Mobile */
  useEffect(() => {
    if (isMobile && open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [open, isMobile]);

  /* Outside Click Close (Desktop) */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        !isMobile &&
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open, isMobile]);

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="w-full border px-3 py-2 rounded text-left text-sm bg-white hover:bg-gray-50 transition"
      >
        {value || label}
      </button>

      {/* ================= MOBILE MODE ================= */}
      {isMobile && (
        <>
          {/* Overlay */}
          {open && (
            <div
              className="fixed inset-0 bg-black/40 z-40"
              onClick={() => setOpen(false)}
            />
          )}

          {/* Bottom Sheet */}
          <div
            className={`fixed bottom-0 left-0 right-0 bg-white z-50 rounded-t-2xl transition-transform duration-300 ${
              open ? "translate-y-0" : "translate-y-full"
            }`}
          >
            <div className="p-4 border-b font-semibold flex justify-between items-center">
              {label}
              <button onClick={() => setOpen(false)}>✕</button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto">
              {options.map((opt) => (
                <div
                  key={opt.value}
                  onClick={() => {
                    onChange(opt.value);
                    setOpen(false);
                  }}
                  className={`px-4 py-3 flex justify-between items-center text-sm border-b cursor-pointer ${
                    value === opt.value ? "bg-gray-100" : ""
                  }`}
                >
                  {opt.label}
                  <div
                    className={`h-4 w-4 rounded-full border ${
                      value === opt.value
                        ? "bg-blue-600 border-blue-600"
                        : "border-gray-400"
                    }`}
                  />
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* ================= DESKTOP MODE ================= */}
      {!isMobile && open && (
        <div className="absolute z-50 mt-2 w-full bg-white border rounded-lg shadow-lg max-h-64 overflow-y-auto">
          {options.map((opt) => (
            <div
              key={opt.value}
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
              className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 ${
                value === opt.value ? "bg-gray-100 font-medium" : ""
              }`}
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}