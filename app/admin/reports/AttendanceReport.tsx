"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function AttendanceReport() {

  const [rows, setRows] = useState<any[]>([]);
  const [dates, setDates] = useState<string[]>([]);

  useEffect(() => {
    loadAttendanceReport();
  }, []);

  async function loadAttendanceReport() {

    const { data: attendance } = await supabase
  .from("attendance")
  .select("batch_id,attendance_date,status,lead_id")
  .order("attendance_date", { ascending: false });

    const { data: batches } = await supabase
      .from("batches")
      .select("id,batch_name")
      .order("start_time");
const { data: batchStudents } = await supabase
  .from("batch_students")
  .select("batch_id,lead_id,is_active")
  .eq("is_active", true);
   const uniqueDates = Array.from(
  new Set(
    (attendance || []).map(a => a.attendance_date)
  )
).sort((a:any, b:any) => b.localeCompare(a));

    setDates(uniqueDates);

    const reportRows = (batches || []).map(batch => {

     const totalStudents =
  batchStudents?.filter(
    b => b.batch_id === batch.id
  ).length || 0;

const row: any = {
  batch_name: batch.batch_name,
  total: totalStudents
};

      uniqueDates.forEach(date => {

        const presentCount =
          attendance?.filter(a =>
            a.batch_id === batch.id &&
            a.attendance_date === date &&
            a.status === "P"
          ).length || 0;

        row[date] = presentCount;
      });

      return row;
    });

    setRows(reportRows);
  }

  function formatDate(date:string) {

  const [year, month, day] = date.split("-");

  const months = [
    "Jan","Feb","Mar","Apr","May","Jun",
    "Jul","Aug","Sep","Oct","Nov","Dec"
  ];

  return `${day} ${months[Number(month) - 1]} ${year.slice(-2)}`;
}

  return (

    <div className="border rounded-lg bg-white overflow-auto">

      <table className="w-full text-sm border-collapse">

        <thead className="bg-gray-100 sticky top-0">

          <tr>

            <th className="border px-2 py-2 text-left sticky left-0 bg-gray-100">
              Batch
            </th>

            {dates.map(date => (
              <th
                key={date}
                className="border px-2 py-2 whitespace-nowrap"
              >
                {formatDate(date)}
              </th>
            ))}

          </tr>

        </thead>

        <tbody>

          {rows.map((row, index) => (

            <tr key={index}>

              <td className="border px-2 py-1 font-medium sticky left-0 bg-white">
                {row.batch_name}
              </td>

              {dates.map(date => (

               <td
  key={date}
  className={`border px-2 py-1 text-center font-medium ${
    new Date(date).getDay() === 0
      ? "bg-yellow-100 text-yellow-700"
      : row[date] === 0
      ? "text-red-600"
      : "text-green-600"
  }`}
>

  {new Date(date).getDay() === 0 ? (
    "Holiday"
  ) : (
    <>
  <span>{row[date]}</span>

  <span className="text-black">
    {" / "}
  </span>

  <span className="text-black">
    {row.total}
  </span>
</>
  )}

</td>

              ))}

            </tr>

          ))}

        </tbody>

      </table>

    </div>
  );
}