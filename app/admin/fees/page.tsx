"use client";

import PermissionGuard from "@/app/components/admin/PermissionGuard";

export default function FeesPage() {

  return (

    <PermissionGuard page="Fees">

      <div className="p-6">

        {/* Header */}

        <div className="flex items-center justify-between">

          <h1 className="text-2xl font-semibold">
            Fee Schemes
          </h1>

          <button className="bg-[#0a1f44] text-white px-4 py-2 rounded-md hover:bg-[#163d7a] transition">
            Create Fee Scheme
          </button>

        </div>

        {/* Filters */}

        <div className="mt-6 bg-white border rounded-lg p-4">

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            <select className="border rounded-md px-3 py-2 text-sm">
              <option>Select Department</option>
            </select>

            <select className="border rounded-md px-3 py-2 text-sm">
              <option>Select Course</option>
            </select>

            <input
              type="text"
              placeholder="Search scheme"
              className="border rounded-md px-3 py-2 text-sm"
            />

          </div>

        </div>

        {/* Scheme List */}

        <div className="mt-6 bg-white border rounded-lg">

          <div className="grid grid-cols-8 text-sm font-semibold border-b px-4 py-3 bg-gray-50">

            <div>Scheme</div>
            <div>Course</div>
            <div>Duration</div>
            <div>Class</div>
            <div>Total Fee</div>
            <div>Installments</div>
            <div>Discount</div>
            <div>Action</div>

          </div>

          {/* Example Row */}

          <div className="grid grid-cols-8 text-sm px-4 py-3 border-b items-center">

            <div>Regular Plan</div>
            <div>Spoken English</div>
            <div>3 Month</div>
            <div>1 Hour</div>
            <div>6000</div>
            <div>3</div>
            <div>Allowed</div>

            <div className="flex gap-2">

              <button className="text-xs bg-gray-100 px-3 py-1 rounded hover:bg-gray-200">
                Edit
              </button>

              <button className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200">
                View
              </button>

            </div>

          </div>

        </div>

      </div>

    </PermissionGuard>

  );

}