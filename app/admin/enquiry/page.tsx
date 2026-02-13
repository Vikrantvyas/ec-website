"use client";

import { useState } from "react";

const dummyLeads = [
  { id: 1, name: "Rahul Kumar", course: "Spoken English" },
  { id: 2, name: "Priya Sharma", course: "Basic Computer" },
  { id: 3, name: "Amit Singh", course: "Tally" },
  { id: 4, name: "Suman Verma", course: "Web Development" },
  { id: 5, name: "Vijay Kumar", course: "Digital Marketing" },
];

export default function EnquiryPage() {
  const [selectedLead, setSelectedLead] = useState(dummyLeads[0]);
  const [activeTab, setActiveTab] = useState("followup");

  return (
    <div className="flex h-full bg-gray-100">

      {/* LEFT PANEL */}
      <div className="w-72 bg-white border-r flex flex-col">

        {/* Search */}
        <div className="p-4 border-b">
          <input
            type="text"
            placeholder="Search Student"
            className="w-full border rounded px-3 py-2 text-sm"
          />
        </div>

        {/* Filters */}
        <div className="flex gap-2 p-4 border-b text-sm">
          <button className="px-3 py-1 bg-blue-600 text-white rounded">
            All
          </button>
          <button className="px-3 py-1 border rounded">
            Follow-ups
          </button>
          <button className="px-3 py-1 border rounded">
            New Enquiry
          </button>
        </div>

        {/* Leads List */}
        <div className="flex-1 overflow-y-auto">
          {dummyLeads.map((lead) => (
            <div
              key={lead.id}
              onClick={() => setSelectedLead(lead)}
              className={`p-4 border-b cursor-pointer ${
                selectedLead.id === lead.id
                  ? "bg-blue-50"
                  : "hover:bg-gray-50"
              }`}
            >
              <div className="font-medium">{lead.name}</div>
              <div className="text-xs text-gray-500">
                {lead.course}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="flex-1 p-6">

        {/* Lead Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-semibold">
            {selectedLead.name}
          </h2>
          <p className="text-gray-500 text-sm">
            Interested in {selectedLead.course}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-6 border-b mb-6">
          <button
            onClick={() => setActiveTab("followup")}
            className={`pb-2 ${
              activeTab === "followup"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-500"
            }`}
          >
            Follow Up
          </button>

          <button
            onClick={() => setActiveTab("courses")}
            className={`pb-2 ${
              activeTab === "courses"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-500"
            }`}
          >
            Courses
          </button>

          <button
            onClick={() => setActiveTab("activity")}
            className={`pb-2 ${
              activeTab === "activity"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-500"
            }`}
          >
            Activity Log
          </button>
        </div>

        {/* Tab Content */}
        <div className="space-y-4">

          {activeTab === "followup" && (
            <>
              <div className="p-4 bg-white rounded shadow text-sm">
                26 Aug 2025 – Spoke with student. Will follow up next week.
              </div>
              <div className="p-4 bg-white rounded shadow text-sm">
                25 Aug 2025 – Called and left a message.
              </div>
            </>
          )}

          {activeTab === "courses" && (
            <div className="p-4 bg-white rounded shadow text-sm">
              Course Interested: {selectedLead.course}
            </div>
          )}

          {activeTab === "activity" && (
            <div className="p-4 bg-white rounded shadow text-sm">
              Lead created. WhatsApp message sent.
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
