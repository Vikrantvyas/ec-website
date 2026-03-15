"use client";

type BatchCardProps = {
  id: string;
  name: string;
  department?: string;
  courses?: string[] | null;
  students?: number;
  onAddStudents?: (id: string) => void;
};

export default function BatchCard({
  id,
  name,
  department,
  courses,
  students = 0,
  onAddStudents
}: BatchCardProps) {

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

  return (

    <div className="bg-white border rounded-lg p-4 shadow-sm hover:shadow-md transition">

      <h3 className="text-sm font-semibold">
        {name}
      </h3>

      <div className="text-sm text-gray-500 mt-2 space-y-1">

        <div>
          {department || "No Department"}
        </div>

        <div>
          {courseList}
        </div>

      </div>

      <div className="flex items-center mt-4">

        <div className="flex items-center">

          {Array.from({ length: showCircles }).map((_, i) => (

            <div
              key={i}
              className={`w-7 h-7 rounded-full text-white text-xs flex items-center justify-center ${colors[i]} ${i !== 0 ? "-ml-2" : ""}`}
            >
              {i === showCircles - 1 && students > 4 ? `+${students}` : ""}
            </div>

          ))}

        </div>

        <span className="text-sm text-gray-600 ml-2">
          {students} student
        </span>

      </div>

      <div className="flex gap-2 mt-4">

        <button
          onClick={() => onAddStudents?.(id)}
          className="text-xs bg-gray-100 px-3 py-1 rounded hover:bg-gray-200"
        >
          Add Students
        </button>

        <button className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200">
          Attendance
        </button>

      </div>

    </div>

  );

}