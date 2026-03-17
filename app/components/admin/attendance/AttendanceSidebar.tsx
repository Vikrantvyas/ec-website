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
}: {
  branches: Branch[];
  selectedBranch: string;
  setSelectedBranch: (b: string) => void;
  batches: Batch[];
  selectedBatch: string | null;
  setSelectedBatch: (id: string) => void;
}) {
  const [search, setSearch] = useState("");

  const filtered = batches.filter((b) =>
    b.batch_name.toLowerCase().includes(search.toLowerCase())
  );

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

      {/* BRANCHES */}
      <div className="px-2 pb-2 overflow-x-auto flex gap-2">
        {branches.map((b) => (
          <button
            key={b.id}
            onClick={() => {
              setSelectedBranch(b.name);
              setSelectedBatch("");
            }}
            className={`px-3 py-1 rounded text-xs md:text-sm whitespace-nowrap shadow-sm transition
              ${
                selectedBranch === b.name
                  ? "bg-blue-600 text-white"
                  : "bg-white"
              }`}
          >
            {b.name}
          </button>
        ))}
      </div>

      {/* BATCH LIST */}
      <div className="flex-1 overflow-y-auto px-2 pb-2">

        {filtered.map((batch) => (
          <div
            key={batch.id}
            onClick={() => setSelectedBatch(batch.id)}
            className={`p-2 md:p-3 mb-2 rounded-lg cursor-pointer shadow-sm text-sm
              ${
                selectedBatch === batch.id
                  ? "bg-blue-50"
                  : "bg-white"
              }`}
          >

            <div className="font-medium text-sm md:text-base">
              {batch.batch_name}
            </div>

            <div className="text-[11px] md:text-xs text-gray-500 mt-1">
              {batch.teacher_name || "Teacher"} •{" "}
              {batch.student_count || 0} Students
            </div>

          </div>
        ))}

      </div>

    </div>
  );
}