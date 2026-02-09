import Link from "next/link";
import { FaMicrophone, FaLaptopCode } from "react-icons/fa";
import { SiZoom } from "react-icons/si";

export default function CoursesSection() {
  return (
    <section className="py-12 px-4 bg-gradient-to-b from-blue-50 via-white to-green-50">
      <h2 className="text-2xl font-bold text-center mb-10 text-blue-700">
        Courses We Offer
      </h2>

      <div className="max-w-5xl mx-auto space-y-6">

        {/* ===== SPOKEN ENGLISH (2 CARDS ROW) ===== */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Spoken English – Offline */}
          <div className="bg-white rounded-2xl p-5 border shadow-sm hover:shadow-md transition flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-green-100 border border-green-300 flex items-center justify-center text-green-600 text-2xl shrink-0">
              <FaMicrophone />
            </div>

            <div className="flex-1">
              <p className="font-semibold text-gray-800">
                Spoken English
              </p>
              <p className="text-sm text-gray-600 mb-2">
                Offline Classes
              </p>
              <Link
                href="/offline-english"
                className="inline-block text-sm font-medium text-blue-600 hover:underline"
              >
                View Details →
              </Link>
            </div>
          </div>

          {/* Spoken English – Online */}
          <div className="bg-white rounded-2xl p-5 border shadow-sm hover:shadow-md transition flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-blue-100 border border-blue-300 flex items-center justify-center text-blue-600 text-2xl shrink-0">
              <SiZoom />
            </div>

            <div className="flex-1">
              <p className="font-semibold text-gray-800">
                Spoken English
              </p>
              <p className="text-sm text-gray-600 mb-2">
                Online Classes
              </p>
              <Link
                href="/online-english"
                className="inline-block text-sm font-medium text-blue-600 hover:underline"
              >
                View Details →
              </Link>
            </div>
          </div>
        </div>

        {/* ===== COMPUTER COURSES (FULL WIDTH) ===== */}
        <div className="bg-white rounded-2xl p-6 border shadow-sm hover:shadow-md transition flex items-center gap-5">
          <div className="w-16 h-16 rounded-xl bg-blue-100 border border-blue-300 flex items-center justify-center text-blue-600 text-3xl shrink-0">
            <FaLaptopCode />
          </div>

          <div className="flex-1">
            <p className="text-lg font-semibold text-gray-800">
              Computer Courses
            </p>
            <p className="text-sm text-gray-600 mb-2">
              Practical training at Computer-G (Basic, Excel, Tally, Power BI, Typing)
            </p>

            <Link
              href="/computer-g"
              className="inline-block text-sm font-medium text-blue-600 hover:underline"
            >
              View Details →
            </Link>
          </div>
        </div>

      </div>
    </section>
  );
}
