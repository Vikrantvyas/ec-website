"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

const tabs = ["Overview", "Attendance", "Fees", "Progress", "Tests"];

export default function LeadDetailPage() {
  const params = useParams();
  const leadId = params.leadId as string;

  const [activeTab, setActiveTab] = useState("Overview");
  const [lead, setLead] = useState<any>(null);
  const [lastFU, setLastFU] = useState<any>(null);
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

    setLead(leadData);
    setLastFU(fuData);

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

      {/* 🔹 TOP CARD (UPDATED) */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 space-y-1">
        <h1 className="text-lg font-semibold">{lead.student_name}</h1>
        <p>{lead.mobile_number}</p>
        <p className="text-xs">{lead.course} • {lead.branch}</p>

        <p className="text-xs mt-1">
          {lead.gender} | {lead.age} | {lead.area} | {lead.city}
        </p>

        <span className="inline-block mt-1 text-xs bg-yellow-400 text-black px-2 py-0.5 rounded">
          {lead.lead_stage || "New"}
        </span>
      </div>

      {/* 🔹 TABS */}
      <div className="bg-white sticky top-0 z-10 shadow-sm">
        <div className="flex overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 text-sm whitespace-nowrap border-b-2 ${
                activeTab === tab
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* 🔹 CONTENT */}
      <div className="p-3 space-y-3 text-sm">

        {activeTab === "Overview" && (
          <>

            {/* 1️⃣ ENQUIRY CARD */}
            <div className="bg-white p-3 rounded shadow space-y-1">
              <p><b>Date:</b> {lead.enquiry_date} | <b>Time:</b> {lead.enquiry_time}</p>
              <p><b>Method:</b> {lead.method} | <b>Channel:</b> {lead.channel}</p>
              <p><b>Enquired By:</b> {lead.enquired_by}</p>
              <p><b>For:</b> {lead.for_whom}</p>
            </div>

            {/* 2️⃣ COURSE CARD */}
            <div className="bg-white p-3 rounded shadow space-y-1">
              <p><b>Department:</b> {lead.department}</p>
              <p><b>Course:</b> {lead.course}</p>
            </div>

            {/* 3️⃣ PERSONAL FULL DATA */}
            <div className="bg-white p-3 rounded shadow space-y-1">
              <p><b>Alt Number:</b> {lead.alternate_number}</p>
              <p><b>Profession:</b> {lead.profession}</p>
              <p><b>Education:</b> {lead.education}</p>
              <p><b>Marital:</b> {lead.marital_status}</p>
              <p><b>School/Job:</b> {lead.school_college_job}</p>
              <p><b>School Timing:</b> {lead.school_timing}</p>
              <p><b>Contact Time:</b> {lead.contact_time}</p>
            </div>

            {/* 4️⃣ STATUS CARD */}
            <div className="bg-white p-3 rounded shadow space-y-1">
              <p><b>Stage:</b> {lead.lead_stage}</p>
              <p><b>Chances:</b> {lead.lead_chances}</p>
              <p><b>Counsellor:</b> {lead.counsellor}</p>
              <p><b>Next Follow:</b> {lead.next_follow_date} {lead.next_follow_time}</p>
              <p><b>Action:</b> {lead.action}</p>
              <p><b>Remark:</b> {lead.remark}</p>
            </div>

            {/* 5️⃣ LAST FOLLOW-UP */}
            {lastFU && (
              <div className="bg-white p-3 rounded shadow space-y-1">
                <p><b>Last Call:</b> {new Date(lastFU.created_at).toLocaleDateString()}</p>
                <p><b>Result:</b> {lastFU.result}</p>
                {lastFU.mood && <p><b>Mood:</b> {lastFU.mood}</p>}
                {lastFU.remark && <p><b>Remark:</b> {lastFU.remark}</p>}
              </div>
            )}

            {/* 6️⃣ ACTION */}
            <div className="bg-white p-3 rounded shadow flex justify-around text-blue-600">
              <a href={`tel:${lead.mobile_number}`}>Call</a>
              <a href={`https://wa.me/91${lead.mobile_number}`} target="_blank">
                WhatsApp
              </a>
            </div>

          </>
        )}

        {activeTab !== "Overview" && (
          <div className="bg-white p-4 rounded shadow text-center text-gray-400">
            Coming Soon
          </div>
        )}

      </div>

    </div>
  );
}