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

type Lead = {
  id: string;
  name: string;
  mobile: string;
  course: string;
  enquiryDate: string;
  followUps: FollowUp[];
  lead_stage?: string;
  lead_chances?: string;
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

  return (
    <div
      className="bg-white rounded shadow-sm p-3 text-sm cursor-pointer w-full hover:bg-gray-50 transition"
      onClick={() => setExpandedId(isExpanded ? null : lead.id)}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1 space-y-1">

          {/* ROW 1 */}
          <div className="flex items-center flex-wrap gap-1">
            <span
              className="font-medium text-blue-600 underline cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/admin/lead/${lead.id}`);
              }}
            >
              {lead.name}
            </span>

            <span className="text-gray-700 text-sm">
              {new Date(lead.enquiryDate).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
              })}{" "}
              ({lead.followUps.length})
            </span>
          </div>

          {/* ROW 2 */}
          <div className="text-gray-700 text-sm">
            Course - {lead.course ? lead.course : "N/A"}
          </div>

          {/* ROW 3 */}
          <div className="flex gap-2 flex-wrap text-xs">

            {lead.lead_stage === "Lead" ? (
              <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded">
                Lead Stage - {lead.lead_stage}
              </span>
            ) : (
              <span className="text-gray-700">
                Lead Stage {lead.lead_stage ? lead.lead_stage : "N/A"}
              </span>
            )}

            {lead.lead_chances === "High" ? (
              <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded">
                Lead Chances - {lead.lead_chances}
              </span>
            ) : (
              <span className="text-gray-700">
                Lead Chances {lead.lead_chances ? lead.lead_chances : "N/A"}
              </span>
            )}

          </div>

        </div>

        <div className="ml-2">
          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </div>

      {/* ROW 4 */}
      <div className="mt-1 text-sm text-gray-700">
        <div className="text-gray-600">
          {lead.batch_name ? lead.batch_name : "No Batch"}
        </div>
      </div>

      {/* ROW 5 */}
      <div
        className="flex gap-5 mt-1.5 text-blue-600 text-sm"
        onClick={(e) => e.stopPropagation()}
      >
        <a href={`tel:${lead.mobile}`}>Call</a>
        <a href={`https://wa.me/91${lead.mobile}`} target="_blank">
          WhatsApp
        </a>
      </div>

      {isExpanded && (
        <div
          className="mt-2 border-t pt-2 space-y-2 text-gray-700 text-sm"
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
                  className={`flex justify-between items-center px-2 py-1 ${
                    hasExtra ? "cursor-pointer" : ""
                  }`}
                  onClick={(e) => {
                    if (!hasExtra) return;
                    e.stopPropagation();
                    setOpenFU(isOpen ? null : i);
                  }}
                >
                  <p className="font-medium text-gray-800 text-sm">
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
                  <div className="px-2 pb-2 space-y-1 text-gray-600 text-sm">
                    {fu.mood && <p>Mood - {fu.mood}</p>}
                    {fu.note && <p>Remark - {fu.note}</p>}
                  </div>
                )}
              </div>
            );
          })}

          <InlineCallingForm
            leadId={lead.id}
            currentStatus={lead.lead_stage || ""}
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