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
  id: string;
  name: string;
  mobile: string;
  course: string;
  enquiryDate: string;
  followUps: FollowUp[];
  attendanceLast10: AttendanceSignal[];
  lead_stage: string;
  lead_chances: string;
  batch_name?: string;
};

type Props = {
  lead: Lead;
  expandedId: string | null;
  setExpandedId: (id: string | null) => void;
  addFollowUp: (
    id: string,
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

  const resultColor = (type: string) => {
    if (type === "Received by Student" || type === "Received by Parent")
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

  const hasAttendance = lead.attendanceLast10.some(
    (a) => a === "P" || a === "A"
  );

  return (
    <div
      className="bg-white rounded shadow-sm p-3 text-xs cursor-pointer w-full hover:bg-gray-50 transition"
      onClick={() => setExpandedId(isExpanded ? null : lead.id)}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1 space-y-1">

          {/* ROW 1 */}
          <div>
            <span
              className="font-semibold text-blue-600 underline cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/admin/lead/${lead.id}`);
              }}
            >
              {lead.name}
            </span>

            <span className="text-black ml-2">
              {new Date(lead.enquiryDate).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
              })}{" "}
              ({lead.followUps.length} Calls)
            </span>
          </div>

          {/* ROW 2 */}
          <div className="text-gray-700 font-medium">
            {lead.course}
          </div>

          {/* ROW 3 */}
          <div className="text-gray-800">
            {lead.lead_stage} - {lead.lead_chances}
          </div>

        </div>

        <div className="ml-2">
          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </div>

      {/* ROW 5 */}
      <div
        className="flex justify-between mt-2 text-xs"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-gray-700">

          {/* BATCH */}
          <div>
            {lead.batch_name ? lead.batch_name : "No Batch"}
          </div>

          {/* ATTENDANCE */}
          <div className="mt-1 text-gray-500">
            {hasAttendance ? (
              <div className="flex gap-[3px]">
                {lead.attendanceLast10.map((signal, idx) => (
                  <span
                    key={idx}
                    className={`h-2 w-2 rounded-full ${
                      signal === "P"
                        ? "bg-green-500"
                        : signal === "A"
                        ? "bg-red-500"
                        : "bg-gray-300"
                    }`}
                  />
                ))}
              </div>
            ) : (
              "No Attendance"
            )}
          </div>

        </div>

        {/* CALL BUTTONS */}
        <div className="flex gap-4 text-blue-600">
          <a href={`tel:${lead.mobile}`}>Call</a>
          <a href={`https://wa.me/91${lead.mobile}`} target="_blank">
            WhatsApp
          </a>
        </div>
      </div>

      {isExpanded && (
        <div
          className="mt-3 border-t pt-2 space-y-2 text-gray-700"
          onClick={(e) => e.stopPropagation()}
        >
          {lead.followUps.slice(0, 5).map((fu, i) => {
            const hasExtra = fu.mood || fu.note;
            const isOpen = openFU === i;

            return (
              <div
                key={i}
                className={`${hasExtra ? "bg-gray-50 rounded" : "bg-white"}`}
              >
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
                    {new Date(fu.date).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "2-digit",
                    })}{" "}
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
            currentStatus={lead.lead_stage}
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