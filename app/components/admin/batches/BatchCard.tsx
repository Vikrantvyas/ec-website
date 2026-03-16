"use client";

import { useRouter } from "next/navigation";

type BatchCardProps = {
  id: string;
  name: string;
  department?: string;
  teacher?: string;
  courses?: string[] | null;
  students?: number;
};

export default function BatchCard({
  id,
  name,
  teacher,
  courses,
  students = 0
}: BatchCardProps) {

  const router = useRouter();

  const courseList =
    Array.isArray(courses) && courses.length > 0
      ? courses.join(", ")
      : "No Courses";

  const colors = [
    "bg-blue-500",
    "bg-green-500",
    "bg-purple-500",
    "bg-orange-500",
    "bg-pink-500"
  ];

  const showCircles = Math.min(students, 4);

  function openAddStudents() {
    router.push(`/admin/batches/add-students?batch=${id}`);
  }

  function openAttendance() {
    router.push(`/admin/attendance?batch=${id}`);
  }

  return (

    <div className="bg-white border rounded-md p-2.5 shadow-sm hover:shadow-md transition max-w-[160px]">

      <h3 className="text-xs font-semibold leading-tight">
        {name}
      </h3>

      <div className="text-xs text-gray-500 mt-1 space-y-0.5">

        <div>
          {courseList}
        </div>

        <div>
          {teacher || ""}
        </div>

      </div>

      <div className="flex items-center mt-2">

        <div className="flex items-center">

          {Array.from({ length: showCircles }).map((_, i) => (

            <div
              key={i}
              className={`w-4 h-4 rounded-full text-white text-[9px] flex items-center justify-center ${colors[i]} ${i !== 0 ? "-ml-1.5" : ""}`}
            >
              {i === showCircles - 1 && students > 4 ? `+${students}` : ""}
            </div>

          ))}

        </div>

        <span className="text-xs text-gray-600 ml-2">
          {students}
        </span>

      </div>

      <div className="flex gap-3 mt-2 text-[11px]">

        <button
          onClick={openAddStudents}
          className="text-gray-600 hover:text-black"
        >
          Add Student
        </button>

        <button
          onClick={openAttendance}
          className="text-blue-600 hover:text-blue-800"
        >
          Attendance
        </button>

      </div>

    </div>

  );

}