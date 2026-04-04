"use client";

import { Phone, MessageCircle, Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import LeadDetails from "./LeadDetails";
import LeadFees from "@/app/components/admin/lead/LeadFees";
import LeadAttendance from "@/app/components/admin/lead/LeadAttendance";
import { supabase } from "@/lib/supabaseClient";

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

  const [latestCall, setLatestCall] = useState<any>(null);
  const [callHistory, setCallHistory] = useState<any[]>([]);

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

    if (data && data.length > 0) {
      setLatestCall(data[0]);
      setCallHistory(data);
    }
  }

  async function fetchData() {
    const { data: receiptData } = await supabase
      .from("receipts")
      .select("*")
      .eq("student_name", lead.name);

    if (receiptData) {
      setReceipts(receiptData);
      const total = receiptData.reduce((s, r) => s + (r.amount || 0), 0);
      setTotalPaid(total);
    }

    const { data: attendanceData } = await supabase
      .from("attendance")
      .select("status, attendance_date, batch_id")
      .eq("lead_id", lead.id);

    if (attendanceData) {
      setAttendance(attendanceData);
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

        {/* ✅ NAME BLACK + BIG */}
        <div className="font-semibold text-black text-base">
          {lead.name} {lead.age || "-"} {genderShort}
        </div>

        {/* ✅ EDIT + DELETE */}
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
            <p>{new Date(lead.enquiryDate).toLocaleDateString("en-GB")}</p>

            <p>{lead.course || "Course N/A"}</p>

            <p className="text-green-700">Total Paid: {totalPaid}</p>

            <div className="border-t pt-1 mt-1">
              {latestCall ? (
                <>
                  <p className="text-xs text-gray-500">
                    {new Date(latestCall.call_date || latestCall.created_at).toLocaleDateString("en-GB")}
                  </p>
                  <p className="font-medium text-xs">{latestCall.result}</p>
                  <p className="text-gray-600 text-xs">{latestCall.remark}</p>
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
            {callHistory.length === 0 && (
              <p className="text-gray-400">No history</p>
            )}

            {callHistory.map((h, i) => (
              <div key={i} className="border-b pb-1">
                <p className="text-xs text-gray-500">
                  {new Date(h.call_date || h.created_at).toLocaleDateString("en-GB")}
                </p>
                <p className="font-medium">{h.result}</p>
                <p className="text-gray-600">{h.remark}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ✅ BOTTOM ACTION BUTTONS */}
      <div className="flex gap-2 pt-2 border-t">

        <a
          href={`tel:${lead.mobile}`}
          className="flex-1 text-center bg-blue-600 text-white py-2 rounded text-sm"
        >
          📞 Call
        </a>

        <a
          href={`https://wa.me/91${lead.mobile}`}
          target="_blank"
          className="flex-1 text-center bg-green-600 text-white py-2 rounded text-sm"
        >
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