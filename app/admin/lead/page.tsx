"use client";

import { useEffect, useState } from "react";
import BottomSheetSelect from "@/app/components/ui/BottomSheetSelect";

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
    branch: "",
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
    contactTime: "",

    department: "",
    course: "",
    preferredTiming: "",

    status: "Fresh",
    action: "",
    nextFollowDate: "",
    nextFollowTime: "",
    counsellor: "",

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
    e.preventDefault();
    if (!formData.branch) {
      alert("Please select branch first.");
      return;
    }
    console.log("Lead Saved:", formData);
  };

  const courseOptions =
    formData.department === "English"
      ? ["Spoken English", "Basic English", "Advanced English"]
      : formData.department === "Computer"
      ? ["Basic Computer", "Tally", "Typing", "Advanced Computer"]
      : [];

  const mapOptions = (arr: string[]) =>
    arr.map((item) => ({ label: item, value: item }));

  return (
    <div className="w-full px-3 sm:px-6 py-4 bg-white">
      <form onSubmit={handleSubmit} className="space-y-8 text-sm">

        <Block title="Basic Info">
          <Input label="Date" name="enquiryDate" value={formData.enquiryDate} readOnly />
          <Input label="Time" name="enquiryTime" value={formData.enquiryTime} readOnly />

          <SelectField
            label="Method"
            value={formData.method}
            options={mapOptions(["Visit","Call","WhatsApp","Social Media"])}
            onChange={(val:string)=>setFormData({...formData,method:val})}
          />

          <SelectField
            label="Channel"
            value={formData.channel}
            options={mapOptions(["Main Board","Friend","Google","Instagram","Banner"])}
            onChange={(val:string)=>setFormData({...formData,channel:val})}
          />
        </Block>

        <Block title="Student Contact">
          <Input label="Enquired By" name="enquiredBy" value={formData.enquiredBy} onChange={handleChange}/>
          
          <SelectField
            label="For"
            value={formData.forWhom}
            options={mapOptions(["Self","Brother","Sister","Friend","Child"])}
            onChange={(val:string)=>setFormData({...formData,forWhom:val})}
          />

          <Input label="Student Name" name="studentName" value={formData.studentName} onChange={handleChange}/>

          <SelectField
            label="Area"
            value={formData.area}
            options={mapOptions(["Alwasa","Vijay Nagar","Bhawarkua","Rajendra Nagar"])}
            onChange={(val:string)=>setFormData({...formData,area:val})}
          />

          <Input label="Mobile" name="mobileNumber" value={formData.mobileNumber} onChange={handleChange}/>
        </Block>

        <Block title="Profile">
          <Input label="Age" name="age" type="number" value={formData.age} onChange={handleChange}/>

          <SelectField
            label="Gender"
            value={formData.gender}
            options={mapOptions(["Male","Female","Other"])}
            onChange={(val:string)=>setFormData({...formData,gender:val})}
          />

          <SelectField
            label="Marital Status"
            value={formData.maritalStatus}
            options={mapOptions(["Single","Married"])}
            onChange={(val:string)=>setFormData({...formData,maritalStatus:val})}
          />

          <SelectField
            label="Profession"
            value={formData.profession}
            options={mapOptions(["Student","Job","Business","Housewife","Other"])}
            onChange={(val:string)=>setFormData({...formData,profession:val})}
          />

          <Input label="School / College / Job" name="education" value={formData.education} onChange={handleChange}/>
          <Input label="School / College / Job Timing" name="schoolTiming" value={formData.schoolTiming} onChange={handleChange}/>
          <Input label="Best Time To Contact" name="contactTime" value={formData.contactTime} onChange={handleChange}/>
        </Block>

        <Block title="Course Selection">
          <SelectField
            label="Department"
            value={formData.department}
            options={mapOptions(["English","Computer"])}
            onChange={(val:string)=>setFormData({...formData,department:val})}
          />

          <SelectField
            label="Course"
            value={formData.course}
            options={mapOptions(courseOptions)}
            onChange={(val:string)=>setFormData({...formData,course:val})}
          />

          <Input label="Preferred Timing" name="preferredTiming" value={formData.preferredTiming} onChange={handleChange}/>
        </Block>

        <Block title="Counselling & Action">
          <SelectField
            label="Status"
            value={formData.status}
            options={mapOptions(["Fresh","Interested","Follow-Up","Admitted","Not Interested","No Response"])}
            onChange={(val:string)=>setFormData({...formData,status:val})}
          />

          <SelectField
            label="Action"
            value={formData.action}
            options={mapOptions(["Call Again","Send Details","Demo Arrange","Visit Reminder"])}
            onChange={(val:string)=>setFormData({...formData,action:val})}
          />

          <Input label="Next Follow-Up Date" type="date" name="nextFollowDate" value={formData.nextFollowDate} onChange={handleChange}/>
          <Input label="Next Follow-Up Time" type="time" name="nextFollowTime" value={formData.nextFollowTime} onChange={handleChange}/>

          <SelectField
            label="Counsellor"
            value={formData.counsellor}
            options={mapOptions(["Counsellor 1"])}
            onChange={(val:string)=>setFormData({...formData,counsellor:val})}
          />

          <div className="col-span-full flex flex-col">
            <label className="mb-1 text-gray-600">Remark</label>
            <textarea
              name="remark"
              value={formData.remark}
              onChange={handleChange}
              rows={3}
              className="
                w-full px-3 py-2 rounded-md text-sm bg-white
                border border-gray-300
                shadow-[0_1px_2px_rgba(0,0,0,0.06)]
                hover:shadow-[0_4px_10px_rgba(0,0,0,0.08)]
                hover:border-gray-400
                focus:outline-none
                focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                transition
              "
            />
          </div>
        </Block>

      </form>
    </div>
  );
}

function SelectField({label,value,options,onChange}:any){
  return(
    <div className="flex flex-col">
      <label className="mb-1 text-gray-600">{label}</label>
      <BottomSheetSelect
        label={label}
        value={value}
        options={options}
        onChange={onChange}
      />
    </div>
  )
}

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
        className="
          w-full px-3 py-2 rounded-md text-sm bg-white
          border border-gray-300
          shadow-[0_1px_2px_rgba(0,0,0,0.06)]
          hover:shadow-[0_4px_10px_rgba(0,0,0,0.08)]
          hover:border-gray-400
          focus:outline-none
          focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          transition
        "
      />
    </div>
  );
}