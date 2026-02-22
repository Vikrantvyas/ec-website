"use client";

import { useEffect, useState } from "react";

export default function LeadPage() {

  const today = new Date();
  const formattedDate = today.toISOString().split("T")[0];
  const formattedTime = today.toTimeString().slice(0, 5);

  const [step, setStep] = useState(1);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const [formData, setFormData] = useState<any>({
    branch: "Nanda Nagar",
    enquiryDate: formattedDate,
    enquiryTime: formattedTime,
    method: "Visit",
    channel: "Main Board",

    enquiredBy: "",
    forWhom: "Self",
    studentName: "",
    mobileNumber: "",
    mobileOwner: "Self",
    whatsappNumber: "",
    whatsappOwner: "Self",
    area: "",

    gender: "",
    age: "",
    maritalStatus: "",
    profession: "Student",
    education: "",
    schoolTiming: "",
    course: "",
    preferredTiming: "",
    counsellor: "",
    status: "Fresh",
    remark: "",
  });

  useEffect(() => {
    setFormData((prev: any) => ({
      ...prev,
      studentName: prev.enquiredBy,
      whatsappNumber: prev.mobileNumber,
    }));
  }, [formData.enquiredBy, formData.mobileNumber]);

  const handleChange = (e: any) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: any) => {
    e.preventDefault(); // 🔥 prevent reload
    console.log("Lead Saved:", formData);
  };

  const branches = ["Nanda Nagar", "Bapat Sq.", "Aurobindo"];

  return (
    <div className="w-full px-3 sm:px-6 py-4 bg-white">
      <form onSubmit={handleSubmit} className="space-y-8 text-sm">

        {/* Branch badges only mobile step 1 */}
        {(!isMobile || step === 1) && (
          <div className="flex flex-wrap gap-3">
            {branches.map((b) => (
              <button
                key={b}
                type="button"
                onClick={() => setFormData({ ...formData, branch: b })}
                className={`px-4 py-2 rounded-full border
                  ${formData.branch === b
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white border-gray-300"
                  }`}
              >
                {b}
              </button>
            ))}
          </div>
        )}

        {/* Block 1 */}
        {(!isMobile || step === 1) && (
          <Block title="Basic Info">
            <Input label="Date" name="enquiryDate" value={formData.enquiryDate} readOnly />
            <Input label="Time" name="enquiryTime" value={formData.enquiryTime} readOnly />
            <Dropdown label="Method" name="method"
              value={formData.method}
              options={["Visit","Call","WhatsApp","Social Media"]}
              onChange={handleChange}/>
            <Dropdown label="Channel" name="channel"
              value={formData.channel}
              options={["Main Board","Friend","Google","Instagram","Banner"]}
              onChange={handleChange}/>
          </Block>
        )}

        {/* Block 2 */}
        {(!isMobile || step === 2) && (
          <Block title="Student Contact">
            <Input label="Enquired By" name="enquiredBy" value={formData.enquiredBy} onChange={handleChange}/>
            <Dropdown label="For" name="forWhom"
              value={formData.forWhom}
              options={["Self","Brother","Sister","Friend","Child"]}
              onChange={handleChange}/>
            <Input label="Student Name" name="studentName" value={formData.studentName} onChange={handleChange}/>
            <Dropdown label="Area" name="area"
              value={formData.area}
              options={["Alwasa","Vijay Nagar","Bhawarkua","Rajendra Nagar"]}
              onChange={handleChange}/>
            <Input label="Mobile" name="mobileNumber" value={formData.mobileNumber} onChange={handleChange}/>
            <Dropdown label="Mobile Owner" name="mobileOwner"
              value={formData.mobileOwner}
              options={["Self","Father","Mother","Guardian"]}
              onChange={handleChange}/>
            <Input label="WhatsApp" name="whatsappNumber" value={formData.whatsappNumber} onChange={handleChange}/>
            <Dropdown label="WhatsApp Owner" name="whatsappOwner"
              value={formData.whatsappOwner}
              options={["Self","Father","Mother","Guardian"]}
              onChange={handleChange}/>
          </Block>
        )}

        {/* Block 3 */}
        {(!isMobile || step === 3) && (
          <Block title="Profile & Course Interest">
            <Input label="Age" name="age" type="number" value={formData.age} onChange={handleChange}/>
            <Dropdown label="Gender" name="gender"
              value={formData.gender}
              options={["Male","Female","Other"]}
              onChange={handleChange}/>
            <Dropdown label="Status" name="status"
              value={formData.status}
              options={["Fresh","Interested","Follow-Up","Admitted","Not Interested","No Response"]}
              onChange={handleChange}/>
            <div className="col-span-full">
              <label className="mb-1 text-gray-600 block">Remark</label>
              <textarea
                name="remark"
                value={formData.remark}
                onChange={handleChange}
                rows={3}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
          </Block>
        )}

        {/* Mobile Navigation */}
        {isMobile && (
          <div className="flex justify-between">
            {step > 1 && (
              <button type="button" onClick={() => setStep(step - 1)}
                className="bg-gray-300 px-4 py-2 rounded-md">
                Back
              </button>
            )}
            {step < 3 ? (
              <button type="button" onClick={() => setStep(step + 1)}
                className="bg-blue-600 text-white px-4 py-2 rounded-md">
                Next
              </button>
            ) : (
              <button type="submit"
                className="bg-green-600 text-white px-6 py-2 rounded-md">
                Save Lead
              </button>
            )}
          </div>
        )}

        {/* Desktop Save */}
        {!isMobile && (
          <div className="flex justify-end">
            <button type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded-md">
              Save Lead
            </button>
          </div>
        )}

      </form>
    </div>
  );
}

/* BLOCK */
function Block({ title, children }: any) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6 shadow-md w-full">
      <h3 className="text-blue-700 font-semibold mb-4">{title}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {children}
      </div>
    </div>
  );
}

/* INPUT */
function Input({ label, name, type="text", value, onChange, readOnly }: any) {
  return (
    <div className="flex flex-col">
      <label className="mb-1 text-gray-600">{label}</label>
      <input
        name={name}
        type={type}
        value={value || ""}
        readOnly={readOnly}
        onChange={onChange}
        className="border border-gray-300 rounded-md px-3 py-2"
      />
    </div>
  );
}

/* DROPDOWN */
function Dropdown({ label, name, value, options, onChange }: any) {
  return (
    <div className="flex flex-col">
      <label className="mb-1 text-gray-600">{label}</label>
      <select
        name={name}
        value={value || ""}
        onChange={onChange}
        className="border border-gray-300 rounded-md px-3 py-2"
      >
        {options.map((opt: string, i: number) => (
          <option key={i} value={opt}>{opt}</option>
        ))}
      </select>
    </div>
  );
}