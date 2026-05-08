"use client";

import { useState, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import useLeadForm from "./useLeadForm";
import LeadMainBlocks from "@/app/components/forms/lead/LeadMainBlocks";
import GroupEntryModal from "@/app/components/forms/lead/GroupEntryModal";
import { buildLeadPayload } from "@/lib/helpers/buildLeadPayload";
import BranchSelector from "@/app/components/ui/BranchSelector";

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
    methods,
    channels,
    areas,
    leadFor,
    departments,
    courses,
    leadChances,
    leadStages,
    actions,
    counsellors,
    educations,

    mapOptions,
    cities,

    resetForm,
    fetchCities

  } = useLeadForm();

  const [groupOpen, setGroupOpen] = useState(false);
  const [groupMembers, setGroupMembers] = useState<any[]>([]);

  // ✅ NEW: CITY MODAL STATE
  const [cityModalOpen, setCityModalOpen] = useState(false);
  const [newCity, setNewCity] = useState("");

  const isPrimaryValid =
    formData.studentName?.trim() &&
    /^\d{10}$/.test(formData.mobileNumber);

  const handleSubmit = async (e:any) => {

    e.preventDefault();

    if (!formData.branch) {
      alert("Select branch");
      return;
    }

    // ✅ AUTO NAME
    if (!formData.studentName.trim()) {
      formData.studentName = `${formData.channel || "Lead"} ${formData.mobileNumber}`;
    }

    if (!/^\d{10}$/.test(formData.mobileNumber)) {
      alert("Enter valid 10 digit mobile");
      mobileRef.current?.focus();
      return;
    }

    setLoading(true);

try {

  // ✅ DUPLICATE NAME CHECK
  const { data: existingLead } = await supabase
    .from("leads")
    .select("id")
    .ilike("student_name", formData.studentName.trim())
    .limit(1)
    .maybeSingle();

  if (existingLead) {
  alert("Student name already exists");
  setLoading(false);
  studentRef.current?.focus();
  return;
}

// ✅ MOBILE NUMBER WARNING CHECK
const { data: existingMobile } = await supabase
  .from("leads")
  .select("student_name")
  .eq("mobile_number", formData.mobileNumber)
  .limit(1)
  .maybeSingle();

if (existingMobile) {

  const confirmSave = confirm(
    `This mobile number already exists with "${existingMobile.student_name}". Do you still want to save?`
  );

  if (!confirmSave) {
    setLoading(false);
    mobileRef.current?.focus();
    return;
  }

}

  const mainPayload = buildLeadPayload(formData);

      const { error: mainError } = await supabase
        .from("leads")
        .insert([mainPayload]);

      if (mainError) {
        console.error(mainError);
        alert("Error saving lead");
        setLoading(false);
        return;
      }

      if (groupMembers.length > 0) {

        const groupPayload = groupMembers.map((m) =>
          buildLeadPayload(formData,{
            student_name: m.name,
            mobile_number: m.mobile
          })
        );

        const { error: groupError } = await supabase
          .from("leads")
          .insert(groupPayload);

        if (groupError) {
          console.error(groupError);
        }

      }

      // ✅ CITY DUPLICATE SAFE INSERT
      if (formData.city?.trim()) {

        const cityName = formData.city.trim();

        const { data: existing } = await supabase
          .from("cities")
          .select("id")
          .ilike("name", cityName)
          .limit(1);

        if (!existing || existing.length === 0) {

          const { error } = await supabase
            .from("cities")
            .insert([{ name: cityName }]);

          if (error) {
            console.error(error);
          }

        }

      }

      await fetchCities();

      alert("Lead saved successfully");

      resetForm();
      setGroupMembers([]);

    } catch (err) {

      console.error(err);
      alert("Unexpected error saving lead");

    }

    setLoading(false);

  };

  return (

    <form onSubmit={handleSubmit} className="space-y-8 text-sm">

      {/* BRANCH */}
      <BranchSelector
        branches={branches}
        value={formData.branch}
        onChange={(branch)=>setFormData({ ...formData, branch })}
      />

      {formData.branch && (

        <>

         <LeadMainBlocks

  formData={formData}
  setFormData={setFormData}
  handleChange={handleChange}

  mapOptions={mapOptions}

  studentRef={studentRef}
  mobileRef={mobileRef}

  cities={cities}

  methods={methods}
  channels={channels}
  areas={areas}
  leadFor={leadFor}
  departments={departments}
  courses={courses}
  leadChances={leadChances}
  leadStages={leadStages}
  actions={actions}
  counsellors={counsellors}
  educations={educations}

  openCityModal={() => setCityModalOpen(true)}  // ✅ NEW LINE

/>

          <div className="flex justify-between items-center pt-4">

            <button
              type="button"
              disabled={!isPrimaryValid}
              onClick={()=>setGroupOpen(true)}
              className={`px-4 py-2 rounded-md text-white transition
              ${
                isPrimaryValid
                ? "bg-green-600 hover:bg-green-700"
                : "bg-gray-400 cursor-not-allowed"
              }`}
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

      {/* GROUP MODAL */}
      <GroupEntryModal
        isOpen={groupOpen}
        onClose={()=>setGroupOpen(false)}
        onSave={(members)=>setGroupMembers(members)}
      />

      {/* ✅ CITY MODAL */}
      {cityModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded shadow w-80 space-y-3">

            <h3 className="font-semibold">Add New City</h3>

            <input
              value={newCity}
              onChange={(e) => setNewCity(e.target.value)}
              placeholder="Enter city name"
              className="w-full border px-2 py-1 rounded"
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setCityModalOpen(false)}
                className="px-3 py-1 bg-gray-300 rounded"
              >
                Cancel
              </button>

                              <button
  type="button"   // ✅ THIS IS THE FIX
  onClick={async () => {

                  if (!newCity.trim()) return;

                  await supabase
  .from("cities")
  .insert([{ name: newCity.trim() }]);

await fetchCities();

// 👉 auto select new city
setFormData((prev:any) => ({
  ...prev,
  city: newCity.trim()
}));

setCityModalOpen(false);
setNewCity("");

                }}
                className="px-3 py-1 bg-blue-600 text-white rounded"
              >
                Save
              </button>
            </div>

          </div>
        </div>
      )}

    </form>

  );

}