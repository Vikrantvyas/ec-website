import Link from "next/link";
import { FaMicrophone, FaLaptopCode } from "react-icons/fa";
import { SiZoom } from "react-icons/si";

export default function CoursesSection() {
  return (
    <section className="py-12 px-4 bg-gradient-to-b from-blue-50 via-white to-green-50">
      <h2 className="text-2xl font-bold text-center mb-8 text-blue-700">
        Courses We Offer
      </h2>

      <div className="max-w-5xl mx-auto space-y-6">

        {/* ===== SPOKEN ENGLISH (2 CARDS ROW) ===== */}
        <div className="grid grid-cols-2 gap-4">

          {/* Spoken English – Offline */}
          <div className="bg-white rounded-2xl p-5 border shadow-sm text-center hover-lift animate-fadeUp">
            <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-green-100 flex items-center justify-center text-green-600 text-2xl">
              <FaMicrophone />
            </div>

            <p className="font-semibold text-gray-800">
              Spoken English
            </p>
            <p className="text-sm text-gray-600 mb-3">
              Offline
            </p>

            <Link
              href="/offline-english"
              className="inline-block px-4 py-2 rounded-full bg-blue-600 text-white text-sm font-medium hover:bg-blue-700"
            >
              View
            </Link>
          </div>

          {/* Spoken English – Online */}
          <div className="bg-white rounded-2xl p-5 border shadow-sm text-center hover-lift animate-fadeUp delay-100">
            <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600 text-2xl">
              <SiZoom />
            </div>

            <p className="font-semibold text-gray-800">
              Spoken English
            </p>
            <p className="text-sm text-gray-600 mb-3">
              Online
            </p>

            <Link
              href="/online-english"
              className="inline-block px-4 py-2 rounded-full bg-green-600 text-white text-sm font-medium hover:bg-green-700"
            >
              View
            </Link>
          </div>
        </div>

        {/* ===== COMPUTER COURSES (FULL WIDTH) ===== */}
        <div className="bg-white rounded-2xl p-6 border shadow-sm flex items-center justify-between hover-lift animate-fadeUp delay-200">
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
            className="px-5 py-2 rounded-full bg-blue-600 text-white text-sm font-medium hover:bg-blue-700"
          >
            View
          </Link>
        </div>

      </div>
    </section>
  );
}
