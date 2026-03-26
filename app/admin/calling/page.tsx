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

type AttendanceSignal = "P" | "A" | "N";

type Lead = {
  id: string;
  name: string;
  gender: "Male" | "Female";
  mobile: string;
  course: string;
  branch: string;
  branch_id?: string;
  status: string;
  enquiryDate: string;
  followUps: FollowUp[];
  attendanceLast10: AttendanceSignal[];
  lead_stage?: string;
  city?: string;
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

  const [statuses, setStatuses] = useState<string[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>("All");

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
    await loadStatuses(access);
  }

  async function loadBranches(access: string[]) {
    let query = supabase.from("branches").select("id,name").order("name");
    if (access.length) query = query.in("name", access);
    const { data } = await query;
    setBranches(data || []);
  }

  async function loadStatuses(access: string[]) {
    let query = supabase.from("leads").select("lead_stage");
    const { data } = await query;

    const unique = Array.from(
      new Set(
        (data || [])
          .map((d: any) => (d.lead_stage || "").trim())
          .filter(Boolean)
      )
    );

    setStatuses(unique);
  }

  async function loadLeads(access: string[]) {

    let query = supabase
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false });

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

    const branchMap: Record<string, string> = {};
    branches.forEach(b => {
      branchMap[b.id] = b.name;
    });

    const formatted: Lead[] = data.map((l: any) => {

      const last10 = last10Dates.map((date) => {
        return attendanceMap[l.id]?.[date] || "N";
      });

      return {
        id: l.id,
        name: l.student_name || "",
        gender: l.gender || "Male",
        mobile: l.mobile_number || "",
        course: l.course || "",
        branch: branchMap[l.branch_id] || "",
        branch_id: l.branch_id,
        status: l.status || "Cold",
        enquiryDate: l.created_at,
        followUps: followupMap[l.id] || [],
        attendanceLast10: last10,
        lead_stage: (l.lead_stage || "").trim(),
        city: l.city || ""
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
            <button onClick={() => setSelectedBranch("All")}
              className={`px-4 py-1 rounded-full text-sm ${selectedBranch === "All" ? "bg-blue-600 text-white" : "bg-gray-200"}`}>
              All
            </button>
            {branches.map((b) => (
              <button key={b.id}
                onClick={() => setSelectedBranch(b.id)}
                className={`px-4 py-1 rounded-full text-sm ${selectedBranch === b.id ? "bg-blue-600 text-white" : "bg-gray-200"}`}>
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

        {/* SCROLL AREA */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3 pb-24">
          {filteredLeads.map((lead) => (
            <div key={lead.id}>
              <LeadCard
                lead={lead}
                expandedId={expandedId}
                setExpandedId={setExpandedId}
                addFollowUp={addFollowUp}
              />
            </div>
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