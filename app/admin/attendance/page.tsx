"use client";

import { useState, useMemo, useEffect } from "react";
import PermissionGuard from "@/app/components/admin/PermissionGuard";
import { supabase } from "@/lib/supabaseClient";

import AdminSplitLayout from "@/app/components/admin/layout/AdminSplitLayout";
import AttendanceSidebar from "@/app/components/admin/attendance/AttendanceSidebar";
import AttendanceMain from "@/app/components/admin/attendance/AttendanceMain";

type Batch = {
  id: string;
  batch_name: string;
  branch_id: string;
  start_time: string;
  teacher_name?: string;
  student_count?: number;
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

export default function AttendancePage() {

  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranch, setSelectedBranch] = useState("");

  const [batches, setBatches] = useState<Batch[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<string | null>(null);

  const [studentsData, setStudentsData] = useState<Student[]>([]);
  const [attendanceState, setAttendanceState] = useState<Record<string, string>>({});

  const [showConfirm, setShowConfirm] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadBranches();
    loadBatches();
  }, []);

  useEffect(() => {
    if (selectedBatch) {
      loadStudents(selectedBatch);
      loadTodayAttendance(selectedBatch);
      setSaved(false);
    }
  }, [selectedBatch]);

  async function loadBranches() {
    const { data } = await supabase
      .from("branches")
      .select("id,name")
      .order("name");

    setBranches(data || []);
  }

  // ✅ UPDATED FUNCTION
  async function loadBatches() {

    const { data: batchData } = await supabase
      .from("batches")
      .select("id,batch_name,branch_id,start_time,teacher_id")
      .order("start_time");

    if (!batchData) return;

    const teacherIds = batchData.map(b => b.teacher_id).filter(Boolean);

    const { data: teachers } = await supabase
      .from("teachers")
      .select("id,name")
      .in("id", teacherIds);

    const { data: counts } = await supabase
      .from("batch_students")
      .select("batch_id");

    const studentCountMap: Record<string, number> = {};

    counts?.forEach(c => {
      studentCountMap[c.batch_id] = (studentCountMap[c.batch_id] || 0) + 1;
    });

    const formatted: Batch[] = batchData.map((b: any) => ({
      id: b.id,
      batch_name: b.batch_name,
      branch_id: b.branch_id,
      start_time: b.start_time,
      teacher_name:
        teachers?.find(t => t.id === b.teacher_id)?.name || "Teacher",
      student_count: studentCountMap[b.id] || 0,
    }));

    setBatches(formatted);
  }

  async function loadTodayAttendance(batchId: string) {

    const today = new Date().toISOString().split("T")[0];

    const { data } = await supabase
      .from("attendance")
      .select("lead_id,status")
      .eq("batch_id", batchId)
      .eq("attendance_date", today);

    const map: Record<string, string> = {};

    (data || []).forEach(r => {
      map[r.lead_id] = r.status;
    });

    setAttendanceState(map);
  }

  async function loadStudents(batchId: string) {

    const { data: batchStudents } = await supabase
      .from("batch_students")
      .select("lead_id")
      .eq("batch_id", batchId);

    const leadIds = batchStudents?.map(b => b.lead_id) || [];

    if (leadIds.length === 0) {
      setStudentsData([]);
      return;
    }

    const { data: leads } = await supabase
      .from("leads")
      .select("id,student_name,enquiry_date,course")
      .in("id", leadIds);

    const students: Student[] = [];

    for (const lead of leads || []) {

      const { data: receipt } = await supabase
        .from("receipts")
        .select("due,batch")
        .eq("student_name", lead.student_name)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      const { data: attendance } = await supabase
        .from("attendance")
        .select("status")
        .eq("lead_id", lead.id)
        .order("attendance_date", { ascending: false })
        .limit(10);

      const last10 = (attendance || []).map(a => a.status);

      while (last10.length < 10) {
        last10.push("N");
      }

      students.push({
        id: lead.id,
        name: lead.student_name,
        joiningDate: lead.enquiry_date,
        course: lead.course,
        due: receipt?.due || 0,
        batchName: receipt?.batch || "",
        last10
      });
    }

    setStudentsData(students);
  }

  async function submitAttendance() {

    if (!selectedBatch) return;

    const today = new Date().toISOString().split("T")[0];

    const rows = studentsData.map(s => ({
      batch_id: selectedBatch,
      lead_id: s.id,
      attendance_date: today,
      status: attendanceState[s.id] || "P"
    }));

    await supabase
      .from("attendance")
      .upsert(rows, { onConflict: "batch_id,lead_id,attendance_date" });

    setShowConfirm(false);
    setSaved(true);
  }

  const filteredBatches = useMemo(() => {

    if (!selectedBranch) return batches;

    const branch = branches.find(b => b.name === selectedBranch);

    if (!branch) return batches;

    return batches.filter(b => b.branch_id === branch.id);

  }, [selectedBranch, batches, branches]);

  const selectedBatchName = batches.find(b => b.id === selectedBatch)?.batch_name;

  const totalStudents = studentsData.length;

  const presentCount = studentsData.filter(
    s => (attendanceState[s.id] || "P") === "P"
  ).length;

  const absentCount = totalStudents - presentCount;

  return (

    <PermissionGuard page="Attendance">

      <div className="h-screen overflow-hidden">

        <AdminSplitLayout

          left={
            <AttendanceSidebar
              branches={branches}
              selectedBranch={selectedBranch}
              setSelectedBranch={(b) => {
                setSelectedBranch(b);
                setSelectedBatch(null);
              }}
              batches={filteredBatches}
              selectedBatch={selectedBatch}
              setSelectedBatch={setSelectedBatch}
            />
          }

          right={
            !selectedBatch ? (
              <div className="flex items-center justify-center h-full text-gray-400">
                Select a batch
              </div>
            ) : (
              <AttendanceMain
                studentsData={studentsData}
                attendanceState={attendanceState}
                setAttendanceState={setAttendanceState}
                selectedBatchName={selectedBatchName}
                totalStudents={totalStudents}
                presentCount={presentCount}
                absentCount={absentCount}
                saved={saved}
                setShowConfirm={setShowConfirm}
              />
            )
          }

        />

      </div>

      {showConfirm && (

        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">

          <div className="bg-white p-6 rounded w-[420px] max-h-[70vh] overflow-auto">

            <h3 className="font-semibold mb-4">
              Confirm Attendance
            </h3>

            <div className="mb-4 text-sm">

              Total Students : {totalStudents}

              <br />

              <span className="text-green-600">
                Present : {presentCount}
              </span>

              <br />

              <span className="text-red-600">
                Absent : {absentCount}
              </span>

            </div>

            <div className="space-y-2 text-sm">

              {studentsData.map(s => {

                const status = attendanceState[s.id] || "P";

                return (

                  <div key={s.id} className="flex justify-between">

                    <span>{s.name}</span>

                    <span
                      className={
                        status === "P"
                          ? "text-green-600 font-bold"
                          : "text-red-600 font-bold"
                      }
                    >
                      {status}
                    </span>

                  </div>

                );

              })}

            </div>

            <div className="flex justify-end gap-3 mt-6">

              <button
                onClick={() => setShowConfirm(false)}
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

    </PermissionGuard>

  );

}