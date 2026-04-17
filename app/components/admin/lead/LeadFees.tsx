"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

type Props = {
  receipts: any[];
  leadId: string;
  isEdit: boolean;
};

export default function LeadFees({ receipts, leadId, isEdit }: Props) {

  const [localReceipts, setLocalReceipts] = useState<any[]>([]);

  useEffect(() => {
    setLocalReceipts(receipts);
  }, [receipts]);

  const format = (num: any) => Number(num || 0).toFixed(2);

  const formatDate = (date: string) => {
    if (!date) return "";
    const d = new Date(date);
    return `${String(d.getDate()).padStart(2, "0")}-${String(
      d.getMonth() + 1
    ).padStart(2, "0")}-${d.getFullYear()}`;
  };

  const sortedReceipts = [...localReceipts].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const totalFee = sortedReceipts[0]?.total_fee || 0;
  const discount = sortedReceipts[0]?.discount || 0;

  let runningPaid = 0;
  const updatedReceipts = sortedReceipts.map((r) => {
    runningPaid += Number(r.amount || 0);
    const finalTotal = totalFee - discount;
    const newDue = Math.max(finalTotal - runningPaid, 0);

    return {
      ...r,
      liveDue: newDue,
    };
  });

  const totalPaid = updatedReceipts.reduce((s, r) => s + Number(r.amount || 0), 0);
  const totalDue = updatedReceipts[updatedReceipts.length - 1]?.liveDue || 0;

  async function updateReceipt(id: string, field: string, value: any) {

    const updated = localReceipts.map((r) =>
      r.id === id ? { ...r, [field]: value } : r
    );
    setLocalReceipts(updated);

    await supabase
      .from("receipts")
      .update({ [field]: value })
      .eq("id", id);

    const { data: allReceipts } = await supabase
      .from("receipts")
      .select("*")
      .eq("lead_id", leadId)
      .order("date", { ascending: true });

    if (!allReceipts) return;

    const totalFee = Number(allReceipts[0]?.total_fee || 0);
    const discount = Number(allReceipts[0]?.discount || 0);

    let runningPaid = 0;

    for (let r of allReceipts) {
      runningPaid += Number(r.amount || 0);
      const finalTotal = totalFee - discount;
      const newDue = Math.max(finalTotal - runningPaid, 0);

      await supabase
        .from("receipts")
        .update({
          due: newDue,
          due_date: newDue === 0 ? null : r.due_date
        })
        .eq("id", r.id);
    }
  }

  return (
    <div className="space-y-3">

      {/* SUMMARY */}
      <div className="bg-white p-3 rounded shadow flex justify-between text-sm">
        <div>
          <p>Total Fee</p>
          <b>{format(totalFee)}</b>
        </div>
        <div>
          <p>Paid</p>
          <b>{format(totalPaid)}</b>
        </div>
        <div>
          <p>Due</p>
          <b className={totalDue === 0 ? "text-green-600" : "text-red-500"}>
            {format(totalDue)}
          </b>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded shadow text-xs overflow-x-auto">
        <div className="min-w-max">

          {/* HEADER */}
          <div className="flex font-semibold border-b bg-gray-50">
            <div className="w-[90px] p-2 border-r sticky left-0 bg-white">Date</div>
            <div className="w-[100px] p-2">Amount</div>
            <div className="w-[100px] p-2">R. No.</div>
            <div className="w-[120px] p-2">Account</div>
            <div className="w-[100px] p-2">Mode</div>
            <div className="w-[100px] p-2">Total Fee</div>
            <div className="w-[100px] p-2">Discount</div>
            <div className="w-[100px] p-2">Due</div>
            <div className="w-[80px] p-2">Days</div>
            <div className="w-[120px] p-2">Due Date</div>
          </div>

          {/* BODY */}
          {updatedReceipts.map((r) => {

            const today = new Date();
            const dueDateObj = r.due_date ? new Date(r.due_date) : null;

            let days = "";
            if (r.liveDue > 0 && dueDateObj) {
              const diff = Math.ceil((dueDateObj.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
              days = String(diff);
            }

            return (
              <div key={r.id} className="flex border-b">

                {/* Date */}
                <div className="w-[90px] p-2 border-r sticky left-0 bg-white">
                  {isEdit ? (
                    <input
                      type="date"
                      defaultValue={r.date}
                      onBlur={(e)=>updateReceipt(r.id,"date",e.target.value)}
                      className="border px-1 w-full"
                    />
                  ) : formatDate(r.date)}
                </div>

                {/* Amount */}
                <div className="w-[100px] p-2">
                  {isEdit ? (
                    <input
                      defaultValue={r.amount}
                      onBlur={(e)=>updateReceipt(r.id,"amount",e.target.value)}
                      className="border px-1 w-full"
                    />
                  ) : format(r.amount)}
                </div>

                {/* Receipt No */}
                <div className="w-[100px] p-2">
                  {isEdit ? (
                    <input
                      defaultValue={r.receipt_no}
                      onBlur={(e)=>updateReceipt(r.id,"receipt_no",e.target.value)}
                      className="border px-1 w-full"
                    />
                  ) : r.receipt_no}
                </div>

                {/* Account */}
                <div className="w-[120px] p-2">
                  {isEdit ? (
                    <input
                      defaultValue={r.account}
                      onBlur={(e)=>updateReceipt(r.id,"account",e.target.value)}
                      className="border px-1 w-full"
                    />
                  ) : r.account}
                </div>

                {/* Mode */}
                <div className="w-[100px] p-2">
                  {isEdit ? (
                    <input
                      defaultValue={r.mode}
                      onBlur={(e)=>updateReceipt(r.id,"mode",e.target.value)}
                      className="border px-1 w-full"
                    />
                  ) : r.mode}
                </div>

                {/* Total Fee */}
                <div className="w-[100px] p-2">
                  {isEdit ? (
                    <input
                      defaultValue={r.total_fee}
                      onBlur={(e)=>updateReceipt(r.id,"total_fee",e.target.value)}
                      className="border px-1 w-full"
                    />
                  ) : format(r.total_fee)}
                </div>

                {/* Discount */}
                <div className="w-[100px] p-2">
                  {isEdit ? (
                    <input
                      defaultValue={r.discount}
                      onBlur={(e)=>updateReceipt(r.id,"discount",e.target.value)}
                      className="border px-1 w-full"
                    />
                  ) : format(r.discount)}
                </div>

                {/* Due */}
                <div className={`w-[100px] p-2 ${r.liveDue === 0 ? "text-green-600" : "text-red-500"}`}>
                  {format(r.liveDue)}
                </div>

                {/* Days */}
                <div className="w-[80px] p-2">
                  {r.liveDue === 0 ? "" : days}
                </div>

                {/* Due Date */}
                <div className="w-[120px] p-2">
                  {r.liveDue === 0 ? "" : (
                    isEdit ? (
                      <input
                        type="date"
                        defaultValue={r.due_date || ""}
                        onBlur={(e)=>updateReceipt(r.id,"due_date",e.target.value)}
                        className="border px-1 w-full"
                      />
                    ) : formatDate(r.due_date)
                  )}
                </div>

              </div>
            );
          })}

        </div>
      </div>

    </div>
  );
}