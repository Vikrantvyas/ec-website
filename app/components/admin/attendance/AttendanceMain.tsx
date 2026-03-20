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
  const [hoverMove, setHoverMove] = useState(false);
  const [hoverAdd, setHoverAdd] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleClick(e: any) {
      if (!menuRef.current?.contains(e.target)) {
        setOpenMenuId(null);
        setHoverMove(false);
        setHoverAdd(false);
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
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = String(d.getFullYear()).slice(-2);
    return `${day}-${month}-${year}`;
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
        </div>

        <button
          disabled={saved}
          onClick={() => setShowConfirm(true)}
          className={`px-2 py-1 text-xs rounded ${
            saved ? "bg-gray-400" : "bg-blue-600 text-white"
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

                  <div className="w-12 h-16 bg-gray-300 flex items-center justify-center text-base font-semibold">
                    {student.name?.charAt(0)}
                  </div>

                  {/* ✅ EQUAL SPACING */}
                  <div className="flex flex-col gap-2">

                    {/* ROW 1 */}
                    <div className={`font-semibold text-sm ${
                      isUnpaid ? "bg-lime-100 inline px-2 rounded" :
                      isDue ? "text-red-600" : ""
                    }`}>
                      {index + 1}. {student.name}
                    </div>

                    {/* ROW 2 */}
                    <div className={`text-sm ${
                      !student.course ? "text-red-500" : "text-gray-700"
                    }`}>
                      {student.course || "Course N.A."}
                    </div>

                    {/* ROW 3 */}
                    <div className="text-xs text-gray-600">
                      {formatDate(student.joiningDate)} • ₹{" "}
                      {isUnpaid ? "Unpaid" : isDue ? `${student.due} Due` : "Clear"}
                    </div>

                    {/* ROW 4 */}
                    <div className="flex gap-1">
                      {student.last10.map((d, i) => (
                        <div key={i} className={`w-4 h-4 text-[10px] flex items-center justify-center rounded ${
                          d === "P" ? "bg-green-500 text-white" :
                          d === "A" ? "bg-red-500 text-white" :
                          d === "L" ? "bg-yellow-400" : "bg-gray-200"
                        }`}>
                          {d}
                        </div>
                      ))}
                    </div>

                  </div>

                </div>

                {/* RIGHT */}
                <div className="flex flex-col items-end justify-between">

                  {/* MENU */}
                  <div className="relative" ref={menuRef}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenMenuId(openMenuId === student.id ? null : student.id);
                      }}
                      className="text-lg px-2"
                    >
                      ⋮
                    </button>

                    {openMenuId === student.id && (
                      <div className="absolute right-0 top-6 bg-white shadow-xl rounded-md w-48 text-sm py-1 z-50">

                        <div className="px-3 py-2 hover:bg-gray-100">📄 Admission</div>
                        <div className="px-3 py-2 hover:bg-gray-100">💰 Receipt</div>
                        <div className="px-3 py-2 hover:bg-gray-100">📊 Progress</div>
                        <div className="px-3 py-2 hover:bg-gray-100">📝 Notes</div>
                        <div className="px-3 py-2 hover:bg-gray-100">🎓 Certificate</div>

                        <div className="border-t my-1"></div>

                        <div
                          onMouseEnter={() => setHoverAdd(true)}
                          onMouseLeave={() => setHoverAdd(false)}
                          className="relative"
                        >
                          <div className="px-3 py-2 hover:bg-gray-100 flex justify-between">
                            ➕ Add Batches ◀
                          </div>

                          {hoverAdd && (
                            <div className="absolute right-full top-0 bg-white shadow-lg rounded w-40 z-50">
                              {dummyBatches.map((b) => (
                                <div key={b.id} className="px-3 py-2 hover:bg-gray-100">
                                  {b.batch_name}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        <div
                          onMouseEnter={() => setHoverMove(true)}
                          onMouseLeave={() => setHoverMove(false)}
                          className="relative"
                        >
                          <div className="px-3 py-2 hover:bg-gray-100 flex justify-between">
                            🔄 Move to Batch ◀
                          </div>

                          {hoverMove && (
                            <div className="absolute right-full top-0 bg-white shadow-lg rounded w-40 z-50">
                              {dummyBatches.map((b) => (
                                <div key={b.id} className="px-3 py-2 hover:bg-gray-100">
                                  {b.batch_name}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                      </div>
                    )}
                  </div>

                  {/* EXPAND BUTTON */}
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : student.id)}
                    className="text-xs text-blue-600"
                  >
                    {isExpanded ? "▲" : "▼"}
                  </button>

                  {/* TOGGLE */}
                  <button
                    onClick={() => {
                      const newStatus = isPresent ? "A" : "P";
                      setAttendanceState((prev: any) => ({
                        ...prev,
                        [student.id]: newStatus,
                      }));
                    }}
                    className={`w-12 h-6 rounded-full flex items-center px-1 ${
                      isPresent ? "bg-green-500" : "bg-red-500"
                    }`}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full ${
                      isPresent ? "translate-x-6" : ""
                    }`} />
                  </button>

                </div>

              </div>

              {/* EXPANDED DATA */}
              {isExpanded && (
                <div className="mt-2 text-xs text-gray-600 border-t pt-2">
                  Dummy Info: Fees Paid ₹5000 • Attendance 80% • Last Test A+
                </div>
              )}

            </div>
          );
        })}

      </div>

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