"use client";

import React from "react";
import BottomSheetSelect from "@/app/components/ui/BottomSheetSelect";

/* BLOCK */

export function Block({ title, children }: any) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6 shadow-md w-full mb-8">
      <h3 className="text-blue-700 font-semibold mb-4 text-base">
        {title}
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {children}
      </div>
    </div>
  );
}

/* INPUT FIELD */

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
text-sm text-gray-800
${disabled ? "bg-gray-100 cursor-not-allowed" : "bg-white"}
focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
        />
      </div>
    );
  }
);

Input.displayName = "Input";

/* TEXTAREA */

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
text-sm text-gray-800
focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />
    </div>
  );
}

/* MULTI SELECT */

function MultiSelect({
  options,
  value,
  onChange
}: any) {

  const toggle = (val: string) => {

    if (value.includes(val)) {
      onChange(value.filter((v: string) => v !== val));
    } else {
      onChange([...value, val]);
    }

  };

  return (

    <div
      className="w-full h-[150px] px-3 py-2 rounded-lg border border-gray-300 bg-white
      focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500
      overflow-y-auto space-y-2"
    >

      {options.map((opt: any) => (

        <label
          key={opt.value}
          className="flex items-center gap-2 text-sm cursor-pointer"
        >

          <input
            type="checkbox"
            checked={value.includes(opt.value)}
            onChange={() => toggle(opt.value)}
            className="accent-blue-600"
          />

          {opt.label}

        </label>

      ))}

    </div>

  );

}

/* SELECT FIELD */

export function SelectField({
  label,
  value,
  options,
  onChange,
  multiple = false,
  defaultValue
}: any) {

  const finalValue = value ?? defaultValue ?? (multiple ? [] : "");

  return (
    <div className="flex flex-col">

      <label className="mb-1 text-gray-600 text-sm font-medium">
        {label}
      </label>

      {!multiple && (
        <BottomSheetSelect
          label={label}
          value={finalValue}
          options={options}
          onChange={onChange}
        />
      )}

      {multiple && (
        <MultiSelect
          options={options}
          value={finalValue}
          onChange={onChange}
        />
      )}

    </div>
  );
}