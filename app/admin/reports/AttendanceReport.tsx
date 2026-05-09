"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function AttendanceReport() {

  const [rows, setRows] = useState<any[]>([]);
  const [dates, setDates] = useState<string[]>([]);
const [branches, setBranches] = useState<any[]>([]);
const [selectedBranches, setSelectedBranches] = useState<string[]>([]);
const [showBranchDropdown, setShowBranchDropdown] = useState(false);
const dropdownRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
  loadAttendanceReport();
}, [selectedBranches]);
useEffect(() => {

  function handleClickOutside(event:any) {

    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target)
    ) {
      setShowBranchDropdown(false);
    }
  }

  document.addEventListener("mousedown", handleClickOutside);

  return () => {
    document.removeEventListener(
      "mousedown",
      handleClickOutside
    );
  };

}, []);
  async function loadAttendanceReport() {

    const { data: attendance } = await supabase
  .from("attendance")
  .select("batch_id,attendance_date,status,lead_id")
  .order("attendance_date", { ascending: false });

    const { data: branchesData } = await supabase
  .from("branches")
  .select("id,name")
  .eq("status", "Active")
  .order("name");

setBranches(branchesData || []);

const { data: batches } = await supabase
  .from("batches")
  .select("id,batch_name,branch_id")
  .order("start_time");
const { data: batchStudents } = await supabase
  .from("batch_students")
  .select("batch_id,lead_id,is_active")
  .eq("is_active", true);
   const attendanceDates = Array.from(
  new Set(
    (attendance || []).map(a => a.attendance_date)
  )
).sort((a:any, b:any) => b.localeCompare(a));

const uniqueDates:string[] = [];

if (attendanceDates.length > 0) {

  const latest = new Date(attendanceDates[0]);
  const oldest = new Date(attendanceDates[attendanceDates.length - 1]);

  const current = new Date(latest);

  while (current >= oldest) {

    const yyyy = current.getFullYear();

    const mm = String(current.getMonth() + 1).padStart(2, "0");

    const dd = String(current.getDate()).padStart(2, "0");

    uniqueDates.push(`${yyyy}-${mm}-${dd}`);

    current.setDate(current.getDate() - 1);
  }
}

    setDates(uniqueDates);

    const filteredBatches =
  selectedBranches.length === 0
    ? (batches || [])
    : (batches || []).filter(batch =>
        selectedBranches.includes(batch.branch_id)
      );

const reportRows = filteredBatches.map(batch => {

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

    <div className="border border-gray-300 rounded-lg bg-white h-[560px]">
  <div className="overflow-auto h-full">
      <table className="w-full h-full text-sm border-separate border-spacing-0">

        <thead className="bg-gray-100">

          <tr>

            <th className="border border-gray-300 px-2 py-2 text-left sticky left-0 bg-gray-100 min-w-[220px] overflow-visible z-50">

  <div className="flex items-center justify-between gap-2">

    
    <div
  ref={dropdownRef}
  className="relative inline-block"
>
      <button
        onClick={() =>
          setShowBranchDropdown(!showBranchDropdown)
        }
        className="border border-gray-300 bg-white px-2 py-[2px] rounded text-xs"
      >
        Branch
      </button>

      {showBranchDropdown && (

        <div className="absolute left-0 top-8 bg-white border border-gray-300 rounded shadow-lg z-[99999] min-w-[180px] max-h-[250px] overflow-auto">

          {branches.map(branch => (

            <label
              key={branch.id}
              className="flex items-center gap-2 px-3 py-2 text-xs hover:bg-gray-100 cursor-pointer"
            >

              <input
                type="checkbox"
                checked={selectedBranches.includes(branch.id)}
                onChange={(e) => {

                  if (e.target.checked) {

                    setSelectedBranches(prev => [
                      ...prev,
                      branch.id
                    ]);

                  } else {

                    setSelectedBranches(prev =>
                      prev.filter(id => id !== branch.id)
                    );
                  }
                }}
              />

              <span>{branch.name}</span>

            </label>

          ))}

        </div>

      )}

    </div>

  </div>

</th>

            {dates.map(date => (
              <th
  key={date}
  className={`border border-gray-300 px-2 py-2 whitespace-nowrap ${
    new Date(date).getDay() === 0
      ? "bg-yellow-100 text-yellow-700"
      : ""
  }`}
>
                {formatDate(date)}
              </th>
            ))}

          </tr>
        </thead>

        <tbody className="align-top h-full">

          {rows.map((row, index) => (
            <tr key={index}>

              <td className="border border-gray-300 px-2 py-1 font-medium sticky left-0 bg-white z-10">
                {row.batch_name}
              </td>

              {dates.map(date => (

               <td
  key={date}
  className={`border border-gray-300 px-2 py-1 text-center font-medium ${
  new Date(date).getDay() === 0
    ? "bg-yellow-100 text-yellow-700"
    : row[date] === 0
    ? "text-red-600"
    : "text-green-600"
} border-gray-300`}
  
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
{rows.length < 12 &&
  Array.from({ length: 12 - rows.length }).map((_, i) => (

    <tr key={`empty-${i}`} className="h-[38px]">

     <td className="border border-gray-300 bg-white"></td>

      {dates.map(date => (

        <td
          key={date}
          className={`border border-gray-300 h-[38px] ${
            new Date(date).getDay() === 0
              ? "bg-yellow-50"
              : "bg-white"
          }`}
        ></td>

      ))}

    </tr>

))}
        </tbody>

      </table>
  </div>
</div>
  );
}