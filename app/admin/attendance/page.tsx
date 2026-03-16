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
  last10: string[];
};

export default function AttendancePage(){

  const [branches,setBranches] = useState<Branch[]>([]);
  const [selectedBranch,setSelectedBranch] = useState("");

  const [batches,setBatches] = useState<Batch[]>([]);
  const [selectedBatch,setSelectedBatch] = useState<string | null>(null);

  const [studentsData,setStudentsData] = useState<Student[]>([]);
  const [attendanceState,setAttendanceState] = useState<Record<string,string>>({});

  const [showConfirm,setShowConfirm] = useState(false);
  const [saved,setSaved] = useState(false);

  useEffect(()=>{
    loadBranches();
    loadBatches();
  },[]);

  useEffect(()=>{
    if(selectedBatch){
      loadStudents(selectedBatch);
      loadTodayAttendance(selectedBatch);
      setSaved(false);
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

  async function loadTodayAttendance(batchId:string){

    const today = new Date().toISOString().split("T")[0];

    const {data} = await supabase
      .from("attendance")
      .select("lead_id,status")
      .eq("batch_id",batchId)
      .eq("attendance_date",today);

    const map:Record<string,string> = {};

    (data || []).forEach(r=>{
      map[r.lead_id] = r.status;
    });

    setAttendanceState(map);
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
        .limit(10);

      const last10 = (attendance || []).map(a=>a.status);

      while(last10.length < 10){
        last10.push("N");
      }

      students.push({
        id:lead.id,
        name:lead.student_name,
        joiningDate:lead.enquiry_date,
        course:lead.course,
        due:receipt?.due || 0,
        batchName:receipt?.batch || "",
        last10
      });

    }

    setStudentsData(students);
  }

  async function submitAttendance(){

    if(!selectedBatch) return;

    const today = new Date().toISOString().split("T")[0];

    const rows = studentsData.map(s=>({
      batch_id:selectedBatch,
      lead_id:s.id,
      attendance_date:today,
      status:attendanceState[s.id] || "P"
    }));

    await supabase
      .from("attendance")
      .upsert(rows,{ onConflict:"batch_id,lead_id,attendance_date" });

    setShowConfirm(false);
    setSaved(true);
  }

  const filteredBatches = useMemo(()=>{

    if(!selectedBranch) return batches;

    const branch = branches.find(b=>b.name===selectedBranch);

    if(!branch) return batches;

    return batches.filter(b=>b.branch_id===branch.id);

  },[selectedBranch,batches,branches]);

  const selectedBatchName = batches.find(b=>b.id===selectedBatch)?.batch_name;

  const totalStudents = studentsData.length;

  const presentCount = studentsData.filter(
    s => (attendanceState[s.id] || "P") === "P"
  ).length;

  const absentCount = totalStudents - presentCount;

  return(

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

  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

  <div className="md:border-r md:pr-4">

  <h2 className="font-semibold mb-3">Batches</h2>

  <div className="space-y-2">

  {filteredBatches.map(batch=>(

  <div
  key={batch.id}
  onClick={()=>setSelectedBatch(batch.id)}
  className={`cursor-pointer p-2 rounded
  ${
  selectedBatch===batch.id
  ?"bg-blue-50"
  :"hover:bg-gray-50"
  }`}
  >

  <div className="font-medium">{batch.batch_name}</div>

  <div className="text-xs text-gray-500">
  {batch.start_time}
  </div>

  </div>

  ))}

  </div>

  </div>

  <div className="md:col-span-2 flex flex-col h-[calc(100vh-180px)]">

  {!selectedBatch && (
  <div className="text-gray-400 text-center py-20">
  Select a batch
  </div>
  )}

  {selectedBatch && (

  <>

  <div className="sticky top-0 bg-white z-10 pb-2">

  <div className="flex justify-between font-semibold">

  <div>
  {new Date().toLocaleDateString()}
  </div>

  </div>

  <div className="text-sm mt-1">

  Total : {totalStudents}

  <span className="text-green-600 ml-3">
  Present : {presentCount}
  </span>

  <span className="text-red-600 ml-3">
  Absent : {absentCount}
  </span>

  </div>

  {saved && (
  <div className="text-green-600 text-sm mt-1">
  ✔ Attendance Saved
  </div>
  )}

  </div>

  <div className="flex-1 overflow-y-auto divide-y pr-2">

  {studentsData.map((student,index)=>{

  const status = attendanceState[student.id] || "P";
  const isPresent = status==="P";

  return(

  <div key={student.id} className="py-3 flex justify-between">

  <div className="space-y-1">

  <div className={`font-semibold
  ${
  student.due ? "text-red-600":""
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

  {student.last10.map((d,i)=>(
  <div
  key={i}
  className={`w-4 h-4 text-xs flex items-center justify-center rounded
  ${
  d==="P"
  ?"bg-green-500 text-white"
  :d==="A"
  ?"bg-red-500 text-white"
  :d==="L"
  ?"bg-yellow-400"
  :"bg-gray-200"
  }`}
  >
  {d}
  </div>
  ))}

  </div>

  </div>

  <button
  onClick={()=>{

  const newStatus = isPresent ? "A":"P";

  setAttendanceState(prev=>({
  ...prev,
  [student.id]:newStatus
  }));

  }}
  className={`w-14 h-7 rounded-full flex items-center px-1
  ${
  isPresent
  ?"bg-green-500"
  :"bg-red-500"
  }`}
  >

  <div
  className={`w-5 h-5 bg-white rounded-full transform transition
  ${
  isPresent
  ?"translate-x-7":""
  }`}
  />

  </button>

  </div>

  )

  })}

  </div>

  <div className="pt-3 border-t bg-white sticky bottom-0">

  <button
  onClick={()=>setShowConfirm(true)}
  className="bg-blue-600 text-white px-6 py-2 rounded"
  >
  Submit Attendance
  </button>

  </div>

  </>

  )}

  </div>

  </div>

  {showConfirm && (

  <div className="fixed inset-0 bg-black/40 flex items-center justify-center">

  <div className="bg-white p-6 rounded w-[420px] max-h-[70vh] overflow-auto">

  <h3 className="font-semibold mb-4">
  Confirm Attendance
  </h3>

  <div className="mb-4 text-sm">

  Total Students : {totalStudents}

  <br/>

  <span className="text-green-600">
  Present : {presentCount}
  </span>

  <br/>

  <span className="text-red-600">
  Absent : {absentCount}
  </span>

  </div>

  <div className="space-y-2 text-sm">

  {studentsData.map(s=>{

  const status = attendanceState[s.id] || "P";

  return(

  <div key={s.id} className="flex justify-between">

  <span>{s.name}</span>

  <span
  className={
  status==="P"
  ?"text-green-600 font-bold"
  :"text-red-600 font-bold"
  }
  >
  {status}
  </span>

  </div>

  )

  })}

  </div>

  <div className="flex justify-end gap-3 mt-6">

  <button
  onClick={()=>setShowConfirm(false)}
  className="px-4 py-2 border rounded"
  >
  Cancel
  </button>

  <button
  onClick={submitAttendance}
  className="bg-green-600 text-white px-4 py-2 rounded"
  >
  Yes Submit
  </button>

  </div>

  </div>

  </div>

  )}

  </div>

  </PermissionGuard>

  );

}