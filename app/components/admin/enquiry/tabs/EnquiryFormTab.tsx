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
    <div className="flex flex-col h-full">

      {/* FORM AREA */}
      <div className="grid grid-cols-4 gap-3 text-xs px-4 py-3">

        <Field label="Enquiry Date" name="enquiryDate" type="date" value={formData.enquiryDate} onChange={handleChange} />
        <Field label="Enquiry Time" name="enquiryTime" type="time" value={formData.enquiryTime} onChange={handleChange} />
        <Select label="Branch" name="branch" value={formData.branch} options={branchOptions} onChange={handleChange} />
        <Select label="Method" name="enquiryMethod" value={formData.enquiryMethod} options={enquiryMethodOptions} onChange={handleChange} />

        <Select label="Source" name="source" value={formData.source} options={sourceOptions} onChange={handleChange} />
        <Field label="Enquired By" name="enquiredBy" value={formData.enquiredBy} onChange={handleChange} />
        <Select label="For" name="enquiredFor" value={formData.enquiredFor} options={enquiredForOptions} onChange={handleChange} />
        <Field label="Student Name" name="studentName" value={formData.studentName} onChange={handleChange} />

        <Field label="DOB" name="dob" type="date" value={formData.dob} onChange={handleChange} />
        <Select label="Gender" name="gender" value={formData.gender} options={genderOptions} onChange={handleChange} />
        <Select label="Marital" name="maritalStatus" value={formData.maritalStatus} options={maritalStatusOptions} onChange={handleChange} />
        <Select label="Area" name="area" value={formData.area} options={areaOptions} onChange={handleChange} />

        <Field label="Mobile" name="mobileNumber" value={formData.mobileNumber} onChange={handleChange} />
        <Select label="Owner" name="mobileOwner" value={formData.mobileOwner} options={ownerOptions} onChange={handleChange} />
        <Field label="WhatsApp" name="whatsappAlternateNumber" value={formData.whatsappAlternateNumber} onChange={handleChange} />
        <Select label="Owner" name="whatsappAlternateOwner" value={formData.whatsappAlternateOwner} options={ownerOptions} onChange={handleChange} />

        <Field label="Profession" name="profession" value={formData.profession} onChange={handleChange} />
        <Select label="Education" name="lastEducation" value={formData.lastEducation} options={lastEducationOptions} onChange={handleChange} />
        <Field label="Institute" name="educationInstitute" value={formData.educationInstitute} onChange={handleChange} />
        <Field label="Timing" name="instituteTiming" value={formData.instituteTiming} onChange={handleChange} />

        <Field label="Course" name="courses" value={formData.courses} onChange={handleChange} />
        <Field label="Pref Time" name="preferredTiming" value={formData.preferredTiming} onChange={handleChange} />
        <Field label="Counsellor" name="counsellor" value={formData.counsellor} onChange={handleChange} />
        <Select label="Status" name="status" value={formData.status} options={["New Enquiry","Follow-up","Converted"]} onChange={handleChange} />

        <div className="col-span-4">
          <Field label="Remark" name="remark" value={formData.remark} onChange={handleChange} />
        </div>

      </div>

      {/* FIXED ACTION BAR */}
      <div className="border-t bg-white px-4 py-2 flex justify-end">
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

function Field({ label, name, type = "text", value, onChange }: any) {
  return (
    <div className="flex flex-col">
      <label className="mb-1 text-gray-500">{label}</label>
      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        className="border rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
      />
    </div>
  );
}

function Select({ label, name, options, value, onChange }: any) {
  return (
    <div className="flex flex-col">
      <label className="mb-1 text-gray-500">{label}</label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        className="border rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
      >
        {options.map((opt: string, i: number) => (
          <option key={i} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}
