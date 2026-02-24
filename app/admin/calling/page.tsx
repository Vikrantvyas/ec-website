"use client";

import { useState, useMemo } from "react";
import FiltersBar from "@/app/components/admin/calling/FiltersBar";
import LeadCard from "@/app/components/admin/calling/LeadCard";

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

  const filteredLeads = useMemo(() => {
    let data = [...leads];

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
              status:
                selectedCallType === "Admission"
                  ? "Admission"
                  : selectedCallType === "Demo Scheduled"
                  ? "Demo"
                  : selectedCallType === "Not Interested"
                  ? "Not Interested"
                  : lead.status,
            }
          : lead
      )
    );

    setExpandedId(null);
    setSelectedCallType("");
  };

  return (
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
            selectedCallType={selectedCallType}
            setSelectedCallType={setSelectedCallType}
            addFollowUp={addFollowUp}
          />
        ))}
      </div>
    </div>
  );
}