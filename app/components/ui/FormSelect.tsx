"use client";

import BottomSheetSelect from "@/app/components/ui/BottomSheetSelect";

interface Option {
  label: string;
  value: string;
}

interface Props {
  label: string;
  value: any;
  options: Option[];
  onChange: (val: any) => void;
}

export default function FormSelect({
  label,
  value,
  options,
  onChange
}: Props) {

  return (

    <div className="flex flex-col">

      <label className="text-xs text-gray-600 mb-1">
        {label}
      </label>

      <BottomSheetSelect
        value={value}
        options={options}
        onChange={onChange}
      />

    </div>

  );

}