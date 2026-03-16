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

    const {data,error} = await supabase
      .from("branches")
      .select("id,name")
      .order("name");

    if(error){
      console.log(error);
      return;
    }

    setBranches(data || []);
  }

  async function loadBatches(){

    const {data,error} = await supabase
      .from("batches")
      .select("id,batch_name,branch_id,start_time")
      .order("start_time");

    if(error){
      console.log(error);
      return;
    }

    setBatches(data || []);
  }

  async function loadStudents(batchId:string){

    const {data:batchStudents,error} = await supabase
      .from("batch_students")
      .select("lead_id")
      .eq("batch_id",batchId);

    if(error){
      console.log(error);
      return;
    }

    const leadIds = batchStudents?.map(b => b.lead_id) || [];

    if(leadIds.length === 0){
      setStudentsData([]);
      return;
    }

    const {data:leads,error:leadError} = await supabase
      .from("leads")
      .select("id,student_name")
      .in("id",leadIds);

    if(leadError){
      console.log(leadError);
      return;
    }

    const students = leads?.map(l=>({
      id:l.id,
      name:l.student_name
    })) || [];

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

      <div className="bg-white min-h-screen">

        <div className="p-4 max-w-full space-y-6">

          <BranchSelector
            branches={branches.map(b=>b.name)}
            value={selectedBranch}
            onChange={(branch)=>{
              setSelectedBranch(branch);
              setSelectedBatch(null);
            }}
          />

          <div className="grid md:grid-cols-3 gap-6">

            <div className="md:col-span-1 bg-white p-4 rounded-xl border">

              <h2 className="font-semibold mb-3">
                Batches
              </h2>

              <div className="space-y-3">

                {filteredBatches.map((batch)=>(

                  <div
                    key={batch.id}
                    onClick={()=>setSelectedBatch(batch.id)}
                    className={`p-3 rounded-lg border cursor-pointer
                    ${
                      selectedBatch === batch.id
                      ? "border-blue-500 bg-blue-50"
                      : ""
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

            <div className="md:col-span-2 bg-white p-4 rounded-xl border">

              {!selectedBatch && (

                <div className="text-gray-400 text-center py-20">
                  Select a batch to mark attendance
                </div>

              )}

              {selectedBatch && (

                <>
                  <div className="flex justify-between items-center mb-4">

                    <div className="font-semibold">
                      Present: {presentCount} / {studentsData.length}
                    </div>

                  </div>

                  <div className="space-y-4">

                    {studentsData.map((student,index)=>{

                      const isPresent = attendanceState[student.id] !== false;

                      return(

                        <div
                          key={student.id}
                          className={`p-4 rounded-xl border
                          ${
                            !isPresent ? "opacity-50" : ""
                          }`}
                        >

                          <div className="flex justify-between items-start">

                            <div className="font-semibold">
                              {index+1}. {student.name}
                            </div>

                            <button
                              onClick={()=>
                                setAttendanceState(prev=>({
                                  ...prev,
                                  [student.id]:!isPresent
                                }))
                              }
                              className={`w-14 h-7 rounded-full flex items-center px-1 transition
                              ${
                                isPresent ? "bg-green-500" : "bg-red-500"
                              }`}
                            >

                              <div
                                className={`w-5 h-5 bg-white rounded-full transform transition
                                ${
                                  isPresent ? "translate-x-7" : ""
                                }`}
                              ></div>

                            </button>

                          </div>

                        </div>

                      )

                    })}

                  </div>

                </>

              )}

            </div>

          </div>

        </div>

      </div>

    </PermissionGuard>

  );

}