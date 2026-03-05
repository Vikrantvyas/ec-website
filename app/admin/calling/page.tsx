"use client";

import { useState, useMemo, useEffect } from "react";
import PermissionGuard from "@/app/components/admin/PermissionGuard";
import FiltersBar from "@/app/components/admin/calling/FiltersBar";
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
  id: number;
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

export default function CallingPage() {

  const [leads, setLeads] = useState<Lead[]>([]);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const [search, setSearch] = useState("");
  const [filter1, setFilter1] = useState("All");
  const [filter2, setFilter2] = useState("All");
  const [filter3, setFilter3] = useState("All");

  useEffect(() => {
    loadLeads();
  }, []);

  async function loadLeads() {

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

    let query = supabase
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false });

    if (roleData?.branch_access?.length) {
      query = query.in("branch", roleData.branch_access);
    }

    const { data } = await query;

    if (!data) return;

    const formatted: Lead[] = data.map((l: any) => ({
      id: l.id,
      name: l.student_name || "",
      gender: l.gender || "Male",
      mobile: l.mobile || "",
      course: l.course || "",
      branch: l.branch || "",
      status: l.status || "Cold",
      enquiryDate: l.created_at,
      followUps: [],
      attendanceLast10: Array(10).fill("N"),
    }));

    setLeads(formatted);

  }

  const filteredLeads = useMemo(() => {

    let data = [...leads];

    data.sort(
      (a, b) =>
        new Date(b.enquiryDate).getTime() -
        new Date(a.enquiryDate).getTime()
    );

    if (search) {
      data = data.filter((l) =>
        l.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    return data;

  }, [leads, search]);

  const addFollowUp = async (
    leadId: number,
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
      console.error("Followup Insert Error:", error);
      alert(error.message);
      return;
    }

    setLeads((prev) =>
      prev.map((lead) =>
        lead.id === leadId
          ? {
              ...lead,
              followUps: [
                ...lead.followUps,
                {
                  date: new Date().toISOString(),
                  type: data.result,
                  mood: data.mood,
                  note: data.remark || "",
                },
              ],
              status: data.status,
            }
          : lead
      )
    );

    setExpandedId(null);

  };

  return (

    <PermissionGuard page="Calling">

      <div className="min-h-screen bg-gray-50">

        <FiltersBar
          filter1={filter1}
          setFilter1={setFilter1}
          filter2={filter2}
          setFilter2={setFilter2}
          filter3={filter3}
          setFilter3={setFilter3}
          search={search}
          setSearch={setSearch}
        />

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