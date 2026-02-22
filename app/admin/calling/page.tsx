"use client";

import { useState } from "react";
import {
  Phone,
  MessageCircle,
  ChevronDown,
  ChevronUp,
  Search,
  Filter,
} from "lucide-react";

type FollowUp = {
  date: string;
  note: string;
};

type Lead = {
  id: number;
  name: string;
  mobile: string;
  course: string;
  branch: string;
  status: string;
  nextFollowUp: string;
  remark: string;
  followUps: FollowUp[];
};

const dummyLeads: Lead[] = [
  {
    id: 1,
    name: "Rahul Sharma",
    mobile: "9876543210",
    course: "Spoken English",
    branch: "Nanda Nagar",
    status: "Interested",
    nextFollowUp: "Today 5 PM",
    remark: "Demo attend kiya",
    followUps: [
      { date: "10 Feb", note: "Initial enquiry" },
      { date: "15 Feb", note: "Demo given" },
    ],
  },
  {
    id: 2,
    name: "Priya Verma",
    mobile: "9123456780",
    course: "Basic Computer",
    branch: "Bapat Square",
    status: "Not Interested",
    nextFollowUp: "—",
    remark: "Fees high lag rahi",
    followUps: [{ date: "12 Feb", note: "Price issue" }],
  },
  ...Array.from({ length: 8 }).map((_, i) => ({
    id: i + 3,
    name: `Lead ${i + 3}`,
    mobile: "9000000000",
    course: "Tally",
    branch: "Aurobindo",
    status: "Follow-up Pending",
    nextFollowUp: "Tomorrow",
    remark: "Thinking",
    followUps: [{ date: "5 Feb", note: "Asked to call later" }],
  })),
];

export default function CallingPage() {
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [leads, setLeads] = useState(dummyLeads);
  const [newNote, setNewNote] = useState("");

  const filteredLeads = leads.filter((lead) => {
    const matchesSearch = lead.name
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === "All" || lead.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const addFollowUp = (id: number) => {
    if (!newNote.trim()) return;

    setLeads((prev) =>
      prev.map((lead) =>
        lead.id === id
          ? {
              ...lead,
              followUps: [
                ...lead.followUps,
                { date: "Today", note: newNote },
              ],
            }
          : lead
      )
    );

    setNewNote("");
  };

  return (
    <div className="min-h-screen bg-gray-50">

      {/* STICKY FILTER BAR */}
      <div className="sticky top-0 z-40 bg-white shadow-sm p-3 space-y-2">
        <div className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-md">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search by name..."
            className="bg-transparent outline-none w-full text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex gap-2 overflow-x-auto text-xs">
          {["All", "Interested", "Not Interested", "Follow-up Pending"].map(
            (status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1 rounded-full whitespace-nowrap ${
                  statusFilter === status
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200"
                }`}
              >
                {status}
              </button>
            )
          )}
        </div>
      </div>

      {/* LEADS LIST */}
      <div className="p-3 space-y-3 pb-24">
        {filteredLeads.map((lead) => {
          const isExpanded = expandedId === lead.id;

          return (
            <div
              key={lead.id}
              className="bg-white rounded-xl shadow-sm border p-3 space-y-2"
            >
              {/* TOP LINE */}
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="font-semibold text-sm">{lead.name}</h2>
                  <p className="text-xs text-gray-500">
                    {lead.course} | {lead.branch}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    Status: {lead.status}
                  </p>
                  <p className="text-xs text-red-600">
                    Next: {lead.nextFollowUp}
                  </p>
                </div>

                <button
                  onClick={() =>
                    setExpandedId(isExpanded ? null : lead.id)
                  }
                >
                  {isExpanded ? (
                    <ChevronUp size={18} />
                  ) : (
                    <ChevronDown size={18} />
                  )}
                </button>
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex gap-2">
                <a
                  href={`tel:${lead.mobile}`}
                  className="flex-1 flex items-center justify-center gap-1 bg-green-600 text-white text-xs py-2 rounded-md"
                >
                  <Phone size={14} /> Call
                </a>

                <a
                  href={`https://wa.me/91${lead.mobile}`}
                  target="_blank"
                  className="flex-1 flex items-center justify-center gap-1 bg-green-500 text-white text-xs py-2 rounded-md"
                >
                  <MessageCircle size={14} /> WhatsApp
                </a>
              </div>

              {/* EXPANDED SECTION */}
              {isExpanded && (
                <div className="mt-3 border-t pt-2 space-y-2 text-xs">
                  <div>
                    <p className="font-medium">Previous Follow-ups:</p>
                    {lead.followUps.map((fu, index) => (
                      <p key={index} className="text-gray-600">
                        {fu.date} - {fu.note}
                      </p>
                    ))}
                  </div>

                  <div className="space-y-1">
                    <input
                      type="text"
                      placeholder="Add new follow-up note..."
                      className="w-full border rounded-md px-2 py-1 text-xs"
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                    />
                    <button
                      onClick={() => addFollowUp(lead.id)}
                      className="w-full bg-blue-600 text-white py-1 rounded-md"
                    >
                      Save Follow-up
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}