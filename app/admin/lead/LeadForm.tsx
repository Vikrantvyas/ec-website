"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import useLeadForm from "./useLeadForm";
import LeadMainBlocks from "@/app/components/forms/lead/LeadMainBlocks";
import GroupEntryModal from "@/app/components/forms/lead/GroupEntryModal";
import { buildLeadPayload } from "@/lib/helpers/buildLeadPayload";

export default function LeadForm() {

  const {
    formData,
    setFormData,
    handleChange,
    loading,
    setLoading,
    branches,
    courseOptions,
    mapOptions,
    resetForm
  } = useLeadForm();

  const [groupOpen, setGroupOpen] = useState(false);
  const [groupMembers, setGroupMembers] = useState<any[]>([]);

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (!formData.branch) return alert("Select branch");
    if (!formData.studentName.trim()) return alert("Student Name required");
    if (!/^\d{10}$/.test(formData.mobileNumber))
      return alert("Enter valid 10 digit mobile");

    setLoading(true);

    try {
      const mainPayload = buildLeadPayload(formData);
      await supabase.from("leads").insert([mainPayload]);

      if (groupMembers.length > 0) {
        const groupPayload = groupMembers.map((m) =>
          buildLeadPayload(formData, {
            student_name: m.name,
            mobile_number: m.mobile,
          })
        );
        await supabase.from("leads").insert(groupPayload);
      }

      alert("Lead saved successfully");
      resetForm();
      setGroupMembers([]);
    } catch (err) {
      console.error(err);
      alert("Error saving lead");
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 text-sm">

      {/* Branch */}
      <div className="space-y-2">
        <p className="font-semibold">Select Branch</p>
        <div className="flex gap-2 flex-wrap">
          {branches.map((b: string) => (
            <button
              key={b}
              type="button"
              onClick={() => setFormData({ ...formData, branch: b })}
              className={`px-3 py-1 rounded-full border
                ${formData.branch === b
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white border-gray-300"}`}
            >
              {b}
            </button>
          ))}
        </div>
      </div>

      {formData.branch && (
        <>
          <LeadMainBlocks
            formData={formData}
            setFormData={setFormData}
            handleChange={handleChange}
            branches={branches}
            courseOptions={courseOptions}
            mapOptions={mapOptions}
          />

          {/* BUTTON SECTION */}
          <div className="flex justify-between items-center">
            <button
              type="button"
              onClick={() => setGroupOpen(true)}
              className="px-4 py-2 border rounded-md"
            >
              ➕ Add Group Members
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 rounded-md text-white bg-blue-600"
            >
              {loading ? "Saving..." : "Save Lead"}
            </button>
          </div>
        </>
      )}

      <GroupEntryModal
        isOpen={groupOpen}
        onClose={() => setGroupOpen(false)}
        onSave={(members) => setGroupMembers(members)}
      />

    </form>
  );
}