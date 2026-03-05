"use client";

import { useState, useEffect } from "react";
import {
  MapPin,
  Phone,
  MessageCircle,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

interface Props {
  selectedStudent: any;
}

export default function StudentDetailsView({ selectedStudent }: Props) {

  const [activeTab, setActiveTab] = useState("Follow up");
  const [followups, setFollowups] = useState<any[]>([]);

  useEffect(() => {

    async function loadFollowups() {

      if (!selectedStudent?.id) return;

      const { data } = await supabase
        .from("lead_followups")
        .select("*")
        .order("created_at", { ascending: false });

      if (!data) {
        setFollowups([]);
        return;
      }

      const filtered = data.filter(
        (f: any) => String(f.lead_id) === String(selectedStudent.id)
      );

      setFollowups(filtered);

    }

    loadFollowups();

  }, [selectedStudent]);

  if (!selectedStudent) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        Please select a student
      </div>
    );
  }

  const {
    student_name = "",
    course = "",
    mobile_number = "",
    area = "",
    remark = "",
  } = selectedStudent;

  const name = student_name;
  const mobile = mobile_number;

  return (
    <div className="flex flex-col h-full bg-white px-4 py-4 overflow-y-auto">

      {/* PROFILE */}

      <div className="flex flex-col sm:flex-row gap-6 border-b pb-6">

        <div className="w-20 h-20 rounded-full bg-blue-600 text-white flex items-center justify-center text-2xl font-bold">
          {name?.charAt(0)}
        </div>

        <div className="flex flex-col gap-3 flex-1">

          <h2 className="text-xl font-semibold">{name}</h2>

          <div className="flex gap-4 text-sm text-gray-600">
            <Meta icon={<MapPin size={14} />} text={area} />
            <Meta icon={<Phone size={14} />} text={mobile} />
            <Meta icon={<MessageCircle size={14} />} text={mobile} className="text-green-600" />
          </div>

          <div className="text-sm text-gray-700">
            {course}
          </div>

          <div className="text-sm text-gray-500">
            {remark}
          </div>

        </div>

      </div>

      {/* TABS */}

      <div className="mt-6">

        <div className="flex gap-6 border-b text-sm font-medium">

          {["Follow up", "Courses", "Activity Log"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-2 ${
                activeTab === tab
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500"
              }`}
            >
              {tab}
            </button>
          ))}

        </div>

        {/* FOLLOWUPS */}

        <div className="mt-4 space-y-4">

          {activeTab === "Follow up" && (

            followups.length === 0 ? (

              <div className="text-gray-400 text-sm">
                No followups found
              </div>

            ) : (

              followups.map((fu) => (
                <FollowCard
                  key={fu.id}
                  date={fu.created_at}
                  remark={fu.remark}
                />
              ))

            )

          )}

        </div>

      </div>

    </div>
  );
}

/* COMPONENTS */

function Meta({ icon, text, className = "" }: any) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {icon} {text}
    </div>
  );
}

function FollowCard({ date, remark }: any) {

  const d = new Date(date);

  const formattedDate = d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const time = d.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (

    <div className="border rounded-lg p-4 flex justify-between gap-3 text-sm bg-gray-50">

      <div>

        <div className="text-gray-500 mb-1 text-xs">
          {formattedDate}
        </div>

        <div className="text-gray-700 text-sm">
          {remark}
        </div>

      </div>

      <div className="text-gray-500 text-xs">
        {time}
      </div>

    </div>

  );

}