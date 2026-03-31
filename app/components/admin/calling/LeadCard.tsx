"use client";

import { Phone, MessageCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
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
  followUps: FollowUp[];
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

  useEffect(() => {
    fetchData();
  }, [lead.id]);

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
    }
  }

  const genderShort =
    lead.gender?.toLowerCase() === "male"
      ? "M"
      : lead.gender?.toLowerCase() === "female"
      ? "F"
      : "-";

  return (
    <div className="bg-white rounded shadow-sm p-3 text-sm w-full space-y-2">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div className="font-medium text-blue-600">
          {lead.name} {lead.age || "-"} {genderShort}
        </div>

        <div className="flex gap-3 text-blue-600">
          <a href={`tel:${lead.mobile}`}>
            <Phone size={16} />
          </a>

          <a href={`https://wa.me/91${lead.mobile}`} target="_blank">
            <MessageCircle size={16} />
          </a>

          <span
            className="cursor-pointer text-xs"
            onClick={() => router.push(`/admin/calling/${lead.id}`)}
          >
            CF
          </span>
        </div>
      </div>

      {/* TABS */}
      <div className="flex gap-3 text-xs overflow-x-auto">
        {[
          "overview",
          "general",
          "contacts",
          "attendance",
          "fees",
          "callhistory",
        ].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-2 py-1 rounded whitespace-nowrap ${
              activeTab === tab
                ? "bg-blue-600 text-white"
                : "bg-gray-100"
            }`}
          >
            {tab === "callhistory" ? "CALL HISTORY" : tab.toUpperCase()}
          </button>
        ))}
      </div>

      {/* TAB CONTENT */}
      <div className="h-[120px] overflow-y-auto space-y-1">

        {activeTab === "overview" && (
          <>
            <p>
              {new Date(lead.enquiryDate).toLocaleDateString("en-GB")} (
              {lead.followUps.length} Calls)
            </p>

            <p>{lead.course || "Course N/A"}</p>

            <div className="flex gap-2 text-xs">
              {lead.lead_stage && (
                <span className="bg-green-100 px-2 rounded">
                  {lead.lead_stage}
                </span>
              )}
              {lead.lead_chances && (
                <span className="bg-blue-100 px-2 rounded">
                  {lead.lead_chances}
                </span>
              )}
            </div>

            <p className="text-green-700">
              Total Paid: {totalPaid}
            </p>

            <p>{lead.batch_name || "No Batch"}</p>
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

        {/* ✅ FINAL WORKING CALL HISTORY */}
        {activeTab === "callhistory" && (
          <div className="space-y-1">
            {lead.followUps && lead.followUps.length === 0 && (
              <p className="text-gray-400">No history</p>
            )}

            {lead.followUps &&
              lead.followUps.map((fu, i) => (
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
    </div>
  );
}