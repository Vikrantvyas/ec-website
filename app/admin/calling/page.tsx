"use client";

import { useState, useMemo, useEffect } from "react";
import PermissionGuard from "@/app/components/admin/PermissionGuard";
import LeadCard from "@/app/components/admin/calling/LeadCard";
import FiltersPanel from "@/app/components/admin/calling/FiltersPanel";
import { supabase } from "@/lib/supabaseClient";
import { Search } from "lucide-react";

type FollowUp = {
  date: string;
  note: string;
  type: string;
  mood?: string;
};

type Lead = {
  id: string;
  name: string;
  mobile: string;
  course: string;
  branch: string;
  branch_id?: string;
  enquiryDate: string;
  followUps: FollowUp[];
  lead_stage?: string;
  lead_chances?: string;
  batch_name?: string;
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

  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<any>({});
  const [search, setSearch] = useState("");

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

    const access = roleData?.branch_access || [];

    await loadBranches(access);
    await loadLeads(access);
  }

  async function loadBranches(access: string[]) {
    let query = supabase.from("branches").select("id,name").order("name");
    if (access.length) query = query.in("name", access);
    const { data } = await query;
    setBranches(data || []);
  }

  async function loadLeads(access: string[]) {

    const { data } = await supabase
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false });

    if (!data) return;

    const leadIds = data.map((l: any) => l.id);

    // FOLLOWUPS
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

    // BATCH MAP
    const { data: batchStudents } = await supabase
      .from("batch_students")
      .select("lead_id, batch_id");

    const batchIds = (batchStudents || []).map((b: any) => b.batch_id);

    const { data: batches } = await supabase
      .from("batches")
      .select("id, batch_name")
      .in("id", batchIds);

    const batchMap: any = {};
    batches?.forEach((b: any) => {
      batchMap[b.id] = b.batch_name;
    });

    const leadBatchMap: any = {};

batchStudents?.forEach((bs: any) => {
  if (!leadBatchMap[bs.lead_id]) {
    leadBatchMap[bs.lead_id] = new Set();
  }

  const batchName = batchMap[bs.batch_id] || "";

  if (batchName) {
    leadBatchMap[bs.lead_id].add(batchName);
  }
});

    // BRANCH MAP
    const branchMap: Record<string, string> = {};
    branches.forEach((b) => {
      branchMap[b.id] = b.name;
    });

    // FINAL DATA (NO ATTENDANCE)
    const formatted: Lead[] = data.map((l: any) => {

  return {
    id: l.id,
    name: l.student_name || "",
    mobile: l.mobile_number || "",
    course: l.course || "",
    branch: branchMap[l.branch_id] || "",
    branch_id: l.branch_id,
    enquiryDate: l.created_at,
    followUps: followupMap[l.id] || [],
    lead_stage: (l.lead_stage || "").trim(),
    lead_chances: (l.lead_chances || "").trim(),
    batch_name: leadBatchMap[l.id]
      ? Array.from(leadBatchMap[l.id]).join(", ")
      : "",

    // ✅ ADD FULL DATA (IMPORTANT FIX)
    area: l.area,
    city: l.city,
    gender: l.gender,
    age: l.age,
    marital_status: l.marital_status,
    profession: l.profession,
    education: l.education,
    school_college_job: l.school_college_job,
    school_timing: l.school_timing,
    contact_time: l.contact_time,

    enquiry_date: l.enquiry_date,
    enquiry_time: l.enquiry_time,
    method: l.method,
    channel: l.channel,
    enquired_by: l.enquired_by,
    for_whom: l.for_whom,

    department: l.department,
    preferred_timing: l.preferred_timing,
    preferred_batch: l.preferred_batch,

    action: l.action,
    next_follow_date: l.next_follow_date,
    next_follow_time: l.next_follow_time,
    counsellor: l.counsellor,
    remark: l.remark,

    alternate_number: l.alternate_number,
    created_at: l.created_at,
    updated_at: l.updated_at,
  };
});

    setLeads(formatted);
  }

  const filteredLeads = useMemo(() => {

    let data = [...leads];

    if (selectedBranch !== "All") {
      data = data.filter((l) => l.branch_id === selectedBranch);
    }

    if (search.trim()) {
      data = data.filter((l) =>
        l.name.toLowerCase().includes(search.toLowerCase()) ||
        l.mobile.includes(search)
      );
    }

    Object.entries(filters).forEach(([key, val]) => {
      const values = val as string[];
      if (!values || values.length === 0) return;

      data = data.filter((l: any) =>
        values.includes(l[key])
      );
    });

    return data;

  }, [leads, selectedBranch, filters, search]);

  const addFollowUp = async (leadId: string, data: any) => {

    const { error } = await supabase
      .from("lead_followups")
      .insert([{
        lead_id: leadId,
        result: data.result,
        mood: data.mood || "",
        remark: data.remark || "",
        status: data.status,
      }]);

    if (error) {
      alert(error.message);
      return;
    }

    loadLeads([]);
    setExpandedId(null);
  };

  return (

    <PermissionGuard page="Calling">

      <div className="calling-page flex flex-col h-[calc(100vh-56px)] bg-gray-50 overflow-hidden">

        {/* HEADER */}
        <div className="sticky top-0 z-20 bg-white shadow-sm">

        <div className="flex gap-2 overflow-x-auto p-3">

  <button
    onClick={() => {
      setSelectedBranch("All");
    }}
    className={`px-3 py-1 rounded text-xs md:text-sm whitespace-nowrap shadow-sm transition
      ${selectedBranch === "All"
        ? "bg-blue-600 text-white"
        : "bg-white"
      }`}
  >
    All
  </button>

  {branches.map((b) => (
    <button
      key={b.id}
      onClick={() => {
        setSelectedBranch(b.id);
        setExpandedId(null); // reset open card (important)
      }}
      className={`px-3 py-1 rounded text-xs md:text-sm whitespace-nowrap shadow-sm transition
        ${selectedBranch === b.id
          ? "bg-blue-600 text-white"
          : "bg-white"
        }`}
    >
      {b.name}
    </button>
  ))}

</div>

          <div className="flex gap-2 px-3 pb-2">

            <div className="flex items-center bg-gray-100 rounded px-2 flex-1">
              <Search className="w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search name or mobile..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-transparent outline-none px-2 py-1 text-sm w-full"
              />
            </div>

            <button
              onClick={() => setShowFilters(true)}
              className="text-sm px-3 py-1 bg-black text-white rounded"
            >
              Filters ⚙️
            </button>

          </div>

        </div>

        {/* LIST */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3 pb-24">
          {filteredLeads.map((lead) => (
          <LeadCard
  key={lead.id}
  lead={lead}
/>
          ))}
        </div>

        <FiltersPanel
          open={showFilters}
          onClose={() => setShowFilters(false)}
          onApply={(f) => setFilters(f)}
        />

      </div>

    </PermissionGuard>

  );

}