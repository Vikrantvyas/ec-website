"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import { useRouter } from "next/navigation";
import InlineCallingForm from "./InlineCallingForm";

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

type Props = {
  lead: Lead;
  expandedId: number | null;
  setExpandedId: (id: number | null) => void;
  selectedCallType: string; // kept for now (not used)
  setSelectedCallType: (val: string) => void; // kept for now (not used)
  addFollowUp: (id: number) => void;
};

export default function LeadCard({
  lead,
  expandedId,
  setExpandedId,
  addFollowUp,
}: Props) {
  const router = useRouter();
  const isExpanded = expandedId === lead.id;

  const attendanceColor = (signal: AttendanceSignal) => {
    if (signal === "P") return "bg-green-500";
    if (signal === "A") return "bg-red-500";
    return "bg-gray-300";
  };

  const frameColor = (status: string) => {
    if (status === "Admission") return "border-green-600";
    if (status === "Demo") return "border-blue-500";
    if (status === "Not Interested") return "border-red-300";
    return "border-gray-200";
  };

  return (
    <div
      className={`bg-white border-l-4 ${frameColor(
        lead.status
      )} rounded shadow-sm p-3 text-xs`}
    >
      <div className="flex justify-between">
        {/* PROFILE CLICK AREA */}
        <div
          className="cursor-pointer flex-1"
          onClick={() =>
            router.push(`/admin/profile/${lead.id}`)
          }
        >
          <p className="font-semibold">
            {lead.name}
            <span className="text-gray-400 ml-2">
              {new Date(lead.enquiryDate).toLocaleDateString(
                "en-GB",
                { day: "2-digit", month: "short" }
              )} ({lead.followUps.length} Calls)
            </span>
          </p>

          <p>
            {lead.course} | {lead.branch}
          </p>

          <p className="flex items-center gap-2">
            Status: {lead.status}

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

        {/* Expand Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setExpandedId(isExpanded ? null : lead.id);
          }}
          className="ml-2"
        >
          {isExpanded ? (
            <ChevronUp size={16} />
          ) : (
            <ChevronDown size={16} />
          )}
        </button>
      </div>

      {/* Call / WhatsApp */}
      <div className="flex gap-4 mt-2 text-blue-600">
        <a
          href={`tel:${lead.mobile}`}
          onClick={(e) => e.stopPropagation()}
        >
          Call
        </a>

        <a
          href={`https://wa.me/91${lead.mobile}`}
          target="_blank"
          onClick={(e) => e.stopPropagation()}
        >
          WhatsApp
        </a>
      </div>

      {/* Expanded Section */}
      {isExpanded && (
        <div className="mt-3 border-t pt-2 space-y-2 text-gray-600">

          {/* Last 5 Followups */}
          {lead.followUps
            .slice(-5)
            .reverse()
            .map((fu, i) => (
              <p key={i}>
                {new Date(fu.date).toLocaleDateString()} – {fu.note}
              </p>
            ))}

          {/* Inline Calling Form */}
          <InlineCallingForm
            leadId={lead.id}
            currentStatus={lead.status}
            onSave={(data) => {
              // For now just add basic followup
              addFollowUp(lead.id);

              // Collapse after save (Option B)
              setExpandedId(null);
            }}
          />
        </div>
      )}
    </div>
  );
}