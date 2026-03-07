"use client";

import { useState } from "react";

export default function AdmissionForm() {

  const [demoRequired, setDemoRequired] = useState(true);

  return (

    <div className="space-y-6">

      {/* Lead Information */}

      <div className="bg-white shadow rounded-lg p-6">

        <h2 className="text-lg font-semibold mb-4">
          Lead Information
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          <input
            type="text"
            placeholder="Student Name"
            className="border rounded px-3 py-2 w-full"
          />

          <input
            type="text"
            placeholder="Mobile"
            className="border rounded px-3 py-2 w-full"
          />

          <input
            type="text"
            placeholder="Father Name"
            className="border rounded px-3 py-2 w-full"
          />

          <input
            type="text"
            placeholder="Course"
            className="border rounded px-3 py-2 w-full"
          />

          <input
            type="text"
            placeholder="Branch"
            className="border rounded px-3 py-2 w-full"
          />

        </div>

      </div>


      {/* Demo Planning */}

      <div className="bg-white shadow rounded-lg p-6">

        <h2 className="text-lg font-semibold mb-4">
          Demo Planning
        </h2>

        <div className="flex items-center gap-4 mb-4">

          <label className="flex items-center gap-2">
            <input
              type="radio"
              checked={demoRequired}
              onChange={() => setDemoRequired(true)}
            />
            Demo Required
          </label>

          <label className="flex items-center gap-2">
            <input
              type="radio"
              checked={!demoRequired}
              onChange={() => setDemoRequired(false)}
            />
            Direct Admission
          </label>

        </div>

        {demoRequired && (

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            <input
              type="date"
              className="border rounded px-3 py-2"
              placeholder="Demo Start"
            />

            <input
              type="date"
              className="border rounded px-3 py-2"
              placeholder="Demo End"
            />

            <input
              type="text"
              placeholder="Demo Batch"
              className="border rounded px-3 py-2"
            />

            <input
              type="text"
              placeholder="Trainer"
              className="border rounded px-3 py-2"
            />

          </div>

        )}

      </div>


      {/* Admission Details */}

      <div className="bg-white shadow rounded-lg p-6">

        <h2 className="text-lg font-semibold mb-4">
          Admission Details
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          <input
            type="date"
            className="border rounded px-3 py-2"
          />

          <input
            type="text"
            placeholder="Batch"
            className="border rounded px-3 py-2"
          />

          <input
            type="text"
            placeholder="Counsellor"
            className="border rounded px-3 py-2"
          />

        </div>

      </div>


      {/* Fee Details */}

      <div className="bg-white shadow rounded-lg p-6">

        <h2 className="text-lg font-semibold mb-4">
          Fee Details
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

          <input
            type="number"
            placeholder="Total Fees"
            className="border rounded px-3 py-2"
          />

          <input
            type="number"
            placeholder="Discount"
            className="border rounded px-3 py-2"
          />

          <input
            type="number"
            placeholder="Paid Amount"
            className="border rounded px-3 py-2"
          />

          <select className="border rounded px-3 py-2">

            <option>Payment Mode</option>
            <option>Cash</option>
            <option>UPI</option>
            <option>Card</option>

          </select>

        </div>

      </div>


      {/* Save Button */}

      <div className="flex justify-end">

        <button className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
          Save Admission
        </button>

      </div>

    </div>

  );

}