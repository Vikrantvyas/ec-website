"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

interface Props {
  onSelectEnquiry: (enquiry: any) => void;
  onNewEnquiry: () => void;
}

export default function EnqSidebar({
  onSelectEnquiry,
  onNewEnquiry,
}: Props) {

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [enquiries, setEnquiries] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadLeads();
  }, []);

  async function loadLeads() {

    const { data } = await supabase
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false });

    if (!data) return;

    const formatted = data.map((l: any) => ({
      id: l.id,
      name: l.student_name || "",
      course: l.course || "",
      date: new Date(l.created_at).toLocaleDateString("en-GB"),
      raw: l,
    }));

    setEnquiries(formatted);

  }

  const filtered = enquiries.filter((e) =>
    e.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <aside className="w-[320px] h-full bg-white border-r border-gray-200 flex flex-col overflow-hidden">

      {/* 🔒 TOP FIXED AREA */}
      <div className="px-4 pt-4 shrink-0">

        {/* Search */}
        <div className="flex items-center bg-gray-100 border rounded-full px-3 py-2">
          <span className="text-gray-400 mr-2">🔍</span>
          <input
            type="text"
            placeholder="Search Student"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent outline-none text-sm"
          />
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-2 mt-3">
          <button className="px-3 py-1.5 border rounded-full text-sm text-gray-600 hover:bg-gray-100">
            All
          </button>

          <button className="px-3 py-1.5 border rounded-full text-sm text-gray-600 hover:bg-gray-100">
            Follow-ups
          </button>

          <button
            onClick={onNewEnquiry}
            className="px-3 py-1.5 bg-blue-600 text-white rounded-full text-sm hover:bg-blue-700"
          >
            New Enquiry
          </button>
        </div>

      </div>

      {/* ✅ ONLY LIST SCROLL */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 mt-4 space-y-2">

        {filtered.map((enquiry) => (

          <div
            key={enquiry.id}
            onClick={() => {
              setSelectedId(enquiry.id);
              onSelectEnquiry(enquiry.raw);
            }}
            className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition ${
              selectedId === enquiry.id
                ? "bg-green-50 border border-green-200"
                : "hover:bg-gray-50"
            }`}
          >

            <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-semibold text-sm">
              {enquiry.name.charAt(0)}
            </div>

            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-gray-900 truncate">
                {enquiry.name}
              </div>

              <div className="text-xs text-gray-500 truncate">
                {enquiry.date} - {enquiry.course}
              </div>
            </div>

          </div>

        ))}

      </div>

    </aside>
  );
}