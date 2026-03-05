"use client";

import { useState } from "react";

export default function LeadTable({ leads }: { leads: any[] }) {

  const [search, setSearch] = useState("");

  const filteredLeads = leads.filter((lead) =>
    lead.student_name?.toLowerCase().includes(search.toLowerCase()) ||
    lead.mobile_number?.includes(search)
  );

  return (

    <div className="space-y-4">

      {/* Search */}
      <div>
        <input
          type="text"
          placeholder="Search student or mobile..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full md:w-80 border rounded-md px-3 py-2 text-sm"
        />
      </div>

      <div className="overflow-x-auto">

        <table className="w-full border text-sm">

          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border">Student</th>
              <th className="p-2 border">Mobile</th>
              <th className="p-2 border">Course</th>
              <th className="p-2 border">Branch</th>
              <th className="p-2 border">Date</th>
              <th className="p-2 border">Call</th>
            </tr>
          </thead>

          <tbody>

            {filteredLeads.map((lead) => (

              <tr key={lead.id} className="hover:bg-gray-50">

                <td className="p-2 border">{lead.student_name}</td>

                <td className="p-2 border">
                  <a
                    href={`tel:${lead.mobile_number}`}
                    className="text-blue-600 hover:underline"
                  >
                    {lead.mobile_number}
                  </a>
                </td>

                <td className="p-2 border">{lead.course}</td>
                <td className="p-2 border">{lead.branch}</td>

                <td className="p-2 border">
                  {new Date(lead.created_at).toLocaleDateString()}
                </td>

                <td className="p-2 border text-center">

                  <a
                    href={`tel:${lead.mobile_number}`}
                    className="px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
                  >
                    Call
                  </a>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>

  );

}