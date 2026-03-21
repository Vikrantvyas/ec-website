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

  const handleClick = (branch:string) => {

    if(value === branch){
      onChange("");   // unselect branch
    }else{
      onChange(branch);
    }

  };

  return (

    <div className="space-y-2 w-full">

      <label className="text-sm text-gray-600">
        Branch
      </label>

      <div
        className="
        flex gap-2 overflow-x-auto pb-1
        scrollbar-hide
        "
      >

        {branches.map((b:string)=>(

          <button
            key={b}
            type="button"
            onClick={()=>handleClick(b)}
            className={`whitespace-nowrap h-[36px] px-3 rounded-md border text-sm transition
            ${
              (value || "").trim() === b.trim()   // ✅ FIXED
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