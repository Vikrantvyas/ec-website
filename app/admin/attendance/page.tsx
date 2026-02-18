"use client";

import { useState, useMemo } from "react";

type Student = {
  id: string;
  name: string;
  joiningDate: string;
  course: string;
  batch: string;
  teacher: string;
  dueAmount: number;
  reviewStars: number;
  last15Days: ("P" | "A")[];
};

const branches = [
  "All Branches",
  "Nanda Nagar",
  "Bapat Square",
  "Aurobindo",
  "Online",
];

const batches = [
  { id: "b1", name: "08 C Gayatri", branch: "Nanda Nagar", time: "8:00 AM" },
  { id: "b2", name: "Spoken English 10AM", branch: "Bapat Square", time: "10:00 AM" },
  { id: "b3", name: "Online English 7AM", branch: "Online", time: "7:00 AM" },
];

const studentsData: Student[] = [
  {
    id: "1",
    name: "Divyanshi",
    joiningDate: "15 Jul",
    course: "BCP",
    batch: "08 C Gayatri",
    teacher: "Gayatri",
    dueAmount: 1500,
    reviewStars: 3,
    last15Days: ["P","A","P","P","A","P","P","P","A","P","P","P","A","P","P"],
  },
  {
    id: "2",
    name: "Khushi Malviya",
    joiningDate: "30 Jun",
    course: "Eng BCP",
    batch: "08 C Gayatri",
    teacher: "Gayatri",
    dueAmount: 0,
    reviewStars: 2,
    last15Days: ["P","P","P","P","P","P","P","P","P","P","P","P","P","P","P"],
  },
];

export default function AttendancePage() {
  const [selectedBranch, setSelectedBranch] = useState("All Branches");
  const [selectedBatch, setSelectedBatch] = useState<string | null>(null);
  const [attendanceState, setAttendanceState] = useState<Record<string, boolean>>({});

  const filteredBatches = useMemo(() => {
    if (selectedBranch === "All Branches") return batches;
    return batches.filter((b) => b.branch === selectedBranch);
  }, [selectedBranch]);

  const filteredStudents = useMemo(() => {
    if (!selectedBatch) return [];
    const batchName = batches.find((b) => b.id === selectedBatch)?.name;
    return studentsData.filter((s) => s.batch === batchName);
  }, [selectedBatch]);

  const presentCount = useMemo(() => {
    return filteredStudents.filter(
      (s) => attendanceState[s.id] !== false
    ).length;
  }, [filteredStudents, attendanceState]);

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Top Header */}
      <div className="p-4 bg-white shadow-sm sticky top-0 z-10">
        <h1 className="text-xl font-semibold">Attendance Manager</h1>
      </div>

      <div className="p-4">

        {/* Branch Filter */}
        <div className="flex gap-2 overflow-x-auto mb-4">
          {branches.map((branch) => (
            <button
              key={branch}
              onClick={() => {
                setSelectedBranch(branch);
                setSelectedBatch(null);
              }}
              className={`px-4 py-2 rounded-full whitespace-nowrap text-sm ${
                selectedBranch === branch
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200"
              }`}
            >
              {branch}
            </button>
          ))}
        </div>

        {/* Desktop Layout */}
        <div className="grid md:grid-cols-3 gap-6">

          {/* Left Panel - Batches */}
          <div className="md:col-span-1 bg-white p-4 rounded-xl shadow">
            <h2 className="font-semibold mb-3">Batches</h2>
            <div className="space-y-3">
              {filteredBatches.map((batch) => (
                <div
                  key={batch.id}
                  onClick={() => setSelectedBatch(batch.id)}
                  className={`p-3 rounded-lg border cursor-pointer ${
                    selectedBatch === batch.id
                      ? "border-blue-500 bg-blue-50"
                      : ""
                  }`}
                >
                  <div className="font-medium">{batch.name}</div>
                  <div className="text-xs text-gray-500">
                    {batch.branch} • {batch.time}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Panel - Students */}
          <div className="md:col-span-2 bg-white p-4 rounded-xl shadow">

            {!selectedBatch && (
              <div className="text-gray-400 text-center py-20">
                Select a batch to mark attendance
              </div>
            )}

            {selectedBatch && (
              <>
                <div className="flex justify-between items-center mb-4">
                  <div className="font-semibold">
                    Present: {presentCount} / {filteredStudents.length}
                  </div>
                </div>

                <div className="space-y-4">
                  {filteredStudents.map((student, index) => {
                    const isPresent = attendanceState[student.id] !== false;

                    return (
                      <div
                        key={student.id}
                        className={`p-4 rounded-xl border ${
                          !isPresent ? "opacity-50" : ""
                        }`}
                      >
                        <div className="flex justify-between items-start">

                          {/* Student Info */}
                          <div>
                            <div
                              className={`font-semibold ${
                                student.dueAmount > 0 ? "text-red-600" : ""
                              }`}
                            >
                              {index + 1}. {student.name}{" "}
                              {"⭐".repeat(student.reviewStars)}
                            </div>

                            <div className="text-xs text-gray-500 mt-1">
                              {student.joiningDate} • {student.course} • ₹
                              {student.dueAmount > 0
                                ? `${student.dueAmount} Due`
                                : "Fees Clear"}
                            </div>

                            <div className="text-xs text-gray-400 mt-1">
                              {student.batch} • {student.teacher}
                            </div>

                            <div className="flex gap-1 mt-2">
                              {student.last15Days.map((day, i) => (
                                <span
                                  key={i}
                                  className={`w-2 h-2 rounded-full ${
                                    day === "P"
                                      ? "bg-green-500"
                                      : "bg-red-500"
                                  }`}
                                ></span>
                              ))}
                            </div>
                          </div>

                          {/* Toggle */}
                          <button
                            onClick={() =>
                              setAttendanceState((prev) => ({
                                ...prev,
                                [student.id]: !isPresent,
                              }))
                            }
                            className={`w-14 h-7 rounded-full flex items-center px-1 transition ${
                              isPresent ? "bg-green-500" : "bg-red-500"
                            }`}
                          >
                            <div
                              className={`w-5 h-5 bg-white rounded-full transform transition ${
                                isPresent ? "translate-x-7" : ""
                              }`}
                            ></div>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
