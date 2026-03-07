"use client";

import { useState } from "react";
import { Block, Input, SelectField, TextArea } from "@/app/components/forms/lead/LeadFormFields";

export default function AdmissionForm() {

  const [formData, setFormData] = useState<any>({
    studentName: "",
    gender: "",
    fatherName: "",
    dob: "",
    maritalStatus: "",
    education: "",

    localAddress: "",
    permanentAddress: "",

    understandEnglish: "",
    speakEnglish: "",

    computerSkills: "",
    englishTyping: "",
    hindiTyping: "",

    course: "",
    batchTiming: "",

    working: "",
    companyName: "",
    jobTiming: "",

    contactNo: "",
    whatsappNo: "",
    guardianNo: "",
    email: "",

    remark: ""
  });

  const handleChange = (e: any) => {

    const { name, value } = e.target;

    setFormData((prev:any)=>({
      ...prev,
      [name]: value
    }));

  };

  const mapOptions = (arr:string[])=>{
    return arr.map(i=>({label:i,value:i}));
  };

  return (

    <>

      <Block title="Student Info">

        <Input
          label="Student Name"
          name="studentName"
          value={formData.studentName}
          onChange={handleChange}
        />

        <SelectField
          label="Gender"
          value={formData.gender}
          options={mapOptions(["Male","Female","Other"])}
          onChange={(val:string)=>setFormData({...formData, gender: val})}
        />

        <Input
          label="Father / Mother Name"
          name="fatherName"
          value={formData.fatherName}
          onChange={handleChange}
        />

        <Input
          label="Date of Birth"
          type="date"
          name="dob"
          value={formData.dob}
          onChange={handleChange}
        />

        <SelectField
          label="Marital Status"
          value={formData.maritalStatus}
          options={mapOptions(["Single","Married"])}
          onChange={(val:string)=>setFormData({...formData, maritalStatus: val})}
        />

        <SelectField
          label="Education"
          value={formData.education}
          options={mapOptions([
            "10th","12th","Graduate","Post Graduate","Other"
          ])}
          onChange={(val:string)=>setFormData({...formData, education: val})}
        />

      </Block>


      <Block title="Address">

        <Input
          label="Local Address with City"
          name="localAddress"
          value={formData.localAddress}
          onChange={handleChange}
        />

        <Input
          label="Permanent Address"
          name="permanentAddress"
          value={formData.permanentAddress}
          onChange={handleChange}
        />

      </Block>


      <Block title="English Knowledge">

        <SelectField
          label="Do you understand English?"
          value={formData.understandEnglish}
          options={mapOptions(["Yes","No","Little"])}
          onChange={(val:string)=>setFormData({...formData, understandEnglish: val})}
        />

        <SelectField
          label="Do you speak English?"
          value={formData.speakEnglish}
          options={mapOptions(["Yes","No","Little"])}
          onChange={(val:string)=>setFormData({...formData, speakEnglish: val})}
        />

      </Block>


      <Block title="Computer Skills">

        <Input
          label="Computer Skills"
          name="computerSkills"
          value={formData.computerSkills}
          onChange={handleChange}
        />

        <Input
          label="English Typing Speed (WPM)"
          name="englishTyping"
          value={formData.englishTyping}
          onChange={handleChange}
        />

        <Input
          label="Hindi Typing Speed (WPM)"
          name="hindiTyping"
          value={formData.hindiTyping}
          onChange={handleChange}
        />

      </Block>


      <Block title="Course Details">

        <Input
          label="Course"
          name="course"
          value={formData.course}
          onChange={handleChange}
        />

        <Input
          label="Batch Timing"
          name="batchTiming"
          value={formData.batchTiming}
          onChange={handleChange}
        />

      </Block>


      <Block title="Job Information">

        <SelectField
          label="Do you work anywhere?"
          value={formData.working}
          options={mapOptions(["No","Yes"])}
          onChange={(val:string)=>setFormData({...formData, working: val})}
        />

        <Input
          label="Company / Department Name"
          name="companyName"
          value={formData.companyName}
          onChange={handleChange}
        />

        <Input
          label="Job Timings"
          name="jobTiming"
          value={formData.jobTiming}
          onChange={handleChange}
        />

      </Block>


      <Block title="Contact Details">

        <Input
          label="Contact No"
          name="contactNo"
          value={formData.contactNo}
          onChange={handleChange}
        />

        <Input
          label="Whatsapp No"
          name="whatsappNo"
          value={formData.whatsappNo}
          onChange={handleChange}
        />

        <Input
          label="Guardian Contact No"
          name="guardianNo"
          value={formData.guardianNo}
          onChange={handleChange}
        />

        <Input
          label="Email"
          name="email"
          value={formData.email}
          onChange={handleChange}
        />

      </Block>


      <Block title="Remark">

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