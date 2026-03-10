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

    <div className="space-y-2 w-full">

      <label className="text-sm text-gray-600">
        Branch
      </label>

      <div className="flex gap-2 flex-wrap">

        {branches.map((b:string)=>(

          <button
            key={b}
            type="button"
            onClick={()=>onChange(b)}
            className={`h-[44px] px-4 rounded-lg border text-sm transition
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