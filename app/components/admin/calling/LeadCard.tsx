"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import InlineCallingForm from "./InlineCallingForm";

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

type Props = {
  lead: Lead;
  expandedId: number | null;
  setExpandedId: (id: number | null) => void;
  addFollowUp: (
    id: number,
    data: {
      result: string;
      mood?: string;
      remark?: string;
      status: string;
    }
  ) => void;
};

export default function LeadCard({
  lead,
  expandedId,
  setExpandedId,
  addFollowUp,
}: Props) {
  const router = useRouter();
  const isExpanded = expandedId === lead.id;
  const [openFU, setOpenFU] = useState<number | null>(null);

  const attendanceColor = (signal: AttendanceSignal) => {
    if (signal === "P") return "bg-green-500";
    if (signal === "A") return "bg-red-500";
    return "bg-gray-300";
  };

  const frameColor = (status: string) => {
    if (status === "Hot") return "border-red-500";
    if (status === "Warm") return "border-yellow-500";
    if (status === "Cold") return "border-blue-400";
    if (status === "Closed") return "border-gray-400";
    return "border-gray-200";
  };

  const resultColor = (type: string) => {
    if (
      type === "Received by Student" ||
      type === "Received by Parent"
    )
      return "text-green-600";

    if (
      type === "Phone Busy" ||
      type === "Not Received" ||
      type === "Not Reachable" ||
      type === "Switched Off" ||
      type === "Voice Issue"
    )
      return "text-blue-600";

    return "text-red-600";
  };

  return (
    <div
      className={`bg-white border-l-4 ${frameColor(
        lead.status
      )} rounded shadow-sm p-3 text-xs cursor-pointer`}
      onClick={() =>
        setExpandedId(isExpanded ? null : lead.id)
      }
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">

          {/* PROFILE ONLY ON NAME */}
          <span
            className="font-semibold text-blue-600 underline cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/admin/profile/${lead.id}`);
            }}
          >
            {lead.name}
          </span>

          <span className="text-gray-400 ml-2">
            {new Date(lead.enquiryDate).toLocaleDateString(
              "en-GB",
              { day: "2-digit", month: "short" }
            )} ({lead.followUps.length} Calls)
          </span>

          <p>
            {lead.course} | {lead.branch}
          </p>

          <p className="flex items-center gap-2">
            Status: {lead.status}
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100">
              {lead.attendanceLast10.map((signal, idx) => (
                <span
                  key={idx}
                  className={`h-2 w-2 rounded-full ${attendanceColor(signal)}`}
                />
              ))}
            </span>
          </p>
        </div>

        <div className="ml-2">
          {isExpanded ? (
            <ChevronUp size={16} />
          ) : (
            <ChevronDown size={16} />
          )}
        </div>
      </div>

      {/* STOP PROPAGATION FOR CALL BUTTONS */}
      <div
        className="flex gap-4 mt-2 text-blue-600"
        onClick={(e) => e.stopPropagation()}
      >
        <a href={`tel:${lead.mobile}`}>Call</a>
        <a
          href={`https://wa.me/91${lead.mobile}`}
          target="_blank"
        >
          WhatsApp
        </a>
      </div>

      {isExpanded && (
        <div
          className="mt-3 border-t pt-2 space-y-2 text-gray-700"
          onClick={(e) => e.stopPropagation()}
        >
          {lead.followUps
            .slice(-5)
            .reverse()
            .map((fu, i) => {
              const hasExtra = fu.mood || fu.note;
              const isOpen = openFU === i;

              return (
                <div
                  key={i}
                  className={`${hasExtra ? "bg-gray-50 rounded" : "bg-white"}`}
                >
                  {/* TOP ROW */}
                  <div
                    className={`flex justify-between items-center p-2 ${
                      hasExtra ? "cursor-pointer" : ""
                    }`}
                    onClick={(e) => {
                      if (!hasExtra) return;
                      e.stopPropagation();
                      setOpenFU(isOpen ? null : i);
                    }}
                  >
                    <p className="font-semibold text-gray-800">
                      {new Date(fu.date).toLocaleDateString(
                        "en-GB",
                        { day: "2-digit", month: "short", year: "2-digit" }
                      )}{" "}
                      -{" "}
                      <span className={resultColor(fu.type)}>
                        {fu.type}
                      </span>
                    </p>

                    {hasExtra &&
                      (isOpen ? (
                        <ChevronUp size={14} />
                      ) : (
                        <ChevronDown size={14} />
                      ))}
                  </div>

                  {/* EXPANDED DETAILS */}
                  {hasExtra && isOpen && (
                    <div className="px-2 pb-2 space-y-1 text-gray-600">
                      {fu.mood && <p>Mood - {fu.mood}</p>}
                      {fu.note && <p>Remark - {fu.note}</p>}
                    </div>
                  )}
                </div>
              );
            })}

          <InlineCallingForm
            leadId={lead.id}
            currentStatus={lead.status}
            onSave={(data) => {
              addFollowUp(lead.id, {
                result: data.result,
                mood: data.mood,
                remark: data.remark,
                status: data.status,
              });
              setExpandedId(null);
            }}
          />
        </div>
      )}
    </div>
  );
}