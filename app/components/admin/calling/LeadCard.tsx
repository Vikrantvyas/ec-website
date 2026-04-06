"use client";

import { Phone, MessageCircle, Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import LeadDetails from "./LeadDetails";
import LeadFees from "@/app/components/admin/lead/LeadFees";
import LeadAttendance from "@/app/components/admin/lead/LeadAttendance";
import { supabase } from "@/lib/supabaseClient";

type FollowUp = {
  date: string;
  note: string;
  type: string;
};

type Lead = {
  id: string;
  name: string;
  mobile: string;
  alternate_number?: string;
  email?: string;
  area?: string;
  city?: string;
  address?: string;
  permanent_address?: string;

  course: string;
  enquiryDate: string;
  followUps?: FollowUp[]; // ✅ OLD SUPPORT
  lead_stage?: string;
  lead_chances?: string;
  batch_name?: string;
  gender?: string;
  age?: number;
};

type Props = {
  lead: Lead;
};

export default function LeadCard({ lead }: Props) {
  const router = useRouter();

  const [totalPaid, setTotalPaid] = useState(0);
  const [receipts, setReceipts] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("overview");

  const [callHistory, setCallHistory] = useState<any[]>([]);

  // ✅ HYBRID SYSTEM
  const sortedFollowUps = useMemo(() => {
    if (lead.followUps && lead.followUps.length > 0) {
      return [...lead.followUps].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
    }

    return callHistory.map((f: any) => ({
      date: f.call_date || f.created_at,
      type: f.result,
      note: f.remark,
    }));
  }, [lead.followUps, callHistory]);

  useEffect(() => {
    fetchData();
    fetchCalls();
  }, [lead.id]);

  async function fetchCalls() {
    const { data } = await supabase
      .from("lead_followups")
      .select("*")
      .eq("lead_id", lead.id)
      .order("created_at", { ascending: false });

    if (data) {
      setCallHistory(data);
    }
  }

  async function fetchData() {
  // 👉 1. PARALLEL FETCH
  const [receiptRes, attendanceRes] = await Promise.all([
    supabase
      .from("receipts")
      .select("*")
      .eq("student_name", lead.name),

    supabase
      .from("attendance")
      .select("status, attendance_date, batch_id")
      .eq("lead_id", lead.id),
  ]);

  const receiptData = receiptRes.data || [];
  const attendanceData = attendanceRes.data || [];

  // 👉 2. RECEIPTS SAFE
  setReceipts(receiptData);
  const total = receiptData.reduce((s, r) => s + (r.amount || 0), 0);
  setTotalPaid(total);

  // 👉 3. ATTENDANCE SAFE
  if (attendanceData.length > 0) {
    const batchIds = attendanceData.map((a) => a.batch_id);

    const { data: batches } = await supabase
      .from("batches")
      .select("id, batch_name")
      .in("id", batchIds);

    const batchMap: any = {};
    batches?.forEach((b) => {
      batchMap[b.id] = b.batch_name;
    });

    const formatted = attendanceData.map((a) => ({
      batch_name: batchMap[a.batch_id] || "",
      date: a.attendance_date,
      status: a.status,
    }));

    setAttendance(formatted);
  } else {
    setAttendance([]); // ✅ prevent stale data
  }
}

  const genderShort =
    lead.gender?.toLowerCase() === "male"
      ? "M"
      : lead.gender?.toLowerCase() === "female"
      ? "F"
      : "-";

  const handleDelete = async () => {
    if (!confirm("Delete this lead?")) return;
    await supabase.from("leads").delete().eq("id", lead.id);
    router.refresh();
  };

  return (
    <div className="bg-white rounded shadow-sm p-3 text-sm w-full space-y-2">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div className="font-semibold text-black text-base">
          {lead.name} {lead.age || "-"} {genderShort}
        </div>

        <div className="flex gap-3 items-center">
          <Pencil
            size={16}
            className="cursor-pointer text-blue-600"
            onClick={() => router.push(`/admin/leads/${lead.id}`)}
          />
          <Trash2
            size={16}
            className="cursor-pointer text-red-500"
            onClick={handleDelete}
          />
        </div>
      </div>

      {/* TABS */}
      <div className="flex gap-3 text-xs overflow-x-auto">
        {["overview", "general", "contacts", "attendance", "fees", "callhistory"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-2 py-1 rounded whitespace-nowrap ${
              activeTab === tab ? "bg-blue-600 text-white" : "bg-gray-100"
            }`}
          >
            {tab === "callhistory" ? "CALL HISTORY" : tab.toUpperCase()}
          </button>
        ))}
      </div>

      {/* CONTENT */}
      <div className="h-[240px] overflow-y-auto space-y-1">

        {activeTab === "overview" && (
          <>
            <p>
              {new Date(lead.enquiryDate).toLocaleDateString("en-GB")} (
              {sortedFollowUps.length} Calls)
            </p>

            <p>{lead.course || "Course N/A"}</p>

            <div className="flex gap-2 text-xs">
              {lead.lead_stage && (
                <span className="bg-green-100 px-2 rounded">{lead.lead_stage}</span>
              )}
              {lead.lead_chances && (
                <span className="bg-blue-100 px-2 rounded">{lead.lead_chances}</span>
              )}
            </div>

            <p className="text-green-700">Total Paid: {totalPaid}</p>

            <p>{lead.batch_name || "No Batch"}</p>

            {/* ✅ LATEST CALL */}
            <div className="border-t pt-1 mt-1">
              {sortedFollowUps.length > 0 ? (
                <>
                  <p className="text-xs text-gray-500">
                    {new Date(sortedFollowUps[0].date).toLocaleDateString("en-GB")}
                  </p>
                  <p className="font-medium text-xs">{sortedFollowUps[0].type}</p>
                  <p className="text-gray-600 text-xs line-clamp-1">
                    {sortedFollowUps[0].note}
                  </p>
                </>
              ) : (
                <p className="text-gray-400 text-xs">No recent call</p>
              )}
            </div>
          </>
        )}

        {activeTab === "general" && <LeadDetails lead={lead} />}

        {activeTab === "contacts" && (
          <div className="space-y-1">
            <p>Mobile: {lead.mobile}</p>
            <p>Alt No: {lead.alternate_number || "-"}</p>
            <p>Email: {lead.email || "-"}</p>
            <p>Area: {lead.area || "-"}</p>
            <p>City: {lead.city || "-"}</p>
            <p>Local Address: {lead.address || "-"}</p>
            <p>Permanent Address: {lead.permanent_address || "-"}</p>
          </div>
        )}

        {activeTab === "attendance" && (
          <LeadAttendance attendance={attendance} />
        )}

        {activeTab === "fees" && (
          <LeadFees receipts={receipts} />
        )}

        {activeTab === "callhistory" && (
          <div className="space-y-1">
            {sortedFollowUps.length === 0 && (
              <p className="text-gray-400">No history</p>
            )}

            {sortedFollowUps.map((fu, i) => (
              <div key={i} className="border-b pb-1">
                <p className="text-xs text-gray-500">
                  {new Date(fu.date).toLocaleDateString("en-GB")}
                </p>
                <p className="font-medium">{fu.type}</p>
                <p className="text-gray-600">{fu.note}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ACTION BUTTONS */}
      <div className="flex gap-2 pt-2 border-t">
        <a href={`tel:${lead.mobile}`} className="flex-1 text-center bg-blue-600 text-white py-2 rounded text-sm">
          📞 Call
        </a>

        <a href={`https://wa.me/91${lead.mobile}`} target="_blank" className="flex-1 text-center bg-green-600 text-white py-2 rounded text-sm">
          💬 WhatsApp
        </a>

        <button
          onClick={() => router.push(`/admin/calling/${lead.id}`)}
          className="flex-1 text-center bg-black text-white py-2 rounded text-sm"
        >
          📝 Feedback
        </button>
      </div>
    </div>
  );
}