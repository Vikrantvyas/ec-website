"use client";

import { useState } from "react";
import AttendanceHistory from "./AttendanceHistory";
import AddStudentsModal from "@/app/components/admin/common/AddStudentsModal";

type Student = {
  id: string;
  name: string;
  joiningDate?: string;
  course?: string;
  due?: number;
  batchName?: string;
  last10: string[];
  isDemo?: boolean;
  paid?: number; // ✅ ADD
};

export default function AttendanceMain({
  studentsData,
  attendanceState,
  setAttendanceState,
  selectedBatchName,
  totalStudents,
  presentCount,
  absentCount,
  saved,
  setShowConfirm,
  showConfirm,
  submitAttendance,
  selectedBatchId,
}: any) {

  const [showHistory, setShowHistory] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  return (
    <div className="flex flex-col h-full overflow-hidden">

      {/* HEADER */}
      <div className="px-3 md:px-4 py-3 bg-white sticky top-0 z-20 shadow-sm flex justify-between items-start gap-2">

        <div>
          <div className="font-semibold text-sm md:text-base">
            {selectedBatchName}
          </div>

          <div className="text-xs md:text-sm mt-1">
            Total: {totalStudents}
            <span className="text-green-600 ml-2">P: {presentCount}</span>
            <span className="text-red-600 ml-2">A: {absentCount}</span>
          </div>

          <div className="text-blue-600 text-xs mt-1 flex items-center gap-2">
            <span onClick={() => setShowHistory(true)} className="cursor-pointer underline">
              Attendance History
            </span>

            <span className="text-gray-400">|</span>

            <span onClick={() => setShowAddModal(true)} className="cursor-pointer underline">
              + Add Students
            </span>
          </div>

          {saved && (
            <div className="text-green-600 text-[11px] md:text-xs mt-1">
              ✔ Attendance Locked for Today
            </div>
          )}
        </div>

        <button
          disabled={saved}
          onClick={() => setShowConfirm(true)}
          className={`px-3 md:px-4 py-1.5 md:py-2 rounded text-xs md:text-sm shadow-sm transition ${
            saved
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
        >
          Submit
        </button>

      </div>

      {/* STUDENT LIST */}
      <div className="flex-1 overflow-y-auto px-2 md:px-4 py-2 md:py-3 bg-gray-50">

        {studentsData.length === 0 && (
          <div className="text-center text-gray-400 py-10 text-sm">
            No students found
          </div>
        )}

        {studentsData.map((student: Student, index: number) => {

          const status = attendanceState[student.id] || "P";
          const isPresent = status === "P";

          // ✅ FINAL CORRECT LOGIC
          const isUnpaid = (student.paid || 0) === 0;
          const isDue = (student.paid || 0) > 0 && (student.due || 0) > 0;

          return (
            <div
              key={student.id}
              className="py-2 md:py-3 px-2 md:px-3 flex justify-between items-center bg-white rounded-lg md:rounded-xl mb-2 md:mb-3 shadow-sm"
            >

              <div className="flex-1 pr-2">

                {/* NAME */}
                <div
                  className={`font-semibold text-sm px-2 py-[2px] rounded inline-block ${
                    isUnpaid
                      ? "bg-lime-100"
                      : isDue
                      ? "text-red-600"
                      : student.isDemo
                      ? "bg-lime-200 text-black"
                      : ""
                  }`}
                >
                  {index + 1}. {student.name}
                </div>

                {/* STATUS TEXT */}
                <div className="text-[10px] md:text-xs text-gray-600 mt-1">
                  {student.joiningDate} • {student.course} • ₹{" "}
                  {isUnpaid
                    ? "Unpaid"
                    : isDue
                    ? `${student.due} Due`
                    : "Clear"}
                </div>

                <div className="flex gap-1 mt-1 md:mt-2">
                  {student.last10.map((d, i) => (
                    <div
                      key={i}
                      className={`w-3.5 md:w-4 h-3.5 md:h-4 text-[9px] md:text-[10px] flex items-center justify-center rounded
                      ${
                        d === "P"
                          ? "bg-green-500 text-white"
                          : d === "A"
                          ? "bg-red-500 text-white"
                          : d === "L"
                          ? "bg-yellow-400"
                          : "bg-gray-200"
                      }`}
                    >
                      {d}
                    </div>
                  ))}
                </div>

              </div>

              <button
                disabled={saved}
                onClick={() => {
                  const newStatus = isPresent ? "A" : "P";
                  setAttendanceState((prev: any) => ({
                    ...prev,
                    [student.id]: newStatus,
                  }));
                }}
                className={`w-12 md:w-14 h-6 md:h-7 rounded-full flex items-center px-1 ${
                  saved
                    ? "bg-gray-300"
                    : isPresent
                    ? "bg-green-500"
                    : "bg-red-500"
                }`}
              >
                <div
                  className={`w-4 md:w-5 h-4 md:h-5 bg-white rounded-full transform transition ${
                    isPresent ? "translate-x-6 md:translate-x-7" : ""
                  }`}
                />
              </button>

            </div>
          );
        })}

      </div>

      {/* CONFIRM POPUP */}
      {showConfirm && !saved && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 w-[90%] max-w-md max-h-[80vh] overflow-y-auto">

            <h3 className="font-semibold mb-3 text-sm">Confirm Attendance</h3>

            {studentsData.map((s: Student) => {
              const st = attendanceState[s.id] || "P";
              return (
                <div key={s.id} className="flex justify-between text-xs mb-1">
                  <span>{s.name}</span>
                  <span className={
                    st === "P" ? "text-green-600" :
                    st === "A" ? "text-red-600" :
                    "text-yellow-500"
                  }>
                    {st}
                  </span>
                </div>
              );
            })}

            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-3 py-1 text-xs bg-gray-200 rounded"
              >
                Cancel
              </button>
              <button
                onClick={submitAttendance}
                className="px-3 py-1 text-xs bg-blue-600 text-white rounded"
              >
                OK
              </button>
            </div>

          </div>
        </div>
      )}

      {/* HISTORY */}
      {showHistory && (
        <AttendanceHistory
          batchId={selectedBatchId}
          students={studentsData}
          onClose={() => setShowHistory(false)}
        />
      )}

      {/* ADD STUDENTS */}
      {showAddModal && (
        <AddStudentsModal
          batchId={selectedBatchId}
          onClose={() => setShowAddModal(false)}
          onSuccess={() => window.location.reload()}
        />
      )}

    </div>
  );
}