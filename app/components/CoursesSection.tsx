import Link from "next/link";
import { FaMicrophone, FaGlobe, FaLaptopCode } from "react-icons/fa";

export default function CoursesSection() {
  return (
    <section className="py-10 px-4 bg-gradient-to-b from-blue-50 via-white to-green-50">
      <h2 className="text-2xl font-bold text-center mb-6 text-blue-700">
        Courses We Offer
      </h2>

      <div className="max-w-4xl mx-auto space-y-4">

        {/* Spoken English Offline */}
        <div
          className="
            flex items-center justify-between gap-4
            bg-white rounded-2xl p-5 border
            shadow-sm
            transition-all duration-300
            hover:-translate-y-1 hover:shadow-lg
            animate-fadeUp
          "
        >
          <div className="flex items-start gap-4">
            <div className="text-green-600 text-2xl mt-1">
              <FaMicrophone />
            </div>
            <div>
              <p className="text-lg font-semibold text-gray-800">
                Spoken English (Offline)
              </p>
              <p className="text-sm text-gray-600">
                Classroom training with daily speaking practice
              </p>
            </div>
          </div>

          <Link
            href="/offline-english"
            className="shrink-0 px-4 py-2 rounded-full bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition"
          >
            View
          </Link>
        </div>

        {/* Spoken English Online */}
        <div
          className="
            flex items-center justify-between gap-4
            bg-white rounded-2xl p-5 border
            shadow-sm
            transition-all duration-300
            hover:-translate-y-1 hover:shadow-lg
            animate-fadeUp delay-100
          "
        >
          <div className="flex items-start gap-4">
            <div className="text-green-600 text-2xl mt-1">
              <FaGlobe />
            </div>
            <div>
              <p className="text-lg font-semibold text-gray-800">
                Spoken English (Online)
              </p>
              <p className="text-sm text-gray-600">
                Live Zoom classes from home
              </p>
            </div>
          </div>

          <Link
            href="/online-english"
            className="shrink-0 px-4 py-2 rounded-full bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition"
          >
            View
          </Link>
        </div>

        {/* Computer Courses */}
        <div
          className="
            flex items-center justify-between gap-4
            bg-white rounded-2xl p-5 border
            shadow-sm
            transition-all duration-300
            hover:-translate-y-1 hover:shadow-lg
            animate-fadeUp delay-200
          "
        >
          <div className="flex items-start gap-4">
            <div className="text-blue-600 text-2xl mt-1">
              <FaLaptopCode />
            </div>
            <div>
              <p className="text-lg font-semibold text-gray-800">
                Computer Courses
              </p>
              <p className="text-sm text-gray-600">
                Practical training at Computer G
              </p>
            </div>
          </div>

          <Link
            href="/computer-g"
            className="shrink-0 px-4 py-2 rounded-full bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition"
          >
            View
          </Link>
        </div>

      </div>
    </section>
  );
}
