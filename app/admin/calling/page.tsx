"use client";

import { useState, useMemo, useEffect } from "react";
import PermissionGuard from "@/app/components/admin/PermissionGuard";
import LeadCard from "@/app/components/admin/calling/LeadCard";
import { supabase } from "@/lib/supabaseClient";

type FollowUp = {
  date: string;
  note: string;
  type: string;
  mood?: string;
};

type AttendanceSignal = "P" | "A" | "N";

type Lead = {
  id: string;
  name: string;
  gender: "Male" | "Female";
  mobile: string;
  course: string;
  branch: string;
  status: string;
  enquiryDate: string;
  followUps: FollowUp[];
  attendanceLast10: AttendanceSignal[];
};

type Branch = {
  id: string;
  name: string;
};

export default function CallingPage() {

  const [leads, setLeads] = useState<Lead[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<string>("All");

  useEffect(() => {
    initPage();
  }, []);

  async function initPage() {

    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) return;

    const userEmail = sessionData.session.user.email;

    const { data: userData } = await supabase
      .from("users")
      .select("role_id")
      .eq("email", userEmail)
      .single();

    if (!userData) return;

    const { data: roleData } = await supabase
      .from("roles")
      .select("branch_access")
      .eq("id", userData.role_id)
      .single();

    await loadBranches(roleData?.branch_access || []);
    await loadLeads(roleData?.branch_access || []);
  }

  async function loadBranches(access: string[]) {

    let query = supabase
      .from("branches")
      .select("id,name")
      .order("name");

    if (access.length) {
      query = query.in("name", access);
    }

    const { data } = await query;

    setBranches(data || []);
  }

  async function loadLeads(access: string[]) {

    let query = supabase
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false });

    if (access.length) {
      query = query.in("branch", access);
    }

    const { data } = await query;
    if (!data) return;

    const leadIds = data.map((l: any) => l.id);

    const { data: followups } = await supabase
      .from("lead_followups")
      .select("*")
      .in("lead_id", leadIds)
      .order("created_at", { ascending: false });

    const followupMap: any = {};

    followups?.forEach((f: any) => {
      if (!followupMap[f.lead_id]) followupMap[f.lead_id] = [];
      followupMap[f.lead_id].push({
        date: f.created_at,
        type: f.result,
        mood: f.mood,
        note: f.remark,
      });
    });

    const today = new Date();
    const last10Dates: string[] = [];

    for (let i = 0; i < 10; i++) {
      const d = new Date();
      d.setDate(today.getDate() - i);

      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");

      last10Dates.push(`${yyyy}-${mm}-${dd}`);
    }

    const { data: attendanceData } = await supabase
      .from("attendance")
      .select("lead_id, attendance_date, status")
      .in("lead_id", leadIds)
      .in("attendance_date", last10Dates);

    const attendanceMap: any = {};

    attendanceData?.forEach((a: any) => {
      if (!attendanceMap[a.lead_id]) attendanceMap[a.lead_id] = {};
      attendanceMap[a.lead_id][a.attendance_date] = a.status;
    });

    const formatted: Lead[] = data.map((l: any) => {

      const last10 = last10Dates.map((date) => {
        return attendanceMap[l.id]?.[date] || "N";
      });

      return {
        id: l.id,
        name: l.student_name || "",
        gender: l.gender || "Male",
        mobile: l.mobile || "",
        course: l.course || "",
        branch: l.branch || "",
        status: l.status || "Cold",
        enquiryDate: l.created_at,
        followUps: followupMap[l.id] || [],
        attendanceLast10: last10,
      };
    });

    setLeads(formatted);
  }

  const filteredLeads = useMemo(() => {
    if (selectedBranch === "All") return leads;
    return leads.filter((l) => l.branch === selectedBranch);
  }, [leads, selectedBranch]);

  const addFollowUp = async (
    leadId: string,
    data: {
      result: string;
      mood?: string;
      remark?: string;
      status: string;
    }
  ) => {

    const { error } = await supabase
      .from("lead_followups")
      .insert([
        {
          lead_id: leadId,
          result: data.result,
          mood: data.mood || "",
          remark: data.remark || "",
          status: data.status,
        },
      ]);

    if (error) {
      alert(error.message);
      return;
    }

    loadLeads(branches.map(b => b.name));
    setExpandedId(null);
  };

  return (

    <PermissionGuard page="Calling">

      <div className="min-h-screen bg-gray-50">

        <div className="flex gap-2 overflow-x-auto p-3 bg-white sticky top-0 z-10">

          <button
            onClick={() => setSelectedBranch("All")}
            className={`px-4 py-1 rounded-full text-sm whitespace-nowrap ${
              selectedBranch === "All" ? "bg-blue-600 text-white" : "bg-gray-200"
            }`}
          >
            All
          </button>

          {branches.map((b) => (
            <button
              key={b.id}
              onClick={() => setSelectedBranch(b.name)}
              className={`px-4 py-1 rounded-full text-sm whitespace-nowrap ${
                selectedBranch === b.name ? "bg-blue-600 text-white" : "bg-gray-200"
              }`}
            >
              {b.name}
            </button>
          ))}

        </div>

        <div className="p-3 space-y-3 pb-24">
          {filteredLeads.map((lead) => (
            <LeadCard
              key={lead.id}
              lead={lead}
              expandedId={expandedId}
              setExpandedId={setExpandedId}
              addFollowUp={addFollowUp}
            />
          ))}
        </div>

      </div>

    </PermissionGuard>

  );

}