"use client";

import { Block, Input, SelectField, TextArea } from "@/app/components/forms/lead/LeadFormFields";

interface Props {
  formData: any;
  setFormData: any;
  handleChange: any;
  courseOptions: string[];
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
  courseOptions,
  mapOptions,
  studentRef,
  mobileRef,

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

  return (
    <>
      {/* BASIC INFO */}

      <Block title="Basic Info">

        <Input
          label="Date"
          name="enquiryDate"
          value={formData.enquiryDate}
          readOnly
        />

        <Input
          label="Time"
          name="enquiryTime"
          value={formData.enquiryTime}
          readOnly
        />

        <SelectField
          label="Method"
          value={formData.method}
          options={mapOptions(methods)}
          onChange={(val: string) =>
            setFormData({ ...formData, method: val })
          }
        />

        <SelectField
          label="Channel"
          value={formData.channel}
          options={mapOptions(channels)}
          onChange={(val: string) =>
            setFormData({ ...formData, channel: val })
          }
        />

      </Block>


      {/* STUDENT CONTACT */}

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
          onChange={(val: string) => {

            setFormData((prev: any) => ({
              ...prev,
              forWhom: val,
              studentName: val === "Self" ? prev.enquiredBy : ""
            }));

            if (val !== "Self") {
              setTimeout(() => {
                studentRef.current?.focus();
              }, 0);
            }

          }}
        />

        <Input
          label="Student Name *"
          name="studentName"
          value={formData.studentName}
          onChange={handleChange}
          ref={studentRef}
          disabled={formData.forWhom === "Self"}
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
          options={mapOptions(areas)}
          onChange={(val: string) =>
            setFormData({ ...formData, area: val })
          }
        />

      </Block>


      {/* PROFILE */}

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
          options={mapOptions(["Male","Female","Other"])}
          onChange={(val: string) =>
            setFormData({ ...formData, gender: val })
          }
        />

        <SelectField
          label="Marital Status"
          value={formData.maritalStatus}
          options={mapOptions(["Single","Married"])}
          onChange={(val: string) =>
            setFormData({ ...formData, maritalStatus: val })
          }
        />

        <SelectField
          label="Profession"
          value={formData.profession}
          options={mapOptions(["Student","Job","Business","Housewife","Other"])}
          onChange={(val: string) =>
            setFormData({ ...formData, profession: val })
          }
        />

        <SelectField
          label="Education"
          value={formData.education}
          options={mapOptions([
            "4th","5th","6th","7th","8th","9th",
            "10th","11th","12th","Graduate","Post Graduate"
          ])}
          onChange={(val: string) =>
            setFormData({ ...formData, education: val })
          }
        />

        <Input
          label="School / College / Job"
          name="schoolCollegeJob"
          value={formData.schoolCollegeJob}
          onChange={handleChange}
        />

      </Block>


      {/* COURSE */}

      <Block title="Course Selection">

        <SelectField
          label="Department"
          value={formData.department}
          options={mapOptions(departments)}
          onChange={(val: string) =>
            setFormData({ ...formData, department: val, course: [] })
          }
        />

        <SelectField
          label="Course"
          value={formData.course}
          options={mapOptions(courses)}
          multiple={true}
          onChange={(val: any) =>
            setFormData({ ...formData, course: val })
          }
        />

      </Block>


      {/* COUNSELLING */}

      <Block title="Counselling & Action">

        <SelectField
          label="Lead Chances"
          value={formData.leadChances}
          options={mapOptions(leadChances)}
          onChange={(val: string) =>
            setFormData({ ...formData, leadChances: val })
          }
        />

        <SelectField
          label="Lead Stage"
          value={formData.leadStage}
          options={mapOptions(leadStages)}
          onChange={(val: string) =>
            setFormData({ ...formData, leadStage: val })
          }
        />

        <SelectField
          label="Action"
          value={formData.action}
          options={mapOptions(actions)}
          onChange={(val: string) =>
            setFormData({ ...formData, action: val })
          }
        />

        <SelectField
          label="Counsellor"
          value={formData.counsellor}
          options={mapOptions(counsellors)}
          onChange={(val: string) =>
            setFormData({ ...formData, counsellor: val })
          }
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