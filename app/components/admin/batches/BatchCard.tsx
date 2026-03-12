type BatchCardProps = {
  name: string;
  department?: string;
  courses?: string[] | null;
  students?: number;
};

export default function BatchCard({
  name,
  department,
  courses,
  students = 0
}: BatchCardProps) {

  const courseList =
    Array.isArray(courses) && courses.length > 0
      ? courses.join(", ")
      : "No Courses";

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

      <div className="flex items-center gap-2 mt-4">

        <div className="w-7 h-7 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs">
          {students}
        </div>

        <span className="text-sm text-gray-600">
          {students} student
        </span>

      </div>

      <div className="flex gap-2 mt-4">

        <button className="text-xs bg-gray-100 px-3 py-1 rounded hover:bg-gray-200">
          Add Students
        </button>

        <button className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200">
          Attendance
        </button>

      </div>

    </div>

  );

}