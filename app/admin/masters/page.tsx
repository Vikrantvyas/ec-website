"use client";
import EnglishCourseMaster from "@/app/components/admin/masters/EnglishCourseMaster";
import EnglishDayMaster from "@/app/components/admin/masters/EnglishDayMaster";
import EnglishTopicMaster from "@/app/components/admin/masters/EnglishTopicMaster";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

import { SelectField } from "@/app/components/ui/FormFields";

import PermissionGuard from "@/app/components/admin/PermissionGuard";

import BranchMaster from "@/app/components/admin/masters/BranchMaster";
import MethodMaster from "@/app/components/admin/masters/MethodMaster";
import ChannelMaster from "@/app/components/admin/masters/ChannelMaster";
import ForMaster from "@/app/components/admin/masters/ForMaster";
import CityMaster from "@/app/components/admin/masters/CityMaster";
import AreaMaster from "@/app/components/admin/masters/AreaMaster";
import DepartmentMaster from "@/app/components/admin/masters/DepartmentMaster";
import CourseMaster from "@/app/components/admin/masters/CourseMaster";
import LeadChanceMaster from "@/app/components/admin/masters/LeadChanceMaster";
import LeadStageMaster from "@/app/components/admin/masters/LeadStageMaster";
import ActionMaster from "@/app/components/admin/masters/ActionMaster";
import CounsellorMaster from "@/app/components/admin/masters/CounsellorMaster";
import TeacherMaster from "@/app/components/admin/masters/TeacherMaster";
import BatchMaster from "@/app/components/admin/masters/BatchMaster";
import EducationMaster from "@/app/components/admin/masters/EducationMaster";
import FeeMaster from "@/app/components/admin/masters/FeeMaster";

/* 🔥 ENGLISH MODULE */
import EnglishSentenceMaster from "@/app/components/admin/masters/EnglishSentenceMaster";

export default function MastersPage() {
const [newCourse, setNewCourse] = useState("");
const [newDay, setNewDay] = useState("");
const [newTopic, setNewTopic] = useState("");

const [showCourseInput, setShowCourseInput] = useState(false);
const [showDayInput, setShowDayInput] = useState(false);
const [showTopicInput, setShowTopicInput] = useState(false);
  const searchParams = useSearchParams();

  const [selectedCategory,setSelectedCategory] = useState("leads");
  const [selectedMaster,setSelectedMaster] = useState("");

  const leadMasters = [
    { label:"Branches", value:"branches" },
    { label:"Method", value:"method" },
    { label:"Channel", value:"channel" },
    { label:"For", value:"for" },
    { label:"City", value:"city" },
    { label:"Area", value:"area" },
    { label:"Education", value:"education" },
    { label:"Department", value:"department" },
    { label:"Courses", value:"courses" },
    { label:"Lead Chances", value:"lead_chances" },
    { label:"Lead Stage", value:"lead_stage" },
    { label:"Action", value:"action" },
    { label:"Counsellor", value:"counsellor" }
  ];

  const englishMasters = [
  { label:"English Courses", value:"english_courses" },
  { label:"Days", value:"english_days" },
  { label:"Topics", value:"english_topics" },
  { label:"Sentences", value:"english_sentences" } // existing safe
];

  const staffMasters = [
    { label:"Teachers", value:"teachers" }
  ];

  const batchMasters = [
    { label:"Batches", value:"batches" }
  ];

  const feeMasters = [
    { label:"Fee Schemes", value:"fee_schemes" }
  ];

  let masters:any[] = [];

  if(selectedCategory === "staff"){
    masters = staffMasters;
  }
  else if(selectedCategory === "batches"){
    masters = batchMasters;
  }
  else if(selectedCategory === "fees"){
    masters = feeMasters;
  }
  else if(selectedCategory === "english"){
    masters = englishMasters;
  }
  else{
    masters = leadMasters;
  }

  const mapOptions = (arr:any[]) =>
    arr.map((v:any)=>({label:v.label,value:v.value}));

  useEffect(() => {
    const tab = searchParams.get("tab");

    if (tab === "batches") {
      setSelectedCategory("batches");
      setSelectedMaster("batches");
    }
  }, [searchParams]);

  return (

    <PermissionGuard page="Masters">

      <div className="space-y-6 text-sm p-6">

        {/* SELECTOR */}

        <div className="sticky top-0 z-30 bg-gray-50 pb-4">

          <div className="bg-white rounded-xl shadow-sm p-5">

            <div className="grid md:grid-cols-2 gap-4">

              <SelectField
                label="Category"
                value={selectedCategory}
                options={[
                  {label:"Leads",value:"leads"},
                  {label:"English",value:"english"},  // 🔥 NEW
                  {label:"Staff",value:"staff"},
                  {label:"Batches",value:"batches"},
                  {label:"Fees",value:"fees"}
                ]}
                onChange={(val:string)=>{
                  setSelectedCategory(val);
                  setSelectedMaster("");
                }}
              />

              <SelectField
                label="Master"
                value={selectedMaster}
                options={mapOptions(masters)}
                onChange={(val:string)=>setSelectedMaster(val)}
              />

            </div>

          </div>

        </div>

        {/* CONTENT */}

        {selectedMaster && (

          <div className="bg-white rounded-xl shadow-sm p-6">

            {/* LEADS */}
            {selectedMaster === "branches" && <BranchMaster />}
            {selectedMaster === "method" && <MethodMaster />}
            {selectedMaster === "channel" && <ChannelMaster />}
            {selectedMaster === "for" && <ForMaster />}
            {selectedMaster === "city" && <CityMaster />}
            {selectedMaster === "area" && <AreaMaster />}
            {selectedMaster === "education" && <EducationMaster />}
            {selectedMaster === "department" && <DepartmentMaster />}
            {selectedMaster === "courses" && <CourseMaster />}
            {selectedMaster === "lead_chances" && <LeadChanceMaster />}
            {selectedMaster === "lead_stage" && <LeadStageMaster />}
            {selectedMaster === "action" && <ActionMaster />}
            {selectedMaster === "counsellor" && <CounsellorMaster />}

            {/* STAFF */}
            {selectedMaster === "teachers" && <TeacherMaster />}

            {/* BATCH */}
            {selectedMaster === "batches" && <BatchMaster />}

            {/* FEES */}
            {selectedMaster === "fee_schemes" && <FeeMaster />}

            {/* 🔥 ENGLISH */}
            

{selectedMaster === "english_courses" && <EnglishCourseMaster />}


{selectedMaster === "english_days" && <EnglishDayMaster />}
{selectedMaster === "english_topics" && <EnglishTopicMaster />}
{selectedMaster === "english_sentences" && <EnglishSentenceMaster />}

          </div>

        )}

      </div>

    </PermissionGuard>

  );

}