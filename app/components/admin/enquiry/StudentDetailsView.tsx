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
    <div className="flex flex-col h-full bg-white p-6 overflow-y-auto">

      {/* Top Meta Row */}
      <div className="flex flex-wrap gap-6 text-sm text-gray-600 mb-4">
        <div className="flex items-center gap-2">
          <CalendarDays size={16} /> {date} at {enquiryTime}
        </div>
        <div className="flex items-center gap-2">
          <Share2 size={16} /> {branch}
        </div>
        <div className="flex items-center gap-2">
          <UserCheck size={16} /> {enquiryMethod}
        </div>
        <div className="flex items-center gap-2">
          <Megaphone size={16} /> {source}
        </div>
        <div className="flex items-center gap-2">
          <User size={16} /> {counsellor}
        </div>

        <div className="ml-auto flex items-center gap-2 text-blue-600 cursor-pointer">
          <Edit size={16} /> Edit
        </div>
      </div>

      {/* Profile Header */}
      <div className="flex gap-6 border-b pb-6">

        {/* Avatar */}
        <div className="w-24 h-24 rounded-full bg-blue-600 text-white flex items-center justify-center text-3xl font-bold">
          {name.charAt(0)}
        </div>

        {/* Info */}
        <div className="flex flex-col gap-2 flex-1">

          {/* Name + Badges */}
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-2xl font-semibold">{name}</h2>

            <span className="text-sm text-gray-600">
              {age} Y {gender?.charAt(0)}
            </span>

            <Badge text={maritalStatus} />
            <Badge text={profession} />
            <Badge text={lastEducation} />
            <Badge text={institute} />
          </div>

          {/* Contact Row */}
          <div className="flex flex-wrap gap-6 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <MapPin size={16} /> {area}
            </div>

            <div className="flex items-center gap-2">
              <Phone size={16} /> {mobile}
            </div>

            <div className="flex items-center gap-2 text-green-600">
              <MessageCircle size={16} /> {whatsapp}
            </div>

            <div className="flex items-center gap-2">
              <User size={16} /> {enquiredBy}
            </div>

            <div className="flex items-center gap-2">
              <User size={16} /> {enquiredFor}
            </div>
          </div>

          {/* Course + Timing */}
          <div className="text-sm text-gray-700 mt-1">
            {course} ({timing})
          </div>

          {/* Remark */}
          <div className="text-sm text-gray-500 mt-1">
            {remark}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-6">
        <div className="flex gap-8 border-b text-sm font-medium">
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

/* Small Badge Component */
function Badge({ text }: { text: string }) {
  return (
    <span className="text-xs bg-gray-100 px-2 py-1 rounded-full text-gray-600">
      {text}
    </span>
  );
}

function FollowCard() {
  return (
    <div className="border rounded-lg p-4 flex justify-between text-sm bg-gray-50">
      <div>
        <div className="text-gray-500 mb-1">26th Aug, 2025</div>
        <div className="text-gray-700">
          Spoke with student. He is interested in the full-stack course.
          Will follow up next week.
        </div>
      </div>
      <div className="text-gray-500">10:30 AM</div>
    </div>
  );
}
