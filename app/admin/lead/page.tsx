"use client";

import { useState } from "react";
import {
  branchOptions,
  enquiryMethodOptions,
  sourceOptions,
  areaOptions,
  enquiredForOptions,
  ownerOptions,
  lastEducationOptions,
  genderOptions,
  maritalStatusOptions,
} from "@/app/components/admin/enquiry/constants";

export default function LeadPage() {

  const [formData, setFormData] = useState<any>({});

  const handleChange = (e: any) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="w-full bg-white p-4">

      
      <form className="space-y-6">

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 text-sm">

          <Input label="Enquiry Date" name="enquiryDate" type="date" value={formData.enquiryDate} onChange={handleChange} />
          <Input label="Enquiry Time" name="enquiryTime" type="time" value={formData.enquiryTime} onChange={handleChange} />
          <Dropdown label="Branch" name="branch" value={formData.branch} options={branchOptions} onChange={handleChange} />
          <Dropdown label="Method" name="enquiryMethod" value={formData.enquiryMethod} options={enquiryMethodOptions} onChange={handleChange} />
          <Dropdown label="Source" name="source" value={formData.source} options={sourceOptions} onChange={handleChange} />

          <Input label="Enquired By" name="enquiredBy" value={formData.enquiredBy} onChange={handleChange} />
          <Dropdown label="For" name="enquiredFor" value={formData.enquiredFor} options={enquiredForOptions} onChange={handleChange} />
          <Input label="Student Name" name="studentName" value={formData.studentName} onChange={handleChange} />
          <Input label="DOB" name="dob" type="date" value={formData.dob} onChange={handleChange} />
          <Dropdown label="Gender" name="gender" value={formData.gender} options={genderOptions} onChange={handleChange} />

          <Dropdown label="Marital" name="maritalStatus" value={formData.maritalStatus} options={maritalStatusOptions} onChange={handleChange} />
          <Dropdown label="Area" name="area" value={formData.area} options={areaOptions} onChange={handleChange} />
          <Input label="Mobile" name="mobileNumber" value={formData.mobileNumber} onChange={handleChange} />
          <Dropdown label="Owner" name="mobileOwner" value={formData.mobileOwner} options={ownerOptions} onChange={handleChange} />
          <Input label="WhatsApp" name="whatsappAlternateNumber" value={formData.whatsappAlternateNumber} onChange={handleChange} />

          <Dropdown label="Owner" name="whatsappAlternateOwner" value={formData.whatsappAlternateOwner} options={ownerOptions} onChange={handleChange} />
          <Input label="Profession" name="profession" value={formData.profession} onChange={handleChange} />
          <Dropdown label="Education" name="lastEducation" value={formData.lastEducation} options={lastEducationOptions} onChange={handleChange} />
          <Input label="Institute" name="educationInstitute" value={formData.educationInstitute} onChange={handleChange} />
          <Input label="Timing" name="instituteTiming" value={formData.instituteTiming} onChange={handleChange} />

          <Input label="Course" name="courses" value={formData.courses} onChange={handleChange} />
          <Input label="Pref Time" name="preferredTiming" value={formData.preferredTiming} onChange={handleChange} />
          <Input label="Counsellor" name="counsellor" value={formData.counsellor} onChange={handleChange} />
          <Dropdown label="Status" name="status" value={formData.status} options={["New Enquiry","Follow-up","Converted"]} onChange={handleChange} />

          <div className="xl:col-span-5 flex flex-col">
            <label className="mb-1 text-gray-600 text-sm">Remark</label>
            <textarea
              name="remark"
              value={formData.remark || ""}
              onChange={handleChange}
              rows={3}
              className="w-full border border-gray-300 bg-white rounded-md px-3 py-2 text-sm shadow-sm 
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            />
          </div>

        </div>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md text-sm font-medium transition"
          >
            Save Lead
          </button>
        </div>

      </form>

    </div>
  );
}


/* ---------- INPUT ---------- */

function Input({ label, name, type = "text", value, onChange }: any) {
  return (
    <div className="flex flex-col">
      <label className="mb-1 text-gray-600 text-sm">{label}</label>
      <input
        name={name}
        type={type}
        value={value || ""}
        onChange={onChange}
        className="w-full border border-gray-300 bg-white rounded-md px-3 py-2 text-sm shadow-sm 
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
      />
    </div>
  );
}


/* ---------- DROPDOWN ---------- */

function Dropdown({ label, name, options, value, onChange }: any) {
  return (
    <div className="flex flex-col">
      <label className="mb-1 text-gray-600 text-sm">{label}</label>
      <select
        name={name}
        value={value || ""}
        onChange={onChange}
        className="w-full border border-gray-300 bg-white rounded-md px-3 py-2 text-sm shadow-sm 
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
      >
        {(options || []).map((opt: string, i: number) => (
          <option key={i} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}