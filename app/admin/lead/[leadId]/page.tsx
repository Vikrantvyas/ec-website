"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

import LeadOverview from "@/app/components/admin/lead/LeadOverview";
import LeadFees from "@/app/components/admin/lead/LeadFees";
import LeadAttendance from "@/app/components/admin/lead/LeadAttendance";

const tabs = ["Overview", "Attendance", "Fees", "Progress", "Tests"];

export default function LeadDetailPage() {
  const params = useParams();
  const router = useRouter();
  const leadId = params.leadId as string;

  const [activeTab, setActiveTab] = useState("Overview");
  const [lead, setLead] = useState<any>(null);
  const [lastFU, setLastFU] = useState<any>(null);
  const [receipts, setReceipts] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (leadId) loadData();
  }, [leadId]);

  async function loadData() {
    setLoading(true);

    const { data: leadData } = await supabase
      .from("leads")
      .select("*")
      .eq("id", leadId)
      .single();

    const { data: fuData } = await supabase
      .from("lead_followups")
      .select("*")
      .eq("lead_id", leadId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const { data: receiptData } = await supabase
      .from("receipts")
      .select("*")
      .eq("student_name", leadData?.student_name)
      .order("date", { ascending: false });

    // 🔥 FIXED ATTENDANCE (JOIN WITH BATCHES)
    const { data: attendanceData } = await supabase
      .from("attendance")
      .select(`
        attendance_date,
        status,
        batch_id,
        batches (
          batch_name
        )
      `)
      .eq("lead_id", leadId);

    // 🔹 format data for component
    const formattedAttendance =
      attendanceData?.map((a: any) => ({
        date: a.attendance_date,
        status: a.status,
        batch_name: a.batches?.batch_name || "Batch",
      })) || [];

    setLead(leadData);
    setLastFU(fuData);
    setReceipts(receiptData || []);
    setAttendance(formattedAttendance);

    setLoading(false);
  }

  if (loading) {
    return <div className="p-5 text-center text-gray-500">Loading...</div>;
  }

  if (!lead) {
    return <div className="p-5 text-center text-red-500">Lead not found</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">

      <div className="sticky top-0 z-20">

        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 space-y-1">

          <button onClick={() => router.back()} className="text-xs underline">
            ← Back
          </button>

          <h1 className="text-lg font-semibold flex items-center gap-2">
            {lead.student_name}
            <span className="text-xs bg-yellow-400 text-black px-2 py-0.5 rounded">
              {lead.lead_stage || "New"}
            </span>
          </h1>

          <p>{lead.mobile_number}</p>
          <p className="text-xs">{lead.course} • {lead.branch}</p>

          <p className="text-xs">
            {lead.gender} | {lead.age} | {lead.area} | {lead.city}
          </p>
        </div>

        <div className="bg-white shadow-sm">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-3 text-sm border-b-2 ${
                  activeTab === tab
                    ? "border-blue-600 text-blue-600"
                    : "text-gray-500"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

      </div>

      <div className="p-3 space-y-3 text-sm">

        {activeTab === "Overview" && (
          <LeadOverview lead={lead} lastFU={lastFU} />
        )}

        {activeTab === "Fees" && (
          <LeadFees receipts={receipts} />
        )}

        {activeTab === "Attendance" && (
          <LeadAttendance attendance={attendance} />
        )}

        {activeTab !== "Overview" &&
          activeTab !== "Fees" &&
          activeTab !== "Attendance" && (
            <div className="bg-white p-4 rounded shadow text-center text-gray-400">
              Coming Soon
            </div>
          )}

      </div>

    </div>
  );
}