"use client";

import React from "react";
import BottomSheetSelect from "@/app/components/ui/BottomSheetSelect";

export function Block({ title, children }: any) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6 shadow-md w-full">
      <h3 className="text-blue-700 font-semibold mb-4 text-base">
        {title}
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {children}
      </div>
    </div>
  );
}

/* ✅ UPDATED INPUT WITH disabled SUPPORT */
export const Input = React.forwardRef<HTMLInputElement, any>(
  (
    {
      label,
      name,
      type = "text",
      value,
      onChange,
      readOnly,
      disabled = false
    },
    ref
  ) => {
    return (
      <div className="flex flex-col">
        <label className="mb-1 text-gray-600 text-sm font-medium">
          {label}
        </label>

        <input
          ref={ref}
          name={name}
          type={type}
          value={value || ""}
          readOnly={readOnly}
          disabled={disabled}
          onChange={onChange}
          className={`w-full h-[44px] px-3 rounded-lg border border-gray-300
                     ${disabled ? "bg-gray-100 cursor-not-allowed" : "bg-white"}
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
        />
      </div>
    );
  }
);

Input.displayName = "Input";

export function TextArea({
  label,
  name,
  value,
  onChange,
  rows = 3
}: any) {
  return (
    <div className="flex flex-col col-span-full">
      <label className="mb-1 text-gray-600 text-sm font-medium">
        {label}
      </label>

      <textarea
        name={name}
        value={value || ""}
        onChange={onChange}
        rows={rows}
        className="w-full min-h-[44px] px-3 py-2 rounded-lg border border-gray-300 bg-white
                   focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />
    </div>
  );
}

export function SelectField({
  label,
  value,
  options,
  onChange,
  multiple = false
}: any) {
  return (
    <div className="flex flex-col">
      <label className="mb-1 text-gray-600 text-sm font-medium">
        {label}
      </label>

      {!multiple ? (
        <div className="w-full">
          <BottomSheetSelect
            label={label}
            value={value}
            options={options}
            onChange={onChange}
          />
        </div>
      ) : (
        <select
          multiple
          value={value}
          onChange={(e) => {
            const selected = Array.from(
              e.target.selectedOptions,
              (option: any) => option.value
            );
            onChange(selected);
          }}
          className="w-full min-h-[150px] px-3 py-3 rounded-lg border border-gray-300 bg-white
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                     space-y-2"
        >
          {options.map((o: any) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}