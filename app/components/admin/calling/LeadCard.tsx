"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import LeadDetails from "./LeadDetails";
import { supabase } from "@/lib/supabaseClient";

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

  area?: string;
  city?: string;
  gender?: string;
  age?: number;
  profession?: string;
  education?: string;
  alternate_number?: string;
  contact_time?: string;
  enquiry_date?: string;
  enquiry_time?: string;
  method?: string;
  channel?: string;
  enquired_by?: string;
  for_whom?: string;
  department?: string;
  preferred_timing?: string;
  preferred_batch?: string;
  next_follow_date?: string;
  next_follow_time?: string;
  counsellor?: string;
  remark?: string;
};

type Props = {
  lead: Lead;
  expandedId: string | null;
  setExpandedId: (id: string | null) => void;
};

export default function LeadCard({
  lead,
  expandedId,
  setExpandedId,
}: Props) {
  const router = useRouter();
  const isExpanded = expandedId === lead.id;
  const [totalPaid, setTotalPaid] = useState(0);

  // ✅ TOTAL PAID FETCH
  useEffect(() => {
    const fetchPayments = async () => {
      const { data } = await supabase
        .from("receipts")
        .select("amount, student_name")
        .eq("student_name", lead.name);

      if (data) {
        const total = data.reduce((s, r) => s + (r.amount || 0), 0);
        setTotalPaid(total);
      }
    };

    fetchPayments();
  }, [lead.name]);

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
      {/* HEADER */}
      <div className="flex justify-between items-start">
        <div className="flex-1 space-y-1">

          {/* NAME + DATE */}
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

          {/* COURSE */}
          <div className="text-gray-700 text-sm">
            {lead.course || (
              <span className="text-gray-400">Course N/A</span>
            )}
          </div>

          {/* STAGE + CHANCES */}
          <div className="flex gap-2 flex-wrap text-xs">
            {lead.lead_stage && (
              <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded">
                {lead.lead_stage}
              </span>
            )}
            {lead.lead_chances && (
              <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                {lead.lead_chances}
              </span>
            )}
          </div>

        </div>

        {/* ARROW */}
        <div className="ml-2">
          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </div>

      {/* TOTAL PAID */}
      <div className="mt-1 text-sm text-green-700 font-medium">
        Total Paid: {totalPaid}.00
      </div>

      {/* BATCH */}
      <div className="mt-1 text-sm text-gray-600">
        {lead.batch_name || "No Batch"}
      </div>

      {/* ACTIONS */}
      <div
        className="flex gap-5 mt-1.5 text-blue-600 text-sm"
        onClick={(e) => e.stopPropagation()}
      >
        <a href={`tel:${lead.mobile}`}>Call</a>
        <a href={`https://wa.me/91${lead.mobile}`} target="_blank">
          WhatsApp
        </a>

        <span
          className="cursor-pointer"
          onClick={() => {
            router.push(`/admin/calling/${lead.id}`);
          }}
        >
          Call Feedback
        </span>
      </div>

      {/* EXPANDED CONTENT */}
      {isExpanded && (
        <div
          className="mt-2 border-t pt-2 space-y-2 text-gray-700 text-sm"
          onClick={(e) => e.stopPropagation()}
        >
          {/* FOLLOWUPS */}
          {lead.followUps.slice(0, 5).map((fu, i) => (
            <div key={i}>
              <p className="text-sm">
                {new Date(fu.date).toLocaleDateString("en-GB")} -{" "}
                <span className={resultColor(fu.type)}>
                  {fu.type}
                </span>
              </p>
            </div>
          ))}

          {/* ✅ DIRECT DETAILS (NO EXTRA CLICK) */}
          <LeadDetails lead={lead} />
        </div>
      )}
    </div>
  );
}