"use client";

import { useState, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import useLeadForm from "./useLeadForm";
import LeadMainBlocks from "@/app/components/forms/lead/LeadMainBlocks";
import GroupEntryModal from "@/app/components/forms/lead/GroupEntryModal";
import { buildLeadPayload } from "@/lib/helpers/buildLeadPayload";

export default function LeadForm() {

  const studentRef = useRef<HTMLInputElement>(null);
  const mobileRef = useRef<HTMLInputElement>(null);

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

  const isPrimaryValid =
    formData.studentName?.trim() &&
    /^\d{10}$/.test(formData.mobileNumber);

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (!formData.branch) {
      alert("Select branch");
      return;
    }

    if (!formData.studentName.trim()) {
      alert("Student Name required");
      studentRef.current?.focus();
      return;
    }

    if (!/^\d{10}$/.test(formData.mobileNumber)) {
      alert("Enter valid 10 digit mobile");
      mobileRef.current?.focus();
      return;
    }

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
            courseOptions={courseOptions}
            mapOptions={mapOptions}
            studentRef={studentRef}
            mobileRef={mobileRef}
          />

          {/* BUTTON SECTION */}
          <div className="flex justify-between items-center pt-4">
            <button
              type="button"
              disabled={!isPrimaryValid}
              onClick={() => setGroupOpen(true)}
              className={`px-4 py-2 rounded-md text-white transition
                ${isPrimaryValid
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-gray-400 cursor-not-allowed"}`}
            >
              ➕ Add Group Members
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 rounded-md text-white bg-blue-600 hover:bg-blue-700 transition"
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