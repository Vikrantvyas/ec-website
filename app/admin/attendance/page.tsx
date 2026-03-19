"use client";

import { useState, useMemo, useEffect } from "react";
import PermissionGuard from "@/app/components/admin/PermissionGuard";
import { supabase } from "@/lib/supabaseClient";
import { usePermissions } from "@/lib/permissionsContext";

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
  paid?: number; // ✅ FINAL
};

export default function AttendancePage() {

  const { role } = usePermissions();

  const [isMobile, setIsMobile] = useState(false);

  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranch, setSelectedBranch] = useState("");

  const [batches, setBatches] = useState<Batch[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<string | null>(null);

  const [studentsData, setStudentsData] = useState<Student[]>([]);
  const [attendanceState, setAttendanceState] = useState<Record<string, string>>({});

  const [showConfirm, setShowConfirm] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    initPage();
  }, []);

  useEffect(() => {
    if (selectedBatch) {
      loadStudents(selectedBatch);
      loadTodayAttendance(selectedBatch);
      checkTodayAttendance(selectedBatch);
    }
  }, [selectedBatch]);

  async function checkTodayAttendance(batchId: string) {
    const today = new Date().toISOString().split("T")[0];

    const { data } = await supabase
      .from("attendance")
      .select("id")
      .eq("batch_id", batchId)
      .eq("attendance_date", today)
      .limit(1);

    setSaved(!!(data && data.length > 0));
  }

  async function initPage() {
    let user = null;

    for (let i = 0; i < 10; i++) {
      const { data } = await supabase.auth.getSession();
      user = data.session?.user;
      if (user) break;
      await new Promise(res => setTimeout(res, 200));
    }

    if (!user) return;

    await loadBranches();
    await loadBatches(user);
  }

  async function loadBranches() {
    const { data } = await supabase
      .from("branches")
      .select("id,name")
      .order("name");

    setBranches(data || []);
  }

  async function loadBatches(user: any) {

    const { data: userData } = await supabase
      .from("users")
      .select("branch_id")
      .eq("id", user.id)
      .single();

    const { data: teacher } = await supabase
      .from("teachers")
      .select("id")
      .eq("email", user.email)
      .maybeSingle();

    let query = supabase
      .from("batches")
      .select("id,batch_name,branch_id,start_time,teacher_id")
      .order("start_time");

    if (teacher?.id) {
      query = query.eq("teacher_id", teacher.id);
    }

    if (userData?.branch_id) {
      query = query.eq("branch_id", userData.branch_id);
      setSelectedBranch(userData.branch_id);
    }

    const { data: batchData } = await query;
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

    const { data: receipts } = await supabase
      .from("receipts")
      .select("student_name,amount,total_fee,discount,created_at,batch")
      .in("student_name", leads?.map(l => l.student_name) || [])
      .order("created_at", { ascending: false });

    const { data: attendance } = await supabase
      .from("attendance")
      .select("lead_id,status,attendance_date")
      .in("lead_id", leadIds)
      .order("attendance_date", { ascending: false });

    const totalPaidMap: Record<string, number> = {};
    const latestReceiptMap: Record<string, any> = {};

    receipts?.forEach(r => {
      totalPaidMap[r.student_name] =
        (totalPaidMap[r.student_name] || 0) + (r.amount || 0);

      if (!latestReceiptMap[r.student_name]) {
        latestReceiptMap[r.student_name] = r;
      }
    });

    const students: Student[] = [];

    for (const lead of leads || []) {

      const latest = latestReceiptMap[lead.student_name];

      const totalFee = latest?.total_fee || 0;
      const discount = latest?.discount || 0;
      const paid = totalPaidMap[lead.student_name] || 0;

      const finalFee = totalFee - discount;

      const studentAttendance = attendance
        ?.filter(a => a.lead_id === lead.id)
        .slice(0, 10) || [];

      const last10 = studentAttendance.map(a => a.status);

      while (last10.length < 10) {
        last10.push("N");
      }

      students.push({
        id: lead.id,
        name: lead.student_name,
        joiningDate: lead.enquiry_date,
        course: lead.course,
        due: Math.max(finalFee - paid, 0),
        batchName: latest?.batch || "",
        last10,
        paid // ✅ FINAL
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

    const { error } = await supabase
      .from("attendance")
      .upsert(rows, {
        onConflict: "batch_id,lead_id,attendance_date"
      });

    if (error) {
      alert("Error: " + error.message);
      return;
    }

    setShowConfirm(false);
    setSaved(true);
  }

  const filteredBatches = useMemo(() => {
    if (!selectedBranch) return batches;
    return batches.filter(b => b.branch_id === selectedBranch);
  }, [selectedBranch, batches]);

  const selectedBatchName = batches.find(b => b.id === selectedBatch)?.batch_name;

  const totalStudents = studentsData.length;

  const presentCount = studentsData.filter(
    s => (attendanceState[s.id] || "P") === "P"
  ).length;

  const absentCount = totalStudents - presentCount;

  return (
    <PermissionGuard page="Attendance">
      <div className="h-screen overflow-hidden">

        {isMobile ? (
          selectedBatch ? (
            <div className="h-full flex flex-col">
              <div className="p-3 bg-white shadow flex items-center gap-2">
                <button onClick={() => setSelectedBatch(null)} className="text-blue-600 text-sm">
                  ← Back
                </button>
                <div className="font-semibold text-sm">{selectedBatchName}</div>
              </div>

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
                showConfirm={showConfirm}
                submitAttendance={submitAttendance}
                selectedBatchId={selectedBatch}
              />
            </div>
          ) : (
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
              isTeacher={role === "teacher"}
            />
          )
        ) : (
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
                isTeacher={role === "teacher"}
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
                  showConfirm={showConfirm}
                  submitAttendance={submitAttendance}
                  selectedBatchId={selectedBatch}
                />
              )
            }
          />
        )}

      </div>
    </PermissionGuard>
  );
}