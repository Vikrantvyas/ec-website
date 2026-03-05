"use client";

import { useState } from "react";
import BranchesMaster from "@/app/components/admin/masters/BranchesMaster";

interface MasterCategory {
  label: string;
  value: string;
  subMasters: { label: string; value: string }[];
}

const masterCategories: MasterCategory[] = [

  {
    label: "Leads",
    value: "leads",
    subMasters: [
      { label: "Areas", value: "areas" },
      { label: "Branches", value: "branches" },
      { label: "Counsellors", value: "counsellors" },
      { label: "Sources", value: "sources" },
      { label: "Education", value: "education" },
      { label: "Institutes", value: "institutes" },
      { label: "Profession Categories", value: "profession_categories" },
    ],
  },

  {
    label: "Courses",
    value: "courses",
    subMasters: [
      { label: "Departments", value: "departments" },
      { label: "Courses", value: "courses_master" },
    ],
  },

  {
    label: "Batch",
    value: "batch",
    subMasters: [
      { label: "Batches", value: "batches" },
      { label: "Teachers", value: "teachers" },
    ],
  },

  {
    label: "Attendance",
    value: "attendance",
    subMasters: [
      { label: "Attendance Settings", value: "attendance_settings" },
    ],
  },

  {
    label: "Finance",
    value: "finance",
    subMasters: [
      { label: "Payment Modes", value: "payment_modes" },
    ],
  },

];

export default function MastersPage() {

  const [selectedCategory, setSelectedCategory] = useState("leads");
  const [selectedMaster, setSelectedMaster] = useState("branches");

  const currentMasters =
    masterCategories.find((c) => c.value === selectedCategory)?.subMasters || [];

  return (

    <div className="min-h-screen p-6">

      <div className="bg-white p-6 rounded-lg border">

        <div className="grid md:grid-cols-2 gap-4 mb-6">

          <div>

            <label className="text-sm text-gray-600">
              Category
            </label>

            <select
              className="w-full border rounded-lg p-2 mt-1"
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setSelectedMaster("");
              }}
            >
              {masterCategories.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>

          </div>

          <div>

            <label className="text-sm text-gray-600">
              Master
            </label>

            <select
              className="w-full border rounded-lg p-2 mt-1"
              value={selectedMaster}
              onChange={(e) => setSelectedMaster(e.target.value)}
            >
              <option value="">Select Master</option>

              {currentMasters.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}

            </select>

          </div>

        </div>

        <div className="border rounded-lg p-6">

          {selectedMaster === "branches" && <BranchesMaster />}

        </div>

      </div>

    </div>

  );

}