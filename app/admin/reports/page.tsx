"use client";

import { useEffect, useState } from "react";
import PermissionGuard from "@/app/components/admin/PermissionGuard";
import { supabase } from "@/lib/supabaseClient";

export default function ReportsPage() {

  const [receipts, setReceipts] = useState<any[]>([]);
  const [editRow, setEditRow] = useState<any>(null);

  const fetchReceipts = async () => {
    const { data, error } = await supabase
      .from("receipts")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error) {
      setReceipts(data || []);
    }
  };

  useEffect(() => {
    fetchReceipts();
  }, []);

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

        <h1 className="text-xl font-semibold mb-4">
          All Receipts
        </h1>

        <div className="border rounded-lg bg-white overflow-auto">

          <table className="w-full text-sm">

            <thead className="bg-gray-100">
              <tr>
                <th className="px-2 py-2 text-left">Date</th>
                <th className="px-2 py-2 text-left">Student</th>
                <th className="px-2 py-2 text-right">Amount</th>
                <th className="px-2 py-2 text-left">R. No.</th>
                <th className="px-2 py-2 text-left">Account</th>
                <th className="px-2 py-2 text-left">Mode</th>
                <th className="px-2 py-2 text-right">Total Fee</th>
                <th className="px-2 py-2 text-right">Discount</th>
                <th className="px-2 py-2 text-right">Due</th>
                <th className="px-2 py-2 text-left">Due Date</th>
                <th className="px-2 py-2 text-center">Actions</th>
              </tr>
            </thead>

            <tbody>

              {receipts.map((r:any)=>(
                <tr key={r.id} className="border-t">

                  {/* DATE */}
                  <td className="px-2 py-1">
                    {editRow?.id === r.id ? (
                      <input
                        type="date"
                        value={editRow.date || ""}
                        onChange={(e)=>setEditRow({...editRow, date:e.target.value})}
                        className="border px-1"
                      />
                    ) : formatDate(r.date)}
                  </td>

                  {/* STUDENT */}
                  <td className="px-2 py-1">
                    {editRow?.id === r.id ? (
                      <input
                        value={editRow.student_name || ""}
                        onChange={(e)=>setEditRow({...editRow, student_name:e.target.value})}
                        className="border px-1"
                      />
                    ) : r.student_name}
                  </td>

                  {/* AMOUNT */}
                  <td className="px-2 py-1 text-right">
                    {editRow?.id === r.id ? (
                      <input
                        type="number"
                        value={editRow.amount || ""}
                        onChange={(e)=>setEditRow({...editRow, amount:e.target.value})}
                        className="border px-1 w-20 text-right"
                      />
                    ) : Number(r.amount).toFixed(2)}
                  </td>

                  {/* RECEIPT NO */}
                  <td className="px-2 py-1">
                    {editRow?.id === r.id ? (
                      <input
                        value={editRow.receipt_no || ""}
                        onChange={(e)=>setEditRow({...editRow, receipt_no:e.target.value})}
                        className="border px-1"
                      />
                    ) : r.receipt_no}
                  </td>

                  {/* ACCOUNT */}
                  <td className="px-2 py-1">
                    {editRow?.id === r.id ? (
                      <input
                        value={editRow.account || ""}
                        onChange={(e)=>setEditRow({...editRow, account:e.target.value})}
                        className="border px-1"
                      />
                    ) : r.account}
                  </td>

                  {/* MODE */}
                  <td className="px-2 py-1">
                    {editRow?.id === r.id ? (
                      <input
                        value={editRow.mode || ""}
                        onChange={(e)=>setEditRow({...editRow, mode:e.target.value})}
                        className="border px-1"
                      />
                    ) : r.mode}
                  </td>

                  {/* TOTAL FEE */}
                  <td className="px-2 py-1 text-right">
                    {editRow?.id === r.id ? (
                      <input
                        type="number"
                        value={editRow.total_fee || ""}
                        onChange={(e)=>setEditRow({...editRow, total_fee:e.target.value})}
                        className="border px-1 w-20 text-right"
                      />
                    ) : Number(r.total_fee).toFixed(2)}
                  </td>

                  {/* DISCOUNT */}
                  <td className="px-2 py-1 text-right">
                    {editRow?.id === r.id ? (
                      <input
                        type="number"
                        value={editRow.discount || ""}
                        onChange={(e)=>setEditRow({...editRow, discount:e.target.value})}
                        className="border px-1 w-20 text-right"
                      />
                    ) : Number(r.discount).toFixed(2)}
                  </td>

                  {/* DUE */}
                  <td className="px-2 py-1 text-right">
                    {editRow?.id === r.id ? (
                      <input
                        type="number"
                        value={editRow.due || ""}
                        onChange={(e)=>setEditRow({...editRow, due:e.target.value})}
                        className="border px-1 w-20 text-right"
                      />
                    ) : Number(r.due).toFixed(2)}
                  </td>

                  {/* DUE DATE */}
                  <td className="px-2 py-1">
                    {editRow?.id === r.id ? (
                      <input
                        type="date"
                        value={editRow.due_date || ""}
                        onChange={(e)=>setEditRow({...editRow, due_date:e.target.value})}
                        className="border px-1"
                      />
                    ) : (Number(r.due) === 0 ? "" : formatDate(r.due_date))}
                  </td>

                  {/* ACTIONS */}
                  <td className="px-2 py-1 text-center">

                    {editRow?.id === r.id ? (
                      <>
                        <button onClick={handleUpdate} className="text-green-600 mr-2">
                          Save
                        </button>
                        <button onClick={()=>setEditRow(null)} className="text-gray-600">
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button onClick={()=>handleEditClick(r)} className="text-blue-600 mr-2">
                          Edit
                        </button>
                        <button onClick={()=>handleDelete(r.id)} className="text-red-600">
                          Delete
                        </button>
                      </>
                    )}

                  </td>

                </tr>
              ))}

            </tbody>

          </table>

        </div>

      </div>

    </PermissionGuard>

  );

}