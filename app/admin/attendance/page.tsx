"use client";

import { useState, useMemo, useEffect } from "react";
import PermissionGuard from "@/app/components/admin/PermissionGuard";
import BranchSelector from "@/app/components/ui/BranchSelector";
import { supabase } from "@/lib/supabaseClient";

type Batch = {
  id: string;
  batch_name: string;
  branch_id: string;
  start_time: string;
};

type Branch = {
  id: string;
  name: string;
};

type Student = {
  id: string;
  name: string;
  joiningDate?: string;
  course?: string;
  due?: number;
  batchName?: string;
  last15: ("P" | "A")[];
};

export default function AttendancePage() {

  const [branches,setBranches] = useState<Branch[]>([]);
  const [selectedBranch,setSelectedBranch] = useState("");

  const [batches,setBatches] = useState<Batch[]>([]);
  const [selectedBatch,setSelectedBatch] = useState<string | null>(null);

  const [studentsData,setStudentsData] = useState<Student[]>([]);
  const [attendanceState,setAttendanceState] = useState<Record<string,boolean>>({});

  useEffect(()=>{
    loadBranches();
    loadBatches();
  },[]);

  useEffect(()=>{
    if(selectedBatch){
      loadStudents(selectedBatch);
    }
  },[selectedBatch]);

  async function loadBranches(){

    const {data} = await supabase
      .from("branches")
      .select("id,name")
      .order("name");

    setBranches(data || []);
  }

  async function loadBatches(){

    const {data} = await supabase
      .from("batches")
      .select("id,batch_name,branch_id,start_time")
      .order("start_time");

    setBatches(data || []);
  }

  async function loadStudents(batchId:string){

    const {data:batchStudents} = await supabase
      .from("batch_students")
      .select("lead_id")
      .eq("batch_id",batchId);

    const leadIds = batchStudents?.map(b=>b.lead_id) || [];

    if(leadIds.length === 0){
      setStudentsData([]);
      return;
    }

    const {data:leads} = await supabase
      .from("leads")
      .select("id,student_name,enquiry_date,course")
      .in("id",leadIds);

    const students:Student[] = [];

    for(const lead of leads || []){

      const {data:receipt} = await supabase
        .from("receipts")
        .select("due,batch")
        .eq("student_name",lead.student_name)
        .order("created_at",{ascending:false})
        .limit(1)
        .single();

      const {data:attendance} = await supabase
        .from("attendance")
        .select("status")
        .eq("lead_id",lead.id)
        .order("attendance_date",{ascending:false})
        .limit(15);

      const last15 = (attendance || []).map(a => a.status ? "P" : "A");

      while(last15.length < 15){
        last15.push("P");
      }

      students.push({
        id:lead.id,
        name:lead.student_name,
        joiningDate:lead.enquiry_date,
        course:lead.course,
        due:receipt?.due || 0,
        batchName:receipt?.batch || "",
        last15:last15
      });

    }

    setStudentsData(students);

  }

  const filteredBatches = useMemo(()=>{

    if(!selectedBranch) return batches;

    const branch = branches.find(
      b => b.name === selectedBranch
    );

    if(!branch) return batches;

    return batches.filter(
      b => b.branch_id === branch.id
    );

  },[selectedBranch,batches,branches]);

  const presentCount = useMemo(()=>{

    return studentsData.filter(
      s => attendanceState[s.id] !== false
    ).length;

  },[studentsData,attendanceState]);

  return (

    <PermissionGuard page="Attendance">

      <div className="min-h-screen p-4 space-y-4">

        <BranchSelector
          branches={branches.map(b=>b.name)}
          value={selectedBranch}
          onChange={(branch)=>{
            setSelectedBranch(branch);
            setSelectedBatch(null);
          }}
        />

        <div className="grid grid-cols-12 gap-6">

          <div className="col-span-3 border-r">

            <h2 className="font-semibold mb-3">Batches</h2>

            <div className="space-y-2">

              {filteredBatches.map(batch=>(

                <div
                  key={batch.id}
                  onClick={()=>setSelectedBatch(batch.id)}
                  className={`cursor-pointer p-2
                  ${
                    selectedBatch === batch.id
                    ? "bg-blue-50"
                    : "hover:bg-gray-50"
                  }`}
                >

                  <div className="font-medium">
                    {batch.batch_name}
                  </div>

                  <div className="text-xs text-gray-500">
                    {batch.start_time}
                  </div>

                </div>

              ))}

            </div>

          </div>

          <div className="col-span-9">

            {!selectedBatch && (
              <div className="text-gray-400 text-center py-20">
                Select a batch
              </div>
            )}

            {selectedBatch && (

              <>

                <div className="flex justify-between mb-4 font-semibold">
                  Present: {presentCount} / {studentsData.length}
                </div>

                <div className="divide-y">

                  {studentsData.map((student,index)=>{

                    const isPresent = attendanceState[student.id] !== false;

                    return(

                      <div key={student.id} className="py-3 flex justify-between">

                        <div className="space-y-1">

                          <div className={`font-semibold
                          ${
                            student.due ? "text-red-600" : ""
                          }`}>
                            {index+1}. {student.name}
                          </div>

                          <div className="text-xs text-gray-600">
                            {student.joiningDate} • {student.course} • ₹
                            {student.due ? `${student.due} Due` : "Fees Clear"}
                          </div>

                          <div className="text-xs text-gray-500">
                            {student.batchName}
                          </div>

                          <div className="flex gap-1">

                            {student.last15.map((d,i)=>(
                              <div
                                key={i}
                                className={`w-2 h-2 rounded-full
                                ${
                                  d === "P"
                                  ? "bg-green-500"
                                  : "bg-red-500"
                                }`}
                              />
                            ))}

                          </div>

                        </div>

                        <button
                          onClick={()=>
                            setAttendanceState(prev=>({
                              ...prev,
                              [student.id]:!isPresent
                            }))
                          }
                          className={`w-14 h-7 rounded-full flex items-center px-1
                          ${
                            isPresent ? "bg-green-500" : "bg-red-500"
                          }`}
                        >

                          <div
                            className={`w-5 h-5 bg-white rounded-full transform transition
                            ${
                              isPresent ? "translate-x-7" : ""
                            }`}
                          />

                        </button>

                      </div>

                    )

                  })}

                </div>

              </>

            )}

          </div>

        </div>

      </div>

    </PermissionGuard>

  );

}