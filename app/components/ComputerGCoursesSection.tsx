"use client";

import { useState } from "react";

const courses = [
  {
    id: 1,
    name: "Basic Computer Course",
    duration: "3 Months",
    syllabus: [
      "Computer Fundamentals",
      "Windows & File Management",
      "MS Word",
      "MS Excel",
      "MS PowerPoint",
      "Internet & Email",
    ],
  },
  {
    id: 2,
    name: "Advanced Excel",
    duration: "1.5 Months",
    syllabus: [
      "Advanced Formulas",
      "VLOOKUP / XLOOKUP",
      "Pivot Tables",
      "Charts & Dashboards",
      "Data Validation",
      "Practical Projects",
    ],
  },
  {
    id: 3,
    name: "Tally with GST",
    duration: "2 Months",
    syllabus: [
      "Accounting Basics",
      "Company Creation",
      "Ledger & Voucher Entry",
      "GST Setup",
      "GST Returns",
      "Final Accounts",
    ],
  },
  {
    id: 4,
    name: "CPCT Preparation",
    duration: "1 Month",
    syllabus: [
      "Typing Practice (Hindi / English)",
      "MS Word Practice",
      "MS Excel Practice",
      "Mock Tests",
      "Speed & Accuracy Improvement",
    ],
  },
];

export default function ComputerGCoursesSection() {
  const [openId, setOpenId] = useState<number | null>(null);

  return (
    <section className="py-16 px-4 bg-gray-50">
      <h2 className="text-2xl md:text-3xl font-bold text-center mb-12 text-blue-700">
        Computer-G Courses
      </h2>

      <div className="max-w-6xl mx-auto grid gap-6 md:grid-cols-2">
        {courses.map((course) => {
          const isOpen = openId === course.id;

          return (
            <div
              key={course.id}
              className="bg-white rounded-2xl shadow hover:shadow-md transition"
            >
              {/* CARD HEADER */}
              <div className="p-6 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    {course.name}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    ⏱ Duration: {course.duration}
                  </p>
                </div>

                <button
                  onClick={() =>
                    setOpenId(isOpen ? null : course.id)
                  }
                  className="px-4 py-2 rounded-full text-sm font-medium
                             border border-blue-600 text-blue-600
                             hover:bg-blue-600 hover:text-white transition"
                >
                  Curriculum
                </button>
              </div>

              {/* CURRICULUM (ACCORDION) */}
              {isOpen && (
                <div className="border-t px-6 py-4 bg-blue-50 animate-fadeUp">
                  <ul className="list-disc pl-5 space-y-2 text-sm text-gray-700">
                    {course.syllabus.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
