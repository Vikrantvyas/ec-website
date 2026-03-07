"use client";

import React from "react";

interface Props {
  label: string;
  name: string;
  value: any;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

export default function FormTextarea({
  label,
  name,
  value,
  onChange
}: Props) {

  return (

    <div className="flex flex-col col-span-full">

      <label className="text-xs text-gray-600 mb-1">
        {label}
      </label>

      <textarea
        name={name}
        value={value || ""}
        onChange={onChange}
        rows={3}
        className="border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
      />

    </div>

  );

}