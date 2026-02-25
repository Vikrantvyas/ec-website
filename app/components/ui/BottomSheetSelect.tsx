"use client";

import { useState, useEffect } from "react";

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

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [open]);

  return (
    <>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full border px-3 py-2 rounded text-left text-sm bg-white"
      >
        {value || label}
      </button>

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
  );
}