"use client";

import React from "react";

interface Props {
  label: string;
  name: string;
  value: any;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  readOnly?: boolean;
  disabled?: boolean;
}

export default function FormInput({
  label,
  name,
  value,
  onChange,
  type = "text",
  readOnly = false,
  disabled = false
}: Props) {

  return (

    <div className="flex flex-col">

      <label className="text-xs text-gray-600 mb-1">
        {label}
      </label>

      <input
        type={type}
        name={name}
        value={value || ""}
        onChange={onChange}
        readOnly={readOnly}
        disabled={disabled}
        className="border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
      />

    </div>

  );

}