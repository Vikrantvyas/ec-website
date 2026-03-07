"use client";

interface Props {
  branches: string[];
  value: string;
  onChange: (branch: string) => void;
}

export default function BranchSelector({
  branches,
  value,
  onChange
}: Props) {

  return (

    <div className="space-y-2">

      <p className="font-semibold text-sm">Select Branch</p>

      <div className="flex gap-2 overflow-x-auto whitespace-nowrap pb-1">

        {branches.map((b:string)=>(

          <button
            key={b}
            type="button"
            onClick={()=>onChange(b)}
            className={`px-3 py-1 rounded-full border text-sm shrink-0 transition
            ${
              value === b
              ? "bg-blue-600 text-white border-blue-600"
              : "bg-white border-gray-300 hover:bg-gray-50"
            }`}
          >
            {b}
          </button>

        ))}

      </div>

    </div>

  );

}