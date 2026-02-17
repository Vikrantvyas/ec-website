"use client";

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
} from "../constants";

interface Props {
  formData: any;
  setFormData: any;
  nextTab: () => void;
}

export default function EnquiryFormTab({
  formData,
  setFormData,
  nextTab,
}: Props) {

  const handleChange = (e: any) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="flex flex-col h-full bg-white">

      {/* FORM GRID */}
      <div className="flex-1 px-4 py-3">

        <div className="grid grid-cols-4 gap-3 text-xs">

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

          {/* Remark Full Width */}
          <div className="col-span-4 flex flex-col">
            <label className="mb-1 text-gray-500">Remark</label>
            <textarea
              name="remark"
              value={formData.remark}
              onChange={handleChange}
              rows={2}
              className="border rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

        </div>
      </div>

      {/* ACTION BAR */}
      <div className="border-t bg-gray-50 px-4 py-2 flex justify-end">
        <button
          onClick={nextTab}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-1.5 rounded text-xs font-medium"
        >
          Next →
        </button>
      </div>

    </div>
  );
}

/* ---------- INPUT COMPONENT ---------- */

function Input({ label, name, type = "text", value, onChange }: any) {
  return (
    <div className="flex flex-col">
      <label className="mb-1 text-gray-500">{label}</label>
      <input
        name={name}
        type={type}
        value={value || ""}
        onChange={onChange}
        className="border rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
      />
    </div>
  );
}

/* ---------- SELECT COMPONENT ---------- */

function Dropdown({ label, name, options, value, onChange }: any) {
  return (
    <div className="flex flex-col">
      <label className="mb-1 text-gray-500">{label}</label>
      <select
        name={name}
        value={value || ""}
        onChange={onChange}
        className="border rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
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
