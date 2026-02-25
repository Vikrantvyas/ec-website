"use client";

import { useState, useEffect, useRef } from "react";

type Option = {
  label: string;
  value: string;
  color?: "green" | "blue" | "red";
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

  useEffect(() => {
    const checkScreen = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkScreen();
    window.addEventListener("resize", checkScreen);
    return () => window.removeEventListener("resize", checkScreen);
  }, []);

  useEffect(() => {
    if (isMobile && open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [open, isMobile]);

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

  const colorClasses = (color?: string) => {
    switch (color) {
      case "green":
        return "text-green-600 border-l-4 border-green-500";
      case "blue":
        return "text-blue-600 border-l-4 border-blue-500";
      case "red":
        return "text-red-600 border-l-4 border-red-500";
      default:
        return "";
    }
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="w-full border px-3 py-2 rounded text-left text-sm bg-white hover:bg-gray-50 transition"
      >
        {value || label}
      </button>

      {/* MOBILE */}
      {isMobile && (
        <>
          {open && (
            <div
              className="fixed inset-0 bg-black/40 z-40"
              onClick={() => setOpen(false)}
            />
          )}

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
                  className={`px-4 py-3 flex justify-between items-center text-sm cursor-pointer ${
                    value === opt.value ? "bg-gray-100" : ""
                  } ${colorClasses(opt.color)}`}
                >
                  {opt.label}
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* DESKTOP */}
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
              } ${colorClasses(opt.color)}`}
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}