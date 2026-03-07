"use client";

interface Option {
  label: string;
  value: string;
}

interface Props {
  options: Option[];
  value: string[];
  onChange: (val: string[]) => void;
}

export default function FormMultiSelect({
  options,
  value,
  onChange
}: Props) {

  const toggle = (val: string) => {

    if (value.includes(val)) {
      onChange(value.filter(v => v !== val));
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

      {options.map(opt => (

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