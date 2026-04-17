"use client";

import { Phone, MessageCircle, Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import LeadDetails from "./LeadDetails";
import LeadFees from "@/app/components/admin/lead/LeadFees";
import LeadAttendance from "@/app/components/admin/lead/LeadAttendance";
import { supabase } from "@/lib/supabaseClient";
import InlineCallingForm from "@/app/components/admin/calling/InlineCallingForm";
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
  followUps?: FollowUp[];
  lead_stage?: string;
  lead_chances?: string;
  batch_name?: string;
  gender?: string;
  age?: number;

  method?: string;
  channel?: string;
  remark?: string;
  enquired_by?: string;
  for_whom?: string;
  marital_status?: string;
  profession?: string;
  education?: string;
  school_college_job?: string;
  school_timing?: string;
  contact_time?: string;
  preferred_timing?: string;
  action?: string;
  next_follow_date?: string;
  next_follow_time?: string;
  counsellor?: string;
};

type Props = {
  lead: Lead;
  selectedIds?: string[];
  setSelectedIds?: (ids: string[]) => void;

  expandedId?: string | null;
  setExpandedId?: (id: string | null) => void;
  onSave?: () => void;
};

export default function LeadCard({
  lead,
  selectedIds,
  setSelectedIds,
  expandedId,
  setExpandedId,
  onSave
}: Props) {
  const router = useRouter();

  const [totalPaid, setTotalPaid] = useState(0);
  const [receipts, setReceipts] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("overview");

  const [callHistory, setCallHistory] = useState<any[]>([]);
  const [showRecentCall, setShowRecentCall] = useState(false);

  function toggleSelect() {
    if (!selectedIds || !setSelectedIds) return;

    if (selectedIds.includes(lead.id)) {
      setSelectedIds(selectedIds.filter((id) => id !== lead.id));
    } else {
      setSelectedIds([...selectedIds, lead.id]);
    }
  }

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

    if (data) setCallHistory(data);
  }

  async function fetchData() {
    const [receiptRes, attendanceRes] = await Promise.all([
      supabase.from("receipts").select("*").eq("student_name", lead.name),
      supabase.from("attendance").select("status, attendance_date, batch_id").eq("lead_id", lead.id),
    ]);

    const receiptData = receiptRes.data || [];
    const attendanceData = attendanceRes.data || [];

    setReceipts(receiptData);
    setTotalPaid(receiptData.reduce((s, r) => s + (r.amount || 0), 0));

    if (attendanceData.length > 0) {
      const batchIds = attendanceData.map((a) => a.batch_id);

      const { data: batches } = await supabase
        .from("batches")
        .select("id, batch_name")
        .in("id", batchIds);

      const batchMap: any = {};
      batches?.forEach((b) => (batchMap[b.id] = b.batch_name));

      setAttendance(
        attendanceData.map((a) => ({
          batch_name: batchMap[a.batch_id] || "",
          date: a.attendance_date,
          status: a.status,
        }))
      );
    } else setAttendance([]);
  }

  const genderShort =
    lead.gender?.toLowerCase() === "male"
      ? "M"
      : lead.gender?.toLowerCase() === "female"
      ? "F"
      : "-";

  const handleDelete = async () => {
    if (!confirm("Delete this lead?")) return;

    const { error } = await supabase.from("leads").delete().eq("id", lead.id);

    if (error) alert("❌ Delete failed");
    else {
      alert("✅ Lead deleted successfully");
      window.location.reload();
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-100 p-3 text-sm w-full space-y-2">

 {/* HEADER */}
<div className="flex justify-between items-start">

  <div className="flex gap-2 items-start">

    <input
      type="checkbox"
      className="mt-1"
      checked={selectedIds?.includes(lead.id) || false}
      onChange={toggleSelect}
    />

    <div className="w-full">

      <div className="font-semibold text-black text-base">
        {lead.name} {lead.age || "-"} {genderShort}
      </div>

      <div className="flex items-center justify-between gap-2 text-sm">

        {/* Mobile */}
        <div className="text-black truncate">
          {lead.mobile}
        </div>

        {/* Links */}
        <div className="flex gap-2 text-xs shrink-0">

          <a href={`tel:${lead.mobile}`} className="text-blue-600">
            Call
          </a>

          <a
            href={`https://wa.me/91${lead.mobile}`}
            target="_blank"
            className="text-green-600"
          >
            Wapp
          </a>

          <button
            onClick={() =>
              setExpandedId?.(expandedId === lead.id ? null : lead.id)
            }
            className="text-black"
          >
            Feedback
          </button>

        </div>

      </div>

    </div>

  </div>

  <div className="flex gap-3 items-center">
    <Pencil
      size={16}
      className="cursor-pointer text-blue-600"
      onClick={() => router.push(`/admin/lead/${lead.id}`)}
    />
    <Trash2
      size={16}
      className="cursor-pointer text-red-500"
      onClick={handleDelete}
    />
  </div>

</div>

{/* ✅ FORM (HEADER के बाहर, full width) */}
{expandedId === lead.id && (
  <div className="w-full mt-2 bg-gray-50 p-2 rounded-lg border">
    <InlineCallingForm
      leadId={lead.id}
      currentStatus={lead.lead_stage || ""}
      onSave={async () => {
        await fetchCalls();
        await onSave?.();
        setExpandedId?.(null);
      }}
    />
  </div>
)}
      {/* TABS */}
    <div className="flex gap-3 text-xs overflow-x-auto no-scrollbar whitespace-nowrap">
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
      <div className="max-h-[240px] overflow-y-auto space-y-1"> {/* ✅ HEIGHT FIX */}

        {activeTab === "overview" && (
          <>
            <p>
              {new Date(lead.enquiryDate).toLocaleDateString("en-GB")} | {lead.method || "-"} | {lead.channel || "-"}
            </p>

            <p>{lead.course || "Course N/A"}</p>

            <div className="flex gap-2 text-xs flex-wrap">
              {lead.lead_stage && (
                <span className="bg-green-100 px-2 rounded">{lead.lead_stage}</span>
              )}
              {lead.lead_chances && (
                <span className="bg-blue-100 px-2 rounded">{lead.lead_chances}</span>
              )}
              <span className="bg-yellow-100 px-2 rounded text-green-700">
                ₹ {totalPaid}
              </span>
            </div>

            <p>{lead.batch_name || "No Batch"}</p>

            <p className="text-gray-600 text-xs">
              {lead.remark || "No remark"}
            </p>

            <div className="border-t my-2"></div>

            {/* RECENT CALL */}
            <div className="pt-2 space-y-2">

             <div
  className={`flex justify-between items-center cursor-pointer text-xs font-medium ${
    callHistory.length > 0 ? "text-green-600" : "text-black"
  }`}
  onClick={() => setShowRecentCall(!showRecentCall)}
>
  <span>📞 Recent Call</span>
  <span>{showRecentCall ? "▲" : "▼"}</span>
</div>

              {showRecentCall && (
                <>
                  {callHistory.length === 0 && (
                    <p className="text-gray-400 text-xs">No recent call</p>
                  )}

                  {callHistory.length > 0 && (
                    <div className="text-xs space-y-1">

                      <div className="font-medium">
                        {(callHistory[0].call_date || new Date(callHistory[0].created_at).toLocaleDateString("en-GB"))}
                        {" · "}
                        {callHistory[0].call_type}
                        {" · "}
                        {callHistory[0].purpose}
                      </div>

                      <div className="grid grid-cols-2">
                        <div>{callHistory[0].result}</div>
                        <div>{callHistory[0].mood}</div>
                      </div>

                      <div className="grid grid-cols-2">
                        <div>Stage: {lead.lead_stage || "-"}</div>
                        <div>Chance: {lead.lead_chances || "-"}</div>
                      </div>

                      <div className="grid grid-cols-2">
                        <div>{callHistory[0].next_follow_up || "-"}</div>
                        <div>{callHistory[0].calling_person || "-"}</div>
                      </div>

                      {callHistory[0].remark && (
                        <div>{callHistory[0].remark}</div>
                      )}

                    </div>
                  )}
                </>
              )}

            </div>

          </>
        )}

        {activeTab === "general" && (
  <div className="space-y-1 text-xs">

    <p><b>Enquired By:</b> {lead.enquired_by || "-"}</p>
    <p><b>For:</b> {lead.for_whom || "-"}</p>
    <p><b>Marital Status:</b> {lead.marital_status || "-"}</p>
    <p><b>Profession:</b> {lead.profession || "-"}</p>
    <p><b>Education:</b> {lead.education || "-"}</p>
    <p><b>School:</b> {lead.school_college_job || "-"}</p>
    <p><b>School Time:</b> {lead.school_timing || "-"}</p>
    <p><b>Contact Time:</b> {lead.contact_time || "-"}</p>
    <p><b>Preferred Time:</b> {lead.preferred_timing || "-"}</p>
    <p><b>Action:</b> {lead.action || "-"}</p>
    <p><b>Next Follow up date:</b> {lead.next_follow_date || "-"}</p>
    <p><b>Next follow up time:</b> {lead.next_follow_time || "-"}</p>
    <p><b>Counseller:</b> {lead.counsellor || "-"}</p>

  </div>
)}
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
         <LeadFees 
  receipts={receipts} 
  leadId={lead.id} 
  isEdit={false}
/>
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
      
    </div>
  );
}