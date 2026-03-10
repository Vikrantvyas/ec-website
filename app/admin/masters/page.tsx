"use client";

import { useState } from "react";

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

export default function MastersPage() {

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

  const staffMasters = [
    { label:"Teachers", value:"teachers" }
  ];

  const batchMasters = [
    { label:"Batches", value:"batches" }
  ];

  let masters:any[] = [];

  if(selectedCategory === "staff"){
    masters = staffMasters;
  }
  else if(selectedCategory === "batches"){
    masters = batchMasters;
  }
  else{
    masters = leadMasters;
  }

  return (

    <div className="space-y-6 text-sm p-6">

      <div className="bg-white rounded-xl shadow-sm p-5 space-y-4">

        <div className="grid md:grid-cols-2 gap-4">

          <div className="space-y-1">

            <label className="text-gray-600 text-sm">
              Category
            </label>

            <select
              className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={selectedCategory}
              onChange={(e)=>{
                setSelectedCategory(e.target.value);
                setSelectedMaster("");
              }}
            >

              <option value="leads">
                Leads
              </option>

              <option value="staff">
                Staff
              </option>

              <option value="batches">
                Batches
              </option>

            </select>

          </div>

          <div className="space-y-1">

            <label className="text-gray-600 text-sm">
              Master
            </label>

            <select
              className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={selectedMaster}
              onChange={(e)=>setSelectedMaster(e.target.value)}
            >

              <option value="">
                Select Master
              </option>

              {masters.map((m)=>(
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}

            </select>

          </div>

        </div>

      </div>

      {selectedMaster && (

        <div className="bg-white rounded-xl shadow-sm p-6">

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
          {selectedMaster === "teachers" && <TeacherMaster />}
          {selectedMaster === "batches" && <BatchMaster />}

        </div>

      )}

    </div>

  );

}