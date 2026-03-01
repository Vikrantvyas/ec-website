"use client";

import { Block, Input, SelectField, TextArea } from "@/app/components/forms/lead/LeadFormFields";

interface Props {
  formData: any;
  setFormData: any;
  handleChange: any;
  courseOptions: string[];
  mapOptions: any;
  studentRef: React.RefObject<HTMLInputElement>;
  mobileRef: React.RefObject<HTMLInputElement>;
}

export default function LeadMainBlocks({
  formData,
  setFormData,
  handleChange,
  courseOptions,
  mapOptions,
  studentRef,
  mobileRef
}: Props) {

  return (
    <>
      {/* BLOCK 1 */}
      <Block title="Basic Info">
        <Input label="Date" name="enquiryDate" value={formData.enquiryDate} readOnly />
        <Input label="Time" name="enquiryTime" value={formData.enquiryTime} readOnly />

        <SelectField
          label="Method"
          value={formData.method}
          options={mapOptions(["Visit", "Call", "WhatsApp", "Social Media"])}
          onChange={(val: string) =>
            setFormData({ ...formData, method: val })}
        />

        <SelectField
          label="Channel"
          value={formData.channel}
          options={mapOptions(["Main Board", "Friend", "Google", "Instagram", "Banner"])}
          onChange={(val: string) =>
            setFormData({ ...formData, channel: val })}
        />
      </Block>

      {/* BLOCK 2 */}
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
          options={mapOptions(["Self", "Brother", "Sister", "Friend", "Child"])}
          onChange={(val: string) =>
            setFormData({ ...formData, forWhom: val })}
        />

        <Input
          label="Student Name *"
          name="studentName"
          value={formData.studentName}
          onChange={handleChange}
          ref={studentRef}
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

        <Input
          label="City"
          name="city"
          value={formData.city}
          onChange={handleChange}
        />

        <SelectField
          label="Area"
          value={formData.area}
          options={mapOptions(["Alwasa", "Vijay Nagar", "Bhawarkua", "Rajendra Nagar"])}
          onChange={(val: string) =>
            setFormData({ ...formData, area: val })}
        />
      </Block>

      {/* BLOCK 3 */}
      <Block title="Profile">
        <Input
          label="Age"
          name="age"
          type="number"
          value={formData.age}
          onChange={handleChange}
        />

        <SelectField
          label="Gender"
          value={formData.gender}
          options={mapOptions(["Male", "Female", "Other"])}
          onChange={(val: string) =>
            setFormData({ ...formData, gender: val })}
        />

        <SelectField
          label="Marital Status"
          value={formData.maritalStatus}
          options={mapOptions(["Single", "Married"])}
          onChange={(val: string) =>
            setFormData({ ...formData, maritalStatus: val })}
        />

        <SelectField
          label="Profession"
          value={formData.profession}
          options={mapOptions(["Student", "Job", "Business", "Housewife", "Other"])}
          onChange={(val: string) =>
            setFormData({ ...formData, profession: val })}
        />

        <SelectField
          label="Education"
          value={formData.education}
          options={mapOptions([
            "4th","5th","6th","7th","8th","9th",
            "10th","11th","12th","Graduate","Post Graduate"
          ])}
          onChange={(val: string) =>
            setFormData({ ...formData, education: val })}
        />

        <Input
          label="School / College / Job"
          name="schoolCollegeJob"
          value={formData.schoolCollegeJob}
          onChange={handleChange}
        />

        <SelectField
          label="School / College / Job Timing"
          value={formData.schoolTiming}
          options={mapOptions(["Morning","Afternoon","Evening","Night"])}
          onChange={(val: string) =>
            setFormData({ ...formData, schoolTiming: val })}
        />

        <SelectField
          label="Best Time To Contact"
          value={formData.contactTime}
          options={mapOptions([
            "8 AM - 10 AM",
            "10 AM - 12 PM",
            "12 AM - 4 PM",
            "4 PM - 7 PM",
            "7 PM - 9 PM"
          ])}
          onChange={(val: string) =>
            setFormData({ ...formData, contactTime: val })}
        />
      </Block>

      {/* BLOCK 4 */}
      <Block title="Course Selection">
        <SelectField
          label="Department"
          value={formData.department}
          options={mapOptions(["English","Computer","Eng & Com"])}
          onChange={(val: string) =>
            setFormData({ ...formData, department: val, course: [] })}
        />

        <SelectField
          label="Course"
          value={formData.course}
          options={mapOptions(courseOptions)}
          multiple={true}
          onChange={(val: any) =>
            setFormData({ ...formData, course: val })}
        />

        <SelectField
          label="Preferred Timing"
          value={formData.preferredTiming}
          options={mapOptions(["Any Time","Morning","Noon","Evening","Night"])}
          onChange={(val: string) =>
            setFormData({ ...formData, preferredTiming: val })}
        />

        <SelectField
          label="Preferred Batch"
          value={formData.preferredBatch}
          options={mapOptions([
            "8 AM","9 AM","10 AM","11 AM",
            "12 PM","1 PM","2 PM","3 PM",
            "4 PM","5 PM","6 PM","7 PM","8 PM"
          ])}
          onChange={(val: string) =>
            setFormData({ ...formData, preferredBatch: val })}
        />
      </Block>

      {/* BLOCK 5 */}
      <Block title="Counselling & Action">
        <SelectField
          label="Lead Chances"
          value={formData.leadChances}
          options={mapOptions(["Low","Medium","High"])}
          onChange={(val: string) =>
            setFormData({ ...formData, leadChances: val })}
        />

        <SelectField
          label="Lead Stage"
          value={formData.leadStage}
          options={mapOptions([
            "Lead","Demo Scheduled","Demo Continue",
            "Admitted","Alumni"
          ])}
          onChange={(val: string) =>
            setFormData({ ...formData, leadStage: val })}
        />

        <SelectField
          label="Action"
          value={formData.action}
          options={mapOptions([
            "Call Again","Send Details",
            "Demo Arrange","Visit Reminder"
          ])}
          onChange={(val: string) =>
            setFormData({ ...formData, action: val })}
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
          options={mapOptions(["Counsellor 1","Counsellor 2","Counsellor 3"])}
          onChange={(val: string) =>
            setFormData({ ...formData, counsellor: val })}
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