"use client";

import { useState } from "react";

const dummyEnquiries = [
  { id: 1, name: "Rahul Kumar", course: "Spoken English", status: "Follow up", date: "21/08/2025" },
  { id: 2, name: "Priya Sharma", course: "Basic Computer", status: "New Enquiry", date: "20/08/2025" },
  { id: 3, name: "Amit Singh", course: "Tally", status: "Converted", date: "19/08/2025" },
  { id: 4, name: "Suman Verma", course: "Web Development", status: "New Enquiry", date: "18/08/2025" },
  { id: 5, name: "Vijay Kumar", course: "Digital Marketing", status: "Follow up", date: "17/08/2025" },
];

interface Props {
  onSelectEnquiry: (enquiry: any) => void;
  onNewEnquiry: () => void;
}

export default function EnqSidebar({
  onSelectEnquiry,
  onNewEnquiry,
}: Props) {

  const [selectedId, setSelectedId] = useState<number | null>(null);

  return (
    <aside className="w-[320px] bg-white border-r border-gray-200 flex flex-col">

      {/* Inner Wrapper (IMPORTANT FIX) */}
      <div className="px-4 pt-4">

        {/* Search */}
        <div className="flex items-center bg-gray-100 border rounded-full px-3 py-2">
          <span className="text-gray-400 mr-2">🔍</span>
          <input
            type="text"
            placeholder="Search Student"
            className="flex-1 bg-transparent outline-none text-sm"
          />
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-2 mt-3">
          <button className="px-3 py-1.5 border rounded-full text-sm text-gray-600 hover:bg-gray-100">
            All
          </button>
          <button className="px-3 py-1.5 border rounded-full text-sm text-gray-600 hover:bg-gray-100">
            Follow-ups
          </button>
          <button
            onClick={onNewEnquiry}
            className="px-3 py-1.5 bg-blue-600 text-white rounded-full text-sm hover:bg-blue-700"
          >
            New Enquiry
          </button>
        </div>

      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 mt-4 space-y-2">
        {dummyEnquiries.map((enquiry) => (
          <div
            key={enquiry.id}
            onClick={() => {
              setSelectedId(enquiry.id);
              onSelectEnquiry(enquiry);
            }}
            className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition ${
              selectedId === enquiry.id
                ? "bg-green-50 border border-green-200"
                : "hover:bg-gray-50"
            }`}
          >
            {/* Avatar */}
            <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-semibold text-sm">
              {enquiry.name.charAt(0)}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-gray-900 truncate">
                {enquiry.name}
              </div>
              <div className="text-xs text-gray-500 truncate">
                {enquiry.date} - {enquiry.course}
              </div>
            </div>
          </div>
        ))}
      </div>

    </aside>
  );
}