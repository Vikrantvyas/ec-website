"use client";

import { useState } from "react";

export default function ScoreCard() {

  const [score, setScore] = useState(0);

  return (

    <div className="h-full flex flex-col">

      {/* TOP BAR (same feel as WhiteBoard) */}
      <div className="flex gap-2 p-2 border-b justify-between items-center">

        <div className="font-semibold">
          Score Card
        </div>

        <button
          onClick={()=>setScore(0)}
          className="px-3 py-1 bg-gray-500 text-white text-sm rounded"
        >
          Reset
        </button>

      </div>

      {/* BODY */}
      <div className="flex-1 flex flex-col items-center justify-center gap-6">

        <div className="text-5xl font-bold">
          {score}
        </div>

        <div className="flex gap-4">

          <button
            onClick={()=>setScore(prev => prev + 1)}
            className="px-6 py-3 bg-green-600 text-white rounded text-lg"
          >
            +1
          </button>

          <button
            onClick={()=>setScore(prev => Math.max(0, prev - 1))}
            className="px-6 py-3 bg-red-600 text-white rounded text-lg"
          >
            -1
          </button>

        </div>

      </div>

    </div>

  );
}