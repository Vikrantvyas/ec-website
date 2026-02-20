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
} from "./constants";

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

  const handleNext = () => {
    if (!formData.studentName) {
      alert("Student Name is required");
      return;
    }
    nextTab();
  };

  return (
    <div className="py-4">

      {/* RESPONSIVE GRID FIX */}
      <div className="grid grid-cols-1 gap-5 text-sm bg-yellow-100">

        <Field label="Enquiry Date" name="enquiryDate" type="date" value={formData.enquiryDate} onChange={handleChange} />
        <Field label="Enquiry Time" name="enquiryTime" type="time" value={formData.enquiryTime} onChange={handleChange} />
        <Select label="Branch" name="branch" value={formData.branch} options={branchOptions} onChange={handleChange} />
        <Select label="Enquiry Method" name="enquiryMethod" value={formData.enquiryMethod} options={enquiryMethodOptions} onChange={handleChange} />

        <Select label="Source" name="source" value={formData.source} options={sourceOptions} onChange={handleChange} />
        <Field label="Enquired By" name="enquiredBy" value={formData.enquiredBy} onChange={handleChange} />
        <Select label="Enquired For" name="enquiredFor" value={formData.enquiredFor} options={enquiredForOptions} onChange={handleChange} />
        <Field label="Student Name" name="studentName" value={formData.studentName} onChange={handleChange} />

        <Field label="Date of Birth" name="dob" type="date" value={formData.dob} onChange={handleChange} />
        <Select label="Gender" name="gender" value={formData.gender} options={genderOptions} onChange={handleChange} />
        <Select label="Marital Status" name="maritalStatus" value={formData.maritalStatus} options={maritalStatusOptions} onChange={handleChange} />
        <Select label="Area" name="area" value={formData.area} options={areaOptions} onChange={handleChange} />

        <Field label="Mobile Number" name="mobileNumber" value={formData.mobileNumber} onChange={handleChange} />
        <Select label="Mobile Owner" name="mobileOwner" value={formData.mobileOwner} options={ownerOptions} onChange={handleChange} />
        <Field label="Whatsapp / Alternate Number" name="whatsappAlternateNumber" value={formData.whatsappAlternateNumber} onChange={handleChange} />
        <Select label="Whatsapp / Alternate Owner" name="whatsappAlternateOwner" value={formData.whatsappAlternateOwner} options={ownerOptions} onChange={handleChange} />

        <Field label="Profession" name="profession" value={formData.profession} onChange={handleChange} />
        <Select label="Last Education" name="lastEducation" value={formData.lastEducation} options={lastEducationOptions} onChange={handleChange} />
        <Field label="Education Institute" name="educationInstitute" value={formData.educationInstitute} onChange={handleChange} />
        <Field label="Institute Timing" name="instituteTiming" value={formData.instituteTiming} onChange={handleChange} />

        <Field label="Courses" name="courses" value={formData.courses} onChange={handleChange} />
        <Field label="Preferred Timing" name="preferredTiming" value={formData.preferredTiming} onChange={handleChange} />
        <Field label="Counsellor" name="counsellor" value={formData.counsellor} onChange={handleChange} />
        <Select
          label="Status"
          name="status"
          value={formData.status}
          options={["New Enquiry", "Follow-up", "Converted"]}
          onChange={handleChange}
        />

      </div>

      {/* Remark Section */}
      <div className="mt-8">
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Remark
        </label>
        <textarea
          name="remark"
          value={formData.remark}
          onChange={handleChange}
          className="w-full border rounded px-3 py-2 text-sm h-24 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <div className="flex justify-end mt-4">
          <button
            onClick={handleNext}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded text-sm font-medium w-full sm:w-auto"
          >
            Next
          </button>
        </div>
      </div>

    </div>
  );
}

function Field({ label, name, type = "text", value, onChange }: any) {
  return (
    <div className="flex flex-col">
      <label className="mb-2 text-gray-600 text-sm">{label}</label>
      <input
        name={name}
        type={type}
        value={value || ""}
        onChange={onChange}
        className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
}

function Select({ label, name, value, options, onChange }: any) {
  return (
    <div className="flex flex-col">
      <label className="mb-2 text-gray-600 text-sm">{label}</label>
      <select
        name={name}
        value={value || ""}
        onChange={onChange}
        className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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