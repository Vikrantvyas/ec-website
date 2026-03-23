"use client";

import { useEffect, useState } from "react";

type Props = {
  attendance: any[];
};

export default function LeadAttendance({ attendance }: Props) {

  const [baseDate, setBaseDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [dates, setDates] = useState<string[]>([]);

  useEffect(() => {
    generateDates(baseDate);
  }, [baseDate]);

  function generateDates(date: string) {
    const arr: string[] = [];
    for (let i = 0; i < 15; i++) {
      const d = new Date(date);
      d.setDate(d.getDate() - i);
      arr.push(d.toISOString().split("T")[0]);
    }
    setDates(arr);
  }

  const batches = [...new Set(attendance.map(a => a.batch_name))];

  function getStatus(batch: string, date: string) {
    const r = attendance.find(
      (a) => a.batch_name === batch && a.date === date
    );
    return r?.status || "N";
  }

  function getColor(status: string) {
    if (status === "P") return "text-green-600";
    if (status === "A") return "text-red-600";
    if (status === "L") return "text-yellow-500";
    return "text-gray-300";
  }

  const totalP = attendance.filter(a => a.status === "P").length;
  const totalA = attendance.filter(a => a.status === "A").length;

  return (
    <div className="space-y-3">

      {/* TOP */}
      <div className="bg-white p-3 rounded shadow flex justify-between items-center text-sm">

        <div>
          <b>Present:</b> {totalP}
          <span className="ml-3 text-red-600"><b>Absent:</b> {totalA}</span>
        </div>

        <input
          type="date"
          value={baseDate}
          onChange={(e) => setBaseDate(e.target.value)}
          className="border px-2 py-1 text-xs rounded"
        />

      </div>

      {/* 🔥 SINGLE SCROLL CONTAINER */}
      <div className="bg-white rounded shadow text-xs overflow-x-auto">

        <div className="min-w-max">

          {/* HEADER */}
          <div className="flex border-b bg-gray-50">

            <div className="w-[120px] p-2 border-r sticky left-0 bg-white z-10">
              Batch
            </div>

            {dates.map((d, i) => (
              <div key={i} className="w-[40px] p-2 text-center text-gray-600">
                {d.slice(8, 10)}
              </div>
            ))}

          </div>

          {/* BODY */}
          {batches.map((batch, i) => (
            <div key={i} className="flex border-b">

              <div className="w-[120px] p-2 border-r sticky left-0 bg-white">
                {batch}
              </div>

              {dates.map((d, j) => {
                const status = getStatus(batch, d);

                return (
                  <div
                    key={j}
                    className={`w-[40px] p-2 text-center font-semibold ${getColor(status)}`}
                  >
                    {status === "N" ? "-" : status}
                  </div>
                );
              })}

            </div>
          ))}

          {batches.length === 0 && (
            <div className="p-4 text-center text-gray-400">
              No attendance data
            </div>
          )}

        </div>

      </div>

    </div>
  );
}