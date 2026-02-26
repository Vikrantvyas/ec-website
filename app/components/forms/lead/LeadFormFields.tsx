"use client";

import BottomSheetSelect from "@/app/components/ui/BottomSheetSelect";

export function Block({ title, children }: any) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6 shadow-md w-full">
      <h3 className="text-blue-700 font-semibold mb-4">{title}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {children}
      </div>
    </div>
  );
}

export function Input({
  label,
  name,
  type = "text",
  value,
  onChange,
  readOnly
}: any) {
  return (
    <div className="flex flex-col">
      <label className="mb-1 text-gray-600 text-sm font-medium">
        {label}
      </label>

      <input
        name={name}
        type={type}
        value={value || ""}
        readOnly={readOnly}
        onChange={onChange}
        className="
          w-full
          h-[44px]
          px-3
          rounded-lg
          border
          border-gray-300
          bg-white
          transition-all
          duration-200
          focus:outline-none
          focus:ring-2
          focus:ring-blue-500
          focus:border-blue-500
        "
      />
    </div>
  );
}

export function SelectField({
  label,
  value,
  options,
  onChange
}: any) {
  return (
    <div className="flex flex-col">
      <label className="mb-1 text-gray-600 text-sm font-medium">
        {label}
      </label>

      <BottomSheetSelect
        label={label}
        value={value}
        options={options}
        onChange={onChange}
      />
    </div>
  );
}