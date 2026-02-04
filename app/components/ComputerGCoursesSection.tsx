"use client";

import Link from "next/link";

const courses = [
  {
    id: 1,
    name: "Basic Computer Course",
    duration: "3 Months",
    link: "/computer-g/basic-computer",
  },
  {
    id: 2,
    name: "Advanced Excel",
    duration: "1.5 Months",
    link: "#", // baad me page banega
  },
  {
    id: 3,
    name: "Tally with GST",
    duration: "2 Months",
    link: "#",
  },
  {
    id: 4,
    name: "CPCT Preparation",
    duration: "1 Month",
    link: "#",
  },
];

export default function ComputerGCoursesSection() {
  return (
    <section className="py-16 px-4 bg-gray-50">
      <h2 className="text-2xl md:text-3xl font-bold text-center mb-12 text-blue-700">
        Computer-G Courses
      </h2>

      <div className="max-w-6xl mx-auto grid gap-6 md:grid-cols-2">
        {courses.map((course) => (
          <div
            key={course.id}
            className="bg-white rounded-2xl shadow hover:shadow-md transition"
          >
            <div className="p-6 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  {course.name}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  ⏱ Duration: {course.duration}
                </p>
              </div>

              {course.link !== "#" ? (
                <Link
                  href={course.link}
                  className="
                    px-4 py-2 rounded-full text-sm font-medium
                    border border-blue-600 text-blue-600
                    hover:bg-blue-600 hover:text-white transition
                  "
                >
                  View Curriculum
                </Link>
              ) : (
                <span className="text-sm text-gray-400">
                  Coming Soon
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
