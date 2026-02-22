"use client";

import { useState, useMemo } from "react";
import {
  ChevronDown,
  ChevronUp,
  Search,
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
  enquiryDate: string;
  followUps: FollowUp[];
};

const today = new Date();

const daysAgo = (dateStr: string) => {
  const d = new Date(dateStr);
  return Math.floor(
    (today.getTime() - d.getTime()) / (1000 * 60 * 60 * 24)
  );
};

const dummyLeads: Lead[] = [
  {
    id: 1,
    name: "Rahul Sharma",
    mobile: "9876543210",
    course: "Spoken English",
    branch: "Nanda Nagar",
    status: "Admission",
    enquiryDate: "2026-02-18",
    followUps: [
      { date: "2026-02-18", note: "Initial enquiry" },
      { date: "2026-02-19", note: "Demo done" },
      { date: "2026-02-20", note: "Interested" },
      { date: "2026-02-21", note: "Confirmed" },
      { date: "2026-02-22", note: "Admission done" },
    ],
  },
  {
    id: 2,
    name: "Priya Verma",
    mobile: "9123456780",
    course: "Basic Computer",
    branch: "Bapat Square",
    status: "Demo",
    enquiryDate: "2026-02-15",
    followUps: [
      { date: "2026-02-15", note: "Asked for demo" },
      { date: "2026-02-17", note: "Demo scheduled" },
    ],
  },
  {
    id: 3,
    name: "Aman Singh",
    mobile: "9000000000",
    course: "Tally",
    branch: "Aurobindo",
    status: "Not Interested",
    enquiryDate: "2026-02-10",
    followUps: [
      { date: "2026-02-10", note: "Price concern" },
    ],
  },
  ...Array.from({ length: 7 }).map((_, i) => ({
    id: i + 4,
    name: `Lead ${i + 4}`,
    mobile: "9000000000",
    course: "Spoken English",
    branch: ["Nanda Nagar", "Bapat Square", "Aurobindo"][i % 3],
    status: "Follow-up",
    enquiryDate: "2026-02-12",
    followUps: [
      { date: "2026-02-13", note: "Call later" },
      { date: "2026-02-14", note: "Busy" },
    ],
  })),
];

export default function CallingPage() {
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [branchFilter, setBranchFilter] = useState("All");
  const [sortBy, setSortBy] = useState("Latest");

  const filteredLeads = useMemo(() => {
    let data = [...dummyLeads];

    // Latest first by default
    data.sort(
      (a, b) =>
        new Date(b.enquiryDate).getTime() -
        new Date(a.enquiryDate).getTime()
    );

    if (branchFilter !== "All") {
      data = data.filter((l) => l.branch === branchFilter);
    }

    if (search) {
      data = data.filter((l) =>
        l.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (sortBy === "Oldest") {
      data.sort(
        (a, b) =>
          new Date(a.enquiryDate).getTime() -
          new Date(b.enquiryDate).getTime()
      );
    }

    if (sortBy === "Most Followups") {
      data.sort((a, b) => b.followUps.length - a.followUps.length);
    }

    return data;
  }, [search, branchFilter, sortBy]);

  const frameColor = (status: string) => {
    if (status === "Admission") return "border-green-600";
    if (status === "Demo") return "border-green-300";
    if (status === "Not Interested") return "border-red-300";
    return "border-gray-200";
  };

  return (
    <div className="min-h-screen bg-gray-50">

      {/* TOP FILTER SECTION */}
      <div className="sticky top-0 z-40 bg-white p-3 shadow-sm space-y-2">

        <div className="flex gap-2 overflow-x-auto text-xs">
          {["All", "Nanda Nagar", "Bapat Square", "Aurobindo"].map(
            (b) => (
              <button
                key={b}
                onClick={() => setBranchFilter(b)}
                className={`px-3 py-1 rounded-full ${
                  branchFilter === b
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200"
                }`}
              >
                {b}
              </button>
            )
          )}
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search..."
            className="flex-1 border rounded px-2 py-1 text-xs"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            className="border rounded px-2 py-1 text-xs"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="Latest">Latest</option>
            <option value="Oldest">Oldest</option>
            <option value="Most Followups">Most Followups</option>
          </select>
        </div>
      </div>

      {/* LEADS */}
      <div className="p-3 space-y-3 pb-24">
        {filteredLeads.map((lead) => {
          const enquiryDays = daysAgo(lead.enquiryDate);
          const lastFU =
            lead.followUps.length > 0
              ? daysAgo(lead.followUps[lead.followUps.length - 1].date)
              : "-";

          return (
            <div
              key={lead.id}
              className={`bg-white border-l-4 ${frameColor(
                lead.status
              )} rounded shadow-sm p-3 text-xs`}
            >
              {/* 4 LINE MAX */}
              <div className="flex justify-between">
                <div>
                  <p className="font-semibold">
                    {lead.name}
                    <span className="text-gray-400 ml-2">
                      {new Date(lead.enquiryDate)
                        .toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                        })}
                    </span>
                  </p>
                  <p>
                    {lead.course} | {lead.branch}
                  </p>
                  <p>
                    Enq: {enquiryDays}d | Last FU: {lastFU}d | FU:{" "}
                    {lead.followUps.length}
                  </p>
                  <p>Status: {lead.status}</p>
                </div>

                <button
                  onClick={() =>
                    setExpandedId(
                      expandedId === lead.id ? null : lead.id
                    )
                  }
                >
                  {expandedId === lead.id ? (
                    <ChevronUp size={16} />
                  ) : (
                    <ChevronDown size={16} />
                  )}
                </button>
              </div>

              {/* TEXT LINKS */}
              <div className="flex gap-4 mt-2 text-blue-600">
                <a href={`tel:${lead.mobile}`}>Call</a>
                <a
                  href={`https://wa.me/91${lead.mobile}`}
                  target="_blank"
                >
                  WhatsApp
                </a>
              </div>

              {/* EXPAND */}
              {expandedId === lead.id && (
                <div className="mt-3 border-t pt-2 space-y-1 text-gray-600">
                  {lead.followUps
                    .slice(-5)
                    .reverse()
                    .map((fu, i) => (
                      <p key={i}>
                        {new Date(fu.date).toLocaleDateString()} –{" "}
                        {fu.note}
                      </p>
                    ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}