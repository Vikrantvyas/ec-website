"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function AttendanceHistory({
  batchId,
  students,
  onClose,
}: any) {

  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [dates, setDates] = useState<string[]>([]);
  const [dataMap, setDataMap] = useState<any>({});

  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    generateDates(selectedDate);
  }, [selectedDate]);

  useEffect(() => {
    if (batchId && dates.length > 0) {
      loadHistory();
    }
  }, [dates, batchId]);

  function generateDates(baseDate: string) {
    const arr: string[] = [];

    for (let i = 0; i < 15; i++) {
      const d = new Date(baseDate);
      d.setDate(d.getDate() - i);
      arr.push(d.toISOString().split("T")[0]);
    }

    setDates(arr);
  }

  async function loadHistory() {

    const { data } = await supabase
      .from("attendance")
      .select("lead_id,status,attendance_date")
      .eq("batch_id", batchId)
      .in("attendance_date", dates);

    const map: any = {};

    (data || []).forEach((r: any) => {
      if (!map[r.lead_id]) map[r.lead_id] = {};
      map[r.lead_id][r.attendance_date] = r.status;
    });

    setDataMap(map);
  }

  function toggleStatus(studentId: string, date: string) {
    const current = dataMap?.[studentId]?.[date] || "-";

  let newVal = "P";

if (current === "P") newVal = "A";
else if (current === "A") newVal = "-";
else newVal = "P";

    setDataMap((prev: any) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [date]: newVal,
      },
    }));
  }

  // ✅ SAVE FUNCTION
  async function saveAttendance() {

  const records: any[] = [];

  Object.keys(dataMap).forEach((studentId) => {
    Object.keys(dataMap[studentId]).forEach((date) => {

      const status = dataMap[studentId][date];

      if (status === "P" || status === "A" || status === "L") {
        records.push({
          batch_id: batchId,
          lead_id: studentId,
          attendance_date: date,
          status,
        });
      }

    });
  });

  const { error } = await supabase
    .from("attendance")
    .upsert(records, {
      onConflict: "batch_id,lead_id,attendance_date",
    });

  if (error) {
    alert("Error saving ❌");
    console.log(error);
    return;
  }

  alert("Attendance Updated ✅");
  setEditMode(false);
}
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

      <div className="bg-white w-full h-full md:w-[95%] md:max-w-5xl md:h-auto md:max-h-[85vh] overflow-hidden flex flex-col">

        {/* HEADER */}
        <div className="px-2 py-2 flex justify-between items-center border-b">
          <div className="flex items-center gap-2">
            <h3 className="text-[13px] font-semibold">Attendance History</h3>

            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="border px-2 py-[3px] text-[11px] rounded"
            />
          </div>

          <div className="flex gap-3 text-[12px]">

  <span
    onClick={() => setEditMode(!editMode)}
    className="text-blue-600 underline cursor-pointer"
  >
    {editMode ? "Cancel Edit" : "Edit"}
  </span>

  {editMode && (
    <span
      onClick={saveAttendance}
      className="text-green-600 underline cursor-pointer"
    >
      Save
    </span>
  )}

  <span
    onClick={onClose}
    className="text-red-600 underline cursor-pointer"
  >
    Close
  </span>

</div>
        </div>

        {/* TABLE */}
        <div className="flex-1 overflow-auto">

          <table className="min-w-[520px] text-[11px]">

            <thead className="sticky top-0 bg-gray-100 z-10">
              <tr>
                <th className="sticky left-0 bg-gray-100 z-20 px-2 py-2 text-left w-[130px]">
                  Name
                </th>

                {dates.map((d) => (
                  <th key={d} className="w-[32px] px-1 py-2 text-center text-gray-600">
                    {d.slice(8, 10)}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {students.map((s: any, i: number) => (
                <tr key={s.id} className="border-b last:border-0">

                  <td className={`sticky left-0 bg-white z-10 px-2 py-2 max-w-[130px] truncate font-medium ${
                    s.due ? "text-red-600" : "text-gray-800"
                  }`}>
                    {i + 1}. {s.name}
                  </td>

                  {dates.map((d) => {
                    const val = dataMap?.[s.id]?.[d] || "-";

                    return (
                      <td
                        key={d}
                        onClick={() => editMode && toggleStatus(s.id, d)}
                        className={`w-[32px] px-1 py-2 text-center font-semibold ${
                          val === "P"
                            ? "text-green-600"
                            : val === "A"
                            ? "text-red-600"
                            : val === "L"
                            ? "text-yellow-500"
                            : "text-gray-300"
                        } ${editMode ? "cursor-pointer" : ""}`}
                      >
                        {val}
                      </td>
                    );
                  })}

                </tr>
              ))}
            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}