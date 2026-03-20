"use client";

import { useState, useEffect, useRef } from "react";
import AttendanceHistory from "./AttendanceHistory";
import AddStudentsModal from "@/app/components/admin/common/AddStudentsModal";

type Student = {
  id: string;
  name: string;
  joiningDate?: string;
  course?: string;
  due?: number;
  last10: string[];
  paid?: number;
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
  reloadStudents
}: any) {

  const [showHistory, setShowHistory] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [openSubMenu, setOpenSubMenu] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleClick(e: any) {
      if (!menuRef.current?.contains(e.target)) {
        setOpenMenuId(null);
        setOpenSubMenu(null);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const dummyBatches = [
    { id: "1", batch_name: "Morning Batch" },
    { id: "2", batch_name: "Evening Batch" },
    { id: "3", batch_name: "Spoken English" },
    { id: "4", batch_name: "Computer Basic" },
  ];

  function formatDate(date?: string) {
    if (!date) return "";
    const d = new Date(date);
    return `${String(d.getDate()).padStart(2, "0")}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getFullYear()).slice(-2)}`;
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">

      {/* HEADER */}
      <div className="px-3 py-3 bg-white shadow-sm flex justify-between">
        <div>
          <div className="font-semibold text-sm">{selectedBatchName}</div>

          <div className="text-sm mt-1">
            Total: {totalStudents}
            <span className="text-green-600 ml-2">P: {presentCount}</span>
            <span className="text-red-600 ml-2">A: {absentCount}</span>
          </div>

          <div className="text-blue-600 text-xs mt-1 flex gap-2">
            <span onClick={() => setShowHistory(true)} className="underline cursor-pointer">
              Attendance History
            </span>
            <span>|</span>
            <span onClick={() => setShowAddModal(true)} className="underline cursor-pointer">
              + Add / Remove
            </span>
          </div>

          {/* ✅ RESTORED */}
          {saved && (
            <div className="text-green-600 text-xs mt-1">
              ✔ Attendance Locked for Today
            </div>
          )}
        </div>

        <button
          disabled={saved}
          onClick={() => setShowConfirm(true)}
          className={`px-2 py-1 text-xs rounded ${
            saved ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 text-white"
          }`}
        >
          Submit
        </button>
      </div>

      {/* STUDENTS */}
      <div className="flex-1 overflow-y-auto p-2 bg-gray-50">

        {studentsData.map((student: Student, index: number) => {

          const status = attendanceState[student.id] || "P";
          const isPresent = status === "P";

          const isUnpaid = (student.paid || 0) === 0;
          const isDue = (student.paid || 0) > 0 && (student.due || 0) > 0;

          const isExpanded = expandedId === student.id;

          return (
            <div key={student.id} className="bg-white p-3 mb-2 rounded shadow">

              <div className="flex justify-between">

                {/* LEFT */}
                <div className="flex gap-3">

                  {/* IMAGE + ARROW */}
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-16 bg-gray-300 flex items-center justify-center font-semibold">
                      {student.name?.charAt(0)}
                    </div>

                    <button
                      onClick={() => setExpandedId(isExpanded ? null : student.id)}
                      className="text-xs text-blue-600 mt-1"
                    >
                      {isExpanded ? "▲" : "▼"}
                    </button>
                  </div>

                  {/* TEXT */}
                  <div className="flex flex-col gap-1">

                    <div className={`font-semibold text-sm ${
                      isUnpaid ? "bg-lime-100 px-2 rounded inline" :
                      isDue ? "text-red-600" : ""
                    }`}>
                      {index + 1}. {student.name}
                    </div>

                    <div className={`text-sm ${
                      !student.course ? "text-red-500" : "text-gray-700"
                    }`}>
                      {student.course || "Course N.A."}
                    </div>

                    <div className="text-xs text-gray-600">
                      {formatDate(student.joiningDate)} • ₹{" "}
                      {isUnpaid ? "Unpaid" : isDue ? `${student.due} Due` : "Clear"}
                    </div>

                    {/* ✅ COLORS RESTORED */}
                    <div className="flex gap-1">
                      {student.last10.map((d, i) => (
                        <div key={i} className={`w-4 h-4 text-[10px] flex items-center justify-center rounded
                          ${d === "P" ? "bg-green-500 text-white" :
                            d === "A" ? "bg-red-500 text-white" :
                            d === "L" ? "bg-yellow-400" : "bg-gray-200"}
                        `}>
                          {d}
                        </div>
                      ))}
                    </div>

                  </div>

                </div>

                {/* RIGHT */}
                <div className="flex flex-col items-end justify-between pr-2">

                  {/* MENU */}
                  <div className="relative" ref={menuRef}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenMenuId(openMenuId === student.id ? null : student.id);
                        setOpenSubMenu(null);
                      }}
                      className="text-lg px-1"
                    >
                      ⋮
                    </button>

                    {openMenuId === student.id && (
                      <div className="absolute right-0 top-6 bg-white shadow-xl rounded-md w-48 text-sm py-1 z-50">

                        <div className="px-3 py-2">📄 Admission</div>
                        <div className="px-3 py-2">💰 Receipt</div>
                        <div className="px-3 py-2">📊 Progress</div>
                        <div className="px-3 py-2">📝 Notes</div>
                        <div className="px-3 py-2">🎓 Certificate</div>

                        <div className="border-t my-1"></div>

                        <div
                          onClick={() => setOpenSubMenu(openSubMenu === "add" ? null : "add")}
                          className="px-3 py-2 flex justify-between cursor-pointer"
                        >
                          ➕ Add Batches ▶
                        </div>

                        {openSubMenu === "add" && (
                          <div className="ml-2">
                            {dummyBatches.map((b) => (
                              <div key={b.id} className="px-3 py-1 text-xs">
                                {b.batch_name}
                              </div>
                            ))}
                          </div>
                        )}

                        <div
                          onClick={() => setOpenSubMenu(openSubMenu === "move" ? null : "move")}
                          className="px-3 py-2 flex justify-between cursor-pointer"
                        >
                          🔄 Move to Batch ▶
                        </div>

                        {openSubMenu === "move" && (
                          <div className="ml-2">
                            {dummyBatches.map((b) => (
                              <div key={b.id} className="px-3 py-1 text-xs">
                                {b.batch_name}
                              </div>
                            ))}
                          </div>
                        )}

                      </div>
                    )}
                  </div>

                  {/* ✅ TOGGLE DISABLE RESTORED */}
                  <button
                    disabled={saved}
                    onClick={() => {
                      const newStatus = isPresent ? "A" : "P";
                      setAttendanceState((prev: any) => ({
                        ...prev,
                        [student.id]: newStatus,
                      }));
                    }}
                    className={`w-11 h-5 rounded-full flex items-center px-1 ${
                      saved
                        ? "bg-gray-300"
                        : isPresent
                        ? "bg-green-500"
                        : "bg-red-500"
                    }`}
                  >
                    <div className={`w-3.5 h-3.5 bg-white rounded-full ${
                      isPresent ? "translate-x-5" : ""
                    }`} />
                  </button>

                </div>

              </div>

              {isExpanded && (
                <div className="mt-2 text-xs text-gray-600 border-t pt-2">
                  Dummy Info: Fees ₹5000 • Attendance 80%
                </div>
              )}

            </div>
          );
        })}

      </div>

      {/* ✅ CONFIRM POPUP RESTORED */}
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

      {showHistory && (
        <AttendanceHistory
          batchId={selectedBatchId}
          students={studentsData}
          onClose={() => setShowHistory(false)}
        />
      )}

      {showAddModal && (
        <AddStudentsModal
          batchId={selectedBatchId}
          onClose={() => setShowAddModal(false)}
          onSuccess={reloadStudents}
        />
      )}

    </div>
  );
}