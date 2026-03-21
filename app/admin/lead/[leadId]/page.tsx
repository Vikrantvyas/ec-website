"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

const tabs = ["Overview", "Attendance", "Fees", "Progress", "Tests"];

type Lead = {
  id: string;
  student_name: string;
  mobile_number: string;
  course: string;
  branch: string;
  lead_stage: string;
};

export default function LeadDetailPage() {
  const params = useParams();
  const leadId = params.leadId as string;

  const [activeTab, setActiveTab] = useState("Overview");
  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (leadId) loadLead();
  }, [leadId]);

  async function loadLead() {
    setLoading(true);

    const { data, error } = await supabase
      .from("leads")
      .select("id, student_name, mobile_number, course, branch, lead_stage")
      .eq("id", leadId)
      .single();

    if (error) {
      console.log(error);
    }

    if (data) {
      setLead(data);
    }

    setLoading(false);
  }

  if (loading) {
    return (
      <div className="p-5 text-center text-gray-500">
        Loading...
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="p-5 text-center text-red-500">
        Lead not found
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* TOP */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4">
        <div className="flex items-center gap-4">
          <img
            src="https://via.placeholder.com/80"
            className="w-20 h-20 rounded-full border-2 border-white"
          />

          <div>
            <h1 className="text-lg font-semibold">
              {lead.student_name}
            </h1>
            <p className="text-sm">{lead.mobile_number}</p>
            <p className="text-xs">
              {lead.course} • {lead.branch}
            </p>

            <span className="inline-block mt-1 text-xs bg-yellow-400 text-black px-2 py-0.5 rounded">
              {lead.lead_stage || "New"}
            </span>
          </div>
        </div>
      </div>

      {/* TABS */}
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

      {/* CONTENT */}
      <div className="p-4">

        {activeTab === "Overview" && (
          <div className="bg-white p-4 rounded shadow text-sm space-y-2">
            <p><b>Name:</b> {lead.student_name}</p>
            <p><b>Mobile:</b> {lead.mobile_number}</p>
            <p><b>Course:</b> {lead.course}</p>
            <p><b>Branch:</b> {lead.branch}</p>
            <p><b>Status:</b> {lead.lead_stage}</p>
          </div>
        )}

        {activeTab === "Attendance" && (
          <div className="bg-white p-4 rounded shadow text-sm">
            Coming Soon
          </div>
        )}

        {activeTab === "Fees" && (
          <div className="bg-white p-4 rounded shadow text-sm">
            Coming Soon
          </div>
        )}

        {activeTab === "Progress" && (
          <div className="bg-white p-4 rounded shadow text-sm">
            Coming Soon
          </div>
        )}

        {activeTab === "Tests" && (
          <div className="bg-white p-4 rounded shadow text-sm">
            Coming Soon
          </div>
        )}

      </div>

    </div>
  );
}