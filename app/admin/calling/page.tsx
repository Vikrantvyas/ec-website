"use client";

import { useState, useMemo } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

type FollowUp = {
  date: string;
  note: string;
  type: string;
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

const callTypes = [
  "Call Received",
  "Not Received",
  "Cut the Call",
  "Received by Someone Else",
  "He Will Call Soon",
  "Will Visit Soon",
  "Call Me Later",
];

const generateFollowUps = (): FollowUp[] => [
  { date: "2026-02-01", note: "Initial enquiry", type: "Call Received" },
  { date: "2026-02-03", note: "Call back later", type: "Call Me Later" },
  { date: "2026-02-05", note: "Not reachable", type: "Not Received" },
  { date: "2026-02-07", note: "Interested", type: "Call Received" },
  { date: "2026-02-09", note: "Follow up again", type: "Call Received" },
];

const generateAttendance = (joined: boolean): AttendanceSignal[] => {
  if (!joined) return Array(10).fill("N");
  return Array.from({ length: 10 }).map((_, i) =>
    i % 3 === 0 ? "A" : "P"
  );
};

const dummyLeads: Lead[] = Array.from({ length: 10 }).map((_, i) => {
  const status = ["Admission", "Demo", "Not Interested"][i % 3];

  return {
    id: i + 1,
    name: i % 2 === 0 ? `Priya ${i}` : `Rahul ${i}`,
    gender: i % 2 === 0 ? "Female" : "Male",
    mobile: `900000000${i}`,
    course: ["Spoken English", "Basic Computer", "Tally"][i % 3],
    branch: ["Nanda Nagar", "Bapat Square", "Aurobindo"][i % 3],
    status,
    enquiryDate: `2026-02-${10 - i}`,
    followUps: generateFollowUps(),
    attendanceLast10: generateAttendance(status !== "Not Interested"),
  };
});

export default function CallingPage() {
  const [leads, setLeads] = useState(dummyLeads);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [filter1, setFilter1] = useState("All");
  const [filter2, setFilter2] = useState("All");
  const [filter3, setFilter3] = useState("All");
  const [selectedCallType, setSelectedCallType] = useState("");
  const [showAll, setShowAll] = useState<number | null>(null);

  const filteredLeads = useMemo(() => {
    let data = [...leads];

    // Default Latest
    data.sort(
      (a, b) =>
        new Date(b.enquiryDate).getTime() -
        new Date(a.enquiryDate).getTime()
    );

    if (filter1 !== "All") {
      data = data.filter((l) => l.branch === filter1);
    }

    if (filter2 === "Gender" && filter3 !== "All") {
      data = data.filter((l) => l.gender === filter3);
    }

    if (filter2 === "Status" && filter3 !== "All") {
      data = data.filter((l) => l.status === filter3);
    }

    if (filter2 === "Sort") {
      if (filter3 === "Oldest") {
        data.sort(
          (a, b) =>
            new Date(a.enquiryDate).getTime() -
            new Date(b.enquiryDate).getTime()
        );
      }
      if (filter3 === "Most Followups") {
        data.sort((a, b) => b.followUps.length - a.followUps.length);
      }
      if (filter3 === "A - Z") {
        data.sort((a, b) => a.name.localeCompare(b.name));
      }
      if (filter3 === "Z - A") {
        data.sort((a, b) => b.name.localeCompare(a.name));
      }
    }

    if (search) {
      data = data.filter((l) =>
        l.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    return data;
  }, [leads, search, filter1, filter2, filter3]);

  const frameColor = (status: string) => {
    if (status === "Admission") return "border-green-600";
    if (status === "Demo") return "border-blue-500";
    if (status === "Not Interested") return "border-red-300";
    return "border-gray-200";
  };

  const attendanceColor = (signal: AttendanceSignal) => {
    if (signal === "P") return "bg-green-500";
    if (signal === "A") return "bg-red-500";
    return "bg-gray-300";
  };

  const addFollowUp = (leadId: number) => {
    if (!selectedCallType) return;

    setLeads((prev) =>
      prev.map((lead) =>
        lead.id === leadId
          ? {
              ...lead,
              followUps: [
                ...lead.followUps,
                {
                  date: new Date().toISOString(),
                  note: selectedCallType,
                  type: selectedCallType,
                },
              ],
            }
          : lead
      )
    );

    setSelectedCallType("");
  };

  return (
    <div className="min-h-screen bg-gray-50">

      {/* FILTERS */}
      <div className="sticky top-0 z-40 bg-white p-3 shadow-sm space-y-2">

        <div className="flex gap-2 flex-wrap text-xs">
          {/* Branch */}
          <select
            className="border px-2 py-1 rounded"
            value={filter1}
            onChange={(e) => setFilter1(e.target.value)}
          >
            <option>All</option>
            <option>Nanda Nagar</option>
            <option>Bapat Square</option>
            <option>Aurobindo</option>
          </select>

          {/* Category */}
          <select
            className="border px-2 py-1 rounded"
            value={filter2}
            onChange={(e) => {
              setFilter2(e.target.value);
              setFilter3("All");
            }}
          >
            <option>All</option>
            <option>Gender</option>
            <option>Status</option>
            <option>Sort</option>
          </select>

          {/* Dependent */}
          <select
            className="border px-2 py-1 rounded"
            value={filter3}
            onChange={(e) => setFilter3(e.target.value)}
          >
            <option>All</option>

            {filter2 === "Gender" && (
              <>
                <option>Male</option>
                <option>Female</option>
              </>
            )}

            {filter2 === "Status" && (
              <>
                <option>Demo</option>
                <option>Admission</option>
                <option>Not Interested</option>
              </>
            )}

            {filter2 === "Sort" && (
              <>
                <option>Oldest</option>
                <option>Most Followups</option>
                <option>A - Z</option>
                <option>Z - A</option>
              </>
            )}
          </select>
        </div>

        <input
          type="text"
          placeholder="Search..."
          className="w-full border rounded px-2 py-1 text-xs"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* LEADS */}
      <div className="p-3 space-y-3 pb-24">
        {filteredLeads.map((lead) => (
          <div
            key={lead.id}
            className={`bg-white border-l-4 ${frameColor(
              lead.status
            )} rounded shadow-sm p-3 text-xs`}
          >
            <div className="flex justify-between">
              <div>
                <p className="font-semibold">
                  {lead.name}
                  <span className="text-gray-400 ml-2">
                    {new Date(lead.enquiryDate).toLocaleDateString(
                      "en-GB",
                      { day: "2-digit", month: "short" }
                    )} ({lead.followUps.length} Calls)
                  </span>
                </p>

                <p>{lead.course} | {lead.branch}</p>

                <p className="flex items-center gap-2">
                  Status: {lead.status}

                  {/* Compact Vercel-style Attendance */}
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100">
                    {lead.attendanceLast10.map((signal, idx) => (
                      <span
                        key={idx}
                        className={`h-2 w-2 rounded-full ${attendanceColor(
                          signal
                        )}`}
                      />
                    ))}
                  </span>
                </p>
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

            <div className="flex gap-4 mt-2 text-blue-600">
              <a href={`tel:${lead.mobile}`}>Call</a>
              <a href={`https://wa.me/91${lead.mobile}`} target="_blank">
                WhatsApp
              </a>
            </div>

            {expandedId === lead.id && (
              <div className="mt-3 border-t pt-2 space-y-2 text-gray-600">
                {(showAll === lead.id
                  ? lead.followUps
                  : lead.followUps.slice(-5)
                )
                  .reverse()
                  .map((fu, i) => (
                    <p key={i}>
                      {new Date(fu.date).toLocaleDateString()} –{" "}
                      {fu.note}
                    </p>
                  ))}

                <div className="flex gap-2 mt-2">
                  <select
                    className="border px-2 py-1 text-xs rounded"
                    value={selectedCallType}
                    onChange={(e) =>
                      setSelectedCallType(e.target.value)
                    }
                  >
                    <option value="">Select Call Result</option>
                    {callTypes.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>

                  <button
                    onClick={() => addFollowUp(lead.id)}
                    className="bg-blue-600 text-white px-3 py-1 rounded text-xs"
                  >
                    Save
                  </button>
                </div>

                <select
                  className="border px-2 py-1 rounded text-xs"
                  value={lead.status}
                  onChange={(e) =>
                    setLeads((prev) =>
                      prev.map((l) =>
                        l.id === lead.id
                          ? { ...l, status: e.target.value }
                          : l
                      )
                    )
                  }
                >
                  <option>Demo</option>
                  <option>Admission</option>
                  <option>Not Interested</option>
                </select>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}