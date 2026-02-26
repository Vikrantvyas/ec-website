"use client";

import { supabase } from "@/lib/supabaseClient";
import useLeadForm from "./useLeadForm";
import { Block, Input, SelectField } from "@/app/components/forms/lead/LeadFormFields";

export default function LeadForm() {

  const {
    formData,
    setFormData,
    handleChange,
    step,
    setStep,
    isMobile,
    loading,
    setLoading,
    branches,
    courseOptions,
    mapOptions
  } = useLeadForm();

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (!formData.branch) {
      alert("Please select branch first.");
      return;
    }

    const confirmSave = window.confirm(
      "Are you sure you want to save this lead?"
    );
    if (!confirmSave) return;

    setLoading(true);

    const { error } = await supabase.from("leads").insert([{
      branch: formData.branch,
      enquiry_date: formData.enquiryDate,
      enquiry_time: formData.enquiryTime,
      method: formData.method,
      channel: formData.channel,
      enquired_by: formData.enquiredBy,
      for_whom: formData.forWhom,
      student_name: formData.studentName,
      mobile_number: formData.mobileNumber,
      area: formData.area,
      gender: formData.gender,
      age: formData.age ? parseInt(formData.age) : null,
      marital_status: formData.maritalStatus,
      profession: formData.profession,
      education: formData.education,
      school_timing: formData.schoolTiming,
      contact_time: formData.contactTime,
      department: formData.department,
      course: formData.course,
      preferred_timing: formData.preferredTiming,
      status: formData.status,
      action: formData.action,
      next_follow_date: formData.nextFollowDate || null,
      next_follow_time: formData.nextFollowTime,
      counsellor: formData.counsellor,
      remark: formData.remark,
    }]);

    setLoading(false);

    if (error) {
      alert("Error saving lead");
      console.error(error);
    } else {
      alert("Lead saved successfully");
      window.location.reload();
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-8 text-sm"
      noValidate
    >

      {/* Branch */}
      {(!isMobile || step === 1) && (
        <div className="space-y-2">
          <p className="text-sm font-semibold text-gray-700">Select Branch</p>
          <div className={`flex gap-2 ${isMobile ? "flex-nowrap overflow-x-auto" : "flex-wrap"}`}>
            {branches.map((b: string) => (
              <button
                key={b}
                type="button"
                onClick={() => setFormData({ ...formData, branch: b })}
                className={`whitespace-nowrap px-3 py-1 rounded-full border
                  ${formData.branch === b
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white border-gray-300"}`}
              >
                {b}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* BLOCKS SAME AS BEFORE */}
      {(!isMobile || step === 1) && (
        <Block title="Basic Info">
          <Input label="Date" name="enquiryDate" value={formData.enquiryDate} readOnly />
          <Input label="Time" name="enquiryTime" value={formData.enquiryTime} readOnly />
          <SelectField label="Method" value={formData.method}
            options={mapOptions(["Visit", "Call", "WhatsApp", "Social Media"])}
            onChange={(val: string) => setFormData({ ...formData, method: val })}
          />
          <SelectField label="Channel" value={formData.channel}
            options={mapOptions(["Main Board", "Friend", "Google", "Instagram", "Banner"])}
            onChange={(val: string) => setFormData({ ...formData, channel: val })}
          />
        </Block>
      )}

      {(!isMobile || step === 2) && (
        <Block title="Student Contact">
          <Input label="Enquired By" name="enquiredBy" value={formData.enquiredBy} onChange={handleChange} />
          <SelectField label="For" value={formData.forWhom}
            options={mapOptions(["Self", "Brother", "Sister", "Friend", "Child"])}
            onChange={(val: string) => setFormData({ ...formData, forWhom: val })}
          />
          <Input label="Student Name" name="studentName" value={formData.studentName} onChange={handleChange} />
          <SelectField label="Area" value={formData.area}
            options={mapOptions(["Alwasa", "Vijay Nagar", "Bhawarkua", "Rajendra Nagar"])}
            onChange={(val: string) => setFormData({ ...formData, area: val })}
          />
          <Input label="Mobile" name="mobileNumber" value={formData.mobileNumber} onChange={handleChange} />
        </Block>
      )}

      {(!isMobile || step === 3) && (
        <Block title="Profile">
          <Input label="Age" name="age" type="number" value={formData.age} onChange={handleChange} />
          <SelectField label="Gender" value={formData.gender}
            options={mapOptions(["Male", "Female", "Other"])}
            onChange={(val: string) => setFormData({ ...formData, gender: val })}
          />
          <SelectField label="Marital Status" value={formData.maritalStatus}
            options={mapOptions(["Single", "Married"])}
            onChange={(val: string) => setFormData({ ...formData, maritalStatus: val })}
          />
          <SelectField label="Profession" value={formData.profession}
            options={mapOptions(["Student", "Job", "Business", "Housewife", "Other"])}
            onChange={(val: string) => setFormData({ ...formData, profession: val })}
          />
          <Input label="School / College / Job" name="education" value={formData.education} onChange={handleChange} />
          <Input label="School / College / Job Timing" name="schoolTiming" value={formData.schoolTiming} onChange={handleChange} />
          <Input label="Best Time To Contact" name="contactTime" value={formData.contactTime} onChange={handleChange} />
        </Block>
      )}

      {(!isMobile || step === 4) && (
        <Block title="Course Selection">
          <SelectField label="Department" value={formData.department}
            options={mapOptions(["English", "Computer"])}
            onChange={(val: string) => setFormData({ ...formData, department: val })}
          />
          <SelectField label="Course" value={formData.course}
            options={mapOptions(courseOptions)}
            onChange={(val: string) => setFormData({ ...formData, course: val })}
          />
          <Input label="Preferred Timing" name="preferredTiming" value={formData.preferredTiming} onChange={handleChange} />
        </Block>
      )}

      {(!isMobile || step === 5) && (
        <Block title="Counselling & Action">
          <SelectField label="Status" value={formData.status}
            options={mapOptions(["Fresh", "Interested", "Follow-Up", "Admitted", "Not Interested", "No Response"])}
            onChange={(val: string) => setFormData({ ...formData, status: val })}
          />
          <SelectField label="Action" value={formData.action}
            options={mapOptions(["Call Again", "Send Details", "Demo Arrange", "Visit Reminder"])}
            onChange={(val: string) => setFormData({ ...formData, action: val })}
          />
          <Input label="Next Follow-Up Date" type="date" name="nextFollowDate" value={formData.nextFollowDate} onChange={handleChange} />
          <Input label="Next Follow-Up Time" type="time" name="nextFollowTime" value={formData.nextFollowTime} onChange={handleChange} />
          <SelectField label="Counsellor" value={formData.counsellor}
            options={mapOptions(["Counsellor 1"])}
            onChange={(val: string) => setFormData({ ...formData, counsellor: val })}
          />
          <div className="col-span-full flex flex-col">
            <label className="mb-1 text-gray-600">Remark</label>
            <textarea
              name="remark"
              value={formData.remark}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 rounded-md border border-gray-300"
            />
          </div>
        </Block>
      )}

      {isMobile && (
        <div className={`flex ${step === 1 ? "justify-end" : "justify-between"}`}>
          {step > 1 && (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="bg-gray-300 px-4 py-2 rounded-md"
            >
              Back
            </button>
          )}

          {step < 5 ? (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                setStep(step + 1);
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded-md"
            >
              Next
            </button>
          ) : (
            <button
              type="submit"
              disabled={loading}
              className="bg-green-600 text-white px-6 py-2 rounded-md"
            >
              {loading ? "Saving..." : "Save Lead"}
            </button>
          )}
        </div>
      )}

      {!isMobile && (
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={!formData.branch || loading}
            className="px-6 py-2 rounded-md text-white bg-blue-600"
          >
            {loading ? "Saving..." : "Save Lead"}
          </button>
        </div>
      )}

    </form>
  );
}