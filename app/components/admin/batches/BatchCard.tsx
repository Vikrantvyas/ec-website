type BatchCardProps = {
  name: string;
  course?: string;
  subject?: string;
  students?: number;
};

export default function BatchCard({
  name,
  course,
  subject,
  students = 0,
}: BatchCardProps) {
  return (
    <div className="bg-white border rounded-lg p-4 shadow-sm hover:shadow-md transition">
      <h3 className="text-lg font-semibold">{name}</h3>

      <div className="text-sm text-gray-500 mt-2">
        <div>{course || "No Course"}</div>
        <div>{subject || "No Subject"}</div>
      </div>

      <div className="flex items-center gap-2 mt-4">
        <div className="w-7 h-7 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs">
          {students}
        </div>

        <span className="text-sm text-gray-600">
          {students} student
        </span>
      </div>
    </div>
  );
}