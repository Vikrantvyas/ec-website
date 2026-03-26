"use client";

interface Branch {
  id: string;
  name: string;
}

interface Props {
  branches: Branch[];
  value: string;
  onChange: (branchId: string) => void;
}

export default function BranchSelector({
  branches,
  value,
  onChange
}: Props) {

  const handleClick = (branchId:string) => {

    if(value === branchId){
      onChange("");   // unselect
    }else{
      onChange(branchId);
    }

  };

  return (

    <div className="space-y-2 w-full">

      <label className="text-sm text-gray-600">
        Branch
      </label>

      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">

        {branches.map((b)=>(
          <button
            key={b.id}
            type="button"
            onClick={()=>handleClick(b.id)}
            className={`whitespace-nowrap h-[36px] px-3 rounded-md border text-sm transition
            ${
              value === b.id
              ? "bg-blue-600 text-white border-blue-600"
              : "bg-white border-gray-300 hover:bg-gray-50"
            }`}
          >
            {b.name}
          </button>
        ))}

      </div>

    </div>

  );

}