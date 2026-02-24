"use client";

import { useState, useMemo } from "react";
import FiltersBar from "@/app/components/admin/calling/FiltersBar";
import LeadCard from "@/app/components/admin/calling/LeadCard";

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

const generateFollowUps = (): FollowUp[] => [
  {
    date: "2026-02-02",
    type: "Received by Student",
    mood: "Wants Demo",
    note: "He'll join morning batch",
  },
  {
    date: "2026-02-06",
    type: "Not Received",
    note: "",
  },
  {
    date: "2026-02-09",
    type: "Received by Parent",
    mood: "Thinking",
    note: "",
  },
];

const generateAttendance = (joined: boolean): AttendanceSignal[] => {
  if (!joined) return Array(10).fill("N");
  return Array.from({ length: 10 }).map((_, i) =>
    i % 3 === 0 ? "A" : "P"
  );
};

const dummyLeads: Lead[] = Array.from({ length: 10 }).map((_, i) => {
  const status = ["Hot", "Warm", "Cold", "Closed"][i % 4];

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
    attendanceLast10: generateAttendance(status !== "Closed"),
  };
});

export default function CallingPage() {
  const [leads, setLeads] = useState(dummyLeads);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const filteredLeads = useMemo(() => {
    return [...leads].sort(
      (a, b) =>
        new Date(b.enquiryDate).getTime() -
        new Date(a.enquiryDate).getTime()
    );
  }, [leads]);

  const addFollowUp = (
    leadId: number,
    data: {
      result: string;
      mood?: string;
      remark?: string;
      status: string;
    }
  ) => {
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
    <div className="min-h-screen bg-gray-50">
      <FiltersBar />

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
  );
}