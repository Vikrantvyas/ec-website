"use client";

import Link from "next/link";
import {
  FaDesktop,
  FaFileExcel,
  FaCalculator,
  FaChartBar,
  FaKeyboard,
} from "react-icons/fa";

const courses = [
  {
    id: 1,
    name: "Basic Computer Course",
    duration: "3 Months",
    link: "/computer-g/basic-computer",
    icon: <FaDesktop />,
    color: "blue",
  },
  {
    id: 2,
    name: "Advanced Excel Course",
    duration: "1 Month",
    link: "/computer-g/advanced-excel",
    icon: <FaFileExcel />,
    color: "green",
  },
  {
    id: 3,
    name: "Tally Course (ERP 9 + Prime)",
    duration: "3 Months",
    link: "/computer-g/tally-course",
    icon: <FaCalculator />,
    color: "orange",
  },
  {
    id: 4,
    name: "Power BI Course",
    duration: "1.5 Months",
    link: "/computer-g/power-bi-course",
    icon: <FaChartBar />,
    color: "purple",
  },
  {
    id: 5,
    name: "English Typing",
    duration: "1 Month",
    link: "/computer-g/english-typing",
    icon: <FaKeyboard />,
    color: "cyan",
  },
  {
    id: 6,
    name: "Hindi Typing",
    duration: "1 Month",
    link: "/computer-g/hindi-typing",
    icon: <FaKeyboard />,
    color: "rose",
  },
];

const colorMap: any = {
  blue: "bg-blue-100 text-blue-600 border-blue-300",
  green: "bg-green-100 text-green-600 border-green-300",
  orange: "bg-orange-100 text-orange-600 border-orange-300",
  purple: "bg-purple-100 text-purple-600 border-purple-300",
  cyan: "bg-cyan-100 text-cyan-600 border-cyan-300",
  rose: "bg-rose-100 text-rose-600 border-rose-300",
};

export default function ComputerGCoursesSection() {
  return (
    <section className="py-16 px-4 bg-gray-50">
      <h2 className="text-2xl md:text-3xl font-bold text-center mb-12 text-blue-700">
        Computer-G Courses
      </h2>

      {/* 3 × 3 GRID */}
      <div className="max-w-6xl mx-auto grid gap-6 md:grid-cols-3">
        {courses.map((course) => (
          <div
            key={course.id}
            className="
              bg-white rounded-2xl p-5 border
              shadow-[0_4px_10px_rgba(0,0,0,0.08)]
              flex items-center gap-4
            "
          >
            {/* ICON */}
            <div
              className={`w-14 h-14 rounded-xl border flex items-center justify-center text-2xl shrink-0 ${colorMap[course.color]}`}
            >
              {course.icon}
            </div>

            {/* CONTENT */}
            <div className="flex-1">
              <p className="font-semibold text-gray-800 leading-tight">
                {course.name}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                ⏱ Duration: {course.duration}
              </p>

              <Link
                href={course.link}
                className="inline-block mt-2 text-sm font-medium text-blue-600"
              >
                View Details →
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
