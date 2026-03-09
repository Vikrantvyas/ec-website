"use client";

import React, { useState } from "react";

interface Props {
  label: string;
  placeholder?: string;
  value: string;
  onChange: (e:any)=>void;
  onSearch: ()=>Promise<boolean> | boolean;
}

export default function SearchField({
  label,
  placeholder = "Search student or mobile...",
  value,
  onChange,
  onSearch
}:Props){

  const [popup,setPopup] = useState<"found" | "notfound" | null>(null);

  const triggerSearch = async ()=>{

    const result = await onSearch();

    if(result){
      setPopup("found");
    }else{
      setPopup("notfound");
    }

    setTimeout(()=>{
      setPopup(null);
    },2000);

  };

  const handleKeyDown = (e:any)=>{
    if(e.key === "Enter"){
      triggerSearch();
    }
  };

  return (

    <div className="flex flex-col w-full relative">

      <label className="mb-1 text-gray-600 text-sm font-medium">
        {label}
      </label>

      <div className="flex gap-3 w-full">

        {/* SEARCH INPUT */}

        <div className="relative flex-1">

          <span className="absolute left-3 top-[12px] text-gray-400">
            🔍
          </span>

          <input
            type="text"
            value={value}
            placeholder={placeholder}
            onChange={onChange}
            onKeyDown={handleKeyDown}
            className="w-full h-[44px] pl-9 pr-3 rounded-lg border border-gray-300 bg-white
            text-sm text-gray-800
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />

        </div>

        {/* SEARCH BUTTON */}

        <button
          type="button"
          onClick={triggerSearch}
          className="h-[44px] px-6 rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition"
        >
          Search
        </button>

      </div>

      {/* POPUP */}

      {popup === "found" && (

        <div className="absolute left-1/2 -bottom-12 -translate-x-1/2
        bg-green-600 text-white px-5 py-2 rounded-lg shadow-lg text-sm font-medium">

          ✔ Record Found

        </div>

      )}

      {popup === "notfound" && (

        <div className="absolute left-1/2 -bottom-12 -translate-x-1/2
        bg-red-600 text-white px-5 py-2 rounded-lg shadow-lg text-sm font-medium">

          ✖ Record Not Found

        </div>

      )}

    </div>

  );

}