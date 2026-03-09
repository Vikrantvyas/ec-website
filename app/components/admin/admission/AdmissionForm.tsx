"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import useLeadForm from "@/app/admin/lead/useLeadForm";
import BranchSelector from "@/app/components/ui/BranchSelector";
import { Block, Input, SelectField, TextArea } from "@/app/components/ui/FormFields";

export default function AdmissionForm() {

  const {
    formData,
    setFormData,
    handleChange,

    branches,
    methods,
    channels,
    areas,
    leadFor,
    departments,
    courses,
    counsellors,
    cities,
    mapOptions

  } = useLeadForm();

  const searchParams = useSearchParams();
  const leadId = searchParams.get("leadId");

  const now = new Date();
  const today = now.toISOString().split("T")[0];
  const timeNow = now.toTimeString().slice(0,5);

  const [searchValue,setSearchValue] = useState("");

  const [extraData,setExtraData] = useState<any>({
    admissionDate:today,
    admissionTime:timeNow,

    email:"",
    guardianName:"",
    guardianMobile:"",

    localAddress:"",
    permanentAddress:"",

    dob:"",
    photo:null,

    admissionBatch:"",

    understandEnglish:"Yes",
    speakEnglish:"Little",
    computerKnowledge:"",
    englishTyping:"",
    hindiTyping:"",

    working:"No",
    companyName:"",
    jobProfile:"",
    experience:"",
    jobTiming:"",

    admissionCounsellor:"",
    admissionRemark:""
  });

  const handleExtraChange = (e:any)=>{
    const {name,value}=e.target;

    setExtraData((prev:any)=>({
      ...prev,
      [name]:value
    }));
  };

  const handlePhoto = (e:any)=>{
    const file = e.target.files?.[0];
    if(!file) return;

    setExtraData((prev:any)=>({
      ...prev,
      photo:file
    }));
  };

  const loadLead = async (id:string)=>{

    const {data,error} = await supabase
      .from("leads")
      .select("*")
      .eq("id",id)
      .single();

    if(error || !data) return;

    setFormData((prev:any)=>({

      ...prev,

      branch:data.branch,

      enquiryDate:data.enquiry_date,
      enquiryTime:data.enquiry_time,
      method:data.method,
      channel:data.channel,
      counsellor:data.counsellor,

      enquiredBy:data.enquired_by,
      forWhom:data.for_whom,

      studentName:data.student_name,
      mobileNumber:data.mobile_number,
      alternateNumber:data.alternate_number,

      city:data.city,
      area:data.area,

      gender:data.gender,
      age:data.age,

      maritalStatus:data.marital_status,
      profession:data.profession,
      education:data.education,

      schoolTiming:data.school_timing,
      contactTime:data.contact_time,

      department:data.department ? [data.department] : [],
      course:data.course ? [data.course] : [],

      preferredTime:data.preferred_timing,
      preferredBatch:data.preferred_batch

    }));

  };

  useEffect(()=>{
    if(leadId){
      loadLead(leadId);
    }
  },[leadId]);

  const searchLead = async ()=>{

    if(!searchValue) return;

    const {data} = await supabase
      .from("leads")
      .select("*")
      .or(`mobile_number.eq.${searchValue},student_name.ilike.%${searchValue}%`)
      .limit(1)
      .maybeSingle();

    if(data){
      loadLead(data.id);
    }

  };

  return (

    <div className="space-y-8">

      {!leadId && (

       <Block title="Search Existing Lead">

  <div className="flex gap-3 items-end">

    <div className="flex-1">
      <Input
        label="Search Name or Mobile"
        value={searchValue}
        onChange={(e:any)=>setSearchValue(e.target.value)}
      />
    </div>

    <button
      type="button"
      className="h-[44px] px-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      onClick={searchLead}
    >
      Search
    </button>

  </div>

</Block>

      )}

      <BranchSelector
        branches={branches}
        value={formData.branch}
        onChange={(val:string)=>setFormData({...formData, branch: val})}
      />

      {formData.branch && (

        <>

          {/* BASIC INFO */}

          <Block title="Basic Info">

            <Input label="Lead Date" name="enquiryDate" value={formData.enquiryDate} readOnly />

            <Input label="Lead Time" name="enquiryTime" value={formData.enquiryTime} readOnly />

            <SelectField
              label="Lead Method"
              value={formData.method}
              options={mapOptions(methods)}
              onChange={(val:string)=>setFormData({...formData, method: val})}
            />

            <SelectField
              label="Lead Channel"
              value={formData.channel}
              options={mapOptions(channels)}
              onChange={(val:string)=>setFormData({...formData, channel: val})}
            />

            <SelectField
              label="Lead Counsellor"
              value={formData.counsellor}
              options={mapOptions(counsellors)}
              onChange={(val:string)=>setFormData({...formData, counsellor: val})}
            />

            <Input
              label="Admission Date"
              type="date"
              name="admissionDate"
              value={extraData.admissionDate}
              onChange={handleExtraChange}
            />

          </Block>


          {/* STUDENT CONTACT */}

          <Block title="Student Contact">

            <Input label="Enquired By" name="enquiredBy" value={formData.enquiredBy} onChange={handleChange} />

            <SelectField
              label="Enquired For"
              value={formData.forWhom}
              options={mapOptions(leadFor)}
              onChange={(val:string)=>setFormData({...formData, forWhom: val})}
            />

            <Input label="Student Name" name="studentName" value={formData.studentName} onChange={handleChange} />

            <Input label="Mobile" name="mobileNumber" value={formData.mobileNumber} onChange={handleChange} />

            <Input label="Whatsapp" name="alternateNumber" value={formData.alternateNumber} onChange={handleChange} />

            <Input label="Email ID" name="email" value={extraData.email} onChange={handleExtraChange} />

            <Input label="Guardian Name" name="guardianName" value={extraData.guardianName} onChange={handleExtraChange} />

            <Input label="Guardian Mobile" name="guardianMobile" value={extraData.guardianMobile} onChange={handleExtraChange} />

            <Input label="Local Address" name="localAddress" value={extraData.localAddress} onChange={handleExtraChange} />

            <Input label="Permanent Address" name="permanentAddress" value={extraData.permanentAddress} onChange={handleExtraChange} />

            <SelectField
              label="City"
              value={formData.city}
              options={mapOptions(cities)}
              onChange={(val:string)=>setFormData({...formData, city: val})}
            />

            <SelectField
              label="Area"
              value={formData.area}
              options={mapOptions(areas)}
              onChange={(val:string)=>setFormData({...formData, area: val})}
            />

          </Block>


          {/* PROFILE */}

          <Block title="Profile">

            <div className="flex flex-col">

<label className="mb-1 text-gray-600 text-sm font-medium">
Photo
</label>

<input
  type="file"
  accept="image/*;capture=camera"
  onChange={handlePhoto}
  className="w-full h-[44px] px-3 rounded-lg border border-gray-300 bg-white
  focus:outline-none focus:ring-2 focus:ring-blue-500"
/>

</div>

            <SelectField
              label="Gender"
              value={formData.gender}
              options={mapOptions(["Male","Female","Other"])}
              onChange={(val:string)=>setFormData({...formData, gender: val})}
            />

            <Input label="Date of Birth" type="date" name="dob" value={extraData.dob} onChange={handleExtraChange} />

            <Input label="Age" name="age" value={formData.age} onChange={handleChange} />

            <SelectField
              label="Marital Status"
              value={formData.maritalStatus}
              options={mapOptions(["Single","Married"])}
              onChange={(val:string)=>setFormData({...formData, maritalStatus: val})}
            />

            <SelectField
              label="Profession"
              value={formData.profession}
              options={mapOptions(["Student","Job","Business","Housewife","Other"])}
              onChange={(val:string)=>setFormData({...formData, profession: val})}
            />

            <SelectField
              label="Education"
              value={formData.education}
              options={mapOptions([
                "4th","5th","6th","7th","8th","9th",
                "10th","11th","12th","Graduate","Post Graduate"
              ])}
              onChange={(val:string)=>setFormData({...formData, education: val})}
            />

            <Input label="School / College / Company" name="schoolCollegeJob" value={formData.schoolCollegeJob} onChange={handleChange} />

            <SelectField
              label="School / College / Job Timing"
              value={formData.schoolTiming}
              options={mapOptions(["Morning","Noon","Evening","Shift Job"])}
              onChange={(val:string)=>setFormData({...formData, schoolTiming: val})}
            />

            <SelectField
              label="Contact Time"
              value={formData.contactTime}
              options={mapOptions(["Any Time","8 to 10 AM","10 to 2","2 to 5","5 to 9"])}
              onChange={(val:string)=>setFormData({...formData, contactTime: val})}
            />

          </Block>


          {/* COURSE SELECTION */}

          <Block title="Course Selection">

            <SelectField
              label="Department"
              value={formData.department}
              options={mapOptions(departments)}
              multiple
              onChange={(val:any)=>setFormData({...formData, department: val})}
            />

            <SelectField
              label="Courses"
              value={formData.course}
              options={mapOptions(courses)}
              multiple
              onChange={(val:any)=>setFormData({...formData, course: val})}
            />

            <SelectField
              label="Preferred Time"
              value={formData.preferredTime}
              options={mapOptions([
                "Any Time",
                "Morning",
                "Afternoon",
                "Evening",
                "Night"
              ])}
              onChange={(val:string)=>setFormData({...formData, preferredTime: val})}
            />

            <SelectField
              label="Preferred Batch"
              value={formData.preferredBatch}
              options={mapOptions([
                "Any Time",
                "8 AM","9 AM","10 AM","11 AM","12 PM",
                "1 PM","2 PM","3 PM","4 PM","5 PM","6 PM","7 PM","8 PM"
              ])}
              onChange={(val:string)=>setFormData({...formData, preferredBatch: val})}
            />

            <Input
              label="Admission Batch"
              name="admissionBatch"
              value={extraData.admissionBatch}
              onChange={handleExtraChange}
            />

          </Block>


          {/* JOB PROFILE */}

          <Block title="Job Profile">

            <SelectField
              label="Understand English"
              value={extraData.understandEnglish}
              options={mapOptions(["Yes","No","Little"])}
              onChange={(val:string)=>setExtraData({...extraData, understandEnglish: val})}
            />

            <SelectField
              label="Speak English"
              value={extraData.speakEnglish}
              options={mapOptions(["Yes","No","Little"])}
              onChange={(val:string)=>setExtraData({...extraData, speakEnglish: val})}
            />

            <Input label="Computer Knowledge" name="computerKnowledge" value={extraData.computerKnowledge} onChange={handleExtraChange} />

            <Input label="English Typing Speed" name="englishTyping" value={extraData.englishTyping} onChange={handleExtraChange} />

            <Input label="Hindi Typing Speed" name="hindiTyping" value={extraData.hindiTyping} onChange={handleExtraChange} />

            <SelectField
              label="Do you Work Anywhere"
              value={extraData.working}
              options={mapOptions(["No","Yes"])}
              onChange={(val:string)=>setExtraData({...extraData, working: val})}
            />

            <Input label="Company Name" name="companyName" value={extraData.companyName} onChange={handleExtraChange} />

            <Input label="Job Profile" name="jobProfile" value={extraData.jobProfile} onChange={handleExtraChange} />

            <Input label="Experience" name="experience" value={extraData.experience} onChange={handleExtraChange} />

            <Input label="Job Timing" name="jobTiming" value={extraData.jobTiming} onChange={handleExtraChange} />

          </Block>


          {/* COUNSELLING ACTION */}

          <Block title="Counselling Action">

            <SelectField
              label="Admission Counsellor"
              value={extraData.admissionCounsellor}
              options={mapOptions(counsellors)}
              onChange={(val:string)=>setExtraData({...extraData, admissionCounsellor: val})}
            />

            <TextArea
              label="Admission Remark"
              name="admissionRemark"
              value={extraData.admissionRemark}
              onChange={handleExtraChange}
            />

          </Block>

        </>

      )}

    </div>

  );

}