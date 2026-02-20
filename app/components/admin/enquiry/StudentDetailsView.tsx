"use client";

import { useState } from "react";
import {
  MapPin,
  Phone,
  MessageCircle,
  User,
  Edit,
  CalendarDays,
  Share2,
  Megaphone,
  UserCheck,
} from "lucide-react";

interface Props {
  selectedStudent: any;
}

export default function StudentDetailsView({ selectedStudent }: Props) {
  const [activeTab, setActiveTab] = useState("Follow up");

  if (!selectedStudent) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        Please select a student
      </div>
    );
  }

  const {
    date = "21/08/2025",
    enquiryTime = "10:30",
    branch = "Nanda Nagar",
    enquiryMethod = "Visit",
    source = "Google",
    counsellor = "Ajay",

    name = "Rahul Kumar",
    age = 22,
    gender = "Male",
    maritalStatus = "Single",
    profession = "Student",
    lastEducation = "Graduation",
    institute = "SGITS",

    mobile = "9876543210",
    whatsapp = "9876543210",
    area = "Shyam Nagar",

    enquiredBy = "Self",
    enquiredFor = "Self",

    course = "Spoken English",
    timing = "6 PM - 8 PM",

    remark = "Interested in spoken english. Will call back in a week.",
  } = selectedStudent;

  return (
    <div className="flex flex-col h-full bg-white px-4 py-4 overflow-y-auto">

      {/* Top Meta Row */}
      <div className="flex flex-wrap gap-4 text-xs sm:text-sm text-gray-600 mb-4">

        <Meta icon={<CalendarDays size={14} />} text={`${date} at ${enquiryTime}`} />
        <Meta icon={<Share2 size={14} />} text={branch} />
        <Meta icon={<UserCheck size={14} />} text={enquiryMethod} />
        <Meta icon={<Megaphone size={14} />} text={source} />
        <Meta icon={<User size={14} />} text={counsellor} />

        <div className="sm:ml-auto flex items-center gap-2 text-blue-600 cursor-pointer">
          <Edit size={14} /> Edit
        </div>
      </div>

      {/* Profile Section */}
      <div className="flex flex-col sm:flex-row gap-6 border-b pb-6">

        {/* Avatar */}
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-blue-600 text-white flex items-center justify-center text-2xl sm:text-3xl font-bold">
          {name.charAt(0)}
        </div>

        {/* Info */}
        <div className="flex flex-col gap-3 flex-1">

          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-semibold">{name}</h2>
            <span className="text-xs sm:text-sm text-gray-600">
              {age} Y {gender?.charAt(0)}
            </span>

            <Badge text={maritalStatus} />
            <Badge text={profession} />
            <Badge text={lastEducation} />
            <Badge text={institute} />
          </div>

          <div className="flex flex-wrap gap-4 text-xs sm:text-sm text-gray-600">
            <Meta icon={<MapPin size={14} />} text={area} />
            <Meta icon={<Phone size={14} />} text={mobile} />
            <Meta icon={<MessageCircle size={14} />} text={whatsapp} className="text-green-600" />
            <Meta icon={<User size={14} />} text={enquiredBy} />
            <Meta icon={<User size={14} />} text={enquiredFor} />
          </div>

          <div className="text-xs sm:text-sm text-gray-700">
            {course} ({timing})
          </div>

          <div className="text-xs sm:text-sm text-gray-500">
            {remark}
          </div>

        </div>
      </div>

      {/* Tabs */}
      <div className="mt-6">

        <div className="flex gap-6 border-b text-sm font-medium overflow-x-auto no-scrollbar">
          {["Follow up", "Courses", "Activity Log"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-2 whitespace-nowrap ${
                activeTab === tab
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="mt-4 space-y-4">
          {activeTab === "Follow up" && (
            <>
              <FollowCard />
              <FollowCard />
              <FollowCard />
            </>
          )}
        </div>

      </div>
    </div>
  );
}

/* ===== Reusable Components ===== */

function Badge({ text }: { text: string }) {
  return (
    <span className="text-xs bg-gray-100 px-2 py-1 rounded-full text-gray-600">
      {text}
    </span>
  );
}

function Meta({ icon, text, className = "" }: any) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {icon} {text}
    </div>
  );
}

function FollowCard() {
  return (
    <div className="border rounded-lg p-4 flex flex-col sm:flex-row sm:justify-between gap-3 text-sm bg-gray-50">
      <div>
        <div className="text-gray-500 mb-1 text-xs">26th Aug, 2025</div>
        <div className="text-gray-700 text-sm">
          Spoke with student. He is interested in the full-stack course.
          Will follow up next week.
        </div>
      </div>
      <div className="text-gray-500 text-xs sm:text-sm">
        10:30 AM
      </div>
    </div>
  );
}