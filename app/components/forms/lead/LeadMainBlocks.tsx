"use client";

import { Block, Input, SelectField, TextArea } from "@/app/components/forms/lead/LeadFormFields";

interface Props {
  formData: any;
  setFormData: any;
  handleChange: any;
  mapOptions: any;

  studentRef: React.RefObject<HTMLInputElement | null>;
  mobileRef: React.RefObject<HTMLInputElement | null>;

  cities: string[];

  methods: string[];
  channels: string[];
  areas: string[];
  leadFor: string[];
  departments: string[];
  courses: string[];
  leadChances: string[];
  leadStages: string[];
  actions: string[];
  counsellors: string[];
}

export default function LeadMainBlocks({
  formData,
  setFormData,
  handleChange,
  mapOptions,
  studentRef,
  mobileRef,

  cities = [],
  methods = [],
  channels = [],
  areas = [],
  leadFor = [],
  departments = [],
  courses = [],
  leadChances = [],
  leadStages = [],
  actions = [],
  counsellors = []
}: Props) {

  const departmentValue = Array.isArray(formData.department) ? formData.department : [];
  const courseValue = Array.isArray(formData.course) ? formData.course : [];

  const preferredBatchOptions = [
    "Any Time",
    "8 AM","9 AM","10 AM","11 AM","12 PM",
    "1 PM","2 PM","3 PM","4 PM","5 PM","6 PM","7 PM","8 PM"
  ];

  return (
    <>

      <Block title="Basic Info">

        <Input label="Date" name="enquiryDate" value={formData.enquiryDate} readOnly />

        <Input label="Time" name="enquiryTime" value={formData.enquiryTime} readOnly />

        <SelectField
          label="Method"
          value={formData.method}
          options={mapOptions(methods)}
          onChange={(val: string)=>setFormData({ ...formData, method: val })}
        />

        <SelectField
          label="Channel"
          value={formData.channel}
          options={mapOptions(channels)}
          onChange={(val: string)=>setFormData({ ...formData, channel: val })}
        />

      </Block>


      <Block title="Student Contact">

        <Input
          label="Enquired By"
          name="enquiredBy"
          value={formData.enquiredBy}
          onChange={handleChange}
        />

        <SelectField
          label="For"
          value={formData.forWhom}
          options={mapOptions(leadFor)}
          onChange={(val:string)=>{

            setFormData((prev:any)=>({
              ...prev,
              forWhom: val,
              studentName: val==="Self"?prev.enquiredBy:""
            }));

            if(val!=="Self"){
              setTimeout(()=>{
                studentRef.current?.focus();
              },0);
            }

          }}
        />

        <Input
          label="Student Name *"
          name="studentName"
          value={formData.studentName}
          onChange={handleChange}
          ref={studentRef}
          disabled={formData.forWhom==="Self"}
        />

        <Input
          label="Mobile *"
          name="mobileNumber"
          value={formData.mobileNumber}
          onChange={handleChange}
          ref={mobileRef}
        />

        <Input
          label="WhatsApp / Alternate Number"
          name="alternateNumber"
          value={formData.alternateNumber}
          onChange={handleChange}
        />

        {/* CITY DROPDOWN */}

        <SelectField
          label="City"
          value={formData.city}
          options={mapOptions(cities)}
          onChange={(val:string)=>setFormData({ ...formData, city: val })}
        />

        <SelectField
          label="Area"
          value={formData.area}
          options={mapOptions(areas)}
          onChange={(val:string)=>setFormData({ ...formData, area: val })}
        />

      </Block>


      <Block title="Profile">

        <Input label="Age" name="age" type="number" value={formData.age} onChange={handleChange} />

        <SelectField
          label="Gender"
          value={formData.gender}
          options={mapOptions(["Male","Female","Other"])}
          onChange={(val:string)=>setFormData({ ...formData, gender: val })}
        />

        <SelectField
          label="Marital Status"
          value={formData.maritalStatus}
          options={mapOptions(["Single","Married"])}
          onChange={(val:string)=>setFormData({ ...formData, maritalStatus: val })}
        />

        <SelectField
          label="Profession"
          value={formData.profession}
          options={mapOptions(["Student","Job","Business","Housewife","Other"])}
          onChange={(val:string)=>setFormData({ ...formData, profession: val })}
        />

        <SelectField
          label="Education"
          value={formData.education}
          options={mapOptions([
            "4th","5th","6th","7th","8th","9th",
            "10th","11th","12th","Graduate","Post Graduate"
          ])}
          onChange={(val:string)=>setFormData({ ...formData, education: val })}
        />

        <Input
          label="School / College / Company"
          name="schoolCollegeJob"
          value={formData.schoolCollegeJob}
          onChange={handleChange}
        />

        <SelectField
          label="School / College / Job Timing"
          value={formData.schoolTiming}
          options={mapOptions([
            "Morning",
            "Noon",
            "Evening",
            "Shift Job"
          ])}
          onChange={(val:string)=>setFormData({ ...formData, schoolTiming: val })}
        />

        <SelectField
          label="Contact Time"
          value={formData.contactTime}
          options={mapOptions([
            "Any Time",
            "8 to 10 AM",
            "10 to 2",
            "2 to 5",
            "5 to 9"
          ])}
          onChange={(val:string)=>setFormData({ ...formData, contactTime: val })}
        />

      </Block>


      <Block title="Course Selection">

        <SelectField
          label="Department"
          value={departmentValue}
          options={mapOptions(departments)}
          multiple={true}
          onChange={(val:any)=>setFormData({ ...formData, department: val, course: [] })}
        />

        <SelectField
          label="Course"
          value={courseValue}
          options={mapOptions(courses)}
          multiple={true}
          onChange={(val:any)=>setFormData({ ...formData, course: val })}
        />

        <SelectField
          label="Preferred Time"
          value={formData.preferredTime || "Any Time"}
          options={mapOptions([
            "Any Time",
            "Morning",
            "Afternoon",
            "Evening",
            "Night"
          ])}
          onChange={(val:string)=>setFormData({ ...formData, preferredTime: val })}
        />

        <SelectField
          label="Preferred Batch"
          value={formData.preferredBatch || "Any Time"}
          options={mapOptions(preferredBatchOptions)}
          onChange={(val:string)=>setFormData({ ...formData, preferredBatch: val })}
        />

      </Block>


      <Block title="Counselling & Action">

        <SelectField
          label="Lead Chances"
          value={formData.leadChances}
          options={mapOptions(leadChances)}
          onChange={(val:string)=>setFormData({ ...formData, leadChances: val })}
        />

        <SelectField
          label="Lead Stage"
          value={formData.leadStage}
          options={mapOptions(leadStages)}
          onChange={(val:string)=>setFormData({ ...formData, leadStage: val })}
        />

        <SelectField
          label="Status"
          value={formData.status || "Fresh Lead"}
          options={mapOptions([
            "Fresh Lead",
            "Follow Up",
            "Converted",
            "Closed"
          ])}
          onChange={(val:string)=>setFormData({ ...formData, status: val })}
        />

        <SelectField
          label="Action"
          value={formData.action}
          options={mapOptions(actions)}
          onChange={(val:string)=>setFormData({ ...formData, action: val })}
        />

        <Input
          label="Next Follow-Up Date"
          type="date"
          name="nextFollowDate"
          value={formData.nextFollowDate}
          onChange={handleChange}
        />

        <Input
          label="Next Follow-Up Time"
          type="time"
          name="nextFollowTime"
          value={formData.nextFollowTime}
          onChange={handleChange}
        />

        <SelectField
          label="Counsellor"
          value={formData.counsellor}
          options={mapOptions(counsellors)}
          onChange={(val:string)=>setFormData({ ...formData, counsellor: val })}
        />

        <TextArea
          label="Remark"
          name="remark"
          value={formData.remark}
          onChange={handleChange}
        />

      </Block>

    </>
  );

}