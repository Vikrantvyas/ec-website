"use client";

import { useEffect, useState } from "react";
import PermissionGuard from "@/app/components/admin/PermissionGuard";
import { supabase } from "@/lib/supabaseClient";
import AttendanceReport from "@/app/admin/reports/AttendanceReport";
export default function ReportsPage() {

  const [receipts, setReceipts] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [editRow, setEditRow] = useState<any>(null);

  const [search, setSearch] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [sortField, setSortField] = useState<string>("date");
  const [sortAsc, setSortAsc] = useState<boolean>(false);
const [reportType, setReportType] = useState("receipts");

  const fetchReceipts = async () => {

    const { count } = await supabase
      .from("receipts")
      .select("*", { count: "exact", head: true });

    setTotalCount(count || 0);

    let allData: any[] = [];
    let from = 0;
    let to = 999;

    while (true) {
      const { data, error } = await supabase
        .from("receipts")
        .select("*")
        .order("date", { ascending: false })
        .range(from, to);

      if (error || !data || data.length === 0) break;

      allData = [...allData, ...data];

      if (data.length < 1000) break;

      from += 1000;
      to += 1000;
    }

    setReceipts(allData);
  };

  useEffect(() => {
    fetchReceipts();
  }, []);

  const handleSort = (field: string) => {
    if (sortField === field) setSortAsc(!sortAsc);
    else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const filteredData = receipts.filter((r:any)=>{

    const nameMatch = r.student_name?.toLowerCase().includes(search.toLowerCase());

    const receiptDate = r.date ? new Date(r.date) : null;

const fromMatch = fromDate ? (receiptDate && receiptDate >= new Date(fromDate)) : true;
const toMatch = toDate ? (receiptDate && receiptDate <= new Date(toDate)) : true;

    return nameMatch && fromMatch && toMatch;
  });

  const sortedData = [...filteredData].sort((a:any,b:any)=>{

    let valA = a[sortField];
    let valB = b[sortField];

    if (!valA) return 1;
    if (!valB) return -1;

    if (["date","due_date"].includes(sortField)){
      return sortAsc
        ? new Date(valA).getTime() - new Date(valB).getTime()
        : new Date(valB).getTime() - new Date(valA).getTime();
    }

    if (!isNaN(valA) && !isNaN(valB)){
      return sortAsc ? Number(valA)-Number(valB) : Number(valB)-Number(valA);
    }

    return sortAsc
      ? valA.toString().localeCompare(valB.toString())
      : valB.toString().localeCompare(valA.toString());
  });

  const formatDate = (date: string) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("en-GB");
  };

  const handleDelete = async (id: number) => {
    await supabase.from("receipts").delete().eq("id", id);
    fetchReceipts();
  };

  const handleEditClick = (row: any) => {
    setEditRow({ ...row });
  };

  const handleUpdate = async () => {
    await supabase
      .from("receipts")
      .update(editRow)
      .eq("id", editRow.id);

    setEditRow(null);
    fetchReceipts();
  };

  return (

    <PermissionGuard page="Reports">

      <div className="p-4">

        <div className="flex items-center justify-between mb-4">

  <h1 className="text-xl font-semibold">
    {reportType === "receipts"
      ? `All Receipts (${totalCount})`
      : "Attendance Report"}
  </h1>

  <div className="flex gap-2">

    <button
      onClick={() => setReportType("receipts")}
      className={`px-3 py-1 rounded border text-sm ${
        reportType === "receipts"
          ? "bg-blue-600 text-white"
          : "bg-white"
      }`}
    >
      Receipts
    </button>

    <button
      onClick={() => setReportType("attendance")}
      className={`px-3 py-1 rounded border text-sm ${
        reportType === "attendance"
          ? "bg-green-600 text-white"
          : "bg-white"
      }`}
    >
      Attendance
    </button>

  </div>

</div>

        {reportType === "receipts" && (

  <div className="flex gap-2 mb-4 flex-wrap">

    <input
      placeholder="Search student..."
      value={search}
      onChange={(e)=>setSearch(e.target.value)}
      className="border px-2 py-1 w-[200px]"
    />

    <input
      type="date"
      value={fromDate}
      onChange={(e)=>setFromDate(e.target.value)}
      className="border px-2 py-1"
    />

    <input
      type="date"
      value={toDate}
      onChange={(e)=>setToDate(e.target.value)}
      className="border px-2 py-1"
    />

    <button
      onClick={()=>{setSearch("");setFromDate("");setToDate("");}}
      className="bg-gray-200 px-3 py-1"
    >
      Reset
    </button>

  </div>

)}
{reportType === "attendance" && (
  <AttendanceReport />
)}
        {reportType === "receipts" && (
<div className="border rounded-lg bg-white overflow-auto">

          <table className="w-full text-sm">

            <thead className="bg-gray-100">
              <tr>
                <th onClick={()=>handleSort("date")} className="px-2 py-2 cursor-pointer">Date</th>
                <th onClick={()=>handleSort("student_name")} className="px-2 py-2 cursor-pointer">Student</th>
                <th onClick={()=>handleSort("amount")} className="px-2 py-2 cursor-pointer text-right">Amount</th>
                <th onClick={()=>handleSort("receipt_no")} className="px-2 py-2 cursor-pointer">R. No.</th>
                <th onClick={()=>handleSort("account")} className="px-2 py-2 cursor-pointer">Account</th>
                <th onClick={()=>handleSort("mode")} className="px-2 py-2 cursor-pointer">Mode</th>
                <th className="px-2 py-2 text-right">Total Fee</th>
                <th className="px-2 py-2 text-right">Discount</th>
                <th className="px-2 py-2 text-right">Due</th>
                <th onClick={()=>handleSort("due_date")} className="px-2 py-2 cursor-pointer">Due Date</th>
                <th className="px-2 py-2 text-center">Actions</th>
              </tr>
            </thead>

            <tbody>

              {sortedData.map((r:any, index:number)=>(
                <tr key={r.id+"-"+index} className="border-t">

                  {/* DATE */}
                  <td className="px-2 py-1">
                    {editRow?.id === r.id ? (
                      <input type="date" value={editRow.date || ""}
                        onChange={(e)=>setEditRow({...editRow, date:e.target.value})}
                        className="border px-1 w-[110px]" />
                    ) : formatDate(r.date)}
                  </td>

                  {/* STUDENT */}
                  <td className="px-2 py-1">
                    {editRow?.id === r.id ? (
                      <input value={editRow.student_name || ""}
                        onChange={(e)=>setEditRow({...editRow, student_name:e.target.value})}
                        className="border px-1 w-[150px]" />
                    ) : r.student_name}
                  </td>

                  {/* AMOUNT */}
                  <td className="px-2 py-1 text-right">
                    {editRow?.id === r.id ? (
                      <input type="number" value={editRow.amount || ""}
                        onChange={(e)=>setEditRow({...editRow, amount:Number(e.target.value)})}
                        className="border px-1 w-[90px] text-right" />
                    ) : Number(r.amount).toFixed(2)}
                  </td>

                  {/* RECEIPT NO */}
                  <td className="px-2 py-1">
                    {editRow?.id === r.id ? (
                      <input value={editRow.receipt_no || ""}
                        onChange={(e)=>setEditRow({...editRow, receipt_no:e.target.value})}
                        className="border px-1 w-[80px]" />
                    ) : r.receipt_no}
                  </td>

                  {/* ACCOUNT */}
                  <td className="px-2 py-1">
                    {editRow?.id === r.id ? (
                      <input value={editRow.account || ""}
                        onChange={(e)=>setEditRow({...editRow, account:e.target.value})}
                        className="border px-1 w-[90px]" />
                    ) : r.account}
                  </td>

                  {/* MODE */}
                  <td className="px-2 py-1">
                    {editRow?.id === r.id ? (
                      <input value={editRow.mode || ""}
                        onChange={(e)=>setEditRow({...editRow, mode:e.target.value})}
                        className="border px-1 w-[80px]" />
                    ) : r.mode}
                  </td>

                  {/* TOTAL */}
                  <td className="px-2 py-1 text-right">{Number(r.total_fee).toFixed(2)}</td>
                  <td className="px-2 py-1 text-right">{Number(r.discount).toFixed(2)}</td>
                  <td className="px-2 py-1 text-right">{Number(r.due).toFixed(2)}</td>

                  {/* DUE DATE */}
                  <td className="px-2 py-1">
                    {editRow?.id === r.id ? (
                      <input type="date" value={editRow.due_date || ""}
                        onChange={(e)=>setEditRow({...editRow, due_date:e.target.value})}
                        className="border px-1 w-[120px]" />
                    ) : (Number(r.due)===0?"":formatDate(r.due_date))}
                  </td>

                  {/* ACTION */}
                  <td className="px-2 py-1 text-center whitespace-nowrap">
                    {editRow?.id === r.id ? (
                      <>
                        <button onClick={handleUpdate} className="text-green-600 mr-2">Save</button>
                        <button onClick={()=>setEditRow(null)} className="text-gray-600">Cancel</button>
                      </>
                    ) : (
                      <>
                        <button onClick={()=>handleEditClick(r)} className="text-blue-600 mr-2">Edit</button>
                        <button onClick={()=>handleDelete(r.id)} className="text-red-600">Delete</button>
                      </>
                    )}
                  </td>

                </tr>
              ))}

            </tbody>

          </table>

                </div>
)}

      </div>

    </PermissionGuard>

  );

}