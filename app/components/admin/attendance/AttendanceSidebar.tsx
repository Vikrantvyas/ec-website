"use client";

import { useState } from "react";

type Batch = {
  id: string;
  batch_name: string;
  start_time: string;
  teacher_name?: string;
  student_count?: number;
};

type Branch = {
  id: string;
  name: string;
};

export default function AttendanceSidebar({
  branches,
  selectedBranch,
  setSelectedBranch,
  batches,
  selectedBatch,
  setSelectedBatch,
  isTeacher,
}: {
  branches: Branch[];
  selectedBranch: string;
  setSelectedBranch: (b: string) => void;
  batches: Batch[];
  selectedBatch: string | null;
  setSelectedBatch: (id: string | null) => void;
  isTeacher: boolean;
}) {

  const [search, setSearch] = useState("");

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  function isCurrentBatch(time?: string) {
    if (!time) return false;

    const [h, m] = time.split(":").map(Number);
    const batchStart = h * 60 + m;

    return currentMinutes >= batchStart && currentMinutes <= batchStart + 60;
  }

  const filtered = batches.filter((b) =>
    b.batch_name.toLowerCase().includes(search.toLowerCase())
  );

  const circleColors = [
    "bg-blue-500",
    "bg-green-500",
    "bg-yellow-400",
    "bg-red-500",
    "bg-purple-500",
  ];

  return (
    <div className="flex flex-col h-full overflow-hidden">

      {/* SEARCH */}
      <div className="p-2">
        <input
          placeholder="Search batch..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded px-3 py-2 text-sm bg-gray-100 outline-none"
        />
      </div>

      {/* TOTAL COUNT */}
      <div className="px-3 text-xs text-gray-500 pb-1">
        Total Batches: {filtered.length}
      </div>

      {/* BRANCHES */}
      {!isTeacher && (
        <div className="px-2 pb-2 overflow-x-auto flex gap-2">
          {branches.map((b) => (
            <button
              key={b.id}
              onClick={() => {
                setSelectedBranch(b.id);
                setSelectedBatch(null);
              }}
              className={`px-3 py-1 rounded text-xs md:text-sm whitespace-nowrap shadow-sm transition
                ${
                  selectedBranch === b.id
                    ? "bg-blue-600 text-white"
                    : "bg-white"
                }`}
            >
              {b.name}
            </button>
          ))}
        </div>
      )}

      {/* BATCH LIST */}
      <div className="flex-1 overflow-y-auto px-2 pb-2">

        {filtered.map((batch) => {

          const isActiveTime = isCurrentBatch(batch.start_time);

          return (
            <div
              key={batch.id}
              onClick={() => setSelectedBatch(batch.id)}
              className={`p-2 md:p-3 mb-2 rounded-lg cursor-pointer shadow-sm
                ${
                  selectedBatch === batch.id
                    ? "bg-blue-50"
                    : isActiveTime
                    ? "bg-green-100 border border-green-500"
                    : "bg-white"
                }`}
            >

              {/* NAME + BADGE */}
              <div className="flex items-center gap-2">

                <div className="font-semibold text-[15px] md:text-[17px]">
                  {batch.batch_name}
                </div>

                {/* ✅ BADGE */}
                <div className="text-[10px] px-1.5 py-[1px] rounded bg-green-100 text-green-700">
                  A ✔
                </div>

              </div>

              {/* SECOND ROW */}
              <div className="text-[13px] md:text-[14px] text-gray-600 mt-1 flex items-center justify-between">

                <span>
                  {batch.teacher_name || "Teacher"} •{" "}
                  {batch.student_count || 0} St.
                </span>

                <div className="flex -space-x-2">
                  {[...Array(Math.min(batch.student_count || 0, 5))].map((_, i) => (
                    <div
                      key={i}
                      className={`w-5 h-5 rounded-full border-2 border-white ${circleColors[i % circleColors.length]}`}
                    />
                  ))}
                </div>

              </div>

            </div>
          );
        })}

      </div>

    </div>
  );
}