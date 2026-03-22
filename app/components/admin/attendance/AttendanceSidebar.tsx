"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

type Batch = {
  id: string;
  batch_name: string;
  start_time: string;
  teacher_name?: string;
  student_count?: number;
  unpaid_count?: number;
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (batches.length) {
      setLoading(false);
    } else {
      setLoading(true);
    }
  }, [batches]);

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

      {/* TOTAL INFO */}
      {!loading && (
        <div className="px-3 py-1 text-xs md:text-sm text-gray-600 border-b">
          Total Batches: {filtered.length}
        </div>
      )}

      {/* LOADING */}
      {loading && (
        <div className="p-3 text-sm text-gray-500">
          Loading batches...
        </div>
      )}

      {/* BATCH LIST */}
      {!loading && (
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

                <div className="flex items-center gap-2 flex-wrap">

                  <div className="font-semibold text-[15px] md:text-[17px]">
                    {batch.batch_name}
                  </div>

                </div>

                <div className="text-[13px] md:text-[14px] text-gray-600 mt-1">
                  {batch.teacher_name || "Teacher"}
                </div>

              </div>
            );
          })}

        </div>
      )}

    </div>
  );
}